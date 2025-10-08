"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Clock } from "lucide-react"

interface TimeWarningProps {
  remainingMs: number
  onDismiss: () => void
}

export function TimeWarning({ remainingMs, onDismiss }: TimeWarningProps) {
  const [visible, setVisible] = useState(true)
  const minutes = Math.floor(remainingMs / 60000)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!visible) return null

  const getMessage = () => {
    if (minutes <= 1) return "DERNIÈRE MINUTE ! Dépêchez-vous !"
    if (minutes <= 2) return "Plus que 2 minutes restantes !"
    if (minutes <= 5) return "Attention : 5 minutes restantes"
    return ""
  }

  const getColor = () => {
    if (minutes <= 1) return "bg-red-600"
    if (minutes <= 2) return "bg-orange-600"
    return "bg-yellow-600"
  }

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 ${getColor()} text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-bounce`}
    >
      {minutes <= 1 ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
      <span className="font-bold text-lg">{getMessage()}</span>
    </div>
  )
}
