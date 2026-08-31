import { Suspense } from "react"
import { listCategories } from "@/lib/medusa"
import {
  fetchCatalogPage,
  getCatalogFacets,
  parseCatalogFilters,
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
  const filters = parseCatalogFilters(searchParams)

  const [categories, facets, page] = await Promise.all([
    listCategories(),
    getCatalogFacets(),
    fetchCatalogPage({ filters, offset: 0 }),
  ])

  return (
    <section className="space-y-10">
      <CatalogFilters
        categories={categories}
        colors={facets.colors}
        materials={facets.materials}
        priceBounds={facets.priceBounds}
      />
      <ProductGrid
        products={page.products}
        nextOffset={page.nextOffset}
        filters={filters}
      />
    </section>
  )
}
