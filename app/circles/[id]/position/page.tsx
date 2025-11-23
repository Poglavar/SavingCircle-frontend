"use client"

import { useParams, useRouter } from "next/navigation"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import { useTimer } from "@/contexts/timer-context"
import { useEffect } from "react"

export default function PositionPage() {
  const params = useParams()
  const router = useRouter()
  const { nextRoundSeconds } = useTimer()

  useEffect(() => {
    if (nextRoundSeconds === 0) {
      router.push(`/circles/${params.id}/result`)
    }
  }, [nextRoundSeconds, router, params.id])

  const installments = [
    { round: 1, amount: 100, status: "paid" as const },
    { round: 2, amount: 100, status: "paid" as const },
    { round: 3, amount: 100, status: "paid" as const },
    { round: 4, amount: null, status: "upcoming" as const },
  ]

  return (
    <>
      <MobileBottomNav />
      <DesktopSidebar />
      <ContextBar location="MY POSITION" phase="contribution" nextRoundSeconds={nextRoundSeconds} />

      <main className="min-h-screen bg-white pb-16 md:pb-0 md:pl-60 pt-16">
        <div className="p-8">
          {/* Header */}
          <div className="h-16 flex items-center border-b-2 border-black mb-8">
            <h1 className="text-2xl font-bold">MY POSITION</h1>
            <span className="ml-4 text-lg text-gray-600">Circle #042</span>
          </div>

          {/* Section 1: Membership */}
          <div className="mb-4 border-2 border-black">
            <div className="h-10 bg-gray-200 flex items-center px-4 border-b-2 border-black">
              <h2 className="text-sm font-bold">MEMBERSHIP</h2>
            </div>
            <div className="p-4 space-y-2">
              <div className="h-10 flex items-center justify-between">
                <span className="font-mono text-sm">Ticket:</span>
                <span className="font-mono text-sm">✓ Purchased</span>
              </div>
              <div className="h-10 flex items-center justify-between">
                <span className="font-mono text-sm">Status:</span>
                <span className="font-mono text-sm font-bold">ACTIVE</span>
              </div>
              <div className="h-10 flex items-center justify-between">
                <span className="font-mono text-sm">Joined:</span>
                <span className="font-mono text-sm">Round 1</span>
              </div>
              <div className="h-10 flex items-center justify-between">
                <span className="font-mono text-sm">Current Round:</span>
                <span className="font-mono text-sm">3 of 10</span>
              </div>
            </div>
          </div>

          {/* Section 2: Installments */}
          <div className="mb-4 border-2 border-black">
            <div className="h-10 bg-gray-200 flex items-center px-4 border-b-2 border-black">
              <h2 className="text-sm font-bold">INSTALLMENTS</h2>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                {installments.map((item) => (
                  <div key={item.round} className="h-10 flex items-center justify-between font-mono text-sm">
                    <span className="flex items-center gap-2">
                      <span>{item.status === "paid" ? "■" : "□"}</span>
                      <span>Round {item.round}</span>
                    </span>
                    <span>{item.amount ? `${item.amount} USDC` : "—"}</span>
                    <span className={item.status === "paid" ? "text-green-600" : "text-gray-500"}>
                      {item.status === "paid" ? "✓ Paid" : "Upcoming"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="h-10 flex items-center justify-between font-mono text-sm font-bold">
                  <span>Total Paid:</span>
                  <span>300 USDC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Protocol Tokens */}
          <div className="mb-4 border-2 border-black">
            <div className="h-10 bg-gray-200 flex items-center px-4 border-b-2 border-black">
              <h2 className="text-sm font-bold">PROTOCOL TOKENS</h2>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="h-10 flex items-center justify-between font-mono text-sm">
                  <span>Earned:</span>
                  <span>150 SCT</span>
                </div>
                <div className="h-10 flex items-center justify-between font-mono text-sm">
                  <span>Spent:</span>
                  <span>50 SCT</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-2">
                  <div className="h-10 flex items-center justify-between font-mono text-sm font-bold">
                    <span>Balance:</span>
                    <span>100 SCT</span>
                  </div>
                </div>
              </div>
              <button className="w-full h-10 bg-white border-2 border-black font-bold text-sm hover:bg-gray-100 transition-colors">
                VIEW TOKEN HISTORY
              </button>
            </div>
          </div>

          {/* Section 4: Quota & Weight */}
          <div className="mb-4 border-2 border-black">
            <div className="h-10 bg-gray-200 flex items-center px-4 border-b-2 border-black">
              <h2 className="text-sm font-bold">QUOTA & WEIGHT</h2>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="h-10 flex items-center justify-between font-mono text-sm">
                  <span>Current Round Quota:</span>
                  <span className="font-bold">50</span>
                </div>
                <div className="h-10 flex items-center justify-between font-mono text-sm">
                  <span>Current Weight:</span>
                  <span className="font-bold">18.2%</span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/circles/${params.id}/auction`)}
                className="w-full h-10 bg-white border-2 border-black font-bold text-sm hover:bg-gray-100 transition-colors"
              >
                VIEW AUCTION HISTORY
              </button>
            </div>
          </div>

          {/* Section 5: Selection Status */}
          <div className="mb-4 border-2 border-black">
            <div className="h-10 bg-gray-200 flex items-center px-4 border-b-2 border-black">
              <h2 className="text-sm font-bold">SELECTION STATUS</h2>
            </div>
            <div className="p-4 space-y-2">
              <div className="h-10 flex items-center justify-between font-mono text-sm">
                <span>Status:</span>
                <span>Not Selected Yet</span>
              </div>
              <div className="h-10 flex items-center justify-between font-mono text-sm">
                <span>Probability:</span>
                <span className="font-bold">18.2%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
