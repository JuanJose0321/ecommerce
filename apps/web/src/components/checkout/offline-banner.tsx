"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"

export function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-16 z-50 flex items-center justify-center gap-2 bg-destructive px-4 py-2.5 text-center text-sm text-white"
    >
      <WifiOff className="size-4" aria-hidden="true" />
      Perdiste la conexion a internet. Tu progreso en el checkout se guarda, pero no
      podras confirmar el pago hasta reconectarte.
    </div>
  )
}
