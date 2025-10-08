"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Terminal, Lock } from "lucide-react"

interface ConsoleModalProps {
  consoleId: string
  gameData: any
  onClose: () => void
  onSubmit: (input: string) => void
  canOperate: boolean
}

export function ConsoleModal({ consoleId, gameData, onClose, onSubmit, canOperate }: ConsoleModalProps) {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (!gameData) return null

  const console = gameData.rooms
    .flatMap((r: any) => r.objects)
    .find((o: any) => o.id === consoleId && o.type === "console")

  if (!console) return null

  const handleSubmit = () => {
    if (!input.trim()) {
      setError("Veuillez entrer un code")
      return
    }

    // FIX: Chercher validFormatRegex dans console.console (structure JSON correcte)
    const validFormatRegex = console.console?.validFormatRegex
    if (validFormatRegex) {
      const pattern = new RegExp(validFormatRegex)
      if (!pattern.test(input)) {
        setError(`Format invalide. Attendu: ${getFormatHint(console.console?.accept || console.accept)}`)
        return
      }
    }

    setError(null)
    onSubmit(input)
    setInput("")
  }

  const getFormatHint = (acceptType: string) => {
    if (acceptType === "code4") return "4 chiffres (ex: 1234)"
    if (acceptType === "codeN") return "Lettre + 2 chiffres (ex: B14)"
    if (acceptType === "code3") return "3 lettres (ex: ACB)"
    return "Code valide"
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-gray-900 border-2 border-cyan-500 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            CONSOLE D'ACTIVATION
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!canOperate && (
            <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                <Lock className="w-5 h-5" />
                ACCÈS RESTREINT
              </div>
              <div className="text-red-300 text-sm">Seul l'Operator peut utiliser cette console</div>
            </div>
          )}

          {canOperate && (
            <>
              <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-4">
                <div className="text-cyan-400 text-sm font-mono mb-2">SYSTÈME: {consoleId}</div>
                <div className="text-cyan-100 text-sm">Format requis: {getFormatHint(console.console?.accept || console.accept)}</div>
                {console.tooltip && <div className="text-gray-400 text-xs mt-2">{console.tooltip}</div>}
              </div>

              <div className="space-y-2">
                <label className="text-cyan-400 text-sm font-semibold">ENTREZ LE CODE:</label>
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value.toUpperCase())
                    setError(null)
                  }}
                  placeholder="Ex: B14"
                  className="bg-slate-800 border-cyan-500/50 text-cyan-100 text-center text-2xl font-mono tracking-widest uppercase"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit()
                    if (e.key === "Escape") onClose()
                  }}
                  autoFocus
                  maxLength={10}
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-400 text-sm">⚠️ {error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                  disabled={!input.trim()}
                >
                  VALIDER
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1 bg-slate-800 border-slate-600">
                  ANNULER
                </Button>
              </div>
            </>
          )}

          {!canOperate && (
            <Button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600">
              Fermer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
