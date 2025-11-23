"use client"

import { useCallback, useMemo, useState } from "react"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import type { Address, Hash } from "viem"
import savingCircleAbi from "@/lib/abi/savingcircle.sol.abi.json"

export function useRegisterTransaction(circleAddress?: string) {
  const { isConnected } = useAccount()
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

  const register = useCallback(async () => {
    if (!circleAddress) {
      const message = "Missing circle contract address."
      setError(message)
      throw new Error(message)
    }

    if (!isConnected) {
      openConnectModal?.()
      const message = "Connect your wallet to continue."
      setError(message)
      throw new Error(message)
    }

    try {
      setError(null)
      const hash = await writeContractAsync({
        address: circleAddress as Address,
        abi: savingCircleAbi,
        functionName: "register",
      })
      setTxHash(hash)
      return hash
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit registration transaction."
      setError(message)
      throw err
    }
  }, [circleAddress, isConnected, openConnectModal, writeContractAsync])

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
    register,
    reset,
    ...status,
  }
}

