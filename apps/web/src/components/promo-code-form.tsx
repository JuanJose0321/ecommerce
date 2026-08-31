"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatePresence } from "@/components/ui/form-banner"
import { SubmitButton } from "@/components/ui/submit-button"
import type { CartPromotion } from "@/lib/cart"

export function PromoCodeForm({
  promotions,
  onApply,
  onRemove,
  className,
}: {
  promotions: CartPromotion[]
  onApply: (code: string) => Promise<{ ok: boolean; message?: string }>
  onRemove: (code: string) => Promise<void> | void
  className?: string
}) {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "applying" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setStatus("applying")
    setError(null)

    const result = await onApply(code.trim().toUpperCase())
    if (result.ok) {
      setCode("")
      setStatus("idle")
    } else {
      setStatus("error")
      setError(result.message ?? "Código inválido o expirado.")
    }
  }

  return (
    <div className={className}>
      {promotions.length > 0 ? (
        <ul className="mb-3 space-y-1">
          {promotions.map((p) =>
            p.code ? (
              <li key={p.code} className="flex items-center justify-between text-sm">
                <span>Cupón {p.code}</span>
                <button
                  type="button"
                  onClick={() => onRemove(p.code!)}
                  aria-label="Quitar cupón"
                  className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ) : null
          )}
        </ul>
      ) : null}
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            if (error) {
              setStatus("idle")
              setError(null)
            }
          }}
          placeholder="Código de descuento"
          aria-label="Código de descuento"
          className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted-foreground/60 focus:border-foreground"
        />
        <SubmitButton
          loading={status === "applying"}
          loadingText=""
          variant="outline"
          className="w-auto shrink-0 rounded-full px-4 py-2"
        >
          Aplicar
        </SubmitButton>
      </form>
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="coupon-error"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-2 text-sm text-destructive"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
