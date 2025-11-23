"use client"

import { useState } from "react"

interface TokenInputFieldProps {
  maxAmount: number
  availableBalance: number
  value: number
  onChange: (value: number) => void
  className?: string
}

export default function TokenInputField({
  maxAmount,
  availableBalance,
  value,
  onChange,
  className = "",
}: TokenInputFieldProps) {
  const [focused, setFocused] = useState(false)
  const hasError = value > availableBalance || value > maxAmount

  return (
    <div className={`border-2 border-black bg-white p-4 ${className}`}>
      <div className="mb-2">
        <span className="text-sm font-bold">Amount to Bid</span>
      </div>
      <div className={`border-${focused ? "3" : "2"} ${hasError ? "border-red-500" : "border-black"} p-4 mb-2`}>
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          className="w-full text-4xl font-bold text-center outline-none"
          max={Math.min(maxAmount, availableBalance)}
        />
        <div className="text-center text-sm font-bold mt-2">MNDG</div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span>Available: {availableBalance} MNDG</span>
        {hasError && (
          <span className="text-red-500 font-bold">
            {value > availableBalance ? "Insufficient MNDG balance" : `Max ${maxAmount} MNDG`}
          </span>
        )}
      </div>
    </div>
  )
}
