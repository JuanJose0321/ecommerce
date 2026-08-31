const SPANISH_COLOR_HEX: Record<string, string> = {
  negro: "#111111",
  "negro onix": "#111111",
  blanco: "#f5f5f4",
  "blanco perla": "#f2ede6",
  camel: "#c19a6b",
  bordeaux: "#5e2129",
  "verde bosque": "#2f4a3c",
  grafito: "#3a3a3a",
  champan: "#e8dcc4",
  "oro rosa": "#e0b0a2",
  "café": "#4b3621",
}

export function colorToHex(name: string): string {
  return SPANISH_COLOR_HEX[name.toLowerCase()] ?? "#a3a3a3"
}

export function isLightColor(name: string): boolean {
  const hex = colorToHex(name).replace("#", "")
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}
