const FULFILLMENT_LABELS: Record<string, string> = {
  not_fulfilled: "Procesando",
  partially_fulfilled: "Procesando",
  fulfilled: "Procesando",
  partially_shipped: "Enviado parcialmente",
  shipped: "Enviado",
  partially_delivered: "Entregado parcialmente",
  delivered: "Entregado",
  canceled: "Cancelado",
}

export function getFulfillmentLabel(status: string): string {
  return FULFILLMENT_LABELS[status] ?? status
}

export function getFulfillmentTone(
  status: string
): "muted" | "amber" | "green" | "destructive" {
  if (status === "delivered" || status === "partially_delivered") return "green"
  if (status === "shipped" || status === "partially_shipped") return "amber"
  if (status === "canceled") return "destructive"
  return "muted"
}
