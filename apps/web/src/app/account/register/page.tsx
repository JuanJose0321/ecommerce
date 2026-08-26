import { redirect } from "next/navigation"
import { getCurrentCustomer } from "@/lib/auth"
import { RegisterForm } from "@/components/register-form"

export default async function RegisterPage() {
  const customer = await getCurrentCustomer()
  if (customer) redirect("/account")

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <h1 className="font-heading mb-10 text-center text-3xl">Crea tu cuenta</h1>
      <RegisterForm />
    </div>
  )
}
