"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import type { CatalogProduct } from "@/lib/catalog"

const RECOMMENDATION_COUNT = 2

export function CartRecommendations({ excludeProductIds }: { excludeProductIds: string[] }) {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/catalog?offset=0")
      .then((res) => res.json())
      .then((data: { products: CatalogProduct[] }) => {
        if (!cancelled) setProducts(data.products)
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!products) return null

  const recommended = products
    .filter((p) => !excludeProductIds.includes(p.id))
    .slice(0, RECOMMENDATION_COUNT)

  if (recommended.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mt-2 border-t border-border pt-4"
    >
      <p className="mb-3 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        También te puede interesar
      </p>
      <div className="grid grid-cols-2 gap-3">
        {recommended.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </motion.div>
  )
}
