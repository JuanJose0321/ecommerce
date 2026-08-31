"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import type { CatalogProduct } from "@/lib/catalog"

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
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

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </AnimatePresence>
    </div>
  )
}
