"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface TimerContextType {
  nextRoundSeconds: number
  skipToNextRound: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [nextRoundSeconds, setNextRoundSeconds] = useState(21600) // 6 hours

  useEffect(() => {
    const interval = setInterval(() => {
      setNextRoundSeconds((prev) => {
        if (prev <= 1) {
          return 21600
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const skipToNextRound = () => {
    setNextRoundSeconds(0)
  }

  return <TimerContext.Provider value={{ nextRoundSeconds, skipToNextRound }}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
