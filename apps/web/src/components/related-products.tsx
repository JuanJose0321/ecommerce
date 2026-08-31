import { listProducts } from "@/lib/medusa"
import { toCatalogProduct } from "@/lib/catalog"
import { ProductGrid } from "@/components/product-grid"

export async function RelatedProducts({
  currentProductId,
  categoryHandle,
}: {
  currentProductId: string
  categoryHandle?: string
}) {
  if (!categoryHandle) return null

  const { products } = await listProducts({ limit: 100 })
  const related = products
    .map(toCatalogProduct)
    .filter(
      (p) => p.id !== currentProductId && p.categoryHandles.includes(categoryHandle)
    )
    .slice(0, 4)

  if (related.length === 0) return null

  return (
    <section className="space-y-4 border-t border-border pt-10">
      <h2 className="font-heading text-2xl">También te puede interesar</h2>
      <ProductGrid products={related} />
    </section>
  )
}
