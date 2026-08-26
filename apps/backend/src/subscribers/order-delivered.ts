import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, FulfillmentWorkflowEvents } from "@medusajs/framework/utils"
import { sendEmail } from "../lib/resend"
import { OrderDeliveredEmail } from "../emails/order-delivered"

export default async function orderDeliveredHandler({
  event,
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  if (event.data.no_notification) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email"],
    // @ts-expect-error -- fulfillments isn't in the generated order filter type on this Medusa version, but filtering by it works at runtime
    filters: { fulfillments: { id: event.data.id } },
  })

  if (!order) {
    logger.warn(`[order-delivered] No se encontro una orden para el fulfillment ${event.data.id}`)
    return
  }

  if (!order.email) return

  const displayId = Number(order.display_id ?? 0)

  await sendEmail({
    to: order.email,
    subject: `Tu orden #${displayId} fue entregada`,
    react: OrderDeliveredEmail({ displayId }),
  })
}

export const config: SubscriberConfig = {
  event: FulfillmentWorkflowEvents.DELIVERY_CREATED,
}
