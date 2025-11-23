"use client"

import { useEffect, useState } from "react"
import { Contract, JsonRpcProvider } from "ethers"
import savingCircleAbi from "@/lib/abi/savingcircle.sol.abi.json"
import { getSepoliaRpcUrl } from "@/lib/rpc"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export async function fetchRegisteredUsersList(
  circleAddress: string,
  provider?: JsonRpcProvider,
  maxUsers = 200,
): Promise<string[]> {
  const rpc = getSepoliaRpcUrl()
  if (!rpc && !provider) {
    throw new Error("Missing Sepolia RPC URL")
  }

  const rpcProvider = provider ?? new JsonRpcProvider(rpc)
  const contract = new Contract(circleAddress, savingCircleAbi, rpcProvider)

  const numUsersBn: bigint = await contract.numUsers()
  const totalSlots = Number(numUsersBn)
  const fetchCount = Math.min(totalSlots, maxUsers)
  if (fetchCount === 0) return []

  const registered: string[] = []
  for (let index = 0; index < fetchCount; index++) {
    try {
      const address: string = await contract.registeredUsers(index)
      if (!address) continue
      if (address.toLowerCase() === ZERO_ADDRESS) continue
      registered.push(address.toLowerCase())
    } catch {
      break
    }
  }

  return registered
}

export function useRegisteredUsers(circleAddress?: string, enabled = true, maxUsers = 200) {
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!circleAddress || !enabled) return

    const rpc = getSepoliaRpcUrl()
    if (!rpc) {
      setError("Missing Sepolia RPC URL")
      return
    }

    let cancelled = false
    const provider = new JsonRpcProvider(rpc)

    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const users = await fetchRegisteredUsersList(circleAddress, provider, maxUsers)
        if (!cancelled) {
          setRegisteredUsers(users)
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
  }, [circleAddress, enabled, maxUsers])

  return { registeredUsers, loading, error }
}

