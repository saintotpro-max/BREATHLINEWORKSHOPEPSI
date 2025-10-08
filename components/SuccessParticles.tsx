"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export function SuccessParticles({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (trigger === 0) return

    const newParticles: Particle[] = []
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 50,
        y: 50,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 100,
      })
    }
    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5,
            life: p.life - 2,
          }))
          .filter((p) => p.life > 0),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [trigger])

  if (particles.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute h-3 w-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.life / 100,
            transform: `scale(${p.life / 100})`,
          }}
        />
      ))}
    </div>
  )
}
