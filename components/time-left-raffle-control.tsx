"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRaffleRequest } from "@/lib/hooks/use-raffle-request"

interface TimeLeftRaffleControlProps {
  circleAddress: string
  currRound?: number | null
  timeLeftSeconds?: number | null
  circleName?: string
  label?: string
  valueClassName?: string
  buttonClassName?: string
}

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

const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

export function TimeLeftRaffleControl({
  circleAddress,
  currRound,
  timeLeftSeconds,
  circleName,
  label = "TIME LEFT",
  valueClassName = "text-2xl font-bold",
  buttonClassName = "px-4 py-2 border-2 border-black font-bold text-sm uppercase bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed",
}: TimeLeftRaffleControlProps) {
  const hasInitialTime = typeof timeLeftSeconds === "number"
  const sanitizedSeconds = Math.max(0, timeLeftSeconds ?? 0)
  const [secondsLeft, setSecondsLeft] = useState(sanitizedSeconds)
  const [pendingRound, setPendingRound] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationRound, setCelebrationRound] = useState<number | null>(null)

  const {
    requestRaffle,
    error,
    txHash,
    explorerUrl,
    isAwaitingSignature,
    isWaitingConfirmation,
    isProcessing,
    consumerConfigured,
  } = useRaffleRequest()

  useEffect(() => {
    setSecondsLeft(sanitizedSeconds)
  }, [sanitizedSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft > 0])

  const roundDefined = typeof currRound === "number" && !Number.isNaN(currRound)

  useEffect(() => {
    if (pendingRound === null) return
    if (!roundDefined) return
    if ((currRound as number) > pendingRound) {
      setPendingRound(null)
      setCelebrationRound(currRound as number)
      setShowCelebration(true)
    }
  }, [currRound, pendingRound, roundDefined])

  useEffect(() => {
    if (!showCelebration) return
    const timeout = setTimeout(() => setShowCelebration(false), 5000)
    return () => clearTimeout(timeout)
  }, [showCelebration])

  const handleCloseCelebration = () => {
    setShowCelebration(false)
  }

  const handleRaffle = useCallback(async () => {
    if (!roundDefined || !consumerConfigured) {
      return
    }
    try {
      await requestRaffle({
        circleAddress,
        round: currRound as number,
        enableNativePayment: false,
      })
      setPendingRound(currRound as number)
    } catch {
      // errors handled via hook state
    }
  }, [circleAddress, consumerConfigured, currRound, requestRaffle, roundDefined])

  const renderPrimary = useMemo(() => {
    if (!hasInitialTime) {
      return <div className={valueClassName}>—</div>
    }

    if (secondsLeft > 0) {
      return <div className={valueClassName}>{formatTime(secondsLeft)}</div>
    }

    if (pendingRound !== null) {
      const statusLabel = isAwaitingSignature
        ? "Confirm in wallet…"
        : isWaitingConfirmation
          ? "Waiting for confirmation…"
          : "Awaiting VRF…"

      return (
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            disabled
            className="px-4 py-2 border-2 border-dashed border-black bg-gray-100 text-xs font-bold uppercase"
          >
            {statusLabel}
          </button>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline text-blue-700 hover:text-blue-900"
            >
              View transaction ↗
            </a>
          )}
        </div>
      )
    }

    return (
      <button
        type="button"
        onClick={handleRaffle}
        disabled={!roundDefined || isProcessing || !consumerConfigured}
        className={buttonClassName}
      >
        {isAwaitingSignature
          ? "Confirm in wallet…"
          : isWaitingConfirmation
            ? "Submitting…"
            : !consumerConfigured
              ? "Configure VRF"
              : "Raffle"}
      </button>
    )
  }, [
    buttonClassName,
    consumerConfigured,
    explorerUrl,
    handleRaffle,
    hasInitialTime,
    isAwaitingSignature,
    isProcessing,
    isWaitingConfirmation,
    pendingRound,
    roundDefined,
    secondsLeft,
    valueClassName,
  ])

  const helperMessage = useMemo(() => {
    if (!consumerConfigured) {
      return "VRF consumer address missing."
    }
    if (!roundDefined) {
      return "Round data unavailable."
    }
    return null
  }, [consumerConfigured, roundDefined])

  const winnerCircleLabel = circleName ?? shortenAddress(circleAddress)

  return (
    <>
      <div className="relative text-right">
        {label && <div className="text-sm mb-1">{label}</div>}
        {renderPrimary}
        {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
        {helperMessage && !error && <div className="mt-2 text-xs text-gray-500">{helperMessage}</div>}
      </div>

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseCelebration} />
          <div className="relative bg-white border-4 border-black max-w-sm w-full p-6 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <div className="text-2xl font-bold">Winner selected!</div>
            <p className="text-sm text-gray-700">
              {winnerCircleLabel} has completed round {celebrationRound ?? (currRound ?? 0)}. Contract data has been
              refreshed.
            </p>
            <button
              type="button"
              onClick={handleCloseCelebration}
              className="w-full h-12 bg-black text-white font-bold border-2 border-black hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default TimeLeftRaffleControl


