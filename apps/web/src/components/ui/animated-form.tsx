"use client"

import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

export function AnimatedForm({ className, ...props }: React.ComponentProps<typeof motion.form>) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(className)}
      {...props}
    />
  )
}

export function FormFade({ className, ...props }: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(className)}
      {...props}
    />
  )
}

export { AnimatePresence }
