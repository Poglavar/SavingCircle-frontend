"use client"

import { useEffect, useState } from "react"
import { Contract, JsonRpcProvider } from "ethers"
import savingCircleAbi from "@/lib/abi/savingcircle.sol.abi.json"
import { getSepoliaRpcUrl } from "@/lib/rpc"
import { withRpcThrottle } from "@/lib/rpc-throttle"
import { getSharedJsonRpcProvider } from "@/lib/shared-provider"
import { getRegisteredUsersCache, setRegisteredUsersCache } from "@/lib/registered-users-cache"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export async function fetchRegisteredUsersList(circleAddress: string, provider?: JsonRpcProvider): Promise<string[]> {
  const rpc = getSepoliaRpcUrl()
  if (!rpc && !provider) {
    throw new Error("Missing Sepolia RPC URL")
  }

  const rpcProvider = provider ?? getSharedJsonRpcProvider(rpc)
  const contract = new Contract(circleAddress, savingCircleAbi, rpcProvider)

  const logs = await contract.queryFilter(contract.filters.UserRegister(), 0, "latest")
  const registered = logs
    .map((log) => {
      const address = log.args?.[0] as string | undefined
      if (!address) return null
      const normalized = address.toLowerCase()
      if (normalized === ZERO_ADDRESS) return null
      return normalized
    })
    .filter((addr): addr is string => Boolean(addr))

  return Array.from(new Set(registered))
}

export function useRegisteredUsers(circleAddress?: string, enabled = true) {
  const initialCache = getRegisteredUsersCache(circleAddress)
  const [registeredUsers, setRegisteredUsers] = useState<string[]>(initialCache ?? [])
  const [loading, setLoading] = useState(Boolean(circleAddress) && !initialCache && enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!circleAddress || !enabled) return

    const rpc = getSepoliaRpcUrl()
    if (!rpc) {
      setError("Missing Sepolia RPC URL")
      return
    }

    let cancelled = false
    const cached = getRegisteredUsersCache(circleAddress)
    if (cached) {
      setRegisteredUsers(cached)
      setLoading(false)
      return
    }

    const provider = getSharedJsonRpcProvider(rpc)

    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const users = await fetchRegisteredUsersList(circleAddress, provider)
        if (!cancelled) {
          setRegisteredUsers(users)
          setRegisteredUsersCache(circleAddress, users)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load registered users")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchUsers()

    return () => {
      cancelled = true
    }
  }, [circleAddress, enabled])

  return { registeredUsers, loading, error }
}

