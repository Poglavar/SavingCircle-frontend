"use client"

type UrgencyState = "calm" | "attention" | "urgent"
type Phase = "contribution" | "auction" | "drawing" | "result"

interface RoundStatusProps {
  round: number
  totalRounds: number
  phase: Phase
  urgency: UrgencyState
  timeRemaining: string
  status: string
  amount?: string
  deadline: string
  progress: string
  pot: string
  members: string
  userStatus: string[]
  action?: {
    label: string
    type: "urgent" | "waiting" | "proceed"
    onClick?: () => void
  }
}

export function RoundStatusDisplay({
  round,
  totalRounds,
  phase,
  urgency,
  timeRemaining,
  status,
  amount,
  deadline,
  progress,
  pot,
  members,
  userStatus,
  action,
}: RoundStatusProps) {
  // Determine primary zone height and background based on urgency
  const primaryZoneStyles = {
    calm: "h-[40vh] bg-white text-black",
    attention: "h-[60vh] bg-[#FFFF00] text-black",
    urgent: "h-[70vh] bg-[#FF0000] text-white",
  }

  // Phase display names
  const phaseNames = {
    contribution: "CONTRIBUTION",
    auction: "AUCTION",
    drawing: "DRAWING",
    result: "RESULT",
  }

  // Action button styles
  const actionStyles = {
    urgent: "bg-[#FFFF00] text-black",
    waiting: "bg-gray-600 text-white",
    proceed: "bg-[#00FF00] text-black",
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Context Bar - Fixed top, 64px */}
      <div className="h-16 bg-black text-white flex items-center justify-between px-4 shrink-0">
        <span className="text-sm font-bold">
          ROUND {round} OF {totalRounds}
        </span>
        <span className="text-sm font-bold flex items-center gap-2">
          <span>⏱</span>
          {timeRemaining}
        </span>
      </div>

      {/* Primary Info Zone - Expands based on urgency */}
      <div className={`${primaryZoneStyles[urgency]} flex flex-col items-center justify-center shrink-0`}>
        <div className="text-center px-4">
          <div className="text-[24px] md:text-[32px] font-bold mb-4 md:mb-8 tracking-tight">{phaseNames[phase]}</div>

          {urgency === "calm" && (
            <div className="text-[64px] md:text-[96px] font-bold leading-none tracking-tight">{status}</div>
          )}

          {urgency === "attention" && (
            <>
              <div className="text-[80px] md:text-[128px] font-bold leading-none tracking-tight mb-4">{status}</div>
              {amount && (
                <div className="text-[48px] md:text-[64px] font-bold leading-none tracking-tight">{amount}</div>
              )}
            </>
          )}

          {urgency === "urgent" && (
            <>
              <div className="text-[64px] md:text-[96px] font-bold leading-none tracking-tight mb-4 md:mb-8">
                {status}
              </div>
              <div className="text-[96px] md:text-[144px] font-bold leading-none tracking-tight mb-4 md:mb-8 font-mono">
                {timeRemaining}
              </div>
              {amount && (
                <div className="text-[48px] md:text-[64px] font-bold leading-none tracking-tight">PAY {amount}</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Secondary Info Zone - Fixed grid */}
      <div className="flex-1 bg-white border-t-2 border-black overflow-y-auto">
        <div className="grid grid-cols-2 gap-0">
          {/* Top row */}
          <div className="h-20 border-r-2 border-b-2 border-black p-4">
            <div className="text-[12px] md:text-[14px] text-gray-600 uppercase mb-1">⏱ DEADLINE</div>
            <div className="text-[18px] md:text-[24px] font-bold leading-tight">{deadline}</div>
          </div>
          <div className="h-20 border-b-2 border-black p-4">
            <div className="text-[12px] md:text-[14px] text-gray-600 uppercase mb-1">📊 PROGRESS</div>
            <div className="text-[18px] md:text-[24px] font-bold leading-tight">{progress}</div>
          </div>

          {/* Middle row */}
          <div className="h-20 border-r-2 border-b-2 border-black p-4">
            <div className="text-[12px] md:text-[14px] text-gray-600 uppercase mb-1">💰 POT</div>
            <div className="text-[18px] md:text-[24px] font-bold leading-tight">{pot}</div>
          </div>
          <div className="h-20 border-b-2 border-black p-4">
            <div className="text-[12px] md:text-[14px] text-gray-600 uppercase mb-1">👥 MEMBERS</div>
            <div className="text-[18px] md:text-[24px] font-bold leading-tight">{members}</div>
          </div>

          {/* Bottom row - full width */}
          <div className="col-span-2 h-20 p-4">
            <div className="text-[12px] md:text-[14px] text-gray-600 uppercase mb-1">📋 YOUR STATUS</div>
            {userStatus.map((line, i) => (
              <div key={i} className="text-[13px] md:text-[16px] font-bold leading-tight">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Zone - Fixed bottom, 80px */}
      {action && (
        <div className="h-20 shrink-0 p-2 bg-black">
          <button
            onClick={action.onClick}
            className={`w-full h-full ${actionStyles[action.type]} border-2 border-black font-bold text-[16px] md:text-[20px] tracking-tight uppercase hover:opacity-90 transition-opacity disabled:opacity-50`}
            disabled={action.type === "waiting"}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  )
}
