"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"
import { resetPasswordAction } from "@/app/actions/auth"

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter()
  const passwordId = useId()
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <p className="text-center text-sm text-destructive">
        Este enlace no es valido. Solicita uno nuevo desde la pagina de
        recuperacion.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setError(null)

    const result = await resetPasswordAction({ token, password })
    if (!result.ok) {
      setStatus("error")
      setError(result.message)
      return
    }

    router.push("/account/login")
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-5">
      <div className="space-y-1.5">
        <label htmlFor={passwordId} className="text-xs tracking-wide text-muted-foreground uppercase">
          Nueva contrasena
        </label>
        <input
          id={passwordId}
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Guardando..." : "Restablecer contrasena"}
      </button>
    </form>
  )
}
