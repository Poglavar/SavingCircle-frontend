"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import type { Config } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import {
  IDBCursor as NodeIDBCursor,
  IDBCursorWithValue as NodeIDBCursorWithValue,
  IDBDatabase as NodeIDBDatabase,
  IDBFactory as NodeIDBFactory,
  IDBIndex as NodeIDBIndex,
  IDBKeyRange as NodeIDBKeyRange,
  IDBObjectStore as NodeIDBObjectStore,
  IDBOpenDBRequest as NodeIDBOpenDBRequest,
  IDBRequest as NodeIDBRequest,
  IDBTransaction as NodeIDBTransaction,
  IDBVersionChangeEvent as NodeIDBVersionChangeEvent,
  indexedDB as nodeIndexedDB,
} from "fake-indexeddb"

const chains = [mainnet, sepolia]
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "SAVINGCIRCLE_DEMO"

const globalObject = globalThis as typeof globalThis & {
  indexedDB?: IDBFactory
  IDBKeyRange?: typeof IDBKeyRange
  IDBCursor?: typeof IDBCursor
  IDBCursorWithValue?: typeof IDBCursorWithValue
  IDBDatabase?: typeof IDBDatabase
  IDBFactory?: typeof IDBFactory
  IDBIndex?: typeof IDBIndex
  IDBObjectStore?: typeof IDBObjectStore
  IDBOpenDBRequest?: typeof IDBOpenDBRequest
  IDBRequest?: typeof IDBRequest
  IDBTransaction?: typeof IDBTransaction
  IDBVersionChangeEvent?: typeof IDBVersionChangeEvent
}

if (typeof window === "undefined" && typeof globalObject.indexedDB === "undefined") {
  globalObject.indexedDB = nodeIndexedDB
  globalObject.IDBKeyRange = NodeIDBKeyRange
  globalObject.IDBCursor = NodeIDBCursor
  globalObject.IDBCursorWithValue = NodeIDBCursorWithValue
  globalObject.IDBDatabase = NodeIDBDatabase
  globalObject.IDBFactory = NodeIDBFactory
  globalObject.IDBIndex = NodeIDBIndex
  globalObject.IDBObjectStore = NodeIDBObjectStore
  globalObject.IDBOpenDBRequest = NodeIDBOpenDBRequest
  globalObject.IDBRequest = NodeIDBRequest
  globalObject.IDBTransaction = NodeIDBTransaction
  globalObject.IDBVersionChangeEvent = NodeIDBVersionChangeEvent
}

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

