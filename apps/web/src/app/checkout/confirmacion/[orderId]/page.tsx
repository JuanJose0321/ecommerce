import { notFound } from "next/navigation"
import { getOrder } from "@/lib/checkout"
import { OrderConfirmation } from "@/components/checkout/order-confirmation"

export default async function OrderConfirmationPage({
  params,
}: PageProps<"/checkout/confirmacion/[orderId]">) {
  const { orderId } = await params
  const order = await getOrder(orderId)

  if (!order) notFound()

  return <OrderConfirmation order={order} />
}
