"use client"

import { Target, CheckCircle2, Circle, AlertCircle, MessageSquare } from "lucide-react"

interface ObjectiveStep {
  id: string
  text: string
  role?: string
  completed: boolean
  current: boolean
}

interface CurrentObjectiveProps {
  title: string
  steps: ObjectiveStep[]
  currentRole?: string
  needsTransmission?: boolean
}

export function CurrentObjective({ title, steps, currentRole, needsTransmission }: CurrentObjectiveProps) {
  const currentStep = steps.find(s => s.current && !s.completed)
  const nextSteps = steps.filter(s => !s.completed && !s.current).slice(0, 2)
  const completedCount = steps.filter(s => s.completed).length

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl z-30 max-w-sm">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
          <Target className="w-4 h-4 text-yellow-400" />
          <h4 className="text-white font-semibold text-sm">Objectif Actuel</h4>
          <span className="ml-auto text-xs text-gray-400">
            {completedCount}/{steps.length}
          </span>
        </div>

        {/* Indicateur transmission (si Operator attend code) */}
        {needsTransmission && currentRole === "Operator" && currentStep?.id === "R1_enter_code" && (
          <div className="mb-3">
            <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <MessageSquare className="w-4 h-4 text-blue-400 animate-pulse flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-blue-300 text-xs font-medium mb-1">
                  💬 Transmission requise
                </div>
                <div className="text-blue-200 text-xs">
                  Attendez que l'<span className="font-bold">Analyst</span> vous transmette le code via le chat
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current step */}
        {currentStep && (
          <div className="mb-3">
            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="mt-0.5">
                <Circle className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">
                  {currentStep.text}
                </div>
                {currentStep.role && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                      currentRole === currentStep.role 
                        ? "bg-green-500/20 text-green-300 font-bold"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      [{currentStep.role}]
                    </span>
                    {currentRole !== currentStep.role && (
                      <span className="text-xs text-gray-400">← Pas votre rôle</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Next steps */}
        {nextSteps.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 font-medium mb-2">
              Prochaines étapes:
            </div>
            {nextSteps.map(step => (
              <div key={step.id} className="flex items-start gap-2 text-gray-400 text-xs">
                <Circle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {step.text}
                  {step.role && (
                    <span className="ml-2 text-gray-500">[{step.role}]</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All completed */}
        {completedCount === steps.length && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div className="text-green-300 text-sm font-medium">
              Tous les objectifs complétés !
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
