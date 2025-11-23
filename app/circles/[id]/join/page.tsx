"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTimer } from "@/contexts/timer-context"
import { useUser } from "@/contexts/user-context"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import { useCircleContractData } from "@/lib/hooks/use-circle-contract-data"
import { useRegisterTransaction } from "@/lib/hooks/use-register-transaction"
import { formatCircleDisplayName } from "@/lib/utils"

export default function JoinCirclePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { nextRoundSeconds } = useTimer()
  const { joinCircle, isJoined } = useUser()
  const [step, setStep] = useState<"confirm" | "success">("confirm")
  const circleAddress = params.id
  const { data: contractData, loading: isLoadingContract, error: contractError } = useCircleContractData(circleAddress)
  const {
    register: submitRegistration,
    isProcessing: isRegistering,
    isSuccess: txSuccess,
    error: registerError,
  } = useRegisterTransaction(circleAddress)

  useEffect(() => {
    if (txSuccess) {
      joinCircle(circleAddress)
      setStep("success")
    }
  }, [circleAddress, joinCircle, txSuccess])

  if (isJoined(circleAddress)) {
    router.push(`/circles/${circleAddress}`)
    return null
  }

  const circleName = formatCircleDisplayName(circleAddress)
  const installmentAmount = contractData?.installmentSize ?? 0
  const totalRounds = contractData?.numRounds ?? 0
  const displayRound = contractData ? Math.max(1, contractData.currRound + 1) : 1

  const handleConfirm = async () => {
    try {
      await submitRegistration()
    } catch {
      // Errors are surfaced via registerError state.
    }
  }

  const handlePayNow = () => {
    router.push(`/circles/${circleAddress}`)
  }

  const handlePayLater = () => {
    router.push(`/circles/${circleAddress}`)
  }

  return (
    <>
      <div className="flex min-h-screen bg-white">
        <DesktopSidebar />

        <div className="flex-1 md:ml-60">
          <ContextBar location={`JOIN ${circleName}`} nextRoundSeconds={nextRoundSeconds} />

          <main className="pb-16 md:pb-0">
            {step === "confirm" && (
              <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                {/* Confirmation Card */}
                <div className="w-full max-w-md bg-white border-4 border-black">
                  <div className="h-14 bg-gray-100 flex items-center px-6 border-b-2 border-black">
                    <h2 className="text-lg font-bold">CONFIRM JOINING</h2>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <p className="text-sm mb-2">You're registering to enter into:</p>
                      <p className="text-2xl font-bold">{circleName}</p>
                    </div>

                    <div className="border-t-2 border-black pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Installment per round:</span>
                        <span>{installmentAmount} USDC</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total rounds:</span>
                        <span>{totalRounds}</span>
                      </div>
                    </div>

                    <p className="text-sm pt-2 text-gray-600">
                      After registering, you'll need to pay your first installment to enter the current round.
                    </p>

                    {registerError && (
                      <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
                        {registerError}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex gap-2 border-t-2 border-black">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      disabled={isRegistering}
                      className="flex-1 h-12 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={isRegistering}
                      className="flex-1 h-12 bg-black text-white font-bold border-2 border-black hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isRegistering ? "CONFIRMING..." : "CONFIRM"}
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
                    <p className="text-lg">Welcome to {circleName}</p>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm">Next: Pay your first installment to enter Round {displayRound}</p>
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
