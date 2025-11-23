interface TokenAllocationDisplayProps {
  circleName: string
  amount: number
  total: number
  className?: string
}

export function TokenAllocationDisplay({ circleName, amount, total, className = "" }: TokenAllocationDisplayProps) {
  const percentage = total > 0 ? (amount / total) * 100 : 0

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">{circleName}</span>
        <span className="text-sm text-mandinga-gray-600">
          {amount} / {total} SCT ({percentage.toFixed(1)}%)
        </span>
      </div>

      <div className="h-6 border-2 border-mandinga-black flex bg-mandinga-gray-100">
        <div className="bg-mandinga-black" style={{ width: `${percentage}%` }} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-mandinga-gray-600">Your allocation weight in this circle</span>
        <span className="font-bold">{percentage.toFixed(1)}% of pool</span>
      </div>
    </div>
  )
}

export default TokenAllocationDisplay
