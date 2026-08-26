// CDMX postal codes range roughly from 01000 to 16999.
const CDMX_RANGE: [number, number] = [1000, 16999]

export type ShippingEstimate = {
  zone: "CDMX" | "Nacional"
  standardDays: string
  expressDays: string
}

export function estimateShippingByPostalCode(postalCode: string): ShippingEstimate | null {
  const digits = postalCode.trim()
  if (!/^\d{5}$/.test(digits)) return null

  const value = Number(digits)
  const isCdmx = value >= CDMX_RANGE[0] && value <= CDMX_RANGE[1]

  return isCdmx
    ? { zone: "CDMX", standardDays: "1-2 dias habiles", expressDays: "mismo dia o siguiente" }
    : { zone: "Nacional", standardDays: "3-5 dias habiles", expressDays: "24-48 horas" }
}
