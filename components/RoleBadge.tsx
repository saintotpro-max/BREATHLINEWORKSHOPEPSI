"use client"

import { User } from "lucide-react"

interface RoleBadgeProps {
  role: string
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
}

const roleColors = {
  Analyst: { bg: "bg-blue-500", text: "text-blue-100", border: "border-blue-400" },
  Operator: { bg: "bg-green-500", text: "text-green-100", border: "border-green-400" },
  Tech: { bg: "bg-orange-500", text: "text-orange-100", border: "border-orange-400" },
  Logistician: { bg: "bg-purple-500", text: "text-purple-100", border: "border-purple-400" }
}

const roleIcons = {
  Analyst: "📊",
  Operator: "⌨️",
  Tech: "🔧",
  Logistician: "📦"
}

export function RoleBadge({ role, size = "md", showIcon = true }: RoleBadgeProps) {
  const colors = roleColors[role as keyof typeof roleColors] || roleColors.Analyst
  const icon = roleIcons[role as keyof typeof roleIcons] || "👤"
  
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5"
  }

  return (
    <div className={`
      inline-flex items-center gap-1.5
      ${colors.bg} ${colors.text}
      border ${colors.border}
      rounded-full
      ${sizeClasses[size]}
      font-semibold
      shadow-lg
      animate-in zoom-in duration-200
    `}>
      {showIcon && <span>{icon}</span>}
      <span>{role}</span>
    </div>
  )
}

// Variante pour floating badge (au-dessus des objets)
export function FloatingRoleBadge({ role }: { role: string }) {
  const colors = roleColors[role as keyof typeof roleColors] || roleColors.Analyst
  const icon = roleIcons[role as keyof typeof roleIcons] || "👤"

  return (
    <div className={`
      absolute -top-8 left-1/2 transform -translate-x-1/2
      ${colors.bg} ${colors.text}
      border-2 ${colors.border}
      rounded-full
      px-3 py-1
      text-xs font-bold
      shadow-xl
      animate-bounce
      whitespace-nowrap
      z-10
    `}>
      <div className="flex items-center gap-1.5">
        <span>{icon}</span>
        <span>{role}</span>
      </div>
      {/* Petit triangle pointant vers le bas */}
      <div className={`
        absolute top-full left-1/2 transform -translate-x-1/2
        w-0 h-0
        border-l-4 border-l-transparent
        border-r-4 border-r-transparent
        border-t-4 ${colors.border}
      `} />
    </div>
  )
}
