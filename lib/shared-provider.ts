import { JsonRpcProvider } from "ethers"
import { getSepoliaRpcUrl } from "@/lib/rpc"

const providerCache = new Map<string, JsonRpcProvider>()

export function getSharedJsonRpcProvider(rpcUrl?: string) {
  const url = rpcUrl ?? getSepoliaRpcUrl()
  if (!url) {
    throw new Error("Missing RPC URL")
  }

  let provider = providerCache.get(url)
  if (!provider) {
    provider = new JsonRpcProvider(url)
    provider.pollingInterval = 30000
    providerCache.set(url, provider)
  }
  return provider
}


