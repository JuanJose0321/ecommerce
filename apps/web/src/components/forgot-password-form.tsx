"use client"

import { useState } from "react"
import Link from "next/link"

import { forgotPasswordAction } from "@/app/actions/auth"
import { AnimatedForm, FormFade } from "@/components/ui/animated-form"
import { AnimatePresence } from "@/components/ui/form-banner"
import { FormField } from "@/components/ui/form-field"
import { SubmitButton } from "@/components/ui/submit-button"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle")

  const validateEmail = () => {
    if (email && !EMAIL_PATTERN.test(email)) {
      setEmailError("Ingresa un correo valido.")
      return false
    }
    setEmailError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail()) return

    setStatus("submitting")
    await forgotPasswordAction({ email })
    setStatus("sent")
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "sent" ? (
        <FormFade key="sent" className="mx-auto max-w-sm space-y-4 text-center">
          <p className="font-heading text-lg">Revisa tu correo</p>
          <p className="text-sm text-muted-foreground">
            Si existe una cuenta con ese correo, te enviamos un enlace para
            restablecer tu contrasena. Expira en 15 minutos.
          </p>
          <Link href="/account/login" className="text-sm text-foreground underline underline-offset-4 transition-opacity hover:opacity-70">
            Volver a inicio de sesion
          </Link>
        </FormFade>
      ) : (
        <AnimatedForm key="form" onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
          <FormField
            label="Correo"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError(null)
            }}
            onBlur={validateEmail}
            error={emailError}
          />
          <SubmitButton loading={status === "submitting"} loadingText="Enviando...">
            Enviar enlace
          </SubmitButton>
        </AnimatedForm>
      )}
    </AnimatePresence>
  )
}
