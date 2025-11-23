"use client"

interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = (current / total) * 100
  const totalBlocks = 48
  const filledBlocks = Math.floor((percentage / 100) * totalBlocks)

  return (
    <div className="w-full">
      {/* Progress blocks */}
      <div className="flex gap-0 mb-2">
        {Array.from({ length: totalBlocks }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 ${
              i < filledBlocks
                ? "bg-mandinga-electric-blue"
                : "bg-mandinga-white border-l border-mandinga-black first:border-l-0"
            }`}
          />
        ))}
      </div>

      {/* Label */}
      {label && <p className="text-xs font-bold">{label || `${current} OF ${total}`}</p>}
    </div>
  )
}
