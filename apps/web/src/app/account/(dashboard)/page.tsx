import { getCurrentCustomer } from "@/lib/auth"

export default async function AccountOverviewPage() {
  const customer = await getCurrentCustomer()

  return (
    <div className="space-y-2">
      <h1 className="font-heading text-2xl">
        Hola, {customer?.first_name ?? "cliente"}
      </h1>
      <p className="text-sm text-muted-foreground">{customer?.email}</p>
    </div>
  )
}
