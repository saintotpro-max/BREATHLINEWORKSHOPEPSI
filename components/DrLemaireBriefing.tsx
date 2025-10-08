"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, Play, SkipForward } from "lucide-react"

interface BriefingLine {
  speaker: string
  text: string
  duration: number
}

const BRIEFING_LINES: BriefingLine[] = [
  {
    speaker: "Dr. Lemaire",
    text: "28 octobre 2025, 23h47. Station de recherche arctique BreatheLab-7.",
    duration: 4000
  },
  {
    speaker: "Dr. Lemaire",
    text: "Équipe, réveil d'urgence! Le système HVAC est compromis.",
    duration: 4000
  },
  {
    speaker: "Dr. Lemaire",
    text: "Le CO₂ monte dangereusement: 1000 ppm et ça grimpe.",
    duration: 4000
  },
  {
    speaker: "Dr. Lemaire",
    text: "À 1500 ppm, vous aurez des pertes de conscience. À 2000 ppm, c'est mortel.",
    duration: 5000
  },
  {
    speaker: "Dr. Lemaire",
    text: "Vous avez 30 minutes pour diagnostiquer, réactiver et débloquer le système.",
    duration: 5000
  },
  {
    speaker: "Dr. Lemaire",
    text: "Analyst: Diagnostiquez la panne. Operator: Réactivez les filtres. Tech: Débloquez les valves.",
    duration: 6000
  },
  {
    speaker: "Dr. Lemaire",
    text: "Chaque minute compte. La tempête nous piège ici. Le protocole d'évacuation est notre seule chance.",
    duration: 6000
  },
  {
    speaker: "Dr. Lemaire",
    text: "Bonne chance, équipe. Je compte sur vous.",
    duration: 3000
  }
]

interface DrLemaireBriefingProps {
  onComplete: () => void
  canSkip?: boolean
}

export function DrLemaireBriefing({ onComplete, canSkip = true }: DrLemaireBriefingProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started || currentLine >= BRIEFING_LINES.length) return

    const line = BRIEFING_LINES[currentLine]
    
    // Son synthétique simple (bip)
    if (!muted) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.value = 200 + (currentLine * 50)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.1)
    }

    const timer = setTimeout(() => {
      if (currentLine === BRIEFING_LINES.length - 1) {
        onComplete()
      } else {
        setCurrentLine(prev => prev + 1)
      }
    }, line.duration)

    return () => clearTimeout(timer)
  }, [currentLine, started, muted, onComplete])

  const handleSkip = () => {
    onComplete()
  }

  const handleStart = () => {
    setStarted(true)
  }

  const progress = (currentLine / BRIEFING_LINES.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-black opacity-90" />
      
      {/* Effet neige/vent */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.03) 10px,
            rgba(255,255,255,0.03) 20px
          )`,
          animation: 'slide 2s linear infinite'
        }} />
      </div>

      <div className="relative z-10 max-w-3xl w-full mx-4">
        {/* Logo/Station */}
        <div className="text-center mb-8 animate-in fade-in duration-1000">
          <div className="text-6xl mb-4">🏔️</div>
          <h1 className="text-4xl font-bold text-white mb-2">BREATHELAB-7</h1>
          <p className="text-blue-300 text-xl">Station de Recherche Arctique</p>
          <p className="text-red-400 text-sm mt-2 animate-pulse">● ALERTE SYSTÈME</p>
        </div>

        {!started ? (
          <div className="text-center animate-in zoom-in duration-500">
            <button
              onClick={handleStart}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105 shadow-2xl"
            >
              <Play className="w-8 h-8" />
              DÉMARRER LE BRIEFING
            </button>
            <p className="text-gray-400 mt-4 text-sm">Durée: ~30 secondes</p>
          </div>
        ) : (
          <>
            {/* Dialogue */}
            <div className="bg-slate-900/90 border-2 border-red-500 rounded-2xl p-8 mb-6 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                  👨‍🔬
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-blue-400 font-bold text-lg">
                      {BRIEFING_LINES[currentLine].speaker}
                    </h3>
                    <button
                      onClick={() => setMuted(!muted)}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-white text-xl leading-relaxed">
                    {BRIEFING_LINES[currentLine].text}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-gray-400 text-sm mt-2">
                  {currentLine + 1} / {BRIEFING_LINES.length}
                </p>
              </div>
            </div>

            {/* Skip button */}
            {canSkip && (
              <div className="text-center">
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto text-sm"
                >
                  <SkipForward className="w-4 h-4" />
                  Passer le briefing
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slide {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
      `}</style>
    </div>
  )
}
