"use client"

import { useEffect, useState } from "react"
import { getSepoliaRpcUrl } from "@/lib/rpc"
import { fetchCircleContractData, type CircleContractData } from "@/lib/contract-data"
import { getCircleCache, setCircleCache } from "@/lib/circle-cache"
import { getSharedJsonRpcProvider } from "@/lib/shared-provider"

export function useCircleContractData(address?: string) {
  const [data, setData] = useState<CircleContractData | null>(() => getCircleCache(address))
  const [loading, setLoading] = useState(() => Boolean(address) && !getCircleCache(address))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    const rpc = getSepoliaRpcUrl()

    if (!rpc) {
      setError("Missing Sepolia RPC URL")
      return
    }

    let cancelled = false
    const provider = getSharedJsonRpcProvider(rpc)

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const payload = await fetchCircleContractData(address, provider)
        if (!cancelled) {
          setCircleCache(address, payload)
          setData(payload)
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load circle data")
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    const cached = getCircleCache(address)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    void fetchData()

    return () => {
      cancelled = true
    }
  }, [address])

  return { data, loading, error }
}

