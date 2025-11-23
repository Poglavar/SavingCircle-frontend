import type { CircleContractData } from "@/lib/contract-data"

const cache = new Map<string, CircleContractData>()

const normalize = (address: string) => address.toLowerCase()

export function setCircleCache(address: string, data: CircleContractData) {
  cache.set(normalize(address), data)
}

export function getCircleCache(address: string | undefined) {
  if (!address) return null
  return cache.get(normalize(address)) ?? null
}

export function clearCircleCache(address?: string) {
  if (!address) {
    cache.clear()
    return
  }
  cache.delete(normalize(address))
}


