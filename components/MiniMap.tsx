"use client"

import { useState } from "react"
import { MapPin, Check, Lock } from "lucide-react"

interface Room {
  id: string
  name: string
  completed: boolean
  locked: boolean
}

interface MiniMapProps {
  rooms: Room[]
  currentRoomId: string
  onRoomClick?: (roomId: string) => void
}

export function MiniMap({ rooms, currentRoomId, onRoomClick }: MiniMapProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)

  // Structure du centre: R1 -> R2 -> R3 -> EXIT
  const roomPositions: Record<string, { x: number; y: number }> = {
    R1: { x: 40, y: 60 },
    R2: { x: 120, y: 60 },
    R3: { x: 120, y: 20 },
    EXIT: { x: 180, y: 20 }
  }

  const connections = [
    { from: "R1", to: "R2" },
    { from: "R2", to: "R3" },
    { from: "R3", to: "EXIT" }
  ]

  const getRoomStatus = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return { color: "gray", icon: "⚫", label: "Inconnu" }
    
    if (room.id === currentRoomId) {
      return { color: "#fbbf24", icon: "🟡", label: "Actuel" }
    }
    if (room.completed) {
      return { color: "#22c55e", icon: "🟢", label: "Complété" }
    }
    if (room.locked) {
      return { color: "#6b7280", icon: "⚫", label: "Verrouillé" }
    }
    return { color: "#3b82f6", icon: "🔵", label: "Disponible" }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl z-30">
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
          <MapPin className="w-4 h-4 text-blue-400" />
          <h4 className="text-white font-semibold text-sm">Plan du Centre</h4>
        </div>

        {/* Map SVG */}
        <div className="relative">
          <svg width="220" height="100" className="mb-2">
            {/* Connections (lignes entre salles) */}
            {connections.map(conn => {
              const from = roomPositions[conn.from]
              const to = roomPositions[conn.to]
              if (!from || !to) return null
              
              return (
                <line
                  key={`${conn.from}-${conn.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#4b5563"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )
            })}

            {/* Room nodes */}
            {rooms.slice(0, 4).map(room => {
              const pos = roomPositions[room.id]
              if (!pos) return null
              
              const status = getRoomStatus(room.id)
              const isHovered = hoveredRoom === room.id
              
              return (
                <g
                  key={room.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  onClick={() => onRoomClick?.(room.id)}
                  style={{ cursor: onRoomClick ? 'pointer' : 'default' }}
                >
                  {/* Glow effect si actuel ou hover */}
                  {(room.id === currentRoomId || isHovered) && (
                    <circle
                      r="18"
                      fill={status.color}
                      opacity="0.3"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Room circle */}
                  <circle
                    r="12"
                    fill={status.color}
                    stroke="white"
                    strokeWidth={room.id === currentRoomId ? "3" : "1.5"}
                  />
                  
                  {/* Room icon */}
                  {room.completed && (
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize="12"
                      fill="white"
                    >
                      ✓
                    </text>
                  )}
                  {room.locked && !room.completed && (
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize="10"
                      fill="white"
                    >
                      🔒
                    </text>
                  )}
                  {room.id === currentRoomId && !room.completed && (
                    <circle
                      r="4"
                      fill="white"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Room label */}
                  <text
                    y="25"
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight={room.id === currentRoomId ? "bold" : "normal"}
                  >
                    {room.id}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Hover info */}
          {hoveredRoom && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-xs whitespace-nowrap shadow-lg">
              <div className="text-white font-semibold">
                {rooms.find(r => r.id === hoveredRoom)?.name || hoveredRoom}
              </div>
              <div className="text-gray-400">
                {getRoomStatus(hoveredRoom).label}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="text-xs space-y-1 pt-2 border-t border-gray-700">
          <div className="flex items-center gap-2 text-gray-300">
            <span>🟡</span>
            <span>Actuel</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span>🟢</span>
            <span>Complété</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span>⚫</span>
            <span>Verrouillé</span>
          </div>
        </div>
      </div>
    </div>
  )
}
