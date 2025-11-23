"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { useDeployedCircles } from "@/lib/hooks/use-deployed-circles"

interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  value?: string | number
  needsAttention?: boolean
  hasActivity?: boolean
}

const formatAddress = (address?: string) => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function DesktopSidebar() {
  const pathname = usePathname()
  const { joinedCircles } = useUser()
  const isCirclesIndex = pathname === "/circles"
  const { circles } = useDeployedCircles({ enabled: isCirclesIndex })

  const navItems: NavItem[] = [
    {
      id: "circles",
      label: "CIRCLES",
      href: "/circles",
      icon: "●●○",
      value: circles.length,
      hasActivity: false,
    },
    // Only show PAYMENTS if user has joined at least one circle
    ...(joinedCircles.length > 0
      ? [
        {
          id: "payments",
          label: "PAYMENTS",
          href: "/payments",
          icon: "⚠",
          value: "!",
          needsAttention: true,
        },
      ]
      : []),
    {
      id: "position",
      label: "POSITION",
      href: "/profile",
      icon: "■",
    },
  ]

  const getTabBackground = (item: NavItem, isActive: boolean) => {
    if (isActive) return "bg-mandinga-black text-mandinga-white"
    if (item.needsAttention) return "bg-yellow-400"
    if (item.hasActivity) return "bg-yellow-100"
    return "bg-mandinga-white"
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] bg-mandinga-white border-r-2 border-mandinga-black flex-col z-50">
      {/* Logo Top - 64px */}
      <Link
        href="/"
        className="h-16 flex items-center justify-center border-b-2 border-mandinga-black hover:bg-mandinga-gray-100 transition-colors gap-2"
      >
        <span className="text-xl">⚪️</span>
        <h1 className="text-xl font-bold">SavingCircles</h1>
      </Link>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`h-[72px] flex flex-col items-start justify-center px-6 border-b-2 border-mandinga-black transition-colors ${getTabBackground(
                item,
                isActive,
              )}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-bold">{item.label}</span>
                {item.value !== undefined && <span className="text-3xl font-bold">{item.value}</span>}
              </div>

              {/* Icon below */}
              <div className="text-lg leading-none mt-1">{item.icon}</div>
            </Link>
          )
        })}
      </div>

      <Link
        href="/tokens"
        className={`h-[72px] flex flex-col items-start justify-center px-6 border-t-2 border-mandinga-black transition-colors ${pathname === "/tokens"
          ? "bg-mandinga-black text-mandinga-white"
          : "bg-mandinga-white hover:bg-mandinga-gray-100"
          }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-bold">TOKENS</span>
          <span className="text-3xl font-bold">{joinedCircles.length > 0 ? 1250 : 0}</span>
        </div>
        <div className="text-lg leading-none mt-1">◆</div>
      </Link>

      {/* Wallet Bottom - 64px */}
      <ConnectButton.Custom>
        {({
          account,
          chain,
          mounted,
          authenticationStatus,
          openAccountModal,
          openChainModal,
          openConnectModal,
        }) => {
          const ready = mounted && authenticationStatus !== "loading"
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated")
          const wrongChain = chain?.unsupported
          const label = !ready
            ? "..."
            : wrongChain
              ? "Switch network"
              : connected
                ? formatAddress(account.address)
                : "Connect Wallet"

          const handleClick = () => {
            if (!ready) return
            if (wrongChain) {
              openChainModal()
              return
            }
            if (connected) {
              openAccountModal()
              return
            }
            openConnectModal()
          }

          return (
            <button
              type="button"
              onClick={handleClick}
              disabled={!ready}
              className="h-16 flex items-center justify-between px-6 border-t-2 border-mandinga-black hover:bg-mandinga-gray-100 transition-colors disabled:opacity-60"
            >
              <div>
                <div className="text-xs font-bold mb-1">WALLET</div>
                <div className="text-sm font-mono">{label}</div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide">
                {wrongChain ? "Fix" : connected ? "Manage" : "Connect"}
              </span>
            </button>
          )
        }}
      </ConnectButton.Custom>
    </aside>
  )
}

export default DesktopSidebar
