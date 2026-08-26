import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { sendEmail } from "../lib/resend"
import { AbandonedCartEmail } from "../emails/abandoned-cart"

const ABANDONED_AFTER_HOURS = 4

export default async function abandonedCartJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const cartModuleService = container.resolve(Modules.CART)

  const cutoff = new Date(Date.now() - ABANDONED_AFTER_HOURS * 60 * 60 * 1000)

  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "email", "metadata", "updated_at", "completed_at", "items.id"],
    filters: {
      completed_at: null,
      updated_at: { $lt: cutoff },
    },
  })

  const candidates = carts.filter(
    (cart) =>
      cart.email &&
      (cart.items?.length ?? 0) > 0 &&
      !(cart.metadata as Record<string, unknown> | null)?.abandoned_email_sent
  )

  if (candidates.length === 0) return

  const storefrontUrl = process.env.STOREFRONT_URL ?? "http://localhost:3000"

  for (const cart of candidates) {
    await sendEmail({
      to: cart.email!,
      subject: "Dejaste piezas en tu carrito",
      react: AbandonedCartEmail({ checkoutUrl: `${storefrontUrl}/checkout` }),
    })

    await cartModuleService.updateCarts(cart.id, {
      metadata: { ...(cart.metadata as Record<string, unknown> | null), abandoned_email_sent: true },
    })
  }

  logger.info(`[abandoned-cart] Enviados ${candidates.length} recordatorios.`)
}

export const config = {
  name: "abandoned-cart-reminder",
  schedule: "0 * * * *",
}
