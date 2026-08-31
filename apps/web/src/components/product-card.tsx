"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { formatPrice } from "@/lib/format"
import type { CatalogProduct } from "@/lib/catalog"
import { StarRating } from "@/components/star-rating"
import { WishlistButton } from "@/components/wishlist-button"
import { ProductThumbnail } from "@/components/product-thumbnail"

const MAX_STAGGER_DELAY = 0.28
const STAGGER_STEP = 0.04

export function ProductCard({
  product,
  index = 0,
}: {
  product: CatalogProduct
  index?: number
}) {
  const delay = Math.min(index * STAGGER_STEP, MAX_STAGGER_DELAY)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/products/${product.handle}`} className="group block">
        <div className="relative aspect-[4/5] shadow-none transition-shadow duration-300 group-hover:shadow-xl">
          <WishlistButton
            item={{
              id: product.id,
              title: product.title,
              handle: product.handle,
              thumbnail: product.thumbnail,
              minPrice: product.minPrice,
              currency: product.currency,
            }}
          />
          <ProductThumbnail
            src={product.thumbnail}
            alt={product.title}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            imageClassName="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-heading text-lg leading-snug text-foreground transition-colors duration-200 group-hover:text-muted-foreground">
            {product.title}
          </h3>
          {product.reviewCount ? (
            <StarRating value={product.reviewAverage ?? 0} count={product.reviewCount} size={12} />
          ) : null}
          <p className="text-sm text-muted-foreground">
            Desde {formatPrice(product.minPrice, product.currency)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
