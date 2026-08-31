import { NextResponse } from "next/server"
import { listProducts } from "@/lib/medusa"
import { toCatalogProduct } from "@/lib/catalog"

export async function GET() {
  const { products } = await listProducts({ limit: 100 })
  const index = products.map(toCatalogProduct).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: p.thumbnail,
    minPrice: p.minPrice,
    currency: p.currency,
    categoryHandles: p.categoryHandles,
  }))

  return NextResponse.json(
    { products: index },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } }
  )
}
