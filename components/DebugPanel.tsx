"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"

interface DebugPanelProps {
  currentRoomId: string
  onTeleport: (roomId: string) => void
  onUnlockAll: () => void
  onResetGame: () => void
  gameState: any
  currentRole: string | null
  onRoleChange: (role: string) => void
}

export function DebugPanel({
  currentRoomId,
  onTeleport,
  onUnlockAll,
  onResetGame,
  gameState,
  currentRole,
  onRoleChange,
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const rooms = [
    { id: "R1", name: "Lobby", color: "bg-blue-500" },
    { id: "R2", name: "Lab", color: "bg-green-500" },
    { id: "R3", name: "Control Room", color: "bg-purple-500" },
    { id: "EXIT", name: "Exit", color: "bg-yellow-500" },
  ]

  const roles = [
    { id: "Analyst", icon: "📊", color: "bg-blue-600" },
    { id: "Tech", icon: "🔧", color: "bg-orange-600" },
    { id: "Operator", icon: "⌨️", color: "bg-purple-600" },
    { id: "Logistician", icon: "📦", color: "bg-green-600" },
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors font-mono text-sm z-50"
      >
        DEBUG MODE
      </button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-black/90 text-white border-red-500 border-2 z-50 max-w-md max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-red-500 font-mono">DEBUG PANEL</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:text-red-500">
          ✕
        </Button>
      </div>

      <div className="space-y-4">
        {/* Role Switching Section */}
        <div>
          <p className="text-xs text-gray-400 mb-2 font-mono">CURRENT ROLE: {currentRole || "None"}</p>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => (
              <Button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                variant={currentRole === role.id ? "default" : "outline"}
                size="sm"
                className={`${
                  currentRole === role.id
                    ? role.color + " text-white"
                    : "border-gray-600 text-gray-300 hover:bg-gray-800"
                } font-mono text-xs`}
              >
                {role.icon} {role.id}
              </Button>
            ))}
          </div>
        </div>

        {/* Room Teleport */}
        <div>
          <p className="text-xs text-gray-400 mb-2 font-mono">TELEPORT TO ROOM:</p>
          <div className="grid grid-cols-2 gap-2">
            {rooms.map((room) => (
              <Button
                key={room.id}
                onClick={() => onTeleport(room.id)}
                variant={currentRoomId === room.id ? "default" : "outline"}
                size="sm"
                className={`${
                  currentRoomId === room.id
                    ? room.color + " text-white"
                    : "border-gray-600 text-gray-300 hover:bg-gray-800"
                } font-mono text-xs`}
              >
                {room.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-xs text-gray-400 mb-2 font-mono">QUICK ACTIONS:</p>
          <div className="space-y-2">
            <Button
              onClick={onUnlockAll}
              variant="outline"
              size="sm"
              className="w-full border-green-600 text-green-400 hover:bg-green-900/20 font-mono text-xs bg-transparent"
            >
              🔓 Unlock All Doors
            </Button>
            <Button
              onClick={onResetGame}
              variant="outline"
              size="sm"
              className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 font-mono text-xs bg-transparent"
            >
              🔄 Reset Game
            </Button>
          </div>
        </div>

        {/* Game State Info */}
        <div>
          <p className="text-xs text-gray-400 mb-2 font-mono">GAME STATE:</p>
          <div className="bg-gray-900 p-2 rounded text-xs font-mono space-y-1">
            <div>
              Room: <span className="text-cyan-400">{currentRoomId}</span>
            </div>
            <div>
              Score: <span className="text-green-400">{gameState?.score || 0}</span>
            </div>
            <div>
              Hints: <span className="text-yellow-400">{gameState?.hintsRemaining || 0}</span>
            </div>
            <div>
              Puzzles Solved:{" "}
              <span className="text-purple-400">
                {Object.values(gameState?.puzzles || {}).filter((p: any) => p.solved).length}
              </span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div>
          <p className="text-xs text-gray-400 mb-2 font-mono">SHORTCUTS:</p>
          <div className="text-xs font-mono text-gray-500 space-y-1">
            <div>+ : Toggle Debug Panel</div>
            <div>1-4 : Quick Teleport</div>
            <div>R : Cycle Roles</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
