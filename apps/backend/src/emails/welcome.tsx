import { Text } from "@react-email/components"
import { EmailLayout } from "./components/email-layout"

export function WelcomeEmail({ firstName }: { firstName: string | null }) {
  return (
    <EmailLayout preview="Bienvenido a Maison Luxe" heading="Bienvenido">
      <Text>
        Hola{firstName ? ` ${firstName}` : ""}, gracias por crear tu cuenta en
        Maison Luxe. Ya puedes ver tu historial de órdenes, guardar
        direcciones y tus piezas favoritas.
      </Text>
    </EmailLayout>
  )
}

export default WelcomeEmail
