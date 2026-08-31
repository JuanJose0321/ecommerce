import { Text } from "@react-email/components"
import { EmailLayout } from "./components/email-layout"

export function OrderShippedEmail({ displayId }: { displayId: number }) {
  return (
    <EmailLayout
      preview={`Tu orden #${displayId} va en camino`}
      heading="Tu pedido va en camino"
    >
      <Text>
        Tu orden <strong>#{displayId}</strong> ya salió de nuestro almacén y
        está en camino.
      </Text>
    </EmailLayout>
  )
}

export default OrderShippedEmail
