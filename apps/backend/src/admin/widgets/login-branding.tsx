import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Text } from "@medusajs/ui"

const LoginBrandingWidget = () => {
  return (
    <div className="mb-6 flex flex-col items-center gap-1">
      <Text
        size="xlarge"
        weight="plus"
        className="tracking-[0.3em] uppercase"
      >
        Maison Luxe
      </Text>
      <Text size="small" className="text-ui-fg-subtle tracking-widest uppercase">
        Panel de administracion
      </Text>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginBrandingWidget
