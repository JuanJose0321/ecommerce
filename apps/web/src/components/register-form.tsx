"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

import { registerAction } from "@/app/actions/auth"
import { AnimatedForm, FormFade } from "@/components/ui/animated-form"
import { AnimatePresence, FormBanner } from "@/components/ui/form-banner"
import { FormField } from "@/components/ui/form-field"
import { SubmitButton } from "@/components/ui/submit-button"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export function RegisterForm() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const validateEmail = () => {
    if (email && !EMAIL_PATTERN.test(email)) {
      setEmailError("Ingresa un correo valido.")
      return false
    }
    setEmailError(null)
    return true
  }

  const validatePassword = () => {
    if (password && password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Minimo ${MIN_PASSWORD_LENGTH} caracteres.`)
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailOk = validateEmail()
    const passwordOk = validatePassword()
    if (!emailOk || !passwordOk) return

    setStatus("submitting")
    setError(null)

    const result = await registerAction({ email, password, firstName, lastName })
    if (!result.ok) {
      setStatus("error")
      setError(result.message)
      return
    }

    setStatus("success")
    setTimeout(() => {
      router.push("/account")
      router.refresh()
    }, 700)
  }

  if (status === "success") {
    return (
      <FormFade className="mx-auto max-w-sm">
        <FormBanner type="success">Cuenta creada. Bienvenido a Maison Luxe.</FormBanner>
      </FormFade>
    )
  }

  return (
    <AnimatedForm onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Nombre"
          autoComplete="given-name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <FormField
          label="Apellido"
          autoComplete="family-name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
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
        label="Contrasena"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          if (passwordError) setPasswordError(null)
        }}
        onBlur={validatePassword}
        error={passwordError}
        hint={passwordError ? undefined : "Minimo 8 caracteres."}
        endAdornment={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
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

      <SubmitButton loading={status === "submitting"} loadingText="Creando cuenta...">
        Crear cuenta
      </SubmitButton>

      <FormFade>
        <p className="text-center text-sm text-muted-foreground">
          Ya tienes cuenta?{" "}
          <Link href="/account/login" className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70">
            Inicia sesion
          </Link>
        </p>
      </FormFade>
    </AnimatedForm>
  )
}
