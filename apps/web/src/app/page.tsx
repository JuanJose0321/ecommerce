import { Suspense } from "react"
import Image from "next/image"
import { listCategories } from "@/lib/medusa"
import {
  fetchCatalogPage,
  getCatalogFacets,
  getFeaturedProducts,
  parseCatalogFilters,
} from "@/lib/catalog"
import { CatalogFilters } from "@/components/catalog-filters"
import { CatalogSkeleton } from "@/components/catalog-skeleton"
import { FeaturedCarousel } from "@/components/featured-carousel"
import { ProductGrid } from "@/components/product-grid"
import { HeroReveal, HeroTextGroup } from "@/components/hero-reveal"

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const resolvedSearchParams = await searchParams
  const featured = await getFeaturedProducts()

  return (
    <div className="pb-24">
      <Hero />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="py-16 sm:py-20">
          <FeaturedCarousel products={featured} />
        </div>
        <Suspense
          key={JSON.stringify(resolvedSearchParams)}
          fallback={<CatalogSkeleton />}
        >
          <CatalogSection searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative flex h-[75vh] min-h-[480px] w-full items-center justify-center overflow-hidden sm:h-[85vh] sm:max-h-[720px]">
      <HeroReveal>
        <Image
          src="https://images.unsplash.com/photo-1694376329556-cf1ba3610960?w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </HeroReveal>
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/5 to-background/50" />
      <HeroTextGroup>
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
      </HeroTextGroup>
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
