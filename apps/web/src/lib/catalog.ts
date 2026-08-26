import {
  getProductColors,
  getProductMaterials,
  getProductPriceRange,
  type MedusaProduct,
} from "@/lib/medusa"

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

export function filterAndSortProducts(
  products: CatalogProduct[],
  filters: CatalogFilters
): CatalogProduct[] {
  let result = products

  if (filters.category) {
    result = result.filter((p) => p.categoryHandles.includes(filters.category!))
  }

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

  const sorted = [...result]
  switch (filters.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.minPrice - b.minPrice)
      break
    case "price-desc":
      sorted.sort((a, b) => b.minPrice - a.minPrice)
      break
    case "newest":
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      break
    case "popular":
    default:
      // Sin metricas de ventas/vistas todavia: se mantiene el orden curado del catalogo.
      break
  }

  return sorted
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
