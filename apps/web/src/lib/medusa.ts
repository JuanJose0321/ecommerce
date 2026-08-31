const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export async function isBackendReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    })
    return res.ok
  } catch {
    return false
  }
}

export type MedusaMoneyAmount = {
  currency_code: string
  amount: number
}

export type MedusaOptionValue = {
  value: string
}

export type MedusaProductOption = {
  id: string
  title: string
  values?: MedusaOptionValue[]
}

export type MedusaInventoryLocationLevel = {
  available_quantity: number
}

export type MedusaVariantOptionValue = {
  option_id: string
  value: string
}

export type MedusaVariant = {
  id: string
  title: string
  sku: string | null
  options?: MedusaVariantOptionValue[]
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
  inventory_items?: {
    inventory: {
      location_levels: MedusaInventoryLocationLevel[]
    }
  }[]
}

export type MedusaCategory = {
  id: string
  name: string
  handle: string
}

export type MedusaImage = {
  id: string
  url: string
}

export type MedusaProduct = {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  status: string
  created_at: string
  metadata: Record<string, unknown> | null
  images?: MedusaImage[]
  categories?: MedusaCategory[]
  options?: MedusaProductOption[]
  variants?: MedusaVariant[]
}

async function medusaFetch<T>(
  path: string,
  options: { next?: NextFetchRequestConfig; searchParams?: Record<string, string> } = {}
): Promise<T> {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new Error(
      "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY no esta configurada. Revisa apps/web/.env.local."
    )
  }

  const url = new URL(path, MEDUSA_BACKEND_URL)
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
      "content-type": "application/json",
    },
    next: options.next,
  })

  if (!res.ok) {
    throw new Error(`Medusa request failed: ${res.status} ${url.pathname}`)
  }

  return res.json()
}

const PRODUCT_FIELDS = [
  "id",
  "title",
  "handle",
  "description",
  "thumbnail",
  "status",
  "created_at",
  "metadata",
  "*images",
  "*categories",
  "*options",
  "*options.values",
  "*variants",
  "*variants.options",
  "*variants.calculated_price",
  "*variants.inventory_items.inventory.location_levels",
].join(",")

let cachedRegionId: string | null = null

export async function getDefaultRegionId(): Promise<string> {
  if (cachedRegionId) return cachedRegionId

  const data = await medusaFetch<{ regions: { id: string; currency_code: string }[] }>(
    "/store/regions",
    { next: { revalidate: 3600, tags: ["regions"] } }
  )

  const region =
    data.regions.find((r) => r.currency_code === "mxn") ?? data.regions[0]

  if (!region) {
    throw new Error("No hay regiones configuradas en Medusa.")
  }

  cachedRegionId = region.id
  return region.id
}

export async function listCategories(): Promise<MedusaCategory[]> {
  const data = await medusaFetch<{ product_categories: MedusaCategory[] }>(
    "/store/product-categories",
    {
      searchParams: { limit: "100" },
      next: { revalidate: 300, tags: ["categories"] },
    }
  )

  const luxuryHandles = new Set(["relojes", "joyeria", "moda", "tecnologia"])
  return data.product_categories.filter((c) => luxuryHandles.has(c.handle))
}

export async function listProducts(): Promise<MedusaProduct[]> {
  const regionId = await getDefaultRegionId()

  const data = await medusaFetch<{ products: MedusaProduct[] }>(
    "/store/products",
    {
      searchParams: {
        limit: "100",
        region_id: regionId,
        fields: PRODUCT_FIELDS,
      },
      next: { revalidate: 60, tags: ["products"] },
    }
  )

  return data.products.filter(isSellableProduct)
}

// A product published without a thumbnail or without a price in the
// storefront's currency (e.g. published by mistake, or missing a price for
// this region) would otherwise render as a broken image with "Desde $0" -
// keep it out of every listing (catalog, related products, search) until
// it's actually ready to sell. The product detail page is intentionally
// left reachable by direct link so merchandising can still preview it.
function isSellableProduct(product: MedusaProduct): boolean {
  const hasImage = Boolean(product.thumbnail)
  const hasPrice = getProductPriceRange(product).min > 0
  return hasImage && hasPrice
}

export async function getProductByHandle(
  handle: string
): Promise<MedusaProduct | null> {
  const regionId = await getDefaultRegionId()

  const data = await medusaFetch<{ products: MedusaProduct[] }>(
    "/store/products",
    {
      searchParams: {
        handle,
        region_id: regionId,
        fields: PRODUCT_FIELDS,
      },
      next: { revalidate: 60, tags: ["products"] },
    }
  )

  return data.products[0] ?? null
}

const MATERIAL_OPTION_TITLES = new Set(["material", "metal"])

export function getProductPriceRange(product: MedusaProduct): {
  min: number
  max: number
  currency: string
} {
  const prices = (product.variants ?? [])
    .map((v) => v.calculated_price)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  if (prices.length === 0) {
    return { min: 0, max: 0, currency: "mxn" }
  }

  const amounts = prices.map((p) => p.calculated_amount)
  return {
    min: Math.min(...amounts),
    max: Math.max(...amounts),
    currency: prices[0].currency_code,
  }
}

export function getProductColors(product: MedusaProduct): string[] {
  const option = product.options?.find((o) => o.title.toLowerCase() === "color")
  return option?.values?.map((v) => v.value) ?? []
}

export function getProductMaterials(product: MedusaProduct): string[] {
  const option = product.options?.find((o) =>
    MATERIAL_OPTION_TITLES.has(o.title.toLowerCase())
  )
  return option?.values?.map((v) => v.value) ?? []
}

export function variantMatchesSelection(
  variant: MedusaVariant,
  productOptions: MedusaProductOption[],
  selected: Record<string, string>
): boolean {
  return productOptions.every((option) => {
    const selectedValue = selected[option.title]
    return variant.options?.some(
      (o) => o.option_id === option.id && o.value === selectedValue
    )
  })
}

export function getVariantAvailableQuantity(variant: MedusaVariant): number {
  return (variant.inventory_items ?? []).reduce((sum, item) => {
    const levels = item.inventory?.location_levels ?? []
    return sum + levels.reduce((s, l) => s + l.available_quantity, 0)
  }, 0)
}

export function getProduct3DModel(product: MedusaProduct): string | null {
  const value = product.metadata?.model3d
  return typeof value === "string" ? value : null
}
