"use client"

import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type SubmitButtonProps = {
  loading?: boolean
  loadingText?: string
  variant?: "primary" | "outline"
} & Omit<React.ComponentProps<typeof motion.button>, "children"> & {
    children: React.ReactNode
  }

export function SubmitButton({
  loading = false,
  loadingText,
  variant = "primary",
  disabled,
  className,
  children,
  type = "submit",
  ...props
}: SubmitButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      whileHover={isDisabled ? undefined : { scale: 1.01 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "relative flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-foreground text-background hover:bg-foreground/90 disabled:bg-foreground/50"
          : "border border-border text-foreground hover:border-foreground disabled:opacity-50",
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      <span>{loading && loadingText ? loadingText : children}</span>
    </motion.button>
  )
}
