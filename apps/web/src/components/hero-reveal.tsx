"use client"

import { motion } from "framer-motion"

// Scale lives on the image itself (not the section) so the brief zoom-in
// settle never pushes the full-bleed hero wider than the viewport — the
// section's own overflow-hidden clips it safely.
export function HeroReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  )
}

export function HeroTextGroup({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex flex-col items-center gap-4 px-6 text-center"
    >
      {children}
    </motion.div>
  )
}
