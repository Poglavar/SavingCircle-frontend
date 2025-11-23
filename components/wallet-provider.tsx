"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import type { Config } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"

const chains = [mainnet, sepolia]
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "SAVINGCIRCLE_DEMO"

const wagmiConfig: Config = getDefaultConfig({
  appName: "SavingCircle",
  projectId,
  chains,
  ssr: true,
})

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default WalletProvider

