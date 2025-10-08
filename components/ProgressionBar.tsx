"use client"

import { CheckCircle, Circle, Lock, ArrowRight } from "lucide-react"

interface PhaseStep {
  id: string
  label: string
  role: string
  completed: boolean
  current: boolean
  locked: boolean
}

interface ProgressionBarProps {
  phases: PhaseStep[]
  overallProgress: number
}

export function ProgressionBar({ phases, overallProgress }: ProgressionBarProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Analyst": return "text-blue-400 border-blue-400 bg-blue-900/30"
      case "Operator": return "text-green-400 border-green-400 bg-green-900/30"
      case "Tech": return "text-orange-400 border-orange-400 bg-orange-900/30"
      default: return "text-gray-400 border-gray-400 bg-gray-900/30"
    }
  }

  return (
    <div className="fixed left-4 top-32 z-30 w-80">
      <div className="bg-slate-900 border-4 border-slate-700 rounded-xl p-4 shadow-2xl">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-white font-bold text-lg mb-2">🎯 PROTOCOLE D'URGENCE</h3>
          <div className="bg-slate-800 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="text-right text-white text-sm mt-1 font-semibold">
            {overallProgress.toFixed(0)}%
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-3">
          {phases.map((phase, index) => (
            <div key={phase.id}>
              <div
                className={`
                  relative rounded-lg border-2 p-3 transition-all duration-300
                  ${phase.completed ? "bg-green-900/30 border-green-500" : ""}
                  ${phase.current ? `${getRoleColor(phase.role)} animate-pulse` : ""}
                  ${phase.locked ? "bg-slate-800/50 border-slate-700 opacity-50" : ""}
                  ${!phase.completed && !phase.current && !phase.locked ? "border-slate-600" : ""}
                `}
              >
                {/* Icon */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {phase.completed && (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    )}
                    {phase.current && (
                      <Circle className="w-6 h-6 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                    )}
                    {phase.locked && (
                      <Lock className="w-6 h-6 text-slate-500" />
                    )}
                    {!phase.completed && !phase.current && !phase.locked && (
                      <Circle className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`text-sm font-semibold ${
                        phase.completed ? "text-green-300" :
                        phase.current ? "text-white" :
                        "text-slate-400"
                      }`}>
                        PHASE {index + 1}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full border ${
                        phase.role === "Analyst" ? "border-blue-400 text-blue-300" :
                        phase.role === "Operator" ? "border-green-400 text-green-300" :
                        phase.role === "Tech" ? "border-orange-400 text-orange-300" :
                        "border-gray-400 text-gray-300"
                      }`}>
                        {phase.role}
                      </div>
                    </div>
                    <div className={`text-sm mt-1 ${
                      phase.completed ? "text-green-200" :
                      phase.current ? "text-white font-semibold" :
                      "text-slate-500"
                    }`}>
                      {phase.label}
                    </div>
                  </div>
                </div>

                {/* Current indicator */}
                {phase.current && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-yellow-400 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Connector line */}
              {index < phases.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className={`w-0.5 h-4 ${
                    phase.completed ? "bg-green-500" : "bg-slate-700"
                  }`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-slate-300 text-xs text-center">
            Chaque phase débloque la suivante
          </div>
        </div>
      </div>
    </div>
  )
}
