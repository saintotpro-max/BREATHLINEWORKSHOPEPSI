/**
 * Pedagogy modal - displays educational content and quiz after room completion.
 */

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Pedagogy, Role } from "@/state/types"

interface PedagogyModalProps {
  open: boolean
  onContinue: () => void
  pedagogy: Pedagogy
  role: Role | null
}

export function PedagogyModal({ open, onContinue, pedagogy, role }: PedagogyModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index)
    setShowResult(true)

    // Emit quiz taken event for potential score adjustment
    window.dispatchEvent(
      new CustomEvent("quizTaken", {
        detail: { correct: index === pedagogy.quiz.correctIndex },
      }),
    )
  }

  const isCorrect = selectedAnswer === pedagogy.quiz.correctIndex

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-gradient-to-br from-green-50 to-blue-50 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <span className="text-3xl">🎓</span>
            {pedagogy.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3 bg-white/50 p-4 rounded-lg">
            {pedagogy.lines.map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-700 flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">•</span>
                <span>{line}</span>
              </p>
            ))}
          </div>

          {role === "Analyst" && pedagogy.analystContext && (
            <div className="bg-purple-100 border-l-4 border-purple-500 p-3 rounded">
              <div className="text-xs font-semibold text-purple-800 mb-1 flex items-center gap-1">
                <span>🔬</span> ANALYST INSIGHT
              </div>
              <p className="text-sm text-purple-900">{pedagogy.analystContext}</p>
            </div>
          )}

          <div className="border-t pt-4 bg-blue-50/50 p-4 rounded-lg">
            <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">❓</span>
              <span>{pedagogy.quiz.q}</span>
            </div>
            <div className="space-y-2">
              {pedagogy.quiz.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => !showResult && handleAnswerSelect(i)}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    showResult
                      ? i === pedagogy.quiz.correctIndex
                        ? "bg-green-100 border-green-500 shadow-md"
                        : i === selectedAnswer
                          ? "bg-red-100 border-red-500"
                          : "bg-gray-100 border-gray-300 opacity-50"
                      : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm"
                  }`}
                >
                  <span className="font-semibold mr-2 text-blue-600">{String.fromCharCode(65 + i)}.</span>
                  {choice}
                  {showResult && i === pedagogy.quiz.correctIndex && <span className="ml-2 text-green-600">✓</span>}
                </button>
              ))}
            </div>

            {showResult && (
              <div
                className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${isCorrect ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
              >
                <span className="text-xl">{isCorrect ? "✓" : "ℹ️"}</span>
                <span>{isCorrect ? "Correct! Well done." : "Not quite, but you learned something important!"}</span>
              </div>
            )}
          </div>

          <Button onClick={onContinue} className="w-full bg-green-600 hover:bg-green-700" disabled={!showResult}>
            {isCorrect ? "Continue Mission →" : "Continue Learning →"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
