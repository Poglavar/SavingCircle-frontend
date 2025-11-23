"use client"

import Link from "next/link"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import { useTimer } from "@/contexts/timer-context"
import { useUser } from "@/contexts/user-context"
import { useDeployedCircles } from "@/lib/hooks/use-deployed-circles"
import TimeLeftRaffleControl from "@/components/time-left-raffle-control"
import { formatCircleDisplayName } from "@/lib/utils"

export default function CirclesPage() {
  const { nextRoundSeconds } = useTimer()
  const { joinedCircles } = useUser()
  const { circles, loading, error } = useDeployedCircles()

  const myCircles = circles.filter((circle) => joinedCircles.includes(circle.id))

  return (
    <div className="min-h-screen flex bg-white">
      <DesktopSidebar />

      <main className="flex-1 md:ml-[240px] pb-20 md:pb-0">
        <ContextBar location="MY CIRCLES" nextRoundSeconds={nextRoundSeconds} />

        {loading && (
          <div className="p-8">
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
        )}

        {error && (
          <div className="p-8 border-b-2 border-red-500 bg-red-50 text-red-900">Failed to load circles: {error}</div>
        )}

        {!loading && !error && myCircles.length === 0 && (
          <div className="p-8 max-w-2xl mx-auto">
            <div className="text-center mb-12 pt-8">
              <div className="text-4xl font-bold mb-4">NO CIRCLES YET</div>
              <div className="text-lg mb-8">Join your first circle to get started</div>
            </div>

            <div className="border-2 border-black mb-8">
              <div className="h-12 bg-gray-100 flex items-center px-4 border-b-2 border-black">
                <h2 className="text-sm font-bold">HOW IT WORKS</h2>
              </div>
              <div className="p-8 space-y-6">
                {[
                  "Buy a ticket to join",
                  "Pay installment each round",
                  "Get selected randomly to receive the pot",
                  "Everyone wins once, then circle completes",
                ].map((text, index) => (
                  <div className="flex gap-4" key={text}>
                    <span className="text-2xl font-bold">{index + 1}.</span>
                    <div>
                      <div className="font-bold mb-1">{text}</div>
                      <div className="text-sm text-gray-600">On-chain rituals keep the flows honest.</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/"
              className="block w-full h-16 bg-black text-white text-lg font-bold border-2 border-black hover:bg-gray-900 flex items-center justify-center"
            >
              BROWSE CIRCLES
            </Link>
          </div>
        )}

        {!loading && !error && myCircles.length > 0 && (
          <div className="divide-y-2 divide-black">
            {myCircles.map((circle) => {
              const displayName = formatCircleDisplayName(circle.address)
              return (
                <Link
                  key={circle.id}
                  href={`/circles/${circle.id}`}
                  className="block bg-white hover:bg-gray-100 transition-colors border-b-2 border-black"
                >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-4xl font-bold mb-2">{displayName}</div>
                      <div className="text-sm">
                        ROUND {Math.max(1, circle.contract.currRound + 1)} • CONTRIBUTION
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
                      <div className="text-xl font-bold">{circle.contract.installmentSize} USDC</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1">NEXT DUE</div>
                      <div className="text-xl font-bold">ROUND {Math.max(1, circle.contract.nextRoundToPay)}</div>
                    </div>
                  </div>
                </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  )
}

