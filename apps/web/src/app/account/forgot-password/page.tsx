import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <h1 className="font-heading mb-10 text-center text-3xl">
        Recupera tu contraseña
      </h1>
      <ForgotPasswordForm />
    </div>
  )
}
