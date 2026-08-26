"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginAction } from "@/app/actions/auth"

export function LoginForm() {
  const router = useRouter()
  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setError(null)

    const result = await loginAction({ email, password })
    if (!result.ok) {
      setStatus("error")
      setError(result.message)
      return
    }

    router.push("/account")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-5">
      <div className="space-y-1.5">
        <label htmlFor={emailId} className="text-xs tracking-wide text-muted-foreground uppercase">
          Correo
        </label>
        <input
          id={emailId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={passwordId} className="text-xs tracking-wide text-muted-foreground uppercase">
          Contrasena
        </label>
        <input
          id={passwordId}
          type="password"
          required
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
        {status === "submitting" ? "Entrando..." : "Iniciar sesion"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/account/forgot-password" className="text-foreground underline">
          Olvidaste tu contrasena?
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        No tienes cuenta?{" "}
        <Link href="/account/register" className="text-foreground underline">
          Crea una
        </Link>
      </p>
    </form>
  )
}
