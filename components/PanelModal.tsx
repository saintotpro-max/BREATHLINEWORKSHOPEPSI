"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CO2GraphPanel } from "@/components/CO2GraphPanel"

interface PanelModalProps {
  panelId: string
  gameData: any
  onClose: () => void
  canRead: boolean
}

export function PanelModal({ panelId, gameData, onClose, canRead }: PanelModalProps) {
  if (!gameData) return null

  const panel = gameData.rooms.flatMap((r: any) => r.objects).find((o: any) => o.id === panelId && o.type === "panel")

  if (!panel || !panel.content) return null

  const showCO2Graph = panel.content.title.includes("CO₂") || panel.content.text.includes("CO₂")
  const currentPPM = panel.content.text.match(/(\d+)\s*ppm/)?.[1] || "1000"

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400">{panel.content.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!canRead && (
            <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4">
              <div className="text-red-400 font-bold">🔒 ACCÈS RESTREINT</div>
              <div className="text-red-300 text-sm">Seul l'Analyst peut lire ce panneau</div>
            </div>
          )}

          {canRead && (
            <>
              {showCO2Graph && <CO2GraphPanel currentPPM={Number.parseInt(currentPPM)} />}

              <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-sm leading-relaxed text-cyan-100">{panel.content.text}</p>
              </div>

              {panel.content.code && gameData.debugSolo?.showStickyNotes && (
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 shadow-md">
                  <div className="text-xs font-semibold text-yellow-800 mb-1">🔍 DEBUG NOTE</div>
                  <div className="text-2xl font-mono font-bold text-yellow-900 text-center">{panel.content.code}</div>
                </div>
              )}
            </>
          )}

          <Button onClick={onClose} className="w-full bg-cyan-600 hover:bg-cyan-700">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
