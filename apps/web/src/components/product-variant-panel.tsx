"use client"

import { useEffect, useMemo, useState } from "react"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { formatPrice } from "@/lib/format"
import {
  getProductPriceRange,
  getVariantAvailableQuantity,
  variantMatchesSelection,
} from "@/lib/medusa"
import type { MedusaProduct } from "@/lib/medusa"
import { useCart } from "@/components/cart-provider"
import { WishlistButton } from "@/components/wishlist-button"
import { SubmitButton } from "@/components/ui/submit-button"

const SUCCESS_FLASH_MS = 1600

const LOW_STOCK_THRESHOLD = 5

export function ProductVariantPanel({ product }: { product: MedusaProduct }) {
  const { addItem } = useCart()
  const options = useMemo(() => product.options ?? [], [product])

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const option of options) {
      const firstValue = option.values?.[0]?.value
      if (firstValue) initial[option.title] = firstValue
    }
    return initial
  })
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle")

  const matchedVariant = useMemo(() => {
    return product.variants?.find((v) => variantMatchesSelection(v, options, selected))
  }, [product, options, selected])

  const availableQuantity = matchedVariant
    ? getVariantAvailableQuantity(matchedVariant)
    : 0
  const price = matchedVariant?.calculated_price
  const outOfStock = matchedVariant ? availableQuantity <= 0 : false
  const { min, currency } = getProductPriceRange(product)

  useEffect(() => {
    if (status !== "added") return
    const timeout = setTimeout(() => setStatus("idle"), SUCCESS_FLASH_MS)
    return () => clearTimeout(timeout)
  }, [status])

  const handleAddToCart = async () => {
    if (!matchedVariant) return
    setStatus("adding")
    const result = await addItem(matchedVariant.id, 1)
    setStatus(result.ok ? "added" : "idle")
  }

  return (
    <div className="space-y-6">
      <p className="text-lg text-muted-foreground">
        {price ? formatPrice(price.calculated_amount, price.currency_code) : ""}
      </p>

      {options.map((option) => (
        <div key={option.id} className="space-y-2">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            {option.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values?.map((value) => {
              const isActive = selected[option.title] === value.value
              return (
                <motion.button
                  key={value.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [option.title]: value.value }))
                  }
                  whileTap={{ scale: 0.94 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors duration-200 ${
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                >
                  {value.value}
                </motion.button>
              )
            })}
          </div>
        </div>
      ))}

      <StockBadge outOfStock={outOfStock} quantity={availableQuantity} />

      <div className="space-y-3">
        <SubmitButton
          type="button"
          disabled={outOfStock}
          loading={status === "adding"}
          loadingText="Anadiendo..."
          onClick={handleAddToCart}
          className="py-3.5"
        >
          {outOfStock ? (
            "Agotado"
          ) : status === "added" ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              <Check className="size-4" aria-hidden />
              Anadido al carrito
            </motion.span>
          ) : (
            "Anadir al carrito"
          )}
        </SubmitButton>
        <div className="flex justify-center">
          <WishlistButton
            variant="inline"
            item={{
              id: product.id,
              title: product.title,
              handle: product.handle,
              thumbnail: product.thumbnail,
              minPrice: min,
              currency,
            }}
          />
        </div>
      </div>
    </div>
  )
}

function StockBadge({
  outOfStock,
  quantity,
}: {
  outOfStock: boolean
  quantity: number
}) {
  if (outOfStock) {
    return (
      <p className="text-sm font-medium text-destructive">
        Agotado en esta combinacion
      </p>
    )
  }

  if (quantity <= LOW_STOCK_THRESHOLD) {
    return (
      <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
        Quedan {quantity} {quantity === 1 ? "pieza" : "piezas"}
      </p>
    )
  }

  return <p className="text-sm text-muted-foreground">En stock</p>
}
