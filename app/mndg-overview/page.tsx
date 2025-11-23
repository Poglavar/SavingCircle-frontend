"use client"

import { useState } from "react"
import InlineTokenBalance from "@/components/mndg/inline-token-balance"
import TokenBalanceCard from "@/components/mndg/token-balance-card"
import TokenTransactionItem from "@/components/mndg/token-transaction-item"
import TokenInputField from "@/components/mndg/token-input-field"
import TokenAllocationDisplay from "@/components/mndg/token-allocation-display"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"

export default function SCTOverviewPage() {
  const [bidAmount, setBidAmount] = useState(50)

  // Sample data
  const balance = 150
  const earnedThisRound = 50
  const spentThisRound = -50
  const maxAuction = 100
  const totalPool = 420
  const yourQuota = 50

  const transactions = [
    {
      id: 1,
      amount: 50,
      type: "earned" as const,
      description: "Installment payment – Round 3",
      timestamp: "2 hours ago",
    },
    { id: 2, amount: -50, type: "spent" as const, description: "Auction bid – Round 3", timestamp: "1 hour ago" },
    {
      id: 3,
      amount: 50,
      type: "earned" as const,
      description: "Installment payment – Round 2",
      timestamp: "1 day ago",
    },
    { id: 4, amount: -30, type: "spent" as const, description: "Auction bid – Round 2", timestamp: "2 days ago" },
  ]

  const totalEarned = 200
  const totalSpent = 50

  return (
    <>
      <DesktopSidebar />
      <div className="min-h-screen md:ml-[240px] pb-16 md:pb-0">
        {/* Header */}
        <div className="h-16 bg-black border-b-2 border-black flex items-center px-4">
          <span className="text-white text-xl font-bold">← SCT OVERVIEW</span>
        </div>

        <div className="p-4 md:p-8 space-y-8">
          {/* Component 1: Inline Token Balance */}
          <div>
            <h2 className="text-sm font-bold mb-4 text-gray-500">COMPONENT 1 — INLINE TOKEN BALANCE</h2>
            <InlineTokenBalance balance={balance} />
          </div>

          {/* Component 2: Token Balance Card */}
          <div>
            <h2 className="text-sm font-bold mb-4 text-gray-500">COMPONENT 2 — TOKEN BALANCE CARD</h2>
            <TokenBalanceCard balance={balance} changeThisRound={earnedThisRound} />
          </div>

          {/* Component 3: Token Transaction Items */}
          <div>
            <h2 className="text-sm font-bold mb-4 text-gray-500">COMPONENT 3 — TOKEN TRANSACTION ITEMS</h2>
            <div className="space-y-4">
              <TokenTransactionItem
                amount={50}
                type="earned"
                description="Installment payment – Round 3"
                timestamp="2 hours ago"
              />
              <TokenTransactionItem
                amount={50}
                type="spent"
                description="Auction bid – Round 3"
                timestamp="1 hour ago"
              />
            </div>
          </div>

          {/* Component 4: Token History Screen */}
          <div>
            <h2 className="text-sm font-bold mb-4 text-gray-500">COMPONENT 4 — TOKEN HISTORY (SUMMARY + LIST)</h2>

            {/* Summary */}
            <div className="border-2 border-black bg-white p-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold">Current Balance:</span>
                  <span className="font-bold">{balance} SCT</span>
                </div>
                <div className="h-px bg-gray-300 my-2" />
                <div className="flex items-center justify-between">
                  <span>Total Earned:</span>
                  <span className="text-green-500 font-bold">{totalEarned} SCT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Spent:</span>
                  <span className="text-red-500 font-bold">{totalSpent} SCT</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border-2 border-black bg-gray-100">
              <div className="h-10 flex items-center px-4 border-b-2 border-black bg-white">
                <span className="text-sm font-bold">RECENT ACTIVITY</span>
              </div>
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {transactions.map((tx) => (
                  <TokenTransactionItem key={tx.id} {...tx} />
                ))}
              </div>
            </div>
          </div>

          {/* Component 5: Token Input Field */}
          <div>
            <h2 className="text-sm font-bold mb-4 text-gray-500">COMPONENT 5 — TOKEN INPUT FIELD (AUCTION BID)</h2>
            <TokenInputField
              maxAmount={maxAuction}
              availableBalance={balance}
              value={bidAmount}
              onChange={setBidAmount}
            />
          </div>

          {/* Component 6: Token Allocation Display */}
          <div>
            <h2 className="text-sm font-bold mb-4 text-gray-500">COMPONENT 6 — TOKEN ALLOCATION DISPLAY</h2>
            <TokenAllocationDisplay yourBid={bidAmount} totalPool={totalPool} yourQuota={yourQuota} />
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </>
  )
}
