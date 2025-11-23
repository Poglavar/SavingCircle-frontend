const cache = new Map<string, string[]>()

const normalize = (address: string) => address.toLowerCase()

export function getRegisteredUsersCache(address?: string) {
  if (!address) return null
  return cache.get(normalize(address)) ?? null
}

export function setRegisteredUsersCache(address: string, users: string[]) {
  cache.set(normalize(address), users)
}

export function clearRegisteredUsersCache(address?: string) {
  if (!address) {
    cache.clear()
    return
  }
  cache.delete(normalize(address))
}


