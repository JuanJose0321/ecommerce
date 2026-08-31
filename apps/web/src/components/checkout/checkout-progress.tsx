"use client"

import { Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

const STEPS = ["Envio", "Pago", "Confirmacion"] as const

export function CheckoutProgress({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="flex items-center gap-3 text-sm">
      {STEPS.map((step, index) => {
        const isComplete = index < current
        const isActive = index === current
        const isFilled = isComplete || isActive

        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                "flex items-center gap-2 transition-colors duration-300",
                isFilled ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center overflow-hidden rounded-full border text-xs transition-colors duration-300",
                  isFilled ? "border-foreground bg-foreground text-background" : "border-border"
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isComplete ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="flex"
                    >
                      <Check className="size-3.5" aria-hidden />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="number"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {index + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {step}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="relative h-px w-8 overflow-hidden bg-border" aria-hidden>
                <motion.span
                  className="absolute inset-0 origin-left bg-foreground"
                  initial={false}
                  animate={{ scaleX: index < current ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
