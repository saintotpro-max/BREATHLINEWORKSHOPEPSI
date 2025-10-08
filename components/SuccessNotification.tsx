"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Sparkles } from "lucide-react"

interface SuccessNotificationProps {
  message: string
  onDismiss: () => void
  duration?: number
}

export function SuccessNotification({ message, onDismiss, duration = 3000 }: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onDismiss, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
        <CheckCircle2 className="w-6 h-6" />
        <span className="font-semibold text-lg">{message}</span>
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>
    </div>
  )
}
