"use client"

import { useEffect, useState } from "react"

// Screen Shake Hook
export function useScreenShake(duration: number = 500) {
  const [isShaking, setIsShaking] = useState(false)

  const trigger = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), duration)
  }

  return { isShaking, triggerShake: trigger }
}

// Particle System
interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

interface ParticleEffectProps {
  x: number
  y: number
  count?: number
  color?: string
  duration?: number
  onComplete?: () => void
}

export function ParticleEffect({ x, y, count = 20, color = "#10b981", duration = 2000, onComplete }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const speed = 2 + Math.random() * 3
      newParticles.push({
        id: `${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: 4 + Math.random() * 6
      })
    }
    setParticles(newParticles)

    // Animation loop
    let animationFrame: number
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      if (progress >= 1) {
        setParticles([])
        onComplete?.()
        return
      }

      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy + 0.1, // Gravity
        vy: p.vy + 0.05,
        life: 1 - progress
      })))

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [x, y, count, color, duration, onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.life,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            transition: 'all 16ms linear'
          }}
        />
      ))}
    </div>
  )
}

// Success Explosion Effect
interface SuccessExplosionProps {
  onComplete?: () => void
}

export function SuccessExplosion({ onComplete }: SuccessExplosionProps) {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <ParticleEffect
        x={window.innerWidth / 2}
        y={window.innerHeight / 2}
        count={50}
        color="#10b981"
        duration={2000}
        onComplete={onComplete}
      />
      <ParticleEffect
        x={window.innerWidth / 2}
        y={window.innerHeight / 2}
        count={30}
        color="#3b82f6"
        duration={2500}
      />
      <ParticleEffect
        x={window.innerWidth / 2}
        y={window.innerHeight / 2}
        count={20}
        color="#fbbf24"
        duration={3000}
      />
    </div>
  )
}

// Ambient Light Overlay
interface AmbientLightProps {
  co2Level: number
}

export function AmbientLight({ co2Level }: AmbientLightProps) {
  const getColor = () => {
    if (co2Level < 800) return "rgba(16, 185, 129, 0.05)" // Green
    if (co2Level < 1000) return "rgba(234, 179, 8, 0.05)" // Yellow
    if (co2Level < 1400) return "rgba(249, 115, 22, 0.1)" // Orange
    return "rgba(239, 68, 68, 0.15)" // Red
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-colors duration-1000"
      style={{
        backgroundColor: getColor()
      }}
    />
  )
}

// Pulse Effect for Critical Objects
export function PulseGlow({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className="absolute inset-0 pointer-events-none animate-pulse">
      <div className="absolute inset-0 bg-yellow-400 opacity-20 blur-xl rounded-lg" />
      <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg" />
    </div>
  )
}

// Warning Flash
export function WarningFlash({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40 animate-pulse">
      <div className="absolute inset-0 border-8 border-red-500 opacity-50" />
    </div>
  )
}
