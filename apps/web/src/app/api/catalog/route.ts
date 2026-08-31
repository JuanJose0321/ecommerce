import { NextResponse } from "next/server"
import { fetchCatalogPage, parseCatalogFilters } from "@/lib/catalog"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const params = Object.fromEntries(searchParams.entries())
  const filters = parseCatalogFilters(params)
  const offset = Number(params.offset ?? 0)

  const { products, nextOffset } = await fetchCatalogPage({
    filters,
    offset: Number.isFinite(offset) ? offset : 0,
  })

  return NextResponse.json({ products, nextOffset })
}
