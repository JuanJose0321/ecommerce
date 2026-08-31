"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

import { loginAction } from "@/app/actions/auth"
import { AnimatedForm, FormFade } from "@/components/ui/animated-form"
import { AnimatePresence, FormBanner } from "@/components/ui/form-banner"
import { FormField } from "@/components/ui/form-field"
import { SubmitButton } from "@/components/ui/submit-button"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const validateEmail = () => {
    if (email && !EMAIL_PATTERN.test(email)) {
      setEmailError("Ingresa un correo válido.")
      return false
    }
    setEmailError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail()) return

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
    <AnimatedForm onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
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
      <FormField
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        endAdornment={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />

      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <FormBanner key="form-error" type="error">
            {error}
          </FormBanner>
        ) : null}
      </AnimatePresence>

      <SubmitButton loading={status === "submitting"} loadingText="Entrando...">
        Iniciar sesión
      </SubmitButton>

      <FormFade className="space-y-2">
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/account/forgot-password" className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70">
            Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          No tienes cuenta?{" "}
          <Link href="/account/register" className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70">
            Crea una
          </Link>
        </p>
      </FormFade>
    </AnimatedForm>
  )
}
