"use client"

import { Users, CheckCircle } from "lucide-react"

interface RoomInfoProps {
  roomName: string
  roomId: string
  playerCount?: number
  puzzlesCompleted: number
  puzzlesTotal: number
  isMultiplayer?: boolean
}

export function RoomInfo({ 
  roomName, 
  roomId, 
  playerCount = 1, 
  puzzlesCompleted, 
  puzzlesTotal,
  isMultiplayer = false 
}: RoomInfoProps) {
  const progress = puzzlesTotal > 0 ? (puzzlesCompleted / puzzlesTotal) * 100 : 0

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl z-30">
      <div className="px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Room name */}
          <div>
            <div className="text-white font-semibold text-sm">
              {roomName}
            </div>
            <div className="text-gray-400 text-xs">
              Salle {roomId}
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-700" />

          {/* Player count (if multiplayer) */}
          {isMultiplayer && (
            <>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <div className="text-cyan-300 text-sm font-medium">
                  {playerCount} joueur{playerCount > 1 ? 's' : ''}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-700" />
            </>
          )}

          {/* Progress */}
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <div className="flex flex-col">
              <div className="text-white text-sm font-medium">
                {puzzlesCompleted}/{puzzlesTotal} énigmes
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
