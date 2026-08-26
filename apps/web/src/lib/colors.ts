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
}

export function colorToHex(name: string): string {
  return SPANISH_COLOR_HEX[name.toLowerCase()] ?? "#a3a3a3"
}
