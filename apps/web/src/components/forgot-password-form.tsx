"use client"

import { useId, useState } from "react"
import Link from "next/link"
import { forgotPasswordAction } from "@/app/actions/auth"

export function ForgotPasswordForm() {
  const emailId = useId()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    await forgotPasswordAction({ email })
    setStatus("sent")
  }

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-sm space-y-4 text-center">
        <p className="font-heading text-lg">Revisa tu correo</p>
        <p className="text-sm text-muted-foreground">
          Si existe una cuenta con ese correo, te enviamos un enlace para
          restablecer tu contrasena. Expira en 15 minutos.
        </p>
        <Link href="/account/login" className="text-sm text-foreground underline">
          Volver a inicio de sesion
        </Link>
      </div>
    )
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
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Enviando..." : "Enviar enlace"}
      </button>
    </form>
  )
}
