"use client"

import { useEffect, useState } from "react"
import { Radio, X } from "lucide-react"

interface DrLemaireMessageProps {
  roomId: string
  onDismiss?: () => void
  trigger?: string
}

const messages: Record<string, { text: string; avatar: string }> = {
  // Messages par salle
  R1: {
    text: "Dr. Lemaire : Équipe, vous m'entendez ? Le système HVAC est compromis. Activez les switches simultanément et entrez le code du panneau CO₂. Vous devez collaborer !",
    avatar: "👨‍🔬"
  },
  R1_complete: {
    text: "Dr. Lemaire : Excellent ! Les ventilations d'urgence sont activées. Le CO₂ diminue temporairement. Direction le laboratoire de filtration, vite !",
    avatar: "👨‍🔬"
  },
  R2: {
    text: "Dr. Lemaire : Vous êtes dans le labo de filtration. Analysez le graphique CO₂ et recalibrez les capteurs dans le bon ordre. Chaque seconde compte !",
    avatar: "👨‍🔬"
  },
  R2_complete: {
    text: "Dr. Lemaire : Parfait ! Le système de filtration est opérationnel. Mais le CO₂ continue de monter. Passez à la salle de contrôle centrale !",
    avatar: "👨‍🔬"
  },
  R3: {
    text: "Dr. Lemaire : C'est le moment crucial ! Synchronisez les modules HVAC et redémarrez le système principal. Tout dépend de vous !",
    avatar: "👨‍🔬"
  },
  warning_5min: {
    text: "Dr. Lemaire : ATTENTION ! Plus que 5 minutes avant l'évacuation forcée ! Le CO₂ atteint des niveaux dangereux !",
    avatar: "👨‍🔬"
  },
  warning_1min: {
    text: "Dr. Lemaire : CRITIQUE ! 1 MINUTE ! Terminez la procédure immédiatement !",
    avatar: "👨‍🔬"
  },
  victory: {
    text: "Dr. Lemaire : BRAVO ÉQUIPE ! Le système HVAC est restauré ! Le CO₂ diminue rapidement. Vous avez sauvé le centre. Excellent travail !",
    avatar: "👨‍🔬"
  },
  defeat: {
    text: "Dr. Lemaire : Évacuation forcée déclenchée ! Le niveau de CO₂ est trop élevé. Mission échouée...",
    avatar: "👨‍🔬"
  }
}

export function DrLemaireMessage({ roomId, onDismiss, trigger }: DrLemaireMessageProps) {
  const [visible, setVisible] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<{ text: string; avatar: string } | null>(null)
  
  useEffect(() => {
    // Déterminer quel message afficher
    let messageKey = trigger || roomId
    
    if (messages[messageKey]) {
      setCurrentMessage(messages[messageKey])
      setVisible(true)
      
      // Auto-dismiss après 8 secondes sauf pour warnings
      if (!messageKey.includes('warning')) {
        const timer = setTimeout(() => {
          handleDismiss()
        }, 8000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [roomId, trigger])
  
  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => {
      onDismiss?.()
    }, 300)
  }
  
  if (!visible || !currentMessage) return null
  
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-blue-500 rounded-lg shadow-2xl max-w-2xl">
        {/* Header */}
        <div className="bg-blue-600 px-4 py-2 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <span className="text-white font-semibold">Transmission Radio</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 flex gap-4">
          {/* Avatar */}
          <div className="text-6xl flex-shrink-0">
            {currentMessage.avatar}
          </div>
          
          {/* Message */}
          <div className="flex-1">
            <div className="text-white text-lg leading-relaxed">
              {currentMessage.text}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-800 px-4 py-2 rounded-b-lg flex justify-end">
          <button
            onClick={handleDismiss}
            className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  )
}
