import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

export function EmailLayout({
  preview,
  heading,
  children,
}: {
  preview: string
  heading: string
  children: ReactNode
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f5f5f4", fontFamily: "Georgia, serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "40px auto",
            padding: "40px",
            maxWidth: "480px",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#78716c",
              margin: "0 0 24px",
            }}
          >
            Maison Luxe
          </Text>
          <Heading style={{ fontSize: "22px", margin: "0 0 16px" }}>{heading}</Heading>
          <Section>{children}</Section>
          <Hr style={{ borderColor: "#e7e5e4", margin: "32px 0 16px" }} />
          <Text style={{ fontSize: "12px", color: "#a8a29e" }}>
            Maison Luxe — relojería, joyería, moda y tecnología premium.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
