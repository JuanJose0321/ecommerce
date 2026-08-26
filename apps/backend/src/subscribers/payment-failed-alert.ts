import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules, PaymentActions, PaymentWebhookEvents } from "@medusajs/framework/utils"
import { sendEmail } from "../lib/resend"
import { PaymentFailedEmail } from "../emails/payment-failed"

type WebhookReceivedData = {
  provider: string
  payload: { data: Record<string, unknown>; rawData: Buffer; headers: Record<string, unknown> }
}

export default async function paymentFailedAlertHandler({
  event,
  container,
}: SubscriberArgs<WebhookReceivedData>) {
  const ownerEmail = process.env.STORE_OWNER_EMAIL
  if (!ownerEmail) return

  const paymentService = container.resolve(Modules.PAYMENT)
  const input = { ...event.data }
  if ((input.payload?.rawData as unknown as { type?: string })?.type === "Buffer") {
    input.payload.rawData = Buffer.from(
      (input.payload.rawData as unknown as { data: number[] }).data
    )
  }

  let processedEvent: Awaited<ReturnType<typeof paymentService.getWebhookActionAndData>>
  try {
    processedEvent = await paymentService.getWebhookActionAndData(input)
  } catch {
    return
  }

  if (processedEvent?.action !== PaymentActions.FAILED) return

  const data = processedEvent.data as {
    amount?: number
    currency_code?: string
  }

  await sendEmail({
    to: ownerEmail,
    subject: "⚠️ Pago fallido",
    react: PaymentFailedEmail({
      reason: "El proveedor de pago reporto un fallo (revisa el dashboard de Stripe para el detalle).",
      amount: data.amount?.toLocaleString("es-MX"),
      currencyCode: data.currency_code,
    }),
  })
}

export const config: SubscriberConfig = {
  event: PaymentWebhookEvents.WebhookReceived,
}
