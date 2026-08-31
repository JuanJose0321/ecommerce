"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

const BANNER_ID = "promo-bienvenida10"
const STORAGE_KEY = `maison-luxe:banner-dismissed:${BANNER_ID}`

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!window.sessionStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // ignore storage failures
    }
  }

  return (
    <div className="relative flex items-center justify-center gap-2 bg-foreground px-10 py-2 text-center text-xs text-background">
      <span>
        10% de descuento en tu primera compra con el código{" "}
        <strong className="font-medium">BIENVENIDA10</strong>
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar aviso"
        className="absolute right-3 flex items-center justify-center rounded-full p-1 transition-opacity hover:opacity-70"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
