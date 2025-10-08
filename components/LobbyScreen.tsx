"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Copy, Check, Crown, Wifi } from "lucide-react"

interface Player {
  id: string
  name: string
  role: string | null
  isHost: boolean
  isReady: boolean
}

interface LobbyScreenProps {
  roomCode: string
  isHost: boolean
  localPlayer: Player
  players: Player[]
  onStart: () => void
  onLeave: () => void
  onReady: (ready: boolean) => void
}

export function LobbyScreen({
  roomCode,
  isHost,
  localPlayer,
  players,
  onStart,
  onLeave,
  onReady,
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Tous les joueurs SAUF l'hôte doivent être prêts
  const allReady = players.filter(p => !p.isHost).every((p) => p.isReady)
  const canStart = isHost && players.length >= 2 && allReady

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white/95 backdrop-blur">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Wifi className="w-6 h-6" />
              <h1 className="text-3xl font-bold">Lobby Multijoueur</h1>
            </div>
            <p className="text-gray-600">En attente des joueurs...</p>
          </div>

          {/* Room Code */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-center space-y-3">
              <p className="text-sm font-semibold text-blue-900">Code de la partie</p>
              <div className="flex items-center justify-center gap-3">
                <div className="bg-white px-6 py-3 rounded-lg border-2 border-blue-300">
                  <span className="text-3xl font-mono font-bold text-blue-600 tracking-wider">{roomCode}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="h-12 w-12 border-blue-300 hover:bg-blue-50"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-blue-600" />}
                </Button>
              </div>
              <p className="text-xs text-blue-700">Partagez ce code avec vos coéquipiers</p>
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  Joueurs ({players.length}/4)
                </h3>
              </div>
              {isHost && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Crown className="w-3 h-3 mr-1" />
                  Hôte
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    player.id === localPlayer.id
                      ? "bg-blue-50 border-blue-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        player.id === localPlayer.id ? "bg-blue-500" : "bg-gray-400"
                      }`}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {player.name}
                        {player.id === localPlayer.id && (
                          <span className="text-blue-600 text-sm ml-2">(Vous)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {player.role || "Rôle non sélectionné"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {player.isHost && (
                      <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-300">
                        <Crown className="w-3 h-3 mr-1" />
                        Hôte
                      </Badge>
                    )}
                    {player.isReady ? (
                      <Badge className="bg-green-500 text-white">Prêt</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">En attente</Badge>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 4 - players.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-400 italic">En attente d'un joueur...</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ready Status */}
          {!isHost && !localPlayer.isReady && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 text-center">
                ⏳ Cliquez sur "Prêt" quand vous êtes prêt à commencer
              </p>
            </div>
          )}

          {isHost && players.length >= 2 && !allReady && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 text-center">
                ℹ️ En attente que tous les joueurs soient prêts... ({players.filter(p => !p.isHost && p.isReady).length}/{players.filter(p => !p.isHost).length})
              </p>
            </div>
          )}

          {isHost && players.length < 2 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800 text-center">
                👥 Minimum 2 joueurs requis pour démarrer
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={onLeave}
            >
              Quitter
            </Button>

            {!isHost && (
              <Button
                className={`flex-1 ${
                  localPlayer.isReady
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                onClick={() => onReady(!localPlayer.isReady)}
              >
                {localPlayer.isReady ? "Annuler" : "Prêt !"}
              </Button>
            )}

            {isHost && (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={onStart}
                disabled={!canStart}
              >
                {canStart ? "🚀 Démarrer la partie" : "En attente..."}
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-xs text-gray-500">
            {isHost ? (
              <p>En tant qu'hôte, vous démarrerez la partie quand tous seront prêts</p>
            ) : (
              <p>L'hôte démarrera la partie quand tout le monde sera prêt</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
