"use client"

import { useEffect, useState } from "react"
import { Zap, CheckCircle, XCircle } from "lucide-react"

interface SyncTimerProps {
  isActive: boolean
  durationMs: number
  onExpire: () => void
}

export function SyncTimer({ isActive, durationMs, onExpire }: SyncTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMs)
  const [status, setStatus] = useState<"waiting" | "success" | "failed">("waiting")

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(durationMs)
      setStatus("waiting")
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(interval)
          setStatus("failed")
          onExpire()
          return 0
        }
        return prev - 100
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isActive, durationMs, onExpire])

  if (!isActive && status === "waiting") return null

  const progress = (timeLeft / durationMs) * 100
  const seconds = (timeLeft / 1000).toFixed(1)

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
      <div className={`px-6 py-4 rounded-lg shadow-2xl border-2 ${
        status === "waiting" 
          ? "bg-yellow-900/90 border-yellow-500" 
          : status === "success"
          ? "bg-green-900/90 border-green-500"
          : "bg-red-900/90 border-red-500"
      }`}>
        <div className="flex items-center gap-3 mb-2">
          {status === "waiting" && <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />}
          {status === "success" && <CheckCircle className="w-5 h-5 text-green-300" />}
          {status === "failed" && <XCircle className="w-5 h-5 text-red-300" />}
          
          <div className="text-white font-bold">
            {status === "waiting" && "⚡ SYNCHRONISATION EN COURS"}
            {status === "success" && "✅ SWITCHES SYNCHRONISÉS!"}
            {status === "failed" && "❌ SYNCHRONISATION ÉCHOUÉE"}
          </div>
        </div>

        {status === "waiting" && (
          <>
            <div className="text-white/80 text-sm mb-2">
              Activez Switch B avant la fin du timer!
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-yellow-300 font-mono text-lg font-bold min-w-[3rem] text-right">
                {seconds}s
              </div>
            </div>
          </>
        )}

        {status === "failed" && (
          <div className="text-red-200 text-sm">
            Réessayez: activez les deux switches dans la fenêtre de {durationMs / 1000}s
          </div>
        )}
      </div>
    </div>
  )
}
