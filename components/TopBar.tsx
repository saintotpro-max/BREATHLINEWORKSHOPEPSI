"use client"

import { Book, Clock, AlertTriangle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  timerMs: number
  co2Level: number
  hintsUsed: number
  maxHints: number
  onOpenJournal: () => void
}

export function TopBar({ 
  timerMs, 
  co2Level, 
  hintsUsed, 
  maxHints,
  onOpenJournal 
}: TopBarProps) {
  const minutes = Math.floor(timerMs / 60000)
  const seconds = Math.floor((timerMs % 60000) / 1000)
  
  // CO₂ status
  const getCO2Status = () => {
    if (co2Level < 800) return { color: "text-green-400", bg: "bg-green-500/20", label: "OPTIMAL" }
    if (co2Level < 1000) return { color: "text-lime-400", bg: "bg-lime-500/20", label: "BON" }
    if (co2Level < 1200) return { color: "text-yellow-400", bg: "bg-yellow-500/20", label: "ATTENTION" }
    if (co2Level < 1400) return { color: "text-orange-400", bg: "bg-orange-500/20", label: "ÉLEVÉ" }
    return { color: "text-red-400", bg: "bg-red-500/20", label: "CRITIQUE" }
  }

  const co2Status = getCO2Status()
  
  // Timer status
  const getTimerColor = () => {
    if (minutes > 20) return "text-green-400"
    if (minutes > 10) return "text-yellow-400"
    if (minutes > 5) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Journal */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenJournal}
          className="text-white hover:bg-white/10"
        >
          <Book className="w-4 h-4 mr-2" />
          <span className="font-semibold">Journal</span>
        </Button>

        {/* Center: Stats */}
        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${getTimerColor()}`} />
            <div className="flex flex-col">
              <span className={`text-lg font-bold ${getTimerColor()} tabular-nums`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-400">Temps restant</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-700" />

          {/* CO₂ */}
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${co2Status.color}`} />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold ${co2Status.color} tabular-nums`}>
                  {co2Level}
                </span>
                <span className="text-xs text-gray-400">ppm</span>
              </div>
              <span className={`text-xs ${co2Status.color}`}>
                {co2Status.label}
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-700" />

          {/* Hints */}
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tabular-nums">
                {hintsUsed}/{maxHints}
              </span>
              <span className="text-xs text-gray-400">Indices</span>
            </div>
          </div>
        </div>

        {/* Right: Placeholder for balance */}
        <div className="w-[100px]" />
      </div>
    </div>
  )
}
