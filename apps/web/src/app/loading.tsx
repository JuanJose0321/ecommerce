import { CatalogSkeleton } from "@/components/catalog-skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10">
      <CatalogSkeleton />
    </div>
  )
}
