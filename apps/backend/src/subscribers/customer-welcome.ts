import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, CustomerWorkflowEvents } from "@medusajs/framework/utils"
import { sendEmail } from "../lib/resend"
import { WelcomeEmail } from "../emails/welcome"

export default async function customerWelcomeHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "has_account"],
    filters: { id: event.data.id },
  })

  if (!customer || !customer.has_account || !customer.email) return

  await sendEmail({
    to: customer.email,
    subject: "Bienvenido a Maison Luxe",
    react: WelcomeEmail({ firstName: customer.first_name }),
  })
}

export const config: SubscriberConfig = {
  event: CustomerWorkflowEvents.CREATED,
}
