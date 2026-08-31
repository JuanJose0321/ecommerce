"use client"

import { useState } from "react"
import Image from "next/image"
import { Gem } from "lucide-react"

import { cn } from "@/lib/utils"

export function ProductThumbnail({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  priority,
}: {
  src: string | null | undefined
  alt: string
  sizes: string
  className?: string
  imageClassName?: string
  priority?: boolean
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error")

  if (!src || status === "error") {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted",
          className
        )}
      >
        <Gem className="size-6 text-muted-foreground/30" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    )
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-muted", className)}>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 animate-pulse bg-muted transition-opacity duration-300",
          status === "loaded" ? "opacity-0" : "opacity-100"
        )}
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn(
          "object-cover transition-opacity duration-500",
          status === "loaded" ? "opacity-100" : "opacity-0",
          imageClassName
        )}
      />
    </div>
  )
}
