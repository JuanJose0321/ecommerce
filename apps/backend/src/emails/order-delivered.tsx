import { Text } from "@react-email/components"
import { EmailLayout } from "./components/email-layout"

export function OrderDeliveredEmail({ displayId }: { displayId: number }) {
  return (
    <EmailLayout
      preview={`Tu orden #${displayId} fue entregada`}
      heading="Tu pedido fue entregado"
    >
      <Text>
        Tu orden <strong>#{displayId}</strong> ya fue entregada. Esperamos que
        disfrutes tu pieza.
      </Text>
    </EmailLayout>
  )
}

export default OrderDeliveredEmail
