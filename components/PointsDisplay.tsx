"use client"

import { useEffect, useState } from "react"

type Props = {
  score: number
  recentPoints?: number
}

export function PointsDisplay({ score, recentPoints }: Props) {
  const [showRecent, setShowRecent] = useState(false)

  useEffect(() => {
    if (recentPoints && recentPoints > 0) {
      setShowRecent(true)
      const timer = setTimeout(() => setShowRecent(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [recentPoints])

  return (
    <div className="fixed top-24 right-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
      <div className="text-sm font-semibold opacity-80">Score</div>
      <div className="text-3xl font-bold">{score}</div>

      {showRecent && recentPoints && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            +{recentPoints}
          </div>
        </div>
      )}
    </div>
  )
}
