"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Lock, Unlock } from "lucide-react"
import type { GameDefinition } from "@/state/types"

interface RoomSelectionModalProps {
  doorId: string
  gameData: GameDefinition
  currentRoomId: string
  onSelectRoom: (roomId: string) => void
  onClose: () => void
}

export function RoomSelectionModal({
  doorId,
  gameData,
  currentRoomId,
  onSelectRoom,
  onClose,
}: RoomSelectionModalProps) {
  // Find the door object
  const door = gameData.rooms.flatMap((r) => r.objects).find((obj) => obj.id === doorId && obj.type === "door")

  if (!door) return null

  // Get available rooms based on current room
  const availableRooms = getConnectedRooms(currentRoomId, gameData)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full p-6 bg-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🚪</div>
            <h2 className="text-2xl font-bold text-gray-900">Choisissez votre destination</h2>
            <p className="text-gray-600 mt-2">Où voulez-vous aller ?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRooms.map((room) => {
              const isLocked = room.locked
              const isCurrent = room.id === currentRoomId

              return (
                <Button
                  key={room.id}
                  size="lg"
                  variant={isCurrent ? "secondary" : "outline"}
                  className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                  onClick={() => !isLocked && !isCurrent && onSelectRoom(room.id)}
                  disabled={isLocked || isCurrent}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-2xl">
                      {isLocked ? (
                        <Lock className="w-6 h-6 text-red-500" />
                      ) : (
                        <Unlock className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg">{room.name}</div>
                      <div className="text-sm text-gray-600">{room.description}</div>
                    </div>
                    {isCurrent && <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Actuel</div>}
                  </div>
                  {isLocked && (
                    <div className="text-xs text-red-600 w-full text-left">
                      🔒 Résolvez les énigmes pour déverrouiller
                    </div>
                  )}
                </Button>
              )
            })}
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function getConnectedRooms(currentRoomId: string, gameData: GameDefinition) {
  // Define room connections and their unlock requirements
  const roomConnections: Record<string, { id: string; name: string; description: string; locked: boolean }[]> = {
    R1: [
      { id: "R1", name: "Control Room", description: "Salle de contrôle principale", locked: false },
      { id: "R2", name: "Filtration Zone", description: "Zone de filtration d'air", locked: false },
    ],
    R2: [
      { id: "R1", name: "Control Room", description: "Retour à la salle de contrôle", locked: false },
      { id: "R2", name: "Filtration Zone", description: "Salle actuelle", locked: false },
      { id: "R3", name: "Ventilation Bay", description: "Baie de ventilation", locked: false },
    ],
    R3: [
      { id: "R2", name: "Filtration Zone", description: "Retour à la zone de filtration", locked: false },
      { id: "R3", name: "Ventilation Bay", description: "Salle actuelle", locked: false },
      { id: "EXIT", name: "Purge Gate", description: "Sortie finale", locked: false },
    ],
    EXIT: [
      { id: "R3", name: "Ventilation Bay", description: "Retour à la baie de ventilation", locked: false },
      { id: "EXIT", name: "Purge Gate", description: "Salle actuelle", locked: false },
    ],
  }

  return roomConnections[currentRoomId] || []
}
