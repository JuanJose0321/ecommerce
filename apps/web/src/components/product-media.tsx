"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { ProductLightbox } from "@/components/product-lightbox"
import { isWebGLAvailable } from "@/lib/webgl"
import type { MedusaImage } from "@/lib/medusa"

const Product3DViewer = dynamic(
  () => import("@/components/product-3d-viewer").then((m) => m.Product3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    ),
  }
)

export function ProductMedia({
  images,
  title,
  model3dUrl,
}: {
  images: MedusaImage[]
  title: string
  model3dUrl: string | null
}) {
  const [mode, setMode] = useState<"gallery" | "3d">("gallery")
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [webglOk] = useState<boolean>(() => isWebGLAvailable())

  const showFallback = mode === "3d" && !webglOk

  return (
    <div>
      {model3dUrl ? (
        <div className="mb-3 flex gap-2">
          <ModeButton active={mode === "gallery"} onClick={() => setMode("gallery")}>
            Fotos
          </ModeButton>
          <ModeButton active={mode === "3d"} onClick={() => setMode("3d")}>
            Vista 3D
          </ModeButton>
        </div>
      ) : null}

      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {mode === "3d" && model3dUrl && !showFallback ? (
          <Product3DViewer modelUrl={model3dUrl} />
        ) : mode === "3d" && showFallback ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              Tu dispositivo no soporta vista 3D (WebGL). Mostrando la galeria de
              fotos en su lugar.
            </p>
            <button
              type="button"
              onClick={() => setMode("gallery")}
              className="rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:border-foreground"
            >
              Ver fotos
            </button>
          </div>
        ) : images[activeIndex] ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Ampliar imagen"
            className="group relative h-full w-full cursor-zoom-in"
          >
            <Image
              src={images[activeIndex].url}
              alt={title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="eager"
              fetchPriority="high"
            />
          </button>
        ) : null}
      </div>

      {mode === "gallery" && images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === activeIndex}
              className={`relative size-16 overflow-hidden bg-muted transition-opacity ${
                i === activeIndex ? "opacity-100 ring-1 ring-foreground" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {images.length > 0 ? (
        <ProductLightbox
          images={images}
          index={activeIndex}
          onIndexChange={setActiveIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          title={title}
        />
      ) : null}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground hover:border-foreground"
      }`}
    >
      {children}
    </button>
  )
}
