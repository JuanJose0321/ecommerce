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
import { formatPrice } from "@/lib/format"

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, isPending } = useCart()
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
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-8 text-muted-foreground" />
            <p className="font-heading text-lg">Tu carrito esta vacio</p>
            <p className="text-sm text-muted-foreground">
              Explora el catalogo y encuentra tu proxima pieza favorita.
            </p>
          </div>
        ) : (
          <>
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
            </div>

            <div className="space-y-4 border-t border-border px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cart!.subtotal, cart!.currency_code)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Envio e impuestos se calculan en el checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full rounded-full bg-foreground px-6 py-3.5 text-center text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Ir a pagar
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
