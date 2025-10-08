"use client"

import { useEffect, useRef, useState } from "react"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

interface CO2RealtimeHUDProps {
  currentCO2: number
  history?: number[]
  onCritical?: () => void
}

export function CO2RealtimeHUD({ currentCO2, history = [], onCritical }: CO2RealtimeHUDProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable")
  const [shake, setShake] = useState(false)

  // Déterminer la zone de danger
  const getZoneInfo = (co2: number) => {
    if (co2 < 800) return { color: "#10b981", label: "OPTIMAL", bgColor: "bg-green-500" }
    if (co2 < 1000) return { color: "#eab308", label: "ACCEPTABLE", bgColor: "bg-yellow-500" }
    if (co2 < 1400) return { color: "#f97316", label: "ALERTE", bgColor: "bg-orange-500" }
    return { color: "#ef4444", label: "CRITIQUE", bgColor: "bg-red-500" }
  }

  const zone = getZoneInfo(currentCO2)

  // Calculer la tendance
  useEffect(() => {
    if (history.length >= 2) {
      const last = history[history.length - 1]
      const previous = history[history.length - 2]
      if (last > previous + 10) setTrend("up")
      else if (last < previous - 10) setTrend("down")
      else setTrend("stable")
    }
  }, [history])

  // Effet shake si critique
  useEffect(() => {
    if (currentCO2 >= 1400) {
      setShake(true)
      const timer = setTimeout(() => setShake(false), 500)
      onCritical?.()
      return () => clearTimeout(timer)
    }
  }, [currentCO2, onCritical])

  // Dessiner le graphique
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, width, height)

    // Grid
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Zones de couleur
    const drawZone = (yStart: number, yEnd: number, color: string) => {
      ctx.fillStyle = color
      ctx.globalAlpha = 0.1
      ctx.fillRect(0, yStart, width, yEnd - yStart)
      ctx.globalAlpha = 1
    }

    drawZone(0, height * 0.2, "#ef4444") // Rouge (> 1400)
    drawZone(height * 0.2, height * 0.4, "#f97316") // Orange (1000-1400)
    drawZone(height * 0.4, height * 0.6, "#eab308") // Jaune (800-1000)
    drawZone(height * 0.6, height, "#10b981") // Vert (< 800)

    // Dessiner la courbe
    if (history.length > 1) {
      ctx.strokeStyle = zone.color
      ctx.lineWidth = 3
      ctx.beginPath()

      history.forEach((value, index) => {
        const x = (width / Math.max(history.length - 1, 1)) * index
        const y = height - ((value - 400) / 1200) * height // Scale 400-1600 ppm
        
        if (index === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })

      ctx.stroke()

      // Points
      history.forEach((value, index) => {
        const x = (width / Math.max(history.length - 1, 1)) * index
        const y = height - ((value - 400) / 1200) * height

        ctx.fillStyle = zone.color
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Ligne valeur actuelle
    const currentY = height - ((currentCO2 - 400) / 1200) * height
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, currentY)
    ctx.lineTo(width, currentY)
    ctx.stroke()
    ctx.setLineDash([])

  }, [history, currentCO2, zone.color])

  return (
    <div className={`fixed top-20 right-4 z-40 ${shake ? "animate-shake" : ""}`}>
      <div className="bg-slate-900 border-4 border-slate-700 rounded-xl p-4 w-80 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            🌡️ NIVEAU CO₂
            {currentCO2 >= 1400 && (
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            )}
          </h3>
          {trend === "up" && <TrendingUp className="w-5 h-5 text-red-500" />}
          {trend === "down" && <TrendingDown className="w-5 h-5 text-green-500" />}
        </div>

        {/* Valeur actuelle */}
        <div className="text-center mb-2">
          <div className={`text-5xl font-bold ${currentCO2 >= 1400 ? "animate-pulse" : ""}`} style={{ color: zone.color }}>
            {currentCO2.toFixed(1)}
          </div>
          <div className="text-white text-sm">ppm (parties par million)</div>
        </div>

        {/* Zone indicator */}
        <div className={`${zone.bgColor} text-white font-bold py-2 px-4 rounded-lg text-center mb-3`}>
          {zone.label}
        </div>

        {/* Graphique */}
        <canvas
          ref={canvasRef}
          width={288}
          height={120}
          className="w-full rounded-lg border-2 border-slate-700 mb-2"
        />

        {/* Légende */}
        <div className="grid grid-cols-2 gap-2 text-xs text-white">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>{'< 800: Optimal'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>800-1000</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>1000-1400</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>{'> 1400: Danger!'}</span>
          </div>
        </div>

        {/* Warning si critique */}
        {currentCO2 >= 1400 && (
          <div className="mt-3 bg-red-900/50 border border-red-500 rounded-lg p-2 animate-pulse">
            <p className="text-red-200 text-sm font-semibold text-center">
              ⚠️ NIVEAU CRITIQUE! AGISSEZ VITE!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
