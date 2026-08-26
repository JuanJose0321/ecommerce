"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

export type WishlistItem = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  minPrice: number
  currency: string
}

type WishlistContextValue = {
  items: WishlistItem[]
  isSaved: (id: string) => boolean
  toggle: (item: WishlistItem) => void
}

const STORAGE_KEY = "maison-luxe:wishlist"

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore malformed/unavailable storage
    }
  }, [])

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id)
      const next = exists ? prev.filter((i) => i.id !== item.id) : [item, ...prev]
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore write failures (private mode, quota, etc.)
      }
      return next
    })
  }, [])

  const isSaved = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  )

  return (
    <WishlistContext.Provider value={{ items, isSaved, toggle }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist debe usarse dentro de WishlistProvider")
  return ctx
}
