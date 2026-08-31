import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { AuthWorkflowEvents } from "@medusajs/framework/utils"
import { sendEmail } from "../lib/resend"
import { PasswordResetEmail } from "../emails/password-reset"

type PasswordResetEventData = {
  entity_id: string
  actor_type: string
  token: string
}

export default async function passwordResetHandler({
  event,
}: SubscriberArgs<PasswordResetEventData>) {
  if (event.data.actor_type !== "customer") return

  const storefrontUrl = process.env.STOREFRONT_URL ?? "http://localhost:3000"
  const resetUrl = `${storefrontUrl}/account/reset-password?token=${event.data.token}&email=${encodeURIComponent(event.data.entity_id)}`

  await sendEmail({
    to: event.data.entity_id,
    subject: "Restablece tu contraseña",
    react: PasswordResetEmail({ resetUrl }),
  })
}

export const config: SubscriberConfig = {
  event: AuthWorkflowEvents.PASSWORD_RESET,
}
