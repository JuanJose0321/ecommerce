import { notFound } from "next/navigation"
import { getProductByHandle, getProductPriceRange, getProduct3DModel } from "@/lib/medusa"
import { getProductReviews } from "@/lib/reviews"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ProductMedia } from "@/components/product-media"
import { ProductVariantPanel } from "@/components/product-variant-panel"
import { ProductDetailsAccordion } from "@/components/product-details-accordion"
import { ReviewsSection } from "@/components/reviews-section"
import { RecentlyViewed } from "@/components/recently-viewed"
import { RelatedProducts } from "@/components/related-products"

export default async function ProductPage({
  params,
}: PageProps<"/products/[handle]">) {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    notFound()
  }

  const { min, currency } = getProductPriceRange(product)
  const category = product.categories?.[0]
  const reviewSummary = await getProductReviews(product.id)

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          ...(category
            ? [{ label: category.name, href: `/?category=${category.handle}` }]
            : []),
          { label: product.title },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductMedia
          images={product.images ?? []}
          title={product.title}
          model3dUrl={getProduct3DModel(product)}
        />

        <div className="space-y-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl">{product.title}</h1>
          </div>

          <p className="max-w-md leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <ProductVariantPanel product={product} />

          <ProductDetailsAccordion />
        </div>
      </div>

      <div className="mt-16 space-y-16">
        <ReviewsSection
          productId={product.id}
          initialReviews={reviewSummary.reviews}
        />

        <RecentlyViewed
          current={{
            id: product.id,
            title: product.title,
            handle: product.handle,
            thumbnail: product.thumbnail,
            minPrice: min,
            currency,
          }}
        />

        <RelatedProducts
          currentProductId={product.id}
          categoryHandle={category?.handle}
        />
      </div>
    </div>
  )
}
