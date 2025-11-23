"use client"

import { useEffect, useMemo, useState } from "react"
import { JsonRpcProvider } from "ethers"
import { fetchCircleContractData, type CircleContractData } from "@/lib/contract-data"
import { getSepoliaRpcUrl } from "@/lib/rpc"
import { fetchRegisteredUsersList } from "@/lib/hooks/use-registered-users"

export type CircleListItem = {
  id: string
  address: string
  contract: CircleContractData
  members: number
  maxMembers: number
  prize: number
  timeLeft: number
}

const deriveTimeLeft = (roundDeadline?: number) => {
  if (!roundDeadline) return 0
  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, roundDeadline - now)
}

const POLL_INTERVAL_MS = 15000

export function useDeployedCircles() {
  const [circles, setCircles] = useState<CircleListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let pollTimer: ReturnType<typeof setInterval> | null = null

    const fetchCircles = async (isBackground = false) => {
      if (!isBackground) {
        setLoading(true)
      }
      setError(null)
      try {
        const response = await fetch("/api/deployed-circles")
        if (!response.ok) {
          throw new Error("Failed to load deployed circles")
        }
        const { addresses } = (await response.json()) as { addresses: string[] }
        if (!addresses || addresses.length === 0) {
          if (!cancelled) {
            setCircles([])
          }
          return
        }

        const provider = new JsonRpcProvider(getSepoliaRpcUrl())
        const results = await Promise.all(
          addresses.map(async (address) => {
            try {
              const data = await fetchCircleContractData(address, provider)
              const registeredUsers = await fetchRegisteredUsersList(address, provider)
              const members = registeredUsers.length
              const prize = data.installmentSize * (data.numUsers || 0)
              const timeLeft = deriveTimeLeft(data.roundDeadline)
              return {
                id: address.toLowerCase(),
                address,
                contract: data,
                members,
                maxMembers: data.numUsers,
                prize,
                timeLeft,
              }
            } catch (err) {
              console.error("Failed to load circle", address, err)
              return null
            }
          }),
        )

        if (!cancelled) {
          setCircles(results.filter((circle): circle is CircleListItem => circle !== null))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch circles")
        }
      } finally {
        if (!cancelled) {
          if (!isBackground) {
            setLoading(false)
          }
        }
      }
    }

    fetchCircles(false)
    pollTimer = setInterval(() => {
      void fetchCircles(true)
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (pollTimer) {
        clearInterval(pollTimer)
      }
    }
  }, [])

  const sortedCircles = useMemo(() => {
    return [...circles].sort((a, b) => a.contract.name.localeCompare(b.contract.name))
  }, [circles])

  return { circles: sortedCircles, loading, error }
}


