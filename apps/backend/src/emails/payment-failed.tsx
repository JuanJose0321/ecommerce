import { Text } from "@react-email/components"
import { EmailLayout } from "./components/email-layout"

export function PaymentFailedEmail({
  reason,
  amount,
  currencyCode,
}: {
  reason: string
  amount?: string
  currencyCode?: string
}) {
  return (
    <EmailLayout
      preview="Un pago fallo en la tienda"
      heading="Pago fallido"
    >
      <Text>Un intento de pago fallo en la tienda.</Text>
      <Text style={{ fontSize: "14px", color: "#78716c" }}>Motivo: {reason}</Text>
      {amount ? (
        <Text style={{ fontSize: "14px", color: "#78716c" }}>
          Monto: {amount} {currencyCode?.toUpperCase()}
        </Text>
      ) : null}
    </EmailLayout>
  )
}

export default PaymentFailedEmail
