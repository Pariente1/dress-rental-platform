import type React from "react"
export interface ColorOption {
  name: string
  hex: string
  displayName?: string
}

export const COLOR_MAP: Record<string, string> = {
  // Primary colors
  Rojo: "#EF4444",
  Azul: "#3B82F6",
  Amarillo: "#EAB308",
  // Neutral colors
  Blanco: "#FFFFFF",
  Negro: "#000000",
  // Secondary colors
  Verde: "#10B981",
  Naranja: "#F97316",
  Morado: "#8B5CF6",
  Rosa: "#EC4899",
  // Special colors
  Vino: "#722F37",
  Dorado: "#D4AF37",
  Plateado: "#9CA3AF",
  Beige: "#D4B896",
  Coral: "#FF7F50",
  Turquesa: "#06B6D4",
  Lavanda: "#A78BFA",
  Otro: "conic-gradient",
}

// Ordered list for UI display - priority colors first
export const PREFERRED_COLOR_ORDER = ["Rojo", "Amarillo", "Azul", "Blanco", "Negro"]

export const COLOR_OPTIONS: ColorOption[] = [
  { name: "Rojo", hex: "#EF4444" },
  { name: "Amarillo", hex: "#EAB308" },
  { name: "Azul", hex: "#3B82F6" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Negro", hex: "#000000" },
  { name: "Verde", hex: "#10B981" },
  { name: "Naranja", hex: "#F97316" },
  { name: "Morado", hex: "#8B5CF6" },
  { name: "Rosa", hex: "#EC4899" },
  { name: "Vino", hex: "#722F37" },
  { name: "Dorado", hex: "#D4AF37" },
  { name: "Plateado", hex: "#9CA3AF" },
  { name: "Otro", hex: "conic-gradient" },
]

// Helper function to get hex from color name
export function getColorHex(colorName: string): string {
  if (!colorName) return "#CCCCCC"

  // Direct lookup
  if (COLOR_MAP[colorName]) {
    return COLOR_MAP[colorName]
  }

  // Case-insensitive lookup
  const normalizedName = colorName.charAt(0).toUpperCase() + colorName.slice(1).toLowerCase()
  if (COLOR_MAP[normalizedName]) {
    return COLOR_MAP[normalizedName]
  }

  // Check if it's already a hex code
  if (colorName.startsWith("#")) {
    return colorName
  }

  // Default fallback
  return "#CCCCCC"
}

// Helper function to get color style (handles Otro/multicolor)
export function getColorStyle(colorNameOrHex: string): React.CSSProperties {
  const normalizedName = colorNameOrHex?.toLowerCase()

  // Check for "Otro" or legacy "Multicolor" names
  if (normalizedName === "otro" || normalizedName === "multicolor" || normalizedName === "estampado") {
    return {
      background: "conic-gradient(#EF4444 0deg 180deg, #3B82F6 180deg 360deg)",
    }
  }

  const hex = getColorHex(colorNameOrHex)

  if (hex === "conic-gradient") {
    return {
      background: "conic-gradient(#EF4444 0deg 180deg, #3B82F6 180deg 360deg)",
    }
  }

  return { backgroundColor: hex }
}

// Helper to get border color (gray for white, subtle for Otro)
export function getColorBorder(colorName: string): string {
  const normalizedName = colorName?.toLowerCase()

  if (normalizedName === "blanco" || colorName === "#FFFFFF") {
    return "#9CA3AF"
  }
  if (normalizedName === "otro" || normalizedName === "multicolor") {
    return "rgba(0,0,0,0.05)"
  }
  return "transparent"
}

// Sort colors by preferred order
export function sortColorsByPreference(colors: { name: string; [key: string]: any }[]): typeof colors {
  return [...colors].sort((a, b) => {
    const indexA = PREFERRED_COLOR_ORDER.indexOf(a.name)
    const indexB = PREFERRED_COLOR_ORDER.indexOf(b.name)

    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    return a.name.localeCompare(b.name)
  })
}
