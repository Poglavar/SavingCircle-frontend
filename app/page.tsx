"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTimer } from "@/contexts/timer-context"
import { useUser } from "@/contexts/user-context"
import { useDeployedCircles } from "@/lib/hooks/use-deployed-circles"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import TimeLeftRaffleControl from "@/components/time-left-raffle-control"
import { formatCircleDisplayName } from "@/lib/utils"

const phaseColorMap: Record<string, string> = {
  contribution: "bg-[#E8FFE8]",
  auction: "bg-[#E8F4FF]",
  drawing: "bg-[#FFF4E8]",
  result: "bg-white",
}

const derivePhase = (timeLeft: number) => {
  if (timeLeft === 0) return "auction"
  return "contribution"
}

export default function HomePage() {
  const { nextRoundSeconds } = useTimer()
  const { isJoined } = useUser()
  const { circles, loading, error } = useDeployedCircles()

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="p-8 border-b-2 border-black">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-6 bg-gray-200" />
              <div className="h-6 bg-gray-200" />
              <div className="h-6 bg-gray-200" />
              <div className="h-6 bg-gray-200" />
            </div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-8 border-b-2 border-red-500 bg-red-50 text-red-900">
          Failed to load circles: {error}
        </div>
      )
    }

    if (circles.length === 0) {
      return (
        <div className="p-8 text-center border-b-2 border-black">
          <div className="text-3xl font-bold mb-2">No deployed circles found</div>
          <p className="text-sm text-gray-600">Add contract addresses to `lib/deployedsavingcircles.txt` to display them.</p>
        </div>
      )
    }

    return circles.map((circle) => {
      const phase = derivePhase(circle.timeLeft)
      const phaseColor = phaseColorMap[phase] ?? "bg-white"
      const userIsJoined = isJoined(circle.id)
      const target = userIsJoined ? `/circles/${circle.id}` : `/circles/${circle.id}/preview`
      const installment = circle.contract.installmentSize
      const ticketPrice = installment

      const displayName = formatCircleDisplayName(circle.address)

      return (
        <Link
          key={circle.id}
          href={target}
          className={`block ${phaseColor} hover:bg-gray-100 transition-colors border-b-2 border-black`}
        >
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-4xl font-bold mb-2">{displayName}</div>
                <div className="text-sm">
                  ROUND {Math.max(1, circle.contract.currRound + 1)} • {phase.toUpperCase()}
                  {userIsJoined && <span className="ml-2 text-green-600">● JOINED</span>}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-500">CONTRACT</div>
                <div className="text-xs font-mono break-all">{circle.address}</div>
              </div>
              <TimeLeftRaffleControl
                circleAddress={circle.address}
                currRound={circle.contract.currRound}
                timeLeftSeconds={circle.timeLeft}
                circleName={displayName}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs mb-1">PRIZE</div>
                <div className="text-xl font-bold">{circle.prize} USDC</div>
              </div>
              <div>
                <div className="text-xs mb-1">MEMBERS</div>
                <div className="text-xl font-bold">
                  {circle.members}/{circle.maxMembers}
                </div>
              </div>
              <div>
                <div className="text-xs mb-1">INSTALLMENT</div>
                <div className="text-xl font-bold">{installment} USDC / ROUND</div>
              </div>
              <div>
                <div className="text-xs mb-1">TICKET</div>
                <div className="text-xl font-bold">{ticketPrice} USDC</div>
              </div>
            </div>
          </div>
        </Link>
      )
    })
  }, [circles, error, isJoined, loading])

  return (
    <div className="min-h-screen flex bg-white">
      <DesktopSidebar />
      <main className="flex-1 md:ml-[240px] pb-20 md:pb-0">
        <ContextBar location="BROWSE CIRCLES" nextRoundSeconds={nextRoundSeconds} />
        <div className="divide-y-2 divide-black">{content}</div>
      </main>
      <MobileBottomNav />
    </div>
  )
}
