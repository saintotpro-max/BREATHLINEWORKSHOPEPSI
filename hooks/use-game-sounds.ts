import { useCallback, useEffect, useRef } from "react"

// Sons du jeu (utilisation de Web Audio API)
export function useGameSounds(muted: boolean = false) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  // Créer un son simple avec oscillateur
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (muted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    // Envelope ADSR simple
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }, [muted])

  // Sons spécifiques du jeu
  const sounds = {
    // Notification de succès (montée joyeuse)
    success: useCallback(() => {
      if (muted) return
      playTone(523.25, 0.1, 'sine') // C5
      setTimeout(() => playTone(659.25, 0.15, 'sine'), 80) // E5
      setTimeout(() => playTone(783.99, 0.2, 'sine'), 150) // G5
    }, [muted, playTone]),

    // Erreur (buzz court)
    error: useCallback(() => {
      if (muted) return
      playTone(200, 0.15, 'sawtooth')
      setTimeout(() => playTone(150, 0.15, 'sawtooth'), 80)
    }, [muted, playTone]),

    // Clic / interaction
    click: useCallback(() => {
      if (muted) return
      playTone(800, 0.05, 'square')
    }, [muted, playTone]),

    // Porte ouverte (swoosh)
    doorOpen: useCallback(() => {
      if (muted) return
      playTone(400, 0.15, 'sine')
      setTimeout(() => playTone(300, 0.15, 'sine'), 50)
      setTimeout(() => playTone(200, 0.2, 'sine'), 100)
    }, [muted, playTone]),

    // Puzzle résolu (fanfare courte)
    puzzleSolved: useCallback(() => {
      if (muted) return
      playTone(523.25, 0.1, 'sine') // C5
      setTimeout(() => playTone(587.33, 0.1, 'sine'), 90) // D5
      setTimeout(() => playTone(659.25, 0.1, 'sine'), 180) // E5
      setTimeout(() => playTone(783.99, 0.25, 'sine'), 270) // G5
    }, [muted, playTone]),

    // Salle complétée (victoire!)
    roomComplete: useCallback(() => {
      if (muted) return
      playTone(523.25, 0.15, 'sine') // C5
      setTimeout(() => playTone(659.25, 0.15, 'sine'), 100) // E5
      setTimeout(() => playTone(783.99, 0.15, 'sine'), 200) // G5
      setTimeout(() => playTone(1046.50, 0.3, 'sine'), 300) // C6
    }, [muted, playTone]),

    // Alerte (warning)
    warning: useCallback(() => {
      if (muted) return
      playTone(880, 0.1, 'square')
      setTimeout(() => playTone(880, 0.1, 'square'), 150)
      setTimeout(() => playTone(880, 0.15, 'square'), 300)
    }, [muted, playTone]),

    // Transition salle (whoosh)
    transition: useCallback(() => {
      if (muted) return
      // Descente de fréquence
      playTone(1000, 0.3, 'sine')
      setTimeout(() => playTone(800, 0.3, 'sine'), 100)
      setTimeout(() => playTone(600, 0.3, 'sine'), 200)
      setTimeout(() => playTone(400, 0.4, 'sine'), 300)
    }, [muted, playTone]),

    // Hover objet
    hover: useCallback(() => {
      if (muted) return
      playTone(600, 0.03, 'sine')
    }, [muted, playTone]),

    // Timer critique (pulse)
    timerCritical: useCallback(() => {
      if (muted) return
      playTone(440, 0.08, 'square')
    }, [muted, playTone])
  }

  return sounds
}
