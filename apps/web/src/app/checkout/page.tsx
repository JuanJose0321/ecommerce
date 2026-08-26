import { redirect } from "next/navigation"
import { getCart, getCartId } from "@/lib/cart"
import { listShippingOptions } from "@/lib/checkout"
import { CheckoutFlow } from "@/components/checkout/checkout-flow"

export default async function CheckoutPage() {
  const cartId = await getCartId()
  if (!cartId) redirect("/")

  const cart = await getCart()
  if (!cart || cart.items.length === 0) redirect("/")

  const shippingOptions = await listShippingOptions(cart.id)

  return <CheckoutFlow initialCart={cart} shippingOptions={shippingOptions} />
}
