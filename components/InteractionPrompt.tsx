"use client"

import { useEffect, useState } from "react"
import type { GameObject, Role, GameSnapshot } from "@/state/types"
import { checkPrerequisites } from "@/lib/puzzleLogic"

interface InteractionPromptProps {
  nearbyObject: GameObject | null
  playerRole: Role | null
  canInteract: boolean
  snapshot?: GameSnapshot
}

export function InteractionPrompt({ nearbyObject, playerRole, canInteract, snapshot }: InteractionPromptProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (nearbyObject) {
      setShow(true)
    } else {
      setShow(false)
    }
  }, [nearbyObject])

  if (!show || !nearbyObject) return null

  let promptText = ""
  let icon = "❓"
  let canUse = canInteract
  let roleInfo = ""
  let prereqInfo = ""

  // Check role lock
  if (nearbyObject.roleLock && nearbyObject.roleLock !== playerRole) {
    canUse = false
    roleInfo = `Réservé au rôle: ${nearbyObject.roleLock}`
  }

  // Check prerequisites
  if (snapshot && nearbyObject.requires && nearbyObject.requires.length > 0) {
    const prereqsMet = checkPrerequisites(nearbyObject.requires, snapshot)
    if (!prereqsMet) {
      canUse = false
      prereqInfo = `Prérequis non remplis: ${nearbyObject.requires.join(", ")}`
    }
  }

  switch (nearbyObject.type) {
    case "switch":
      icon = "🔘"
      promptText = nearbyObject.state === "on" ? "Désactiver le switch" : "Activer le switch"
      break
    case "valve":
      icon = "🔧"
      promptText = nearbyObject.state === "on" ? "Fermer la valve" : "Ouvrir la valve"
      break
    case "panel":
      icon = "📋"
      promptText = "Lire le panneau"
      break
    case "console":
      icon = "⌨️"
      promptText = "Utiliser la console"
      break
    case "door":
      icon = "🚪"
      promptText = nearbyObject.open ? "Passer la porte" : "Porte verrouillée"
      canUse = nearbyObject.open || false
      break
    case "item":
      icon = "📦"
      promptText = "Ramasser l'objet"
      break
    case "weightPlate":
      icon = "⚖️"
      promptText = "Plaque de poids"
      break
    case "led":
      icon = "💡"
      promptText = "Indicateur"
      canUse = false
      break
  }

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 animate-bounce">
      <div
        className={`px-6 py-3 rounded-lg backdrop-blur border-2 shadow-2xl transition-all ${
          canUse
            ? "bg-green-500/90 border-green-300 shadow-green-500/50"
            : "bg-red-500/90 border-red-300 shadow-red-500/50"
        }`}
      >
        <div className="text-white text-center space-y-1">
          <div className="text-3xl animate-pulse">{icon}</div>
          <div className="font-bold text-lg">{nearbyObject.name || promptText}</div>
          <div className="text-sm opacity-90">{promptText}</div>
          {roleInfo && <div className="text-xs bg-black/30 px-2 py-1 rounded">{roleInfo}</div>}
          {prereqInfo && <div className="text-xs bg-orange-900/50 px-2 py-1 rounded border border-orange-500/50">🔗 {prereqInfo}</div>}
          {canUse && (
            <div className="text-sm font-semibold mt-2 flex items-center justify-center gap-2">
              Appuyez sur <kbd className="px-3 py-1 bg-white/30 rounded font-mono text-base">*</kbd> ou{" "}
              <kbd className="px-3 py-1 bg-white/30 rounded font-mono text-base">Entrée</kbd>
            </div>
          )}
          {!canUse && nearbyObject.type === "door" && (
            <div className="text-xs mt-1">Résolvez les énigmes pour déverrouiller</div>
          )}
        </div>
      </div>
    </div>
  )
}
