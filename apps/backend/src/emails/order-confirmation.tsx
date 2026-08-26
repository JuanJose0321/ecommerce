import { Section, Text } from "@react-email/components"
import { EmailLayout } from "./components/email-layout"

export type OrderEmailItem = {
  title: string
  quantity: number
}

export function OrderConfirmationEmail({
  displayId,
  items,
  total,
  currencyCode,
}: {
  displayId: number
  items: OrderEmailItem[]
  total: string
  currencyCode: string
}) {
  return (
    <EmailLayout
      preview={`Tu orden #${displayId} fue confirmada`}
      heading={`Gracias por tu compra`}
    >
      <Text>
        Confirmamos tu orden <strong>#{displayId}</strong>. Te avisaremos en
        cuanto salga hacia ti.
      </Text>
      <Section style={{ margin: "24px 0" }}>
        {items.map((item, i) => (
          <Text key={i} style={{ margin: "4px 0", fontSize: "14px" }}>
            {item.quantity}x {item.title}
          </Text>
        ))}
      </Section>
      <Text style={{ fontWeight: "bold" }}>
        Total: {total} {currencyCode.toUpperCase()}
      </Text>
    </EmailLayout>
  )
}

export default OrderConfirmationEmail
