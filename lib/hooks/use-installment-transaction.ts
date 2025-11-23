"use client"

import { useCallback, useMemo, useState } from "react"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import type { Address, Hash } from "viem"
import savingCircleAbi from "@/lib/abi/savingcircle.sol.abi.json"

interface PayInstallmentParams {
  round: bigint | number
  auctionSize?: bigint | number
}

export function useInstallmentTransaction(circleAddress?: string) {
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [txHash, setTxHash] = useState<Hash | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const { writeContractAsync, isPending } = useWriteContract()

  const { isLoading: isWaitingConfirmation, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: Boolean(txHash),
    },
  })

  const payInstallment = useCallback(
    async ({ round, auctionSize = 0 }: PayInstallmentParams) => {
      if (!circleAddress) {
        const message = "Missing circle contract address."
        setError(message)
        throw new Error(message)
      }

      if (!isConnected || !address) {
        openConnectModal?.()
        const message = "Connect your wallet to continue."
        setError(message)
        throw new Error(message)
      }

      try {
        setError(null)
        const roundValue = typeof round === "bigint" ? round : BigInt(round)
        const auctionValue = typeof auctionSize === "bigint" ? auctionSize : BigInt(auctionSize)

        const hash = await writeContractAsync({
          address: circleAddress as Address,
          abi: savingCircleAbi,
          functionName: "depositRound",
          args: [roundValue, auctionValue, address as Address],
        })
        setTxHash(hash)
        return hash
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit installment transaction."
        setError(message)
        throw err
      }
    },
    [address, circleAddress, isConnected, openConnectModal, writeContractAsync],
  )

  const reset = useCallback(() => {
    setTxHash(undefined)
    setError(null)
  }, [])

  const status = useMemo(
    () => ({
      error,
      txHash,
      isAwaitingSignature: isPending,
      isWaitingConfirmation,
      isProcessing: isPending || isWaitingConfirmation,
      isSuccess,
    }),
    [error, isPending, isWaitingConfirmation, isSuccess, txHash],
  )

  return {
    payInstallment,
    reset,
    ...status,
  }
}


