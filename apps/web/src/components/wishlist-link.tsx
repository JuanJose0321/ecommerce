"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useWishlist } from "@/components/wishlist-provider"

export function WishlistLink() {
  const { items } = useWishlist()

  return (
    <Link
      href="/wishlist"
      aria-label={`Favoritos, ${items.length} ${items.length === 1 ? "producto" : "productos"}`}
      className="relative flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Heart className="size-5" />
      {items.length > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
          {items.length > 9 ? "9+" : items.length}
        </span>
      ) : null}
    </Link>
  )
}
