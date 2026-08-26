"use client"

import { Heart } from "lucide-react"
import { useWishlist, type WishlistItem } from "@/components/wishlist-provider"

export function WishlistButton({
  item,
  variant = "overlay",
}: {
  item: WishlistItem
  variant?: "overlay" | "inline"
}) {
  const { isSaved, toggle } = useWishlist()
  const saved = isSaved(item.id)

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        aria-pressed={saved}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Heart className={saved ? "size-4 fill-foreground text-foreground" : "size-4"} />
        {saved ? "Guardado en favoritos" : "Guardar en favoritos"}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(item)
      }}
      aria-pressed={saved}
      aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
    >
      <Heart className={saved ? "size-4 fill-foreground text-foreground" : "size-4"} />
    </button>
  )
}
