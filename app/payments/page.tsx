"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import DesktopSidebar from "@/components/desktop-sidebar"
import ContextBar from "@/components/context-bar"
import { useTimer } from "@/contexts/timer-context"

type UrgencyState = "paid" | "due" | "overdue"

export default function PaymentsPage() {
  const { nextRoundSeconds } = useTimer()
  const router = useRouter()

  const [urgency, setUrgency] = useState<UrgencyState>("due")
  const [timeLeft, setTimeLeft] = useState(6 * 60 * 60) // 6 hours in seconds

  useEffect(() => {
    if (nextRoundSeconds === 0) {
      router.push("/circles/circle-1/result")
    }
  }, [nextRoundSeconds, router])

  useEffect(() => {
    // Update timeLeft based on urgency for demo
    if (urgency === "overdue") {
      setTimeLeft(2 * 60 * 60 + 34 * 60 + 18) // 2h 34m 18s
    } else if (urgency === "due") {
      setTimeLeft(14 * 60 * 60) // 14 hours
    } else {
      setTimeLeft(38 * 60 * 60) // 38 hours
    }
  }, [urgency])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex">
      <DesktopSidebar />

      <main className="flex-1 md:ml-[240px] pb-32 md:pb-24">
        <ContextBar location="ALPHA CIRCLE - ROUND 3" phase="contribution" nextRoundSeconds={nextRoundSeconds} />

        <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold">ROUND 3 OF 10</span>

          {/* Demo controls integrated */}
          <div className="flex gap-1 border-2 border-white p-1">
            <button
              onClick={() => setUrgency("paid")}
              className={`px-2 py-1 text-xs font-bold border transition-colors ${
                urgency === "paid" ? "bg-white text-black border-white" : "border-white text-white"
              }`}
            >
              PAID
            </button>
            <button
              onClick={() => setUrgency("due")}
              className={`px-2 py-1 text-xs font-bold border transition-colors ${
                urgency === "due" ? "bg-[#FFEB3B] text-black border-[#FFEB3B]" : "border-white text-white"
              }`}
            >
              DUE
            </button>
            <button
              onClick={() => setUrgency("overdue")}
              className={`px-2 py-1 text-xs font-bold border transition-colors ${
                urgency === "overdue" ? "bg-white text-black border-white" : "border-white text-white"
              }`}
            >
              OVERDUE
            </button>
          </div>
        </div>

        <div
          className={`flex flex-col items-center justify-center py-16 ${
            urgency === "paid" ? "bg-white" : urgency === "due" ? "bg-[#FFEB3B]" : "bg-white"
          }`}
        >
          <div className="text-center px-4">
            <div className="text-2xl font-bold mb-8">CONTRIBUTION</div>
            <div className="text-6xl md:text-8xl font-bold leading-none mb-4">
              {urgency === "paid" ? "PAID ✓" : urgency === "due" ? "DUE NOW" : "OVERDUE"}
            </div>
            {urgency !== "paid" && <div className="text-4xl md:text-6xl font-bold">100 USDC</div>}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-0 border-t-2 border-black">
          <div className="p-6 border-r-2 border-b-2 border-black">
            <div className="text-sm text-gray-600 mb-2">⏱ DEADLINE</div>
            <div className="text-2xl font-bold">Nov 24, 2:00 PM</div>
          </div>
          <div className="p-6 border-b-2 border-black">
            <div className="text-sm text-gray-600 mb-2">📊 PROGRESS</div>
            <div className="text-2xl font-bold">8/10 PAID</div>
          </div>
          <div className="p-6 border-r-2 border-b-2 border-black">
            <div className="text-sm text-gray-600 mb-2">💰 POT</div>
            <div className="text-2xl font-bold">800 USDC</div>
          </div>
          <div className="p-6 border-b-2 border-black">
            <div className="text-sm text-gray-600 mb-2">👥 MEMBERS</div>
            <div className="text-2xl font-bold">8 ACTIVE</div>
          </div>
          <div className="col-span-2 p-6">
            <div className="text-sm text-gray-600 mb-2">📋 YOUR STATUS</div>
            <div className="font-bold">Last paid: Round 2</div>
            <div className="font-bold">Earned: 100 MNDG total</div>
          </div>
        </div>
      </main>

      {urgency !== "paid" && (
        <button
          onClick={() => alert("Payment triggered")}
          className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-[240px] z-50 h-20 text-2xl font-bold bg-[#FFEB3B] hover:bg-[#FDD835] transition-colors border-t-2 border-black"
        >
          PAY 100 USDC
        </button>
      )}

      <MobileBottomNav />
    </div>
  )
}
