const formatters = new Map<string, Intl.NumberFormat>()

export function formatPrice(amount: number, currencyCode: string): string {
  const key = currencyCode.toUpperCase()
  let formatter = formatters.get(key)

  if (!formatter) {
    formatter = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: key,
      maximumFractionDigits: 0,
    })
    formatters.set(key, formatter)
  }

  return formatter.format(amount)
}
