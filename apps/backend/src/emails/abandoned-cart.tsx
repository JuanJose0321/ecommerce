import { Button, Text } from "@react-email/components"
import { EmailLayout } from "./components/email-layout"

export function AbandonedCartEmail({ checkoutUrl }: { checkoutUrl: string }) {
  return (
    <EmailLayout
      preview="Dejaste piezas en tu carrito"
      heading="Tus piezas te esperan"
    >
      <Text>
        Dejaste articulos en tu carrito. Sigue disponibles, pero el stock es
        limitado.
      </Text>
      <Button
        href={checkoutUrl}
        style={{
          backgroundColor: "#1c1917",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "999px",
          fontSize: "14px",
          textDecoration: "none",
          display: "inline-block",
          marginTop: "16px",
        }}
      >
        Completar mi compra
      </Button>
    </EmailLayout>
  )
}

export default AbandonedCartEmail
