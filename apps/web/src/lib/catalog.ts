import {
  getProductColors,
  getProductMaterials,
  getProductPriceRange,
  listCategories,
  listProducts,
  type MedusaProduct,
} from "@/lib/medusa"
import { getReviewSummaries } from "@/lib/reviews"

export const PAGE_SIZE = 12

// A safety cap on how many raw (pre-filter) pages a single "load more" click
// (or the initial page load) may fetch while looking for a full page of
// results after client-side color/material/price filtering. Keeps a rare
// filter combination from silently pulling in the whole catalog at once.
const MAX_RAW_PAGES_PER_FETCH = 5

// Medusa can't sort by calculated price or filter by option value (color,
// material) server-side, so those two cases fetch the full category-scoped
// catalog once instead of paginating — see fetchCatalogPage below.
const FULL_FETCH_LIMIT = 200

export type SortOption = "newest" | "price-asc" | "price-desc" | "popular"

export type CatalogFilters = {
  category?: string
  color?: string
  material?: string
  minPrice?: number
  maxPrice?: number
  sort: SortOption
}

export type CatalogProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  categoryHandles: string[]
  colors: string[]
  materials: string[]
  minPrice: number
  currency: string
  createdAt: string
  reviewAverage?: number
  reviewCount?: number
}

export function toCatalogProduct(product: MedusaProduct): CatalogProduct {
  const { min, currency } = getProductPriceRange(product)

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail,
    categoryHandles: (product.categories ?? []).map((c) => c.handle),
    colors: getProductColors(product),
    materials: getProductMaterials(product),
    minPrice: min,
    currency,
    createdAt: product.created_at,
  }
}

export function withReviewSummaries(
  products: CatalogProduct[],
  summaries: Record<string, { average: number; count: number }>
): CatalogProduct[] {
  return products.map((p) => ({
    ...p,
    reviewAverage: summaries[p.id]?.average,
    reviewCount: summaries[p.id]?.count,
  }))
}

export function getPriceBounds(products: CatalogProduct[]): {
  min: number
  max: number
} {
  if (products.length === 0) return { min: 0, max: 0 }
  const amounts = products.map((p) => p.minPrice)
  return {
    min: Math.floor(Math.min(...amounts)),
    max: Math.ceil(Math.max(...amounts)),
  }
}

export function getAvailableColors(products: CatalogProduct[]): string[] {
  return Array.from(new Set(products.flatMap((p) => p.colors))).sort()
}

export function getAvailableMaterials(products: CatalogProduct[]): string[] {
  return Array.from(new Set(products.flatMap((p) => p.materials))).sort()
}

function applyClientFilters(
  products: CatalogProduct[],
  filters: CatalogFilters
): CatalogProduct[] {
  let result = products

  if (filters.color) {
    result = result.filter((p) => p.colors.includes(filters.color!))
  }
  if (filters.material) {
    result = result.filter((p) => p.materials.includes(filters.material!))
  }
  if (typeof filters.minPrice === "number") {
    result = result.filter((p) => p.minPrice >= filters.minPrice!)
  }
  if (typeof filters.maxPrice === "number") {
    result = result.filter((p) => p.minPrice <= filters.maxPrice!)
  }

  return result
}

function sortByPrice(
  products: CatalogProduct[],
  sort: "price-asc" | "price-desc"
): CatalogProduct[] {
  const sorted = [...products]
  sorted.sort((a, b) =>
    sort === "price-asc" ? a.minPrice - b.minPrice : b.minPrice - a.minPrice
  )
  return sorted
}

async function resolveCategoryId(
  categoryHandle: string | undefined
): Promise<string | undefined> {
  if (!categoryHandle) return undefined
  const categories = await listCategories()
  return categories.find((c) => c.handle === categoryHandle)?.id
}

export type CatalogPageResult = {
  products: CatalogProduct[]
  nextOffset: number | null
}

/**
 * Fetches one page of the catalog grid for the given filters, using
 * Medusa's limit/offset (and category_id/order where supported) instead of
 * pulling the whole catalog into memory. Color, material, and price-range
 * filters aren't supported server-side, so they're applied client-side over
 * whatever raw pages get fetched; price sort needs the whole category-scoped
 * set to be globally correct, so it bypasses pagination and fetches once.
 */
export async function fetchCatalogPage({
  filters,
  offset,
}: {
  filters: CatalogFilters
  offset: number
}): Promise<CatalogPageResult> {
  const categoryId = await resolveCategoryId(filters.category)

  if (filters.sort === "price-asc" || filters.sort === "price-desc") {
    const { products: rawProducts } = await listProducts({
      limit: FULL_FETCH_LIMIT,
      offset: 0,
      categoryId,
    })
    let mapped = rawProducts.map(toCatalogProduct)
    mapped = applyClientFilters(mapped, filters)
    mapped = sortByPrice(mapped, filters.sort)

    const summaries = await getReviewSummaries(mapped.map((p) => p.id))
    return { products: withReviewSummaries(mapped, summaries), nextOffset: null }
  }

  const order = filters.sort === "newest" ? "-created_at" : undefined
  const needsClientFilter = Boolean(
    filters.color ||
      filters.material ||
      typeof filters.minPrice === "number" ||
      typeof filters.maxPrice === "number"
  )

  const collected: CatalogProduct[] = []
  let rawOffset = offset
  let totalCount = Infinity
  let pagesFetched = 0

  while (
    collected.length < PAGE_SIZE &&
    rawOffset < totalCount &&
    pagesFetched < MAX_RAW_PAGES_PER_FETCH
  ) {
    const { products: rawProducts, count } = await listProducts({
      limit: PAGE_SIZE,
      offset: rawOffset,
      categoryId,
      order,
    })
    totalCount = count
    const mapped = rawProducts.map(toCatalogProduct)
    collected.push(...(needsClientFilter ? applyClientFilters(mapped, filters) : mapped))
    rawOffset += PAGE_SIZE
    pagesFetched += 1
    if (rawProducts.length === 0) break
  }

  const summaries = await getReviewSummaries(collected.map((p) => p.id))
  const nextOffset = rawOffset < totalCount ? rawOffset : null

  return { products: withReviewSummaries(collected, summaries), nextOffset }
}

/**
 * Color/material swatches and the price slider need to reflect the whole
 * catalog, not just the current page, so this fetches everything once
 * (cached by Next's fetch layer) purely to compute those facet values.
 */
export async function getCatalogFacets(): Promise<{
  colors: string[]
  materials: string[]
  priceBounds: { min: number; max: number }
}> {
  const { products: rawProducts } = await listProducts({ limit: FULL_FETCH_LIMIT })
  const mapped = rawProducts.map(toCatalogProduct)

  return {
    colors: getAvailableColors(mapped),
    materials: getAvailableMaterials(mapped),
    priceBounds: getPriceBounds(mapped),
  }
}

/**
 * A representative sample for the home page's "Destacados" carousel: walks
 * the catalog round-robin across categories (one item per category per
 * round) so all four are represented instead of whichever has the most
 * products. Reuses the same full-catalog fetch as getCatalogFacets, so
 * Next's fetch cache/request memoization means this doesn't add a second
 * network round-trip within the same page render.
 */
export async function getFeaturedProducts(limit = 6): Promise<CatalogProduct[]> {
  const { products: rawProducts } = await listProducts({ limit: FULL_FETCH_LIMIT })
  const mapped = rawProducts.map(toCatalogProduct)

  const byCategory = new Map<string, CatalogProduct[]>()
  for (const product of mapped) {
    const category = product.categoryHandles[0] ?? "otros"
    if (!byCategory.has(category)) byCategory.set(category, [])
    byCategory.get(category)!.push(product)
  }
  const groups = Array.from(byCategory.values())

  const featured: CatalogProduct[] = []
  for (let round = 0; featured.length < limit && groups.some((g) => g[round]); round++) {
    for (const group of groups) {
      if (featured.length >= limit) break
      if (group[round]) featured.push(group[round])
    }
  }

  const summaries = await getReviewSummaries(featured.map((p) => p.id))
  return withReviewSummaries(featured, summaries)
}

export function parseCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>
): CatalogFilters {
  const get = (key: string): string | undefined => {
    const value = searchParams[key]
    return Array.isArray(value) ? value[0] : value
  }

  const sortParam = get("sort")
  const sort: SortOption =
    sortParam === "price-asc" ||
    sortParam === "price-desc" ||
    sortParam === "newest" ||
    sortParam === "popular"
      ? sortParam
      : "popular"

  const minPrice = get("minPrice") ? Number(get("minPrice")) : undefined
  const maxPrice = get("maxPrice") ? Number(get("maxPrice")) : undefined

  return {
    category: get("category"),
    color: get("color"),
    material: get("material"),
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    sort,
  }
}
