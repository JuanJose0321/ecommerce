import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, OrderWorkflowEvents } from "@medusajs/framework/utils"
import { sendEmail } from "../lib/resend"
import { OrderConfirmationEmail } from "../emails/order-confirmation"

export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "currency_code", "total", "items.title", "items.quantity"],
    filters: { id: event.data.id },
  })

  if (!order || !order.email) return

  const displayId = Number(order.display_id ?? 0)
  const total = Number(order.total ?? 0).toLocaleString("es-MX")
  const items = (order.items ?? [])
    .filter((i): i is NonNullable<typeof i> => i != null)
    .map((i) => ({
      title: i.title,
      quantity: Number(i.quantity ?? 0),
    }))

  await sendEmail({
    to: order.email,
    subject: `Confirmamos tu orden #${displayId}`,
    react: OrderConfirmationEmail({
      displayId,
      items,
      total,
      currencyCode: order.currency_code,
    }),
  })

  const ownerEmail = process.env.STORE_OWNER_EMAIL
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `Nueva orden #${displayId}`,
      react: OrderConfirmationEmail({
        displayId,
        items,
        total,
        currencyCode: order.currency_code,
      }),
    })
  }
}

export const config: SubscriberConfig = {
  event: OrderWorkflowEvents.PLACED,
}
