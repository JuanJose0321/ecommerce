"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[error-boundary]", error.digest ?? error.message)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Error
      </p>
      <h1 className="font-heading text-3xl sm:text-4xl">Algo salió mal</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        No pudimos completar esta acción. Intenta de nuevo o vuelve al inicio.
        {error.digest ? (
          <span className="mt-2 block text-xs">Referencia: {error.digest}</span>
        ) : null}
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-6 py-2.5 text-sm transition-colors hover:border-foreground"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
