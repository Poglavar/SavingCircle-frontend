"use client"

import { useEffect, useState } from "react"
import { JsonRpcProvider } from "ethers"
import { getSepoliaRpcUrl } from "@/lib/rpc"
import { fetchCircleContractData, type CircleContractData } from "@/lib/contract-data"

const REFRESH_INTERVAL_MS = 15000

export function useCircleContractData(address?: string) {
  const [data, setData] = useState<CircleContractData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    const rpc = getSepoliaRpcUrl()

    if (!rpc) {
      setError("Missing Sepolia RPC URL")
      return
    }

    let cancelled = false
    let pollTimer: ReturnType<typeof setInterval> | null = null
    const provider = new JsonRpcProvider(rpc)

    const fetchData = async (isBackground = false) => {
      if (!isBackground) {
        setLoading(true)
      }
      setError(null)
      try {
        const payload = await fetchCircleContractData(address, provider)
        if (!cancelled) {
          setData(payload)
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load circle data")
      } finally {
        if (!cancelled && !isBackground) {
          setLoading(false)
        }
      }
    }

    fetchData(false)
    pollTimer = setInterval(() => {
      void fetchData(true)
    }, REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      if (pollTimer) {
        clearInterval(pollTimer)
      }
    }
  }, [address])

  return { data, loading, error }
}

