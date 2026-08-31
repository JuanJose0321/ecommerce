import { Suspense } from "react"
import { listCategories, listProducts } from "@/lib/medusa"
import { getReviewSummaries } from "@/lib/reviews"
import {
  filterAndSortProducts,
  getAvailableColors,
  getAvailableMaterials,
  getPriceBounds,
  parseCatalogFilters,
  toCatalogProduct,
  withReviewSummaries,
} from "@/lib/catalog"
import { CatalogFilters } from "@/components/catalog-filters"
import { CatalogSkeleton } from "@/components/catalog-skeleton"
import { ProductGrid } from "@/components/product-grid"

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const resolvedSearchParams = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
      <Hero />
      <Suspense
        key={JSON.stringify(resolvedSearchParams)}
        fallback={<CatalogSkeleton />}
      >
        <CatalogSection searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  )
}

function Hero() {
  return (
    <section className="flex flex-col items-center gap-4 py-20 text-center sm:py-28">
      <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Nueva colección
      </p>
      <h1 className="font-heading max-w-2xl text-4xl leading-tight sm:text-6xl">
        Piezas atemporales, hechas para durar
      </h1>
      <p className="max-w-md text-sm text-muted-foreground sm:text-base">
        Relojería, joyería, moda y tecnología premium seleccionadas con un
        mismo criterio: manufactura impecable.
      </p>
    </section>
  )
}

async function CatalogSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ])

  const baseCatalogProducts = products.map(toCatalogProduct)
  const reviewSummaries = await getReviewSummaries(
    baseCatalogProducts.map((p) => p.id)
  )
  const catalogProducts = withReviewSummaries(baseCatalogProducts, reviewSummaries)
  const filters = parseCatalogFilters(searchParams)
  const filtered = filterAndSortProducts(catalogProducts, filters)

  return (
    <section className="space-y-10">
      <CatalogFilters
        categories={categories}
        colors={getAvailableColors(catalogProducts)}
        materials={getAvailableMaterials(catalogProducts)}
        priceBounds={getPriceBounds(catalogProducts)}
      />
      <ProductGrid products={filtered} />
    </section>
  )
}
