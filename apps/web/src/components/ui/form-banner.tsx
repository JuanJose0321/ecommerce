"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

type FormBannerProps = {
  type: "error" | "success"
  children: React.ReactNode
}

export function FormBanner({ type, children }: FormBannerProps) {
  const Icon = type === "error" ? AlertCircle : CheckCircle2

  return (
    <motion.div
      role={type === "error" ? "alert" : "status"}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0, x: type === "error" ? [0, -4, 4, -3, 3, 0] : 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-2.5 border px-4 py-3 text-sm",
        type === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-foreground/15 bg-foreground/[0.03] text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </motion.div>
  )
}

export { AnimatePresence }
