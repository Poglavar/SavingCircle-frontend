"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchCircleContractData, type CircleContractData } from "@/lib/contract-data"
import { setCircleCache } from "@/lib/circle-cache"
import { getSepoliaRpcUrl } from "@/lib/rpc"
import { getSharedJsonRpcProvider } from "@/lib/shared-provider"

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

type CirclesState = {
  circles: CircleListItem[]
  loading: boolean
  error: string | null
}

const listeners = new Set<(state: CirclesState) => void>()
let circlesState: CirclesState = { circles: [], loading: false, error: null }
let fetchPromise: Promise<void> | null = null

const notify = () => {
  listeners.forEach((listener) => listener(circlesState))
}

const setCirclesState = (updates: Partial<CirclesState>) => {
  circlesState = { ...circlesState, ...updates }
  notify()
}

const fetchCirclesInternal = async () => {
  setCirclesState({ loading: true, error: null })
  const sequentialResults: CircleListItem[] = []
  try {
    const response = await fetch("/api/deployed-circles")
    if (!response.ok) {
      throw new Error("Failed to load deployed circles")
    }
    const { addresses } = (await response.json()) as { addresses: string[] }
    if (!addresses || addresses.length === 0) {
      setCirclesState({ circles: [], loading: false })
      return
    }

    const provider = getSharedJsonRpcProvider(getSepoliaRpcUrl())

    for (const address of addresses) {
      try {
        const data = await fetchCircleContractData(address, provider)
        const members = data.numUsers
        const prize = data.installmentSize * (data.numUsers || 0)
        const timeLeft = deriveTimeLeft(data.roundDeadline)
        const nextCircle: CircleListItem = {
          id: address.toLowerCase(),
          address,
          contract: data,
          members,
          maxMembers: data.numUsers,
          prize,
          timeLeft,
        }
        setCircleCache(address, data)
        sequentialResults.push(nextCircle)
        const nextState: Partial<CirclesState> = { circles: [...sequentialResults] }
        if (sequentialResults.length === 1) {
          nextState.loading = false
        }
        setCirclesState(nextState)
      } catch (err) {
        console.error("Failed to load circle", address, err)
      }
    }

    setCirclesState({ circles: [...sequentialResults], loading: false })
  } catch (err) {
    setCirclesState({
      error: err instanceof Error ? err.message : "Failed to fetch circles",
      loading: false,
    })
  }
}

const ensureFetch = () => {
  if (!fetchPromise) {
    fetchPromise = fetchCirclesInternal().finally(() => {
      fetchPromise = null
    })
  }
  return fetchPromise
}

type UseDeployedCirclesOptions = {
  enabled?: boolean
}

export function useDeployedCircles(options: UseDeployedCirclesOptions = {}) {
  const { enabled = true } = options
  const [state, setState] = useState<CirclesState>(circlesState)

  useEffect(() => {
    const listener = (nextState: CirclesState) => {
      setState(nextState)
    }
    listeners.add(listener)
    listener(circlesState)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    if (circlesState.circles.length === 0 && !circlesState.loading) {
      void ensureFetch()
    }
  }, [enabled])

  const sortedCircles = useMemo(() => {
    return [...state.circles].sort((a, b) => a.contract.name.localeCompare(b.contract.name))
  }, [state.circles])

  return { circles: sortedCircles, loading: state.loading, error: state.error, refresh: ensureFetch }
}


