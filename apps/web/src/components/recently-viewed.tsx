"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/format"

export type ViewedSnapshot = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  minPrice: number
  currency: string
}

const STORAGE_KEY = "maison-luxe:recently-viewed"
const MAX_ITEMS = 8

export function RecentlyViewed({ current }: { current: ViewedSnapshot }) {
  const [items, setItems] = useState<ViewedSnapshot[]>([])

  useEffect(() => {
    // localStorage is unavailable during SSR, so the read/write/setState has to
    // happen post-hydration here rather than during render.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const list: ViewedSnapshot[] = raw ? JSON.parse(raw) : []
      const withoutCurrent = list.filter((i) => i.id !== current.id)
      const updated = [current, ...withoutCurrent].slice(0, MAX_ITEMS)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(updated.filter((i) => i.id !== current.id))
    } catch {
      setItems([])
    }
  }, [current])

  if (items.length === 0) return null

  return (
    <section className="space-y-4 border-t border-border pt-10">
      <h2 className="font-heading text-2xl">Vistos recientemente</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.handle}`}
            className="w-32 shrink-0 space-y-2"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <p className="truncate text-xs">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatPrice(item.minPrice, item.currency)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
