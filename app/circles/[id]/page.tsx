"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import { useTimer } from "@/contexts/timer-context"
import { useUser } from "@/contexts/user-context"
import { useCircleContractData } from "@/lib/hooks/use-circle-contract-data"
import { useInstallmentTransaction } from "@/lib/hooks/use-installment-transaction"
import { useRegisteredUsers } from "@/lib/hooks/use-registered-users"
import { formatCircleDisplayName } from "@/lib/utils"

export default function CircleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const circleId = (params.id as string)?.toString()
  const { isJoined } = useUser()

  const { nextRoundSeconds } = useTimer()
  const { data: contractData, loading: isLoadingContract, error: contractError } = useCircleContractData(circleId)
  const { registeredUsers } = useRegisteredUsers(circleId, Boolean(circleId))
  const {
    payInstallment,
    reset: resetInstallmentTx,
    isProcessing: isPaying,
    isSuccess: paySuccess,
    error: payError,
  } = useInstallmentTransaction(circleId)
  const [timeLeft, setTimeLeft] = useState(0)
  const [demoPhase, setDemoPhase] = useState<"calm" | "attention" | "urgent">("attention")
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [payStep, setPayStep] = useState<"confirm" | "success">("confirm")

  useEffect(() => {
    if (!contractData?.roundDeadline) return

    const nowSeconds = Math.floor(Date.now() / 1000)
    const initialSeconds = Math.max(0, contractData.roundDeadline - nowSeconds)
    setTimeLeft(initialSeconds)

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [contractData?.roundDeadline])

  useEffect(() => {
    if (nextRoundSeconds === 0) {
      router.push(`/circles/${circleId}/result`)
    }
  }, [nextRoundSeconds, router, circleId])

  useEffect(() => {
    if (paySuccess) {
      setPayStep("success")
    }
  }, [paySuccess])

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

  const openPayModal = () => {
    resetInstallmentTx()
    setPayStep("confirm")
    setPayModalOpen(true)
  }

  const closePayModal = () => {
    if (isPaying) return
    resetInstallmentTx()
    setPayModalOpen(false)
  }

  const handlePayInstallment = async () => {
    try {
      await payInstallment({ round: nextRoundDue, auctionSize: 0 })
    } catch {
      // errors handled via hook state
    }
  }

  if (!circleId) {
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
  const circleName = formatCircleDisplayName(circleId)
  const displayRound = contractData ? Math.max(1, contractData.currRound + 1) : 1
  const totalRounds = contractData?.numRounds ?? 0
  const installmentAmount = contractData?.installmentSize ?? 0
  const prizeAmount = contractData ? contractData.installmentSize * (contractData.numUsers || 0) : 0
  const registeredMembersCount = registeredUsers.length
  const membersCount = registeredMembersCount
  const maxMembersCount = contractData?.numUsers ?? Math.max(membersCount, 1)
  const poolToDate = contractData
    ? contractData.installmentSize * (contractData.numUsers || 0) * Math.max(0, contractData.currRound)
    : 0
  const rewardPerInstallment = contractData?.protocolTokenRewardPerInstallment ?? 10
  const roundsPaidByUser = contractData?.nextRoundToPay ?? 0
  const totalPaidByUser = roundsPaidByUser * installmentAmount
  const totalMndgRewards = roundsPaidByUser * rewardPerInstallment
  const nextRoundDue = roundsPaidByUser + 1
  const formatAmount = (value?: number, unit = "USDC") => {
    if (value === undefined || Number.isNaN(value)) return "—"
    return `${value.toLocaleString()} ${unit}`
  }
  const phaseLabel = timeLeft > 0 ? "contribution" : "auction"
  const phaseColor =
    phaseLabel === "contribution"
      ? "bg-[#FFEB3B]"
      : phaseLabel === "auction"
        ? "bg-[#E8F4FF]"
        : "bg-white"
  const canEnterAuction = phaseLabel === "auction"
  const isContributionPhase = phaseLabel === "contribution"
  const contextLocation = `${circleName} - ROUND ${displayRound}`
  const userStatus = isJoined(circleId) ? "ACTIVE" : "INACTIVE"

  return (
    <div className={`min-h-screen flex ${phaseColor}`}>
      <DesktopSidebar />

      <main className="flex-1 md:ml-[240px] pb-16 md:pb-8">
        <ContextBar location={contextLocation} phase={phaseLabel} nextRoundSeconds={nextRoundSeconds} />

        {contractError && (
          <div className="border-b-2 border-black bg-red-50 text-red-900 p-4 text-sm">
            Failed to load on-chain data: {contractError}
          </div>
        )}

        {isLoadingContract && !contractError && (
          <div className="border-b-2 border-black bg-blue-50 text-blue-900 p-4 text-sm">Syncing on-chain circle data…</div>
        )}

        <div className="border-b-2 border-black p-4 md:p-6 bg-black text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="text-2xl md:text-3xl font-bold">
                ROUND {displayRound}
                {totalRounds && ` OF ${totalRounds}`}
              </div>
              <div className="text-[11px] uppercase tracking-wide text-gray-300 mt-2">Contract</div>
              <div className="text-xs font-mono break-all">{circleId}</div>
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
            <div className="text-5xl md:text-7xl font-bold">{installmentAmount} USDC</div>
          </div>
        )}

      <div className="border-b-2 border-black p-8 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase text-gray-500 tracking-wide">NEXT ROUND DUE</div>
            <div className="text-3xl font-bold">
              Round {totalRounds ? Math.min(nextRoundDue, totalRounds) : nextRoundDue}
            </div>
            <div className="text-sm text-gray-600">Installment: {installmentAmount} USDC</div>
          </div>
          <button
            type="button"
            onClick={openPayModal}
            disabled={isPaying}
            className="w-full md:w-auto px-6 h-14 bg-black text-white font-bold border-2 border-black hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPaying ? "PAYING..." : "PAY INSTALLMENT"}
          </button>
        </div>
      </div>

        <div className="border-b-2 border-black bg-gray-50 p-8">
          <div className="text-2xl font-bold mb-6">SAVINGS (USDC)</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs mb-1">PRIZE</div>
              <div className="text-4xl font-bold">{prizeAmount} USDC</div>
            </div>
            <div>
              <div className="text-xs mb-1">INSTALLMENT</div>
              <div className="text-4xl font-bold">{installmentAmount} USDC / ROUND</div>
            </div>
            <div>
              <div className="text-xs mb-1">ROUNDS</div>
              <div className="text-4xl font-bold">{totalRounds}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <div className="text-xs mb-1">TOTAL PAID BY YOU</div>
              <div className="text-2xl font-bold">{formatAmount(totalPaidByUser)}</div>
            </div>
            <div>
              <div className="text-xs mb-1">TOTAL POOL (TO DATE)</div>
              <div className="text-2xl font-bold">{formatAmount(poolToDate)}</div>
            </div>
            <div>
              <div className="text-xs mb-1">ROUNDS PAID</div>
              <div className="text-2xl font-bold">
                {roundsPaidByUser} / {totalRounds}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1">NEXT ROUND DUE</div>
              <div className="text-2xl font-bold">{totalRounds ? Math.min(nextRoundDue, totalRounds) : nextRoundDue}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs mb-2">YOUR STATUS</div>
            <div className="text-3xl font-bold">{userStatus}</div>
          </div>
        </div>

        <div className="border-b-2 border-black bg-yellow-50 p-8">
          <div className="text-2xl font-bold mb-6">AUCTION & REWARDS (SCT)</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs mb-1">MAX AUCTION PER ROUND</div>
              <div className="text-4xl font-bold">
                {contractData?.maxProtocolTokenInAuction !== undefined
                  ? `${contractData.maxProtocolTokenInAuction.toLocaleString()} SCT`
                  : "—"}
              </div>
              <div className="text-xs mt-2 text-gray-600">Taken from contract cap</div>
            </div>
            <div>
              <div className="text-xs mb-1">Your Auction Stake</div>
              <div className="text-4xl font-bold">—</div>
              <div className="text-xs mt-2 text-gray-600">Connect wallet flows coming soon</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <div className="text-xs mb-1">REWARD PER INSTALLMENT</div>
              <div className="text-2xl font-bold">{rewardPerInstallment} SCT</div>
            </div>
            <div>
              <div className="text-xs mb-1">TOTAL SCT REWARDS CREDITED</div>
              <div className="text-2xl font-bold">{totalMndgRewards} SCT</div>
              <div className="text-xs mt-1 text-gray-600">Based on {roundsPaidByUser} paid rounds</div>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-black p-8">
          <div className="text-xs mb-2">ACTIVE MEMBERS</div>
          <div className="text-3xl font-bold">
            {membersCount}/{maxMembersCount}
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
                {phaseLabel === "contribution" && "Waiting for all contributions..."}
                {phaseLabel !== "contribution" && "Auction window in progress..."}
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

      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={closePayModal} />
          <div className="relative w-full max-w-md">
            {payStep === "confirm" && (
              <div className="bg-white border-4 border-black">
                <div className="h-14 bg-gray-100 flex items-center px-6 border-b-2 border-black">
                  <h2 className="text-lg font-bold">PAY INSTALLMENT</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-sm mb-2">You're paying for:</p>
                        <p className="text-2xl font-bold">
                          Round {totalRounds ? Math.min(nextRoundDue, totalRounds) : nextRoundDue} · {circleName}
                        </p>
                  </div>

                  <div className="border-t-2 border-black pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="font-bold">Installment:</span>
                      <span className="font-bold">{installmentAmount} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>SCT Auction Deposit:</span>
                      <span>0 (coming soon)</span>
                    </div>
                  </div>

                  <p className="text-sm pt-2 text-gray-600">
                    This transaction calls <code>depositRound</code> on the circle contract. Confirm it in your wallet to
                    keep your spot in the next round.
                  </p>

                  {payError && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">{payError}</div>
                  )}
                </div>

                <div className="p-4 flex gap-2 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={closePayModal}
                    disabled={isPaying}
                    className="flex-1 h-12 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handlePayInstallment}
                    disabled={isPaying}
                    className="flex-1 h-12 bg-black text-white font-bold border-2 border-black hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPaying ? "CONFIRMING..." : "CONFIRM"}
                  </button>
                </div>
              </div>
            )}

            {payStep === "success" && (
              <div className="bg-white border-4 border-black p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-500 flex items-center justify-center text-4xl text-white font-bold border-2 border-black">
                    ✓
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">INSTALLMENT SUBMITTED</h1>
                  <p className="text-lg">Round {totalRounds ? Math.min(nextRoundDue, totalRounds) : nextRoundDue} payment is pending confirmation.</p>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    type="button"
                    onClick={closePayModal}
                    className="w-full h-12 bg-black text-white font-bold border-2 border-black hover:bg-gray-900"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

