import { useState, useEffect, useCallback } from "react"

interface CO2SimulationOptions {
  initialLevel: number
  riseRate: number // ppm per second
  fallRate: number // ppm per second when system active
  maxLevel: number
  minLevel: number
  systemActive: boolean
  criticalCallback?: () => void
}

export function useCO2Simulation({
  initialLevel = 1000,
  riseRate = 0.5,
  fallRate = 2,
  maxLevel = 2000,
  minLevel = 400,
  systemActive = false,
  criticalCallback
}: CO2SimulationOptions) {
  const [currentLevel, setCurrentLevel] = useState(initialLevel)
  const [history, setHistory] = useState<number[]>([initialLevel])
  const [hasCriticalAlerted, setHasCriticalAlerted] = useState(false)

  // Update CO₂ level
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLevel(prev => {
        let newLevel: number

        if (systemActive) {
          // System is active, CO₂ decreases
          newLevel = Math.max(minLevel, prev - fallRate)
        } else {
          // System inactive, CO₂ rises
          newLevel = Math.min(maxLevel, prev + riseRate)
        }

        // Add to history (keep last 100 points)
        setHistory(h => {
          const newHistory = [...h, newLevel]
          return newHistory.slice(-100)
        })

        // Critical alert
        if (newLevel >= 1400 && !hasCriticalAlerted) {
          setHasCriticalAlerted(true)
          criticalCallback?.()
        }

        if (newLevel < 1400 && hasCriticalAlerted) {
          setHasCriticalAlerted(false)
        }

        return newLevel
      })
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [systemActive, riseRate, fallRate, maxLevel, minLevel, criticalCallback, hasCriticalAlerted])

  const forceLevel = useCallback((level: number) => {
    setCurrentLevel(level)
    setHistory(h => [...h, level].slice(-100))
  }, [])

  const reset = useCallback(() => {
    setCurrentLevel(initialLevel)
    setHistory([initialLevel])
    setHasCriticalAlerted(false)
  }, [initialLevel])

  return {
    currentLevel,
    history,
    forceLevel,
    reset,
    isCritical: currentLevel >= 1400,
    isWarning: currentLevel >= 1000 && currentLevel < 1400,
    isOptimal: currentLevel < 800
  }
}
