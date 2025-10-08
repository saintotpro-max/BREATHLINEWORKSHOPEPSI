"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

interface RoomTransitionProps {
  fromRoom: string
  toRoom: string
  onComplete: () => void
}

export function RoomTransition({ fromRoom, toRoom, onComplete }: RoomTransitionProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Son de transition (swoosh) au démarrage
    const playTransitionSound = () => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.4)
    }
    
    playTransitionSound()
  }, [])

  useEffect(() => {
    // Animation de progression
    const duration = 2000 // 2 secondes
    const interval = 50
    const steps = duration / interval
    const increment = 100 / steps

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 200) // Petit délai avant de compléter
          return 100
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-blue-500 rounded-lg p-8 max-w-md w-full shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/20 p-4 rounded-full">
            <ArrowRight className="w-12 h-12 text-blue-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            🚪 Passage en cours
          </h3>
          <div className="flex items-center justify-center gap-3 text-gray-300">
            <span className="text-lg">{fromRoom}</span>
            <ArrowRight className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-semibold text-blue-400">{toRoom}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-400">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
