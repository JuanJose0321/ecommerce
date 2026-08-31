"use client"

import { AnimatePresence, motion } from "framer-motion"

export function FieldMessage({
  id,
  error,
  hint,
}: {
  id: string
  error?: string | null
  hint?: string
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {error ? (
        <motion.p
          key="error"
          id={`${id}-error`}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      ) : hint ? (
        <motion.p
          key="hint"
          id={`${id}-hint`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-muted-foreground"
        >
          {hint}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}
