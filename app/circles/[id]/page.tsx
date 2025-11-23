"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import { useTimer } from "@/contexts/timer-context"
import { useUser } from "@/contexts/user-context"
import { getCircleById, getUserCircleData } from "@/lib/mock-data"

export default function CircleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const circleId = params.id as string
  const circle = getCircleById(circleId)
  const { isJoined } = useUser()
  const userCircleData = getUserCircleData(circleId)

  const { nextRoundSeconds } = useTimer()

  const [timeLeft, setTimeLeft] = useState(circle?.timeLeft || 0)
  const [demoPhase, setDemoPhase] = useState<"calm" | "attention" | "urgent">("attention")

  useEffect(() => {
    if (!circle) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [circle])

  useEffect(() => {
    if (nextRoundSeconds === 0) {
      router.push(`/circles/${circleId}/result`)
    }
  }, [nextRoundSeconds, router, circleId])

  const formatTime = (seconds: number) => {
    if (seconds >= 24 * 60 * 60) {
      const days = Math.floor(seconds / (24 * 60 * 60))
      const hours = Math.floor((seconds % (24 * 60 * 60)) / 3600)
      return `${days}d ${hours}h`
    }
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (!circle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">CIRCLE NOT FOUND</div>
      </div>
    )
  }

  if (!isJoined(circleId)) {
    router.push(`/circles/${circleId}/join`)
    return null
  }

  const phaseColor =
    circle.phase === "contribution"
      ? "bg-[#FFEB3B]"
      : circle.phase === "auction"
        ? "bg-[#E8F4FF]"
        : circle.phase === "drawing"
          ? "bg-[#FFF4E8]"
          : circle.phase === "result"
            ? "bg-[#F4E8FF]"
            : "bg-white"

  const canEnterAuction = circle.phase === "auction"
  const isContributionPhase = circle.phase === "contribution"

  const roundsPaidByUser = 3 // This would come from contract/backend
  const totalPaidByUser = roundsPaidByUser * circle.installment
  const totalMndgRewards = roundsPaidByUser * 10 // 10 MNDG per installment

  return (
    <div className={`min-h-screen flex ${phaseColor}`}>
      <DesktopSidebar />

      <main className="flex-1 md:ml-[240px] pb-16 md:pb-8">
        <ContextBar
          location={`${circle.name} - ROUND ${circle.round}`}
          phase={circle.phase}
          nextRoundSeconds={nextRoundSeconds}
        />

        <div className="border-b-2 border-black p-4 md:p-6 bg-black text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="text-2xl md:text-3xl font-bold">
              ROUND {circle.round}
              {circle.totalRounds && ` OF ${circle.totalRounds}`}
            </div>

            <div className="flex gap-1 border border-white p-0.5">
              <button
                onClick={() => setDemoPhase("calm")}
                className={`px-2 md:px-3 py-1 text-xs font-bold border border-white transition-colors ${
                  demoPhase === "calm" ? "bg-white text-black" : "bg-transparent text-white"
                }`}
              >
                PAID
              </button>
              <button
                onClick={() => setDemoPhase("attention")}
                className={`px-2 md:px-3 py-1 text-xs font-bold border border-white transition-colors ${
                  demoPhase === "attention" ? "bg-[#FFEB3B] text-black" : "bg-transparent text-white"
                }`}
              >
                DUE
              </button>
              <button
                onClick={() => setDemoPhase("urgent")}
                className={`px-2 md:px-3 py-1 text-xs font-bold border border-white transition-colors ${
                  demoPhase === "urgent" ? "bg-white text-black" : "bg-transparent text-white"
                }`}
              >
                OVERDUE
              </button>
            </div>
          </div>
        </div>

        {isContributionPhase && (
          <div className="border-b-2 border-black p-12 md:p-16 text-center">
            <div className="text-xl md:text-2xl mb-4">CONTRIBUTION</div>
            <div className="text-6xl md:text-8xl font-bold mb-6">DUE NOW</div>
            <div className="text-5xl md:text-7xl font-bold">{circle.installment} USDC</div>
          </div>
        )}

        <div className="border-b-2 border-black bg-gray-50 p-8">
          <div className="text-2xl font-bold mb-6">SAVINGS (USDC)</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs mb-1">PRIZE</div>
              <div className="text-4xl font-bold">{circle.prize} USDC</div>
            </div>
            <div>
              <div className="text-xs mb-1">INSTALLMENT</div>
              <div className="text-4xl font-bold">{circle.installment} USDC / ROUND</div>
            </div>
            <div>
              <div className="text-xs mb-1">ROUNDS</div>
              <div className="text-4xl font-bold">{circle.totalRounds}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div>
              <div className="text-xs mb-1">TOTAL PAID BY YOU</div>
              <div className="text-2xl font-bold">{totalPaidByUser} USDC</div>
            </div>
            <div>
              <div className="text-xs mb-1">TOTAL POOL</div>
              <div className="text-2xl font-bold">{circle.totalContributions} USDC</div>
            </div>
            <div>
              <div className="text-xs mb-1">ROUNDS PAID</div>
              <div className="text-2xl font-bold">
                {roundsPaidByUser} / {circle.totalRounds}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs mb-2">YOUR STATUS</div>
            <div className="text-3xl font-bold">{userCircleData?.status.toUpperCase() || "INACTIVE"}</div>
          </div>
        </div>

        <div className="border-b-2 border-black bg-yellow-50 p-8">
          <div className="text-2xl font-bold mb-6">AUCTION & REWARDS (MNDG)</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs mb-1">THIS ROUND – YOUR AUCTION STAKE</div>
              <div className="text-4xl font-bold">25 MNDG</div>
            </div>
            <div>
              <div className="text-xs mb-1">TOTAL AUCTION THIS ROUND</div>
              <div className="text-4xl font-bold">200 MNDG</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs mb-2">YOUR WEIGHT</div>
            <div className="text-3xl font-bold">12.5%</div>
            <div className="text-sm mt-2 text-gray-600">Based on your auction stake vs total</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <div className="text-xs mb-1">REWARD PER INSTALLMENT</div>
              <div className="text-2xl font-bold">10 MNDG</div>
            </div>
            <div>
              <div className="text-xs mb-1">TOTAL MNDG REWARDS EARNED</div>
              <div className="text-2xl font-bold">{totalMndgRewards} MNDG</div>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-black p-8">
          <div className="text-xs mb-2">ACTIVE MEMBERS</div>
          <div className="text-3xl font-bold">
            {circle.members}/{circle.maxMembers}
          </div>
        </div>

        <div className="md:border-t-2 md:border-black">
          {canEnterAuction ? (
            <button
              onClick={() => router.push(`/circles/${circleId}/auction`)}
              className="w-full h-20 text-2xl font-bold border-2 border-black bg-[#E8F4FF] hover:bg-[#00FF00] transition-colors"
            >
              ENTER AUCTION →
            </button>
          ) : (
            <div className="p-8 text-center">
              <div className="text-xl mb-2">AUCTION NOT AVAILABLE</div>
              <div className="text-sm">
                {circle.phase === "contribution" && "Waiting for all contributions..."}
                {circle.phase === "drawing" && "Drawing in progress..."}
                {circle.phase === "result" && "Round complete"}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t-2 border-black">
          <button
            onClick={() => router.push(`/circles/${circleId}/position`)}
            className="w-full h-12 bg-white border-2 border-black font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            VIEW MY POSITION
          </button>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  )
}
