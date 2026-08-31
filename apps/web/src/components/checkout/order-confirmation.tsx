"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

import { formatPrice } from "@/lib/format"
import type { CompletedOrder } from "@/lib/checkout"

export function OrderConfirmation({ order }: { order: CompletedOrder }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mx-auto flex size-14 items-center justify-center rounded-full bg-foreground text-background"
      >
        <CheckCircle2 className="size-7" aria-hidden />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
      >
        <p className="mt-6 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Gracias por tu compra
        </p>
        <h1 className="font-heading mt-3 text-3xl sm:text-4xl">
          Orden #{order.display_id} confirmada
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviamos los detalles a {order.email}.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        className="mt-10 space-y-4 rounded-lg border border-border p-6 text-left"
      >
        <ul className="space-y-4">
          {order.items.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.35 + index * 0.06, ease: "easeOut" }}
              className="flex gap-3"
            >
              <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.title} fill sizes="64px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
              </div>
            </motion.li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-border pt-4 text-base font-medium">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency_code)}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Link
          href="/"
          className="mt-10 inline-block rounded-full border border-border px-6 py-2.5 text-sm transition-colors duration-200 hover:border-foreground"
        >
          Seguir explorando
        </Link>
      </motion.div>
    </div>
  )
}
