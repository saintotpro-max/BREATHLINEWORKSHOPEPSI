"use client"

import { useEffect, useState } from "react"
import { X, BookOpen, Lightbulb, CheckCircle } from "lucide-react"

interface DebriefingContent {
  title: string
  explanation: string
  didYouKnow: string
  realWorldApplication: string
  unlocked?: string
}

interface PedagogicalDebriefingProps {
  content: DebriefingContent
  onClose: () => void
}

export function PedagogicalDebriefing({ content, onClose }: PedagogicalDebriefingProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Auto-fermeture après 15 secondes
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onClose()
          return 100
        }
        return prev + (100 / 150) // 15s = 150 * 100ms
      })
    }, 100)

    return () => clearInterval(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-blue-900 to-blue-950 border-4 border-blue-400 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl shadow-blue-500/50 animate-in zoom-in duration-500">
        {/* Header */}
        <div className="bg-blue-500 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">✅ ÉNIGME RÉSOLUE!</h2>
              <p className="text-blue-100 text-sm">{content.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-blue-600 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-white max-h-[60vh] overflow-y-auto">
          {/* Explanation */}
          <div className="bg-blue-800/50 rounded-lg p-4 border border-blue-400/30">
            <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Comment ça marche?
            </h3>
            <p className="text-blue-100 leading-relaxed whitespace-pre-line">
              {content.explanation}
            </p>
          </div>

          {/* Did You Know */}
          <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-400/50">
            <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Le saviez-vous?
            </h3>
            <p className="text-yellow-100 leading-relaxed whitespace-pre-line">
              {content.didYouKnow}
            </p>
          </div>

          {/* Real World Application */}
          <div className="bg-green-900/30 rounded-lg p-4 border border-green-400/50">
            <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
              🌍 Dans la vraie vie
            </h3>
            <p className="text-green-100 leading-relaxed whitespace-pre-line">
              {content.realWorldApplication}
            </p>
          </div>

          {/* Unlocked */}
          {content.unlocked && (
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-400/50 animate-pulse">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                🔓 Débloqué
              </h3>
              <p className="text-purple-100 font-semibold">
                {content.unlocked}
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-4">
          <div className="bg-blue-950 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-blue-300 text-sm mt-2">
            Fermeture automatique dans {Math.ceil((100 - progress) / (100 / 15))}s
          </p>
        </div>
      </div>
    </div>
  )
}

// Composant manager pour empiler plusieurs débriefings
interface DebriefingManagerProps {
  debriefings: Array<{
    id: string
    content: DebriefingContent
  }>
  onDismiss: (id: string) => void
}

export function DebriefingManager({ debriefings, onDismiss }: DebriefingManagerProps) {
  if (debriefings.length === 0) return null

  // Afficher seulement le premier de la queue
  const current = debriefings[0]

  return (
    <PedagogicalDebriefing
      content={current.content}
      onClose={() => onDismiss(current.id)}
    />
  )
}
