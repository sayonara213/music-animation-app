import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // Remove leading '#' if present
  hex = hex.replace(/^#/, '')

  if (hex.length === 3) {
    // Expand shorthand form (e.g., 'f00' -> 'ff0000')
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  if (hex.length !== 6) {
    return null
  }

  // Parse the hex color string
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return { r, g, b }
}
