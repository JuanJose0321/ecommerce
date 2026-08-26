"use client"

import { useMemo, useState } from "react"
import { formatPrice } from "@/lib/format"
import {
  getProductPriceRange,
  getVariantAvailableQuantity,
  variantMatchesSelection,
} from "@/lib/medusa"
import type { MedusaProduct } from "@/lib/medusa"
import { useCart } from "@/components/cart-provider"
import { WishlistButton } from "@/components/wishlist-button"

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
  const [status, setStatus] = useState<"idle" | "adding">("idle")

  const matchedVariant = useMemo(() => {
    return product.variants?.find((v) => variantMatchesSelection(v, options, selected))
  }, [product, options, selected])

  const availableQuantity = matchedVariant
    ? getVariantAvailableQuantity(matchedVariant)
    : 0
  const price = matchedVariant?.calculated_price
  const outOfStock = matchedVariant ? availableQuantity <= 0 : false
  const { min, currency } = getProductPriceRange(product)

  const handleAddToCart = async () => {
    if (!matchedVariant) return
    setStatus("adding")
    await addItem(matchedVariant.id, 1)
    setStatus("idle")
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
                <button
                  key={value.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [option.title]: value.value }))
                  }
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                >
                  {value.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <StockBadge outOfStock={outOfStock} quantity={availableQuantity} />

      <div className="space-y-3">
        <button
          type="button"
          disabled={outOfStock || status === "adding"}
          onClick={handleAddToCart}
          className="w-full rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock
            ? "Agotado"
            : status === "adding"
              ? "Anadiendo..."
              : "Anadir al carrito"}
        </button>
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
