"use client"
import Link from "next/link"
import { useEffect } from "react"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { ContextBar } from "@/components/context-bar"
import { useTimer } from "@/contexts/timer-context"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"
import { allCircles } from "@/lib/mock-data"

const formatTime = (seconds: number) => {
  if (seconds >= 24 * 60 * 60) {
    const days = Math.floor(seconds / (24 * 60 * 60))
    return `${days}d`
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

export default function HomePage() {
  const { nextRoundSeconds } = useTimer()
  const { isJoined } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (nextRoundSeconds === 0) {
      router.push("/circles/1/result")
    }
  }, [nextRoundSeconds, router])

  return (
    <div className="min-h-screen flex bg-white">
      <DesktopSidebar />

      <main className="flex-1 md:ml-[240px] pb-20 md:pb-0">
        <ContextBar location="BROWSE CIRCLES" nextRoundSeconds={nextRoundSeconds} />

        {/* Circle List - All available circles */}
        <div className="divide-y-2 divide-black">
          {allCircles.map((circle) => {
            const phaseColor =
              circle.phase === "contribution"
                ? "bg-[#E8FFE8]"
                : circle.phase === "auction"
                  ? "bg-[#E8F4FF]"
                  : circle.phase === "drawing"
                    ? "bg-[#FFF4E8]"
                    : "bg-white"

            const userIsJoined = isJoined(circle.id)

            return (
              <Link
                key={circle.id}
                href={userIsJoined ? `/circles/${circle.id}` : `/circles/${circle.id}/preview`}
                className={`block ${phaseColor} hover:bg-gray-100 transition-colors border-b-2 border-black`}
              >
                <div className="p-8">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-4xl font-bold mb-2">{circle.name}</div>
                      <div className="text-sm">
                        ROUND {circle.round} • {circle.phase.toUpperCase()}
                        {userIsJoined && <span className="ml-2 text-green-600">● JOINED</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm mb-1">TIME LEFT</div>
                      <div className="text-2xl font-bold">{formatTime(circle.timeLeft)}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
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
                      <div className="text-xl font-bold">{circle.installment} USDC / ROUND</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1">TICKET</div>
                      <div className="text-xl font-bold">{circle.ticketPrice} USDC</div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  )
}
