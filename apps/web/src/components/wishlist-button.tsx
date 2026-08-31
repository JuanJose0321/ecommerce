"use client"

import { Heart } from "lucide-react"
import { motion } from "framer-motion"
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
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(item)
      }}
      whileTap={{ scale: 0.85 }}
      aria-pressed={saved}
      aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background ${
        saved
          ? "opacity-100"
          : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100"
      }`}
    >
      <motion.span
        key={saved ? "saved" : "unsaved"}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="flex"
      >
        <Heart className={saved ? "size-4 fill-foreground text-foreground" : "size-4"} />
      </motion.span>
    </motion.button>
  )
}
