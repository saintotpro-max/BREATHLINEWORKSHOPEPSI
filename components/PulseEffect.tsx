"use client"

import { ReactNode } from "react"

interface PulseEffectProps {
  children: ReactNode
  active: boolean
  color?: string
  intensity?: "low" | "medium" | "high"
}

export function PulseEffect({ 
  children, 
  active, 
  color = "yellow", 
  intensity = "medium" 
}: PulseEffectProps) {
  if (!active) return <>{children}</>

  const colorMap = {
    yellow: "shadow-yellow-400",
    green: "shadow-green-400",
    red: "shadow-red-400",
    blue: "shadow-blue-400",
    orange: "shadow-orange-400"
  }

  const intensityMap = {
    low: "animate-pulse",
    medium: "animate-pulse shadow-lg",
    high: "animate-pulse shadow-2xl"
  }

  return (
    <div className={`${intensityMap[intensity]} ${colorMap[color as keyof typeof colorMap] || colorMap.yellow}`}>
      {children}
    </div>
  )
}

// Effet de glow pour objets interactifs
export function GlowEffect({ children, active }: { children: ReactNode; active: boolean }) {
  if (!active) return <>{children}</>

  return (
    <div className="relative">
      {/* Glow background */}
      <div className="absolute inset-0 bg-yellow-400 opacity-30 blur-xl animate-pulse rounded-lg" />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Shake effect pour erreurs
export function ShakeEffect({ children, trigger }: { children: ReactNode; trigger: boolean }) {
  return (
    <div className={trigger ? "animate-shake" : ""}>
      {children}
    </div>
  )
}

// Bounce effect pour nouvelles notifs
export function BounceEffect({ children }: { children: ReactNode }) {
  return (
    <div className="animate-bounce-in">
      {children}
    </div>
  )
}
