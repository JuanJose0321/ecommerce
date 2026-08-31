"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { resetPasswordAction } from "@/app/actions/auth"
import { AnimatedForm, FormFade } from "@/components/ui/animated-form"
import { AnimatePresence, FormBanner } from "@/components/ui/form-banner"
import { FormField } from "@/components/ui/form-field"
import { SubmitButton } from "@/components/ui/submit-button"

const MIN_PASSWORD_LENGTH = 8

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <FormFade>
        <FormBanner type="error">
          Este enlace no es válido. Solicita uno nuevo desde la página de
          recuperación.
        </FormBanner>
      </FormFade>
    )
  }

  const validatePassword = () => {
    if (password && password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`)
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    setStatus("submitting")
    setError(null)

    const result = await resetPasswordAction({ token, password })
    if (!result.ok) {
      setStatus("error")
      setError(result.message)
      return
    }

    setStatus("success")
    setTimeout(() => {
      router.push("/account/login")
    }, 700)
  }

  if (status === "success") {
    return (
      <FormFade className="mx-auto max-w-sm">
        <FormBanner type="success">Contraseña actualizada. Redirigiendo...</FormBanner>
      </FormFade>
    )
  }

  return (
    <AnimatedForm onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
      <FormField
        label="Nueva contraseña"
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
        hint={passwordError ? undefined : "Mínimo 8 caracteres."}
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

      <SubmitButton loading={status === "submitting"} loadingText="Guardando...">
        Restablecer contraseña
      </SubmitButton>
    </AnimatedForm>
  )
}
