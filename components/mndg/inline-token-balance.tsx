interface InlineTokenBalanceProps {
  balance: number
  className?: string
}

export default function InlineTokenBalance({ balance, className = "" }: InlineTokenBalanceProps) {
  return (
    <div className={`flex items-center gap-2 h-8 ${className}`}>
      <div className="w-5 h-5 bg-black border-2 border-black flex items-center justify-center">
        <span className="text-white text-xs">◆</span>
      </div>
      <span className="text-base font-bold">{balance} MNDG</span>
    </div>
  )
}
