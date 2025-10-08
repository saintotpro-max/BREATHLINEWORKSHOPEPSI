"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react"

interface GameNotificationProps {
  message: string
  type: "success" | "warning" | "info"
  playerName?: string
  duration?: number
  onDismiss?: () => void
}

export function GameNotification({ 
  message, 
  type, 
  playerName,
  duration = 4000,
  onDismiss 
}: GameNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-900/30 border-green-500/50 text-green-300"
      case "warning":
        return "bg-yellow-900/30 border-yellow-500/50 text-yellow-300"
      case "info":
        return "bg-blue-900/30 border-blue-500/50 text-blue-300"
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`
        fixed top-20 left-1/2 transform -translate-x-1/2 z-50
        ${getColors()}
        border-2 rounded-lg px-4 py-3 shadow-2xl
        animate-in slide-in-from-top duration-300
        ${!isVisible ? 'animate-out slide-out-to-top' : ''}
        max-w-md
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          {playerName && (
            <div className="font-semibold text-sm mb-1">
              {playerName}
            </div>
          )}
          <div className="text-sm">
            {message}
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onDismiss?.(), 300)
          }}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Container pour gérer plusieurs notifications
interface NotificationManagerProps {
  notifications: Array<{
    id: string
    message: string
    type: "success" | "warning" | "info"
    playerName?: string
  }>
  onDismiss: (id: string) => void
}

export function NotificationManager({ notifications, onDismiss }: NotificationManagerProps) {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {notifications.map((notif, index) => (
        <div
          key={notif.id}
          style={{
            transform: `translateY(${index * 80}px)`,
            transition: 'transform 300ms ease-out'
          }}
        >
          <GameNotification
            message={notif.message}
            type={notif.type}
            playerName={notif.playerName}
            onDismiss={() => onDismiss(notif.id)}
          />
        </div>
      ))}
    </div>
  )
}
