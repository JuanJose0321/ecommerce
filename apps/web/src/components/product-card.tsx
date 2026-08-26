"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatPrice } from "@/lib/format"
import type { CatalogProduct } from "@/lib/catalog"
import { StarRating } from "@/components/star-rating"
import { WishlistButton } from "@/components/wishlist-button"

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Link href={`/products/${product.handle}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
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
          {product.thumbnail ? (
            <motion.div
              className="h-full w-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          ) : null}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-heading text-lg leading-snug transition-colors group-hover:text-muted-foreground">
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
