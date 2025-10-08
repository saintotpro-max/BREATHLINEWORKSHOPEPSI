"use client"

import { Target, CheckCircle2, Circle } from "lucide-react"

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
}

export function CurrentObjective({ title, steps }: CurrentObjectiveProps) {
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
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                      [{currentStep.role}]
                    </span>
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
