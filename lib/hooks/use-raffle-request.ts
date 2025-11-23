"use client"

import { useCallback, useMemo, useState } from "react"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import type { Address, Hash } from "viem"
import directFundingConsumerAbi from "@/lib/abi/directfundingconsumer.sol.abi.json"

interface RequestRaffleParams {
  circleAddress: string
  round: bigint | number
  enableNativePayment?: boolean
}

const explorerBaseUrl = "https://sepolia.etherscan.io/tx/"
const DEFAULT_CONSUMER_ADDRESS = "0x40A67964a8C751f383C5cbd49d0fff5F1cF6b7aa"

export function useRaffleRequest() {
  const consumerAddress = process.env.NEXT_PUBLIC_DIRECT_FUNDING_CONSUMER_ADDRESS ?? DEFAULT_CONSUMER_ADDRESS
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

  const requestRaffle = useCallback(
    async ({ circleAddress, round, enableNativePayment = false }: RequestRaffleParams) => {
      if (!consumerAddress) {
        const message = "Missing DirectFundingConsumer address."
        setError(message)
        throw new Error(message)
      }

      if (!circleAddress) {
        const message = "Missing circle address."
        setError(message)
        throw new Error(message)
      }

      if (!isConnected) {
        openConnectModal?.()
        const message = "Connect your wallet to request a raffle."
        setError(message)
        throw new Error(message)
      }

      try {
        setError(null)
        const normalizedRound = typeof round === "bigint" ? round : BigInt(round)
        const hash = await writeContractAsync({
          address: consumerAddress as Address,
          abi: directFundingConsumerAbi,
          functionName: "requestRandomWords",
          args: [circleAddress as Address, normalizedRound, enableNativePayment],
        })
        setTxHash(hash)
        return hash
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to request raffle."
        setError(message)
        throw err
      }
    },
    [consumerAddress, isConnected, openConnectModal, writeContractAsync],
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
      explorerUrl: txHash ? `${explorerBaseUrl}${txHash}` : null,
      consumerConfigured: Boolean(consumerAddress),
    }),
    [consumerAddress, error, isPending, isWaitingConfirmation, isSuccess, txHash],
  )

  return {
    requestRaffle,
    reset,
    ...status,
  }
}


