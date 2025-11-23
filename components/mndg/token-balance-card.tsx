interface TokenBalanceCardProps {
  balance: number
  changeThisRound?: number
  className?: string
}

export function TokenBalanceCard({ balance, changeThisRound = 0, className = "" }: TokenBalanceCardProps) {
  return (
    <div className={`border-2 border-black bg-white ${className}`} style={{ height: "160px" }}>
      <div className="h-10 flex items-center px-4 border-b-2 border-black bg-gray-100">
        <span className="text-sm font-bold">MNDG BALANCE</span>
      </div>
      <div className="flex flex-col items-center justify-center" style={{ height: "120px" }}>
        <span className="text-6xl font-bold mb-2">{balance}</span>
        {changeThisRound !== 0 && (
          <span className={`text-sm ${changeThisRound > 0 ? "text-green-500" : "text-red-500"}`}>
            {changeThisRound > 0 ? "▲" : "▼"} {changeThisRound > 0 ? "+" : ""}
            {changeThisRound} this round
          </span>
        )}
      </div>
    </div>
  )
}

export default TokenBalanceCard
