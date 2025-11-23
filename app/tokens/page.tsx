"use client"

import MobileBottomNav from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import { useTimer } from "@/contexts/timer-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TokensPage() {
  const { nextRoundSeconds } = useTimer()
  const router = useRouter()

  useEffect(() => {
    if (nextRoundSeconds === 0) {
      router.push("/circles/1/result")
    }
  }, [nextRoundSeconds, router])

  return (
    <div className="min-h-screen flex">
      <DesktopSidebar />

      <main className="flex-1 md:ml-[240px] pb-[72px] md:pb-0">
        <ContextBar location="TOKEN BALANCE" phase="result" nextRoundSeconds={nextRoundSeconds} />

        <div className="px-4 py-8">
          <h1 className="text-2xl font-bold">TOKENS PAGE</h1>
          <p className="mt-4">Your token balance and transactions will appear here.</p>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  )
}
