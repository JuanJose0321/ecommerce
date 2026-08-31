"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingBag, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/components/cart-provider"
import { CartRecommendations } from "@/components/cart-recommendations"
import { PromoCodeForm } from "@/components/promo-code-form"
import { formatPrice } from "@/lib/format"

// Below this many items the drawer has visible room to spare below the
// list — fill it with recommendations instead of leaving dead space above
// the totals.
const RECOMMENDATION_THRESHOLD = 2

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    updateItem,
    removeItem,
    applyPromoCode,
    removePromoCode,
    isPending,
  } = useCart()
  const items = cart?.items ?? []

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">
            Tu carrito {items.length > 0 ? `(${items.length})` : ""}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
          >
            <ShoppingBag className="size-8 text-muted-foreground" />
            <p className="font-heading text-lg">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground">
              Explora el catálogo y encuentra tu próxima pieza favorita.
            </p>
            <Link
              href="/"
              onClick={closeCart}
              className="mt-2 rounded-full border border-border px-5 py-2 text-sm transition-colors duration-200 hover:border-foreground"
            >
              Explorar catálogo
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="items"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4 border-b border-border py-4"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden bg-muted">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-heading text-sm leading-snug">{item.title}</p>
                        {item.variant_title ? (
                          <p className="text-xs text-muted-foreground">
                            {item.variant_title}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              item.quantity > 1
                                ? updateItem(item.id, item.quantity - 1)
                                : removeItem(item.id)
                            }
                            aria-label="Disminuir cantidad"
                            className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground disabled:opacity-40"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-4 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            aria-label="Aumentar cantidad"
                            className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground disabled:opacity-40"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <p className="text-sm">
                          {formatPrice(item.unit_price * item.quantity, cart!.currency_code)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => removeItem(item.id)}
                      aria-label="Eliminar producto"
                      className="self-start text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                    >
                      <X className="size-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {items.length <= RECOMMENDATION_THRESHOLD ? (
                <CartRecommendations
                  excludeProductIds={items.map((item) => item.product_id)}
                />
              ) : null}
            </div>

            <div className="space-y-4 border-t border-border px-4 py-4">
              <PromoCodeForm
                promotions={cart!.promotions}
                onApply={applyPromoCode}
                onRemove={removePromoCode}
              />

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cart!.subtotal, cart!.currency_code)}</span>
                </div>
                {cart!.discount_total > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between text-foreground"
                  >
                    <span className="text-muted-foreground">Descuento</span>
                    <span>-{formatPrice(cart!.discount_total, cart!.currency_code)}</span>
                  </motion.div>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Envío e impuestos se calculan en el checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full rounded-full bg-foreground px-6 py-3.5 text-center text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Ir a pagar
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="block w-full text-center text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-200 hover:text-foreground"
              >
                Seguir comprando
              </button>
            </div>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  )
}
