"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { X, AlertTriangle, Zap } from "lucide-react"

interface NarrativeOverlayProps {
  roomId: string
  onDismiss: () => void
}

export function NarrativeOverlay({ roomId, onDismiss }: NarrativeOverlayProps) {
  const [visible, setVisible] = useState(true)

  const narratives: Record<string, { title: string; text: string; icon: string; urgency: string; objective: string }> =
    {
      R1: {
        icon: "🚨",
        title: "SALLE DE CONTRÔLE",
        urgency: "NIVEAU CO₂ : 1000 PPM - SEUIL D'ALERTE ATTEINT",
        text: "Le système d'alarme vient de se déclencher. Les capteurs indiquent une concentration de CO₂ de 1000 ppm dans le bâtiment - le seuil d'alerte est franchi. À ce niveau, les occupants commencent à ressentir de la fatigue et une baisse de concentration. Vous devez activer les 4 ventilations d'urgence SIMULTANÉMENT pour stabiliser temporairement la situation.",
        objective:
          "🎯 Objectif : Activez les 2 switches en même temps ET entrez le code du panneau CO₂ dans la console",
      },
      R2: {
        icon: "🔬",
        title: "LABORATOIRE DE FILTRATION",
        urgency: "SYSTÈME DE FILTRATION HORS SERVICE",
        text: "Le système de filtration multi-étages est complètement bloqué. Les filtres fonctionnent en cascade : pré-filtre → filtre HEPA → filtre à charbon actif. Si vous activez les valves dans le mauvais ordre, la différence de pression peut endommager les filtres. Consultez le guide de séquence pour connaître l'ordre correct.",
        objective:
          "🎯 Objectif : Activez les 3 valves dans le bon ordre (V2→V3→V1) ET placez les poids sur les plaques",
      },
      R3: {
        icon: "💨",
        title: "BAIE DE VENTILATION PRINCIPALE",
        urgency: "PURGE DU SYSTÈME HVAC REQUISE",
        text: "Le système HVAC principal nécessite une purge complète pour éliminer l'air vicié accumulé. La procédure de purge doit suivre une séquence précise avec des fenêtres temporelles strictes. Une fois la séquence lancée, vous avez 2.5 secondes entre chaque étape. La confirmation finale nécessite deux techniciens positionnés aux extrémités opposées de la salle.",
        objective:
          "🎯 Objectif : Activez les boutons A→B→C dans l'ordre, puis confirmez avec les 2 switches simultanément",
      },
      EXIT: {
        icon: "✅",
        title: "PORTE D'ÉVACUATION",
        urgency: "SYSTÈME RESTAURÉ - ÉVACUATION SÉCURISÉE",
        text: "Félicitations ! Vous avez réussi à restaurer le système de ventilation. Les niveaux de CO₂ redescendent progressivement vers des valeurs normales (< 800 ppm). Vous avez collecté 3 fragments de code lors de votre progression. Combinez-les dans l'ordre des salles (R1→R2→R3) pour former le code final et déverrouiller la sortie.",
        objective: "🎯 Objectif : Entrez le code final formé des 3 fragments (format : XXX)",
      },
    }

  const narrative = narratives[roomId]

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 12000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!narrative || !visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }}
    >
      <Card className="max-w-3xl w-full mx-4 p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-4 border-yellow-500 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setVisible(false)
            setTimeout(onDismiss, 300)
          }}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/30 rounded-full p-2"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-6 text-white">
          <div className="text-center border-b-2 border-yellow-500/30 pb-4">
            <div className="text-7xl mb-4 animate-pulse">{narrative.icon}</div>
            <h2 className="text-4xl font-bold text-yellow-400 mb-2">{narrative.title}</h2>
            <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-lg">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              {narrative.urgency}
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-6 border-2 border-cyan-500/30">
            <p className="text-lg leading-relaxed text-cyan-50">{narrative.text}</p>
          </div>

          <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 rounded-lg p-5 border-2 border-green-500/50">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xl font-bold text-green-400 mb-2">OBJECTIF DE LA SALLE</p>
                <p className="text-lg text-green-100">{narrative.objective}</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-6 py-3">
              <p className="text-sm text-yellow-300 font-semibold">
                ⏱️ Cliquez n'importe où pour continuer (fermeture auto dans 12s)
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
