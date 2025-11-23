"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface UserContextType {
  joinedCircles: string[]
  joinCircle: (circleId: string) => void
  leaveCircle: (circleId: string) => void
  isJoined: (circleId: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [joinedCircles, setJoinedCircles] = useState<string[]>([])

  const normalizeId = (circleId: string) => circleId?.toLowerCase?.() ?? circleId

  const joinCircle = (circleId: string) => {
    setJoinedCircles((prev) => {
      const normalized = normalizeId(circleId)
      if (!normalized) return prev
      if (prev.includes(normalized)) return prev
      return [...prev, normalized]
    })
  }

  const leaveCircle = (circleId: string) => {
    const normalized = normalizeId(circleId)
    setJoinedCircles((prev) => prev.filter((id) => id !== normalized))
  }

  const isJoined = (circleId: string) => {
    const normalized = normalizeId(circleId)
    return joinedCircles.includes(normalized)
  }

  return (
    <UserContext.Provider value={{ joinedCircles, joinCircle, leaveCircle, isJoined }}>{children}</UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
