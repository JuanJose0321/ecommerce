"use client"

import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import type { CatalogProduct } from "@/lib/catalog"

const AUTOPLAY_INTERVAL_MS = 4000
const RESUME_AFTER_INTERACTION_MS = 5000
const NEAR_END_EPSILON_PX = 8

export function FeaturedCarousel({ products }: { products: CatalogProduct[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const hoveredRef = useRef(false)
  const interactionPausedRef = useRef(false)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollByAmount = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.85 * direction, behavior: "smooth" })
  }

  const pauseForInteraction = () => {
    interactionPausedRef.current = true
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = setTimeout(() => {
      interactionPausedRef.current = false
    }, RESUME_AFTER_INTERACTION_MS)
  }

  const handleArrowClick = (direction: 1 | -1) => {
    scrollByAmount(direction)
    pauseForInteraction()
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || products.length < 2) return

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let intervalId: ReturnType<typeof setInterval> | null = null

    const tick = () => {
      if (document.visibilityState !== "visible") return
      if (hoveredRef.current || interactionPausedRef.current) return

      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - NEAR_END_EPSILON_PX) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: el.clientWidth * 0.85, behavior: "smooth" })
      }
    }

    const start = () => {
      if (motionQuery.matches || intervalId) return
      intervalId = setInterval(tick, AUTOPLAY_INTERVAL_MS)
    }
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    start()
    const onMotionChange = () => (motionQuery.matches ? stop() : start())
    motionQuery.addEventListener("change", onMotionChange)

    return () => {
      stop()
      motionQuery.removeEventListener("change", onMotionChange)
    }
  }, [products.length])

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [])

  if (products.length === 0) return null

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl sm:text-3xl">Destacados</h2>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => handleArrowClick(-1)}
            aria-label="Anterior"
            className="flex size-9 items-center justify-center rounded-full border border-border transition-colors duration-200 hover:border-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => handleArrowClick(1)}
            aria-label="Siguiente"
            className="flex size-9 items-center justify-center rounded-full border border-border transition-colors duration-200 hover:border-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <motion.div
        ref={scrollerRef}
        data-testid="featured-carousel-scroller"
        onMouseEnter={() => {
          hoveredRef.current = true
        }}
        onMouseLeave={() => {
          hoveredRef.current = false
        }}
        onPointerDown={pauseForInteraction}
        onWheel={pauseForInteraction}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="scroll-hidden flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className="w-[70vw] shrink-0 snap-start sm:w-[240px] lg:w-[260px] xl:w-[280px]"
          >
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </motion.div>
    </section>
  )
}
