"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import { SubmitButton } from "@/components/ui/submit-button"
import type { CatalogFilters, CatalogProduct } from "@/lib/catalog"

export function ProductGrid({
  products,
  nextOffset = null,
  filters,
}: {
  products: CatalogProduct[]
  nextOffset?: number | null
  filters?: CatalogFilters
}) {
  const [items, setItems] = useState(products)
  const [offset, setOffset] = useState(nextOffset)
  const [loading, setLoading] = useState(false)

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-2 py-32 text-center"
      >
        <p className="font-heading text-2xl">Sin resultados</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          No encontramos piezas que coincidan con estos filtros. Intenta
          ajustar el rango de precio o quitar alguna categoría.
        </p>
      </motion.div>
    )
  }

  const loadMore = async () => {
    if (offset === null || loading) return
    setLoading(true)

    const params = new URLSearchParams()
    if (filters?.category) params.set("category", filters.category)
    if (filters?.color) params.set("color", filters.color)
    if (filters?.material) params.set("material", filters.material)
    if (typeof filters?.minPrice === "number") params.set("minPrice", String(filters.minPrice))
    if (typeof filters?.maxPrice === "number") params.set("maxPrice", String(filters.maxPrice))
    if (filters?.sort) params.set("sort", filters.sort)
    params.set("offset", String(offset))

    try {
      const res = await fetch(`/api/catalog?${params.toString()}`)
      const data: { products: CatalogProduct[]; nextOffset: number | null } = await res.json()
      setItems((prev) => [...prev, ...data.products])
      setOffset(data.nextOffset)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {items.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {offset !== null ? (
        <div className="flex justify-center">
          <SubmitButton
            type="button"
            variant="outline"
            loading={loading}
            loadingText="Cargando..."
            onClick={loadMore}
            className="w-auto min-w-48 px-8"
          >
            Cargar más
          </SubmitButton>
        </div>
      ) : null}
    </div>
  )
}
