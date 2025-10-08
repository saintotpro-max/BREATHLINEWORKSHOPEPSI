"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle, Lock } from "lucide-react"
import type { GameDefinition, GameSnapshot } from "@/state/types"

interface ObjectiveDisplayProps {
  gameData: GameDefinition
  snapshot: GameSnapshot
  currentRoomId: string // Added currentRoomId prop to track actual room
}

export function ObjectiveDisplay({ gameData, snapshot, currentRoomId }: ObjectiveDisplayProps) {
  const currentRoom = gameData.rooms.find((r) => r.id === currentRoomId)

  if (!currentRoom) return null

  const roomPuzzles = currentRoom.puzzles || []
  const completedPuzzles = roomPuzzles.filter((p) => snapshot.puzzles[p.id]?.success).length

  let objectiveText = ""
  if (currentRoom.id === "R1") {
    if (completedPuzzles === 0) {
      objectiveText = "Activez les 2 switches simultanément et entrez le code du panneau CO₂"
    } else {
      objectiveText = "Passez à la salle suivante par la porte"
    }
  } else if (currentRoom.id === "R2") {
    if (completedPuzzles === 0) {
      objectiveText = "Activez les valves dans le bon ordre et utilisez les plaques de poids"
    } else {
      objectiveText = "Passez à la salle suivante par la porte"
    }
  } else if (currentRoom.id === "R3") {
    if (completedPuzzles === 0) {
      objectiveText = "Activez les boutons A→B→C puis confirmez avec les 2 switches"
    } else {
      objectiveText = "Passez à la sortie par la porte"
    }
  } else if (currentRoom.id === "EXIT") {
    objectiveText = "Entrez le code final pour ouvrir la porte de sortie"
  }

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
      <Card className="bg-black/80 backdrop-blur border-yellow-500/50 p-4">
        <div className="text-center space-y-3">
          <div className="text-yellow-400 font-semibold text-lg">🎯 {currentRoom.name}</div>
          <div className="text-white text-sm">{objectiveText}</div>

          <div className="flex items-center justify-center gap-4 pt-2">
            {gameData.rooms.slice(0, -1).map((room, idx) => {
              const roomCompleted = room.puzzles?.every((p) => snapshot.puzzles[p.id]?.success) || false
              const isCurrent = room.id === currentRoomId

              return (
                <div key={room.id} className="flex items-center gap-1">
                  {roomCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : isCurrent ? (
                    <Circle className="w-5 h-5 text-yellow-400 animate-pulse" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <span
                    className={`text-xs ${roomCompleted ? "text-green-400" : isCurrent ? "text-yellow-400" : "text-gray-500"}`}
                  >
                    Salle {idx + 1}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
