"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerAction } from "@/app/actions/auth"

export function RegisterForm() {
  const router = useRouter()
  const firstNameId = useId()
  const lastNameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setError(null)

    const result = await registerAction({ email, password, firstName, lastName })
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor={firstNameId} className="text-xs tracking-wide text-muted-foreground uppercase">
            Nombre
          </label>
          <input
            id={firstNameId}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={lastNameId} className="text-xs tracking-wide text-muted-foreground uppercase">
            Apellido
          </label>
          <input
            id={lastNameId}
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>
      </div>
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
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <p className="text-xs text-muted-foreground">Minimo 8 caracteres.</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Creando cuenta..." : "Crear cuenta"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        Ya tienes cuenta?{" "}
        <Link href="/account/login" className="text-foreground underline">
          Inicia sesion
        </Link>
      </p>
    </form>
  )
}
