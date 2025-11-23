const DEFAULT_ALCHEMY_KEY = "5eMnDYb8SsrseqleUSYcq-Hr_Rt-1n26"

export const getSepoliaRpcUrl = () => {
  if (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL) return process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
  if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    return `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  }
  return `https://eth-sepolia.g.alchemy.com/v2/${DEFAULT_ALCHEMY_KEY}`
}


