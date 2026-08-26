import { Resend } from "resend"
import type { ReactElement } from "react"

let client: Resend | null = null

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

// Without a verified domain, Resend's sandbox only delivers to the account
// owner's own verified email - this is a Resend restriction, not a bug here.
const FROM = "Maison Luxe <onboarding@resend.dev>"

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: ReactElement
}) {
  const resend = getClient()
  if (!resend) {
    console.warn(
      `[resend] RESEND_API_KEY no configurada. Se omitio el envio de "${subject}" a ${to}.`
    )
    return
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, react })
  if (error) {
    console.error(`[resend] Fallo el envio de "${subject}" a ${to}:`, error)
  }
}
