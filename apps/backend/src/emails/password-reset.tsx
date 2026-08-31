import { Button, Text } from "@react-email/components"
import { EmailLayout } from "./components/email-layout"

export function PasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <EmailLayout
      preview="Restablece tu contraseña"
      heading="Restablece tu contraseña"
    >
      <Text>
        Recibimos una solicitud para restablecer tu contraseña. Este enlace
        expira en 15 minutos. Si tú no lo pediste, ignora este correo.
      </Text>
      <Button
        href={resetUrl}
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
        Restablecer contraseña
      </Button>
    </EmailLayout>
  )
}

export default PasswordResetEmail
