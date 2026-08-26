import { getCurrentCustomer } from "@/lib/auth"
import { AddressBook } from "@/components/address-book"

export default async function AddressesPage() {
  const customer = await getCurrentCustomer()

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Direcciones</h1>
      <AddressBook initialAddresses={customer?.addresses ?? []} />
    </div>
  )
}
