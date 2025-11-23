"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import { useTimer } from "@/contexts/timer-context"
import { useUser } from "@/contexts/user-context"
import { useCircleContractData } from "@/lib/hooks/use-circle-contract-data"
import { useRegisterTransaction } from "@/lib/hooks/use-register-transaction"
import { useInstallmentTransaction } from "@/lib/hooks/use-installment-transaction"
import { useRegisteredUsers } from "@/lib/hooks/use-registered-users"
import { formatCircleDisplayName } from "@/lib/utils"
import TimeLeftRaffleControl from "@/components/time-left-raffle-control"

export default function CirclePreviewPage() {
  const router = useRouter()
  const params = useParams()
  const rawCircleId = params?.id
  const circleId = Array.isArray(rawCircleId) ? rawCircleId[0] : rawCircleId
  const circleAddress = circleId?.toString()
  const { nextRoundSeconds } = useTimer()
  const { isJoined, joinCircle } = useUser()
  const [step, setStep] = useState<"confirm" | "success">("confirm")
  const [modalType, setModalType] = useState<"join" | "pay" | null>(null)
  const [payStep, setPayStep] = useState<"confirm" | "success">("confirm")
  const { address: walletAddress, isConnected } = useAccount()

  if (!circleAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">LOADING CIRCLE…</div>
      </div>
    )
  }

  const { data: contractData, loading: isLoadingContract, error: contractError } = useCircleContractData(circleAddress)
  const {
    register: submitRegistration,
    reset: resetRegistration,
    isProcessing: isRegistering,
    isSuccess: txSuccess,
    error: registerError,
  } = useRegisterTransaction(circleAddress)
  const {
    payInstallment,
    reset: resetInstallmentTx,
    isProcessing: isPaying,
    isSuccess: paySuccess,
    error: payError,
  } = useInstallmentTransaction(circleAddress)
  const { registeredUsers } = useRegisteredUsers(circleAddress, Boolean(circleAddress))

  const installmentAmount = contractData?.installmentSize ?? 0
  const totalRounds = contractData?.numRounds ?? 0
  const displayRound = contractData ? Math.max(1, contractData.currRound + 1) : 1
  const prizeAmount = contractData ? contractData.installmentSize * (contractData.numUsers ?? 0) : 0
  const registeredMembersCount = registeredUsers.length
  const nowSeconds = Math.floor(Date.now() / 1000)
  const timeLeftSeconds = contractData ? Math.max(0, contractData.roundDeadline - nowSeconds) : 0
  const poolToDate = contractData
    ? contractData.installmentSize * (contractData.numUsers ?? 0) * Math.max(0, contractData.currRound)
    : 0
  const walletIsRegistered = walletAddress
    ? registeredUsers.some((addr) => addr === walletAddress.toLowerCase())
    : false
  const alreadyRegistered = walletIsRegistered || isJoined(circleAddress)
  const nextRoundToPayValue =
    contractData?.nextRoundToPay ?? (contractData ? Math.max(1, contractData.currRound + 1) : 1)
  const isModalOpen = modalType !== null
  const primaryCtaLabel = alreadyRegistered ? (isPaying ? "PAYING..." : "PAY INSTALLMENT") : "JOIN CIRCLE"
  const activeMembersCount = registeredMembersCount
  const maxMembersCount = contractData?.numUsers ?? Math.max(activeMembersCount, 1)
  const formatAmount = (value?: number, unit = "USDC") => {
    if (value === undefined || Number.isNaN(value)) return "—"
    return `${value.toLocaleString()} ${unit}`
  }

  const circleName = formatCircleDisplayName(circleAddress)
  const phaseLabel = timeLeftSeconds > 0 ? "CONTRIBUTION" : "AUCTION"

  const handlePrimaryCta = () => {
    if (alreadyRegistered) {
      resetInstallmentTx()
      setPayStep("confirm")
      setModalType("pay")
    } else {
      resetRegistration()
      setStep("confirm")
      setModalType("join")
    }
  }

  useEffect(() => {
    if (txSuccess) {
      joinCircle(circleAddress)
      setStep("success")
    }
  }, [circleAddress, joinCircle, txSuccess])

  useEffect(() => {
    if (paySuccess) {
      setPayStep("success")
    }
  }, [paySuccess])

  const handleJoinConfirm = async () => {
    try {
      await submitRegistration()
    } catch {
      // Errors are surfaced via registerError
    }
  }

  const handlePayConfirm = async () => {
    try {
      await payInstallment({ round: nextRoundToPayValue, auctionSize: 0 })
    } catch {
      // errors handled via hook state
    }
  }

  const handleComplete = () => {
    router.push(`/circles/${circleAddress}`)
  }

  const handleCloseModal = () => {
    if (modalType === "pay" && isPaying) return
    if (modalType === "pay") {
      resetInstallmentTx()
      setPayStep("confirm")
    }
    if (modalType === "join") {
      resetRegistration()
      setStep("confirm")
    }
    setModalType(null)
  }

  return (
    <>
      <div className="min-h-screen flex bg-white">
        <DesktopSidebar />

        <main className="flex-1 md:ml-[240px] pb-20 md:pb-0">
          <ContextBar location={`${circleName} PREVIEW`} nextRoundSeconds={nextRoundSeconds} />

          {contractError && (
            <div className="border-b-2 border-black bg-red-50 text-red-900 p-4 text-sm">
              Failed to load on-chain data: {contractError}
            </div>
          )}
          {isLoadingContract && !contractError && (
            <div className="border-b-2 border-black bg-blue-50 text-blue-900 p-4 text-sm">Syncing on-chain data…</div>
          )}

          {/* Circle Header Zone */}
          <div className="border-b-2 border-black p-8 relative">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-6xl font-bold mb-2">{circleName}</div>
                <div className="text-2xl">ROUND {displayRound}</div>
                <div className="text-xs uppercase text-gray-500 mt-3">CONTRACT</div>
                <div className="text-sm font-mono break-all">{circleAddress}</div>
              </div>
              <TimeLeftRaffleControl
                circleAddress={circleAddress}
                currRound={contractData?.currRound}
                timeLeftSeconds={timeLeftSeconds}
                circleName={circleName}
                valueClassName="text-4xl font-bold"
                buttonClassName="px-6 py-3 border-2 border-black font-bold text-lg uppercase bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Phase Status */}
            <div className="inline-block px-6 py-3 border-2 border-black bg-white">
              <div className="text-sm mb-1">CURRENT PHASE</div>
              <div className="text-3xl font-bold">{phaseLabel}</div>
            </div>
          </div>

          {/* Primary Stats Zone */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-black border-b-2 border-black">
            <div className="p-8">
              <div className="text-sm mb-2">PRIZE</div>
              <div className="text-6xl font-bold mb-2">{prizeAmount}</div>
              <div className="text-xl">USDC</div>
            </div>
            <div className="p-8">
              <div className="text-sm mb-2">INSTALLMENT</div>
              <div className="text-6xl font-bold mb-2">{installmentAmount}</div>
              <div className="text-xl">USDC / ROUND</div>
            </div>
            <div className="p-8">
              <div className="text-sm mb-2">TOTAL ROUNDS</div>
              <div className="text-6xl font-bold mb-2">{totalRounds}</div>
              <div className="text-xl">ROUNDS</div>
            </div>
          </div>

          {/* Secondary Stats Zone */}
          <div className="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black">
            <div className="p-6">
              <div className="text-xs mb-1">YOUR CONTRIBUTION</div>
              <div className="text-3xl font-bold">0 USDC</div>
            </div>
            <div className="p-6">
              <div className="text-xs mb-1">TOTAL POOL</div>
              <div className="text-3xl font-bold">{formatAmount(poolToDate)}</div>
            </div>
            <div className="p-6">
              <div className="text-xs mb-1">ACTIVE MEMBERS</div>
              <div className="text-3xl font-bold">
                {activeMembersCount}/{maxMembersCount}
              </div>
            </div>
            <div className="p-6">
              <div className="text-xs mb-1">YOUR STATUS</div>
              <div className="text-3xl font-bold">NOT JOINED</div>
            </div>
          </div>

          {/* SCT Auction & Rewards Section */}
          <div className="border-b-2 border-black bg-gray-50 p-8">
            <div className="text-2xl font-bold mb-6">AUCTION & REWARDS (SCT)</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs mb-2">MAX AUCTION PER ROUND</div>
                <div className="text-4xl font-bold">
                  {contractData?.maxProtocolTokenInAuction !== undefined
                    ? `${contractData.maxProtocolTokenInAuction.toLocaleString()} SCT`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs mb-2">REWARD PER INSTALLMENT</div>
                <div className="text-4xl font-bold">
                  {contractData?.protocolTokenRewardPerInstallment ?? 10} SCT
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white border-2 border-black text-sm space-y-2">
              <p>
                <strong>Each round:</strong> Pay {installmentAmount} USDC installment + deposit SCT (up to{" "}
                {contractData?.maxProtocolTokenInAuction ?? 100} SCT) to increase your odds.
              </p>
              <p>
                <strong>Earn rewards:</strong> You earn {contractData?.protocolTokenRewardPerInstallment ?? 10} SCT
                every time you pay an installment.
              </p>
            </div>
          </div>

          {/* Action Zone */}
          <div className="p-8 border-b-2 border-black">
            <button
              onClick={handlePrimaryCta}
              disabled={alreadyRegistered && isPaying}
              className="w-full h-20 text-2xl font-bold border-2 border-black bg-white hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {primaryCtaLabel}
            </button>
          </div>
        </main>

        <MobileBottomNav />
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/80" onClick={handleCloseModal} />

          {/* Modal Content */}
          <div className="relative w-full max-w-md">
            {modalType === "join" && (
              <>
                {step === "confirm" && (
                  <div className="bg-white border-4 border-black">
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
                        After registering, you'll need to pay your first {installmentAmount} USDC installment to enter the
                        current round. For each installment you'll also deposit SCT into the auction (up to{" "}
                        {contractData?.maxProtocolTokenInAuction ?? 100} SCT) and earn{" "}
                        {contractData?.protocolTokenRewardPerInstallment ?? 10} SCT as a reward.
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
                        onClick={handleCloseModal}
                        disabled={isRegistering}
                        className="flex-1 h-12 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        onClick={handleJoinConfirm}
                        disabled={isRegistering}
                        className="flex-1 h-12 bg-black text-white font-bold border-2 border-black hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isRegistering ? "CONFIRMING..." : "CONFIRM"}
                      </button>
                    </div>
                  </div>
                )}

                {step === "success" && (
                  <div className="bg-white border-4 border-black p-8 text-center space-y-6">
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
                        onClick={handleComplete}
                        className="w-full h-12 bg-black text-white font-bold border-2 border-black hover:bg-gray-900"
                      >
                        GO TO CIRCLE
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {modalType === "pay" && (
              <>
                {payStep === "confirm" && (
                  <div className="bg-white border-4 border-black">
                    <div className="h-14 bg-gray-100 flex items-center px-6 border-b-2 border-black">
                      <h2 className="text-lg font-bold">PAY INSTALLMENT</h2>
                    </div>

                    <div className="p-6 space-y-6">
                      <div>
                        <p className="text-sm mb-2">You're paying for:</p>
                        <p className="text-2xl font-bold">
                          Round {nextRoundToPayValue} · {circleName}
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
                        This calls <code>depositRound</code> for round {nextRoundToPayValue}. Confirm the transaction in
                        your wallet to continue.
                      </p>

                      {payError && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">{payError}</div>
                      )}
                    </div>

                    <div className="p-4 flex gap-2 border-t-2 border-black">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        disabled={isPaying}
                        className="flex-1 h-12 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        onClick={handlePayConfirm}
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
                      <p className="text-lg">Round {nextRoundToPayValue} payment is on-chain.</p>
                    </div>

                    <div className="space-y-2 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="w-full h-12 bg-black text-white font-bold border-2 border-black hover:bg-gray-900"
                      >
                        CLOSE
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
