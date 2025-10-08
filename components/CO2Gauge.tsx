"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"

interface CO2GaugeProps {
  timerMs: number
  errors: number
  puzzlesSolved: number
  isPlaying: boolean
}

export function CO2Gauge({ timerMs, errors, puzzlesSolved, isPlaying }: CO2GaugeProps) {
  const [co2Level, setCo2Level] = useState(1000)
  
  // Calculer le CO₂ basé sur le temps, erreurs et puzzles
  useEffect(() => {
    if (!isPlaying) return
    
    // Base: 1000 ppm (seuil critique)
    // Augmentation: +0.5 ppm par seconde écoulée (30 sec = +15 ppm)
    const timeElapsedMs = 1800000 - timerMs // 30 min en ms
    const timeIncrease = Math.floor(timeElapsedMs / 1000) * 0.5
    
    // Pénalité erreurs: +20 ppm par erreur
    const errorPenalty = errors * 20
    
    // Bonus puzzles: -50 ppm par puzzle résolu
    const puzzleBonus = puzzlesSolved * 50
    
    const newLevel = Math.max(400, Math.min(1500, 1000 + timeIncrease + errorPenalty - puzzleBonus))
    setCo2Level(Math.round(newLevel))
  }, [timerMs, errors, puzzlesSolved, isPlaying])
  
  // Déterminer l'état et la couleur
  const getStatus = () => {
    if (co2Level < 800) return { text: "OPTIMAL", color: "text-green-500", bg: "bg-green-500" }
    if (co2Level < 1000) return { text: "BON", color: "text-lime-500", bg: "bg-lime-500" }
    if (co2Level < 1200) return { text: "ATTENTION", color: "text-yellow-500", bg: "bg-yellow-500" }
    if (co2Level < 1400) return { text: "ÉLEVÉ", color: "text-orange-500", bg: "bg-orange-500" }
    return { text: "CRITIQUE", color: "text-red-500", bg: "bg-red-500" }
  }
  
  const status = getStatus()
  const percentage = Math.min(100, ((co2Level - 400) / (1500 - 400)) * 100)
  
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-gray-700 min-w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${status.color} ${co2Level > 1200 ? 'animate-pulse' : ''}`} />
            <span className="text-white font-semibold">Niveau CO₂</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${status.color}`}>{co2Level}</span>
            <span className="text-gray-400 text-sm">ppm</span>
          </div>
        </div>
        
        {/* Gauge */}
        <div className="mb-2">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${status.bg} transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        
        {/* Status & Info */}
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${status.color}`}>
            {status.text}
          </span>
          <div className="flex gap-3 text-gray-400">
            <span>+0.5 ppm/s</span>
            <span>-50 ppm/énigme</span>
          </div>
        </div>
        
        {/* Warning messages */}
        {co2Level >= 1400 && (
          <div className="mt-2 bg-red-900/30 border border-red-500 rounded px-3 py-1 text-red-400 text-xs animate-pulse">
            🚨 DANGER ! Niveau critique - Évacuation imminente
          </div>
        )}
        {co2Level >= 1200 && co2Level < 1400 && (
          <div className="mt-2 bg-orange-900/30 border border-orange-500 rounded px-3 py-1 text-orange-400 text-xs">
            ⚠️ Niveau élevé - Fatigue et maux de tête
          </div>
        )}
      </div>
    </div>
  )
}
