"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTimer } from "@/contexts/timer-context"
import { useUser } from "@/contexts/user-context"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import { getCircleById } from "@/lib/mock-data"

export default function JoinCirclePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { nextRoundSeconds } = useTimer()
  const { joinCircle, isJoined } = useUser()
  const [step, setStep] = useState<"confirm" | "success">("confirm")

  const circle = getCircleById(params.id)

  if (!circle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">CIRCLE NOT FOUND</div>
      </div>
    )
  }

  if (isJoined(params.id)) {
    router.push(`/circles/${params.id}`)
    return null
  }

  const handleConfirm = () => {
    joinCircle(params.id)
    setStep("success")
  }

  const handlePayNow = () => {
    router.push(`/circles/${params.id}`)
  }

  const handlePayLater = () => {
    router.push(`/circles/${params.id}`)
  }

  return (
    <>
      <div className="flex min-h-screen bg-white">
        <DesktopSidebar />

        <div className="flex-1 md:ml-60">
          <ContextBar location={`JOIN ${circle.name}`} nextRoundSeconds={nextRoundSeconds} />

          <main className="pb-16 md:pb-0">
            {step === "confirm" && (
              <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                {/* Confirmation Card */}
                <div className="w-full max-w-md bg-white border-4 border-black">
                  <div className="h-14 bg-gray-100 flex items-center px-6 border-b-2 border-black">
                    <h2 className="text-lg font-bold">CONFIRM PURCHASE</h2>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <p className="text-sm mb-2">You're buying a ticket to:</p>
                      <p className="text-2xl font-bold">{circle.name}</p>
                    </div>

                    <div className="border-t-2 border-black pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="font-bold">Ticket Price:</span>
                        <span className="font-bold">{circle.ticketPrice} USDC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Installment per round:</span>
                        <span>{circle.installment} USDC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total rounds:</span>
                        <span>{circle.totalRounds}</span>
                      </div>
                    </div>

                    <p className="text-sm pt-2 text-gray-600">
                      After purchase, you'll need to pay your first installment to enter the current round.
                    </p>
                  </div>

                  <div className="p-4 flex gap-2 border-t-2 border-black">
                    <button
                      onClick={() => router.back()}
                      className="flex-1 h-12 bg-white text-black font-bold border-2 border-black hover:bg-gray-100"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 h-12 bg-black text-white font-bold border-2 border-black hover:bg-gray-900"
                    >
                      CONFIRM
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-500 flex items-center justify-center text-4xl text-white font-bold border-2 border-black">
                      ✓
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold">YOU'RE NOW A MEMBER</h1>
                    <p className="text-lg">Welcome to {circle.name}</p>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm">Next: Pay your first installment to enter Round {circle.round}</p>
                  </div>

                  <div className="space-y-2 pt-6">
                    <button
                      onClick={handlePayNow}
                      className="w-full h-12 bg-black text-white font-bold border-2 border-black hover:bg-gray-900"
                    >
                      PAY INSTALLMENT NOW
                    </button>
                    <button
                      onClick={handlePayLater}
                      className="w-full h-12 bg-white text-black font-bold border-2 border-black hover:bg-gray-100"
                    >
                      I'LL DO IT LATER
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </>
  )
}
