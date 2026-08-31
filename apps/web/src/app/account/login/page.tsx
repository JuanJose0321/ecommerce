import { redirect } from "next/navigation"
import { getCurrentCustomer } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const customer = await getCurrentCustomer()
  if (customer) redirect("/account")

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <h1 className="font-heading mb-10 text-center text-3xl">Inicia sesión</h1>
      <LoginForm />
    </div>
  )
}
