import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCircleDisplayName(address?: string) {
  const fallback = 'SavingCircle'
  if (!address) return fallback
  const normalized = address.toLowerCase()
  const withPrefix = normalized.startsWith('0x') ? normalized : `0x${normalized}`
  const fragment = withPrefix.slice(0, 10) // 0x + first 8 chars
  return `${fallback} ${fragment}`
}
