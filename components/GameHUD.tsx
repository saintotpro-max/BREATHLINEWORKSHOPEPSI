/**
 * Game HUD - displays timer, score, roles, hints, and controls.
 */

"use client"

import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, HelpCircle } from "lucide-react"
import type { GameSnapshot, Role } from "@/state/types"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GameHUDProps {
  state: GameSnapshot
  role: Role | null
  onUseHint: (roomId: string) => void
  onMuteToggle: () => void
  muted: boolean
  maxHints: number
  hintCost: number
}

export function GameHUD({ state, role, onUseHint, onMuteToggle, muted, maxHints, hintCost }: GameHUDProps) {
  const [helpOpen, setHelpOpen] = useState(false)
  const [lastWarning, setLastWarning] = useState<number>(0)

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getTimerColor = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    if (minutes <= 1) return "text-red-500 animate-pulse"
    if (minutes <= 2) return "text-orange-500"
    if (minutes <= 5) return "text-yellow-400"
    return "text-green-400"
  }

  useEffect(() => {
    const minutes = Math.floor(state.timerMs / 60000)
    if (minutes === 5 && lastWarning !== 5) {
      setLastWarning(5)
      // Could trigger a sound effect here
    } else if (minutes === 2 && lastWarning !== 2) {
      setLastWarning(2)
    } else if (minutes === 1 && lastWarning !== 1) {
      setLastWarning(1)
    }
  }, [state.timerMs, lastWarning])

  const hintsRemaining = maxHints - state.hintsUsed

  return (
    <>
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-4">
          <div className={`text-sm font-mono font-bold ${getTimerColor(state.timerMs)}`}>
            <span>⏱</span> {formatTime(state.timerMs)}
          </div>
          <div className="text-sm">
            <span className="text-blue-400">Room:</span> {state.roomId || "Lobby"}
          </div>
          <div className="text-sm">
            <span className="text-green-400">Score:</span> {state.score}
          </div>
          {state.errors > 0 && (
            <div className="text-sm">
              <span className="text-red-400">Errors:</span> {state.errors}
            </div>
          )}
          {role && (
            <div className="text-sm">
              <span className="text-purple-400">Role:</span> {role}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
            onClick={() => onUseHint(state.roomId)}
            disabled={hintsRemaining <= 0}
          >
            💡 Hint ({hintsRemaining}/{maxHints}) -{hintCost}pts
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
            onClick={onMuteToggle}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guide & Contrôles</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <strong className="text-blue-900">Objectif</strong>
              <p className="text-blue-800 mt-1">
                Résolvez les énigmes dans chaque salle pour déverrouiller les portes et atteindre la sortie avant la fin
                du chronomètre (30 minutes).
              </p>
            </div>

            <div className="space-y-2">
              <strong>Contrôles de Base</strong>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Déplacement:</strong> WASD / ZQSD / Clic
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Interaction:</strong> Touche E
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Chat:</strong> Tapez dans le panneau
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Aide:</strong> Bouton ? ou H
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <strong>Mode Debug (Test)</strong>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-50 p-2 rounded">
                  <strong>Ouvrir debug:</strong> Touche +
                </div>
                <div className="bg-amber-50 p-2 rounded">
                  <strong>Changer rôle:</strong> Touche R
                </div>
                <div className="bg-amber-50 p-2 rounded">
                  <strong>Téléport salle 1:</strong> Touche 1
                </div>
                <div className="bg-amber-50 p-2 rounded">
                  <strong>Téléport salle 2:</strong> Touche 2
                </div>
                <div className="bg-amber-50 p-2 rounded">
                  <strong>Téléport salle 3:</strong> Touche 3
                </div>
                <div className="bg-amber-50 p-2 rounded">
                  <strong>Téléport sortie:</strong> Touche 4
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <strong>Rôles et Capacités</strong>
              <ul className="space-y-2 mt-2">
                <li className="bg-purple-50 p-2 rounded">
                  <strong className="text-purple-900">📊 Analyst:</strong>
                  <span className="text-purple-800"> Lit les panneaux de données et analyse les graphiques CO₂</span>
                </li>
                <li className="bg-blue-50 p-2 rounded">
                  <strong className="text-blue-900">🔧 Tech:</strong>
                  <span className="text-blue-800"> Active les switches, valves et systèmes mécaniques</span>
                </li>
                <li className="bg-green-50 p-2 rounded">
                  <strong className="text-green-900">⌨️ Operator:</strong>
                  <span className="text-green-800"> Entre les codes dans les consoles de contrôle</span>
                </li>
                <li className="bg-orange-50 p-2 rounded">
                  <strong className="text-orange-900">📦 Logistician:</strong>
                  <span className="text-orange-800"> Ramasse et place les objets (plaques de poids, etc.)</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <strong className="text-amber-900">Astuce</strong>
              <p className="text-amber-800 mt-1">
                Approchez-vous des objets pour voir le prompt "Press E". Si vous ne pouvez pas interagir, vérifiez que
                vous avez le bon rôle (affiché dans le prompt).
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
