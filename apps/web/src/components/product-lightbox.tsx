"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { MedusaImage } from "@/lib/medusa"

const ZOOM_SCALE = 2.4

export function ProductLightbox({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
  title,
}: {
  images: MedusaImage[]
  index: number
  onIndexChange: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
}) {
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState("50% 50%")
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragState = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [prevOpen, setPrevOpen] = useState(open)
  const [prevIndex, setPrevIndex] = useState(index)
  if (open !== prevOpen || index !== prevIndex) {
    setPrevOpen(open)
    setPrevIndex(index)
    if (zoomed) setZoomed(false)
    if (pan.x !== 0 || pan.y !== 0) setPan({ x: 0, y: 0 })
  }

  const goTo = (next: number) => {
    onIndexChange((next + images.length) % images.length)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomed) {
      setZoomed(false)
      setPan({ x: 0, y: 0 })
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
    setZoomed(true)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!zoomed) return
    dragState.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!zoomed || !dragState.current) return
    setPan({
      x: e.clientX - dragState.current.x,
      y: e.clientY - dragState.current.y,
    })
  }

  const handlePointerUp = () => {
    dragState.current = null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-[90vh] w-[95vw] max-w-5xl overflow-hidden border-none bg-background/95 p-0 sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 rounded-full bg-background/80 p-2 shadow-sm transition-colors hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Imagen anterior"
              className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-sm transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Imagen siguiente"
              className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-sm transition-colors hover:bg-muted"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}

        <div
          ref={containerRef}
          onClick={handleImageClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`relative h-full w-full ${zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
        >
          <div
            className="relative h-full w-full transition-transform duration-300 ease-out"
            style={{
              transform: zoomed
                ? `translate(${pan.x}px, ${pan.y}px) scale(${ZOOM_SCALE})`
                : "scale(1)",
              transformOrigin: origin,
            }}
          >
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={images[index].url}
                  alt={`${title} - imagen ${index + 1}`}
                  fill
                  sizes="95vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 text-xs text-muted-foreground">
          {zoomed ? <ZoomOut className="size-3.5" /> : <ZoomIn className="size-3.5" />}
          <span>{zoomed ? "Toca para alejar" : "Toca la imagen para acercar"}</span>
          {images.length > 1 ? (
            <span>
              {index + 1} / {images.length}
            </span>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
