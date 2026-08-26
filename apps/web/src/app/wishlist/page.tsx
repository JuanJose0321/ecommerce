"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { useWishlist } from "@/components/wishlist-provider"
import { formatPrice } from "@/lib/format"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function WishlistPage() {
  const { items, toggle } = useWishlist()

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Favoritos" }]} />

      <h1 className="font-heading mt-6 text-3xl sm:text-4xl">Tus favoritos</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Heart className="size-8 text-muted-foreground" />
          <p className="font-heading text-lg">Aun no tienes favoritos</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Guarda las piezas que te interesen desde el catalogo tocando el
            corazon en cada producto.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-full border border-border px-5 py-2 text-sm transition-colors hover:border-foreground"
          >
            Ver catalogo
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <button
                type="button"
                onClick={() => toggle(item)}
                aria-label="Quitar de favoritos"
                className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
              >
                <Heart className="size-4 fill-foreground text-foreground" />
              </button>
              <Link href={`/products/${item.handle}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="font-heading text-lg leading-snug">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.minPrice, item.currency)}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
