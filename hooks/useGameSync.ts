/**
 * Game synchronization hook - manages game state and server communication.
 * Supports both online (Supabase) and offline (local authoritative) modes.
 */

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { GameSnapshot, Role, Puzzle, PlayerState } from "@/state/types"
import { updatePuzzleState, checkRoomCompletion, canInteract } from "@/lib/puzzleLogic"
import { calculateScore } from "@/lib/scoring"

interface UseGameSyncOptions {
  mode: "online" | "offline"
  roomId: string
  userId: string
  displayName: string
}

export function useGameSync({ mode, roomId, userId, displayName }: UseGameSyncOptions) {
  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    roomId: "",
    timerMs: 1800000,
    score: 100,
    errors: 0,
    hintsUsed: 0,
    objects: {},
    puzzles: {},
    keys: [],
    codeParts: {},
  })

  const [role, setRole] = useState<Role | null>(null)
  const revRef = useRef(0)

  // Offline authoritative state
  const offlineStateRef = useRef<any>(null)
  const playersRef = useRef<Map<string, PlayerState>>(new Map())

  const [gameDefinition, setGameDefinition] = useState<any>(null)
  const [currentRoomId, setCurrentRoomId] = useState<string>("R1")

  useEffect(() => {
    fetch("/game/breathe-line.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("[v0] Game definition loaded:", data)
        setGameDefinition(data)
      })
      .catch((err) => console.error("[v0] Failed to load game definition:", err))
  }, [])

  useEffect(() => {
    if (mode === "offline" && gameDefinition) {
      // FIX: Ne réinitialiser QUE si offlineStateRef n'existe pas encore
      // Sinon, on perd toute la progression à chaque changement de rôle!
      if (!offlineStateRef.current) {
        const initialObjects: Record<string, any> = {}
        const initialPuzzles: Record<string, any> = {}

        gameDefinition.rooms.forEach((room: any) => {
          room.objects.forEach((obj: any) => {
            initialObjects[obj.id] = { ...obj }
          })
          room.puzzles.forEach((puzzle: any) => {
            initialPuzzles[puzzle.id] = { success: false, currentStep: 0 }
          })
        })

        offlineStateRef.current = {
          timerMs: gameDefinition.timer.durationMs,
          score: gameDefinition.scoring.baseScore,
          errors: 0,
          hintsUsed: 0,
          objects: initialObjects,
          puzzles: initialPuzzles,
          keys: [],
          codeParts: {},
          players: new Map(),
        }
      }

      const startRoom = gameDefinition.rooms.find((r: any) => r.id === currentRoomId)
      const spawnX = startRoom?.spawn?.x || 2
      const spawnY = startRoom?.spawn?.y || 6

      // FIX: Mettre à jour le joueur existant au lieu de le recréer
      const existingPlayer = playersRef.current.get(userId)
      if (existingPlayer) {
        // Juste mettre à jour le rôle, garder position
        existingPlayer.role = role || "Analyst"
      } else {
        // Créer nouveau joueur si n'existe pas
        playersRef.current.set(userId, {
          sessionId: userId,
          displayName: displayName,
          role: role || "Analyst",
          x: spawnX,
          y: spawnY,
          facing: "S"
        })
      }

      const interval = setInterval(() => {
        if (offlineStateRef.current) {
          offlineStateRef.current.timerMs = Math.max(0, offlineStateRef.current.timerMs - 1000)

          const currentRoom = gameDefinition.rooms.find((r: any) => r.id === currentRoomId)
          const roomsCompleted = gameDefinition.rooms.filter((r: any) => {
            const roomPuzzles = r.puzzles.map((p: any) => p)
            return checkRoomCompletion(roomPuzzles, offlineStateRef.current)
          }).length

          const scoreData = calculateScore(
            offlineStateRef.current.timerMs,
            gameDefinition.timer.durationMs,
            offlineStateRef.current.hintsUsed,
            offlineStateRef.current.errors,
            roomsCompleted,
            gameDefinition.rooms.length - 1, // Exclude EXIT room
          )

          offlineStateRef.current.score = scoreData.finalScore

          setSnapshot({ ...offlineStateRef.current, roomId })

          if (offlineStateRef.current.timerMs === 0) {
            console.log("[v0] Time's up! Game over.")
          }
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [mode, roomId, gameDefinition, currentRoomId, role, userId, displayName])

  const sendJoin = useCallback(async () => {
    if (mode === "offline") {
      console.log("[v0] Offline join:", displayName)
    } else {
      // Online mode: State is already synced via Realtime
      console.log("[v0] Online join:", displayName, "to room:", roomId)
      // The subscription handles state sync automatically
    }
  }, [mode, displayName, roomId])

  const chooseRole = useCallback(
    async (newRole: Role) => {
      setRole(newRole)
      if (mode === "offline") {
        console.log("[v0] Role selected:", newRole)
      } else {
        // Online mode: Role is part of player state (synced separately)
        console.log("[v0] Online role selected:", newRole)
        // TODO: Add player to Supabase 'players' table with role
        // For now, role is local (each player manages their own)
      }
    },
    [mode],
  )

  const sendMove = useCallback(
    async (to: { x: number; y: number }) => {
      if (mode === "offline") {
        // Update local state only
        const player = playersRef.current.get(userId)
        if (player) {
          player.x = to.x
          player.y = to.y
        }
      } else {
        // Online mode: Update via LocalMultiplayer
        if (typeof window !== "undefined") {
          import("@/lib/local-multiplayer").then((module) => {
            const manager = module.getLocalMultiplayerManager()
            manager.updatePosition(to.x, to.y)
          })
        }
      }
    },
    [mode, userId],
  )

  const transitionToRoom = useCallback(
    (doorId: string) => {
      if (mode === "offline" && offlineStateRef.current && gameDefinition) {
        const door = offlineStateRef.current.objects[doorId]
        if (!door || door.type !== "door") return

        if (!door.open) {
          console.log("[v0] Door is locked")
          return
        }

        // Find which room this door leads to
        const currentRoom = gameDefinition.rooms.find((r: any) => r.id === currentRoomId)
        if (!currentRoom) return

        // Determine next room based on current room
        const roomOrder = ["R1", "R2", "R3", "EXIT"]
        const currentIndex = roomOrder.indexOf(currentRoomId)
        const nextRoomId = roomOrder[currentIndex + 1]

        if (nextRoomId) {
          console.log("[v0] Transitioning from", currentRoomId, "to", nextRoomId)
          setCurrentRoomId(nextRoomId)

          // Teleport player to spawn point of new room
          const nextRoom = gameDefinition.rooms.find((r: any) => r.id === nextRoomId)
          if (nextRoom && nextRoom.spawn) {
            const player = playersRef.current.get(userId)
            if (player) {
              player.x = nextRoom.spawn.x
              player.y = nextRoom.spawn.y
            }
          }

          // Show room transition notification
          console.log("[v0] Entered room:", nextRoom?.name || nextRoomId)
        }
      }
    },
    [mode, gameDefinition, currentRoomId, userId],
  )

  const sendInteract = useCallback(
    async (objectId: string, debugMode = false) => {
      if (mode === "offline" && offlineStateRef.current && gameDefinition) {
        console.log("[v0] Interact with:", objectId)

        const obj = offlineStateRef.current.objects[objectId]
        if (!obj) {
          console.warn("[v0] Object not found:", objectId)
          return
        }

        const player = playersRef.current.get(userId)
        if (!player) return

        const adjacencyRange = gameDefinition.ui.adjacencyRange || 2
        if (!canInteract(player, obj, adjacencyRange, offlineStateRef.current, debugMode, gameDefinition)) {
          console.warn("[v0] Cannot interact: out of range, wrong role, prerequisites not met, or already completed")
          console.log("[v0] Player:", player.x, player.y, "Object:", obj.x, obj.y, "Range:", adjacencyRange)
          return
        }

        const timestamp = Date.now()
        
        // Trouver la room actuelle (utilisée par plusieurs cases)
        const currentRoom = gameDefinition.rooms.find((r: any) => r.id === currentRoomId)

        switch (obj.type) {
          case "switch":
            obj.state = obj.state === "on" ? "off" : "on"
            console.log("[v0] Switch toggled:", objectId, obj.state)

            if (obj.ledId) {
              const led = offlineStateRef.current.objects[obj.ledId]
              if (led) {
                led.state = obj.state === "on" ? "green" : "red"
                led.label = obj.state === "on" ? "ON" : "OFF"
              }
            }
            if (currentRoom) {
              currentRoom.puzzles.forEach((puzzle: Puzzle) => {
                if (puzzle.type === "multiSwitch" && puzzle.ids?.includes(objectId)) {
                  offlineStateRef.current = updatePuzzleState(
                    puzzle,
                    { type: "toggle", objectId, timestamp },
                    offlineStateRef.current,
                    playersRef.current,
                    true,
                  )
                }
              })
            }
            break

          case "valve":
            obj.state = obj.state === "on" ? "off" : "on"
            console.log("[v0] Valve toggled:", objectId, obj.state)

            if (currentRoom) {
              currentRoom.puzzles.forEach((puzzle: Puzzle) => {
                if (puzzle.type === "multiValve" && puzzle.ids?.includes(objectId)) {
                  offlineStateRef.current = updatePuzzleState(
                    puzzle,
                    { type: "toggle", objectId, timestamp },
                    offlineStateRef.current,
                    playersRef.current,
                    true,
                  )
                } else if (puzzle.type === "sequence") {
                  offlineStateRef.current = updatePuzzleState(
                    puzzle,
                    { type: "activate", objectId, timestamp },
                    offlineStateRef.current,
                    playersRef.current,
                    true,
                  )
                }
              })
            }
            break

          case "panel":
            console.log("[v0] Panel opened:", objectId)
            
            // Mettre à jour les puzzles infoSplit où ce panel est la source
            if (currentRoom) {
              currentRoom.puzzles.forEach((puzzle: Puzzle) => {
                if (puzzle.type === "infoSplit" && puzzle.sourcePanel === objectId) {
                  // Si targetConsole === sourcePanel, c'est juste une lecture
                  if (puzzle.targetConsole === objectId) {
                    offlineStateRef.current = updatePuzzleState(
                      puzzle,
                      { type: "panelRead", objectId, timestamp },
                      offlineStateRef.current,
                      playersRef.current,
                      true
                    )
                  }
                }
              })
            }
            break

          case "console":
            console.log("[v0] Console opened:", objectId)
            break

          case "door":
            if (obj.open) {
              console.log("[v0] Walking through door:", objectId)
              transitionToRoom(objectId)
            } else if (obj.lockedBy && obj.lockedBy.length > 0) {
              console.log("[v0] Door locked by:", obj.lockedBy)

              const allUnlocked = obj.lockedBy.every((lockId: string) => {
                if (lockId.endsWith("_complete")) {
                  const roomId = lockId.replace("_complete", "")
                  const room = gameDefinition.rooms.find((r: any) => r.id === roomId)
                  if (room) {
                    return checkRoomCompletion(room.puzzles, offlineStateRef.current)
                  }
                }
                return offlineStateRef.current.keys.includes(lockId)
              })

              if (allUnlocked) {
                obj.open = true
                console.log("[v0] Door unlocked and opened:", objectId)
                setSnapshot({ ...offlineStateRef.current, roomId })
              } else {
                console.log("[v0] Door still locked - complete required puzzles first")
              }
            } else {
              obj.open = true
              console.log("[v0] Door opened:", objectId)
            }
            break
        }

        setSnapshot({ ...offlineStateRef.current, roomId })
      }
    },
    [mode, gameDefinition, currentRoomId, userId, roomId, transitionToRoom],
  )

  const sendConsoleSubmit = useCallback(
    async (consoleId: string, input: string) => {
      if (mode === "offline" && offlineStateRef.current && gameDefinition) {
        console.log("[v0] Console submit:", consoleId, input)

        const obj = offlineStateRef.current.objects[consoleId]
        if (!obj) return

        obj.lastInput = input

        const currentRoom = gameDefinition.rooms.find((r: any) => r.id === currentRoomId)
        if (currentRoom) {
          currentRoom.puzzles.forEach((puzzle: Puzzle) => {
            if (puzzle.type === "infoSplit" && puzzle.targetConsole === consoleId) {
              offlineStateRef.current = updatePuzzleState(
                puzzle,
                { type: "consoleSubmit", objectId: consoleId, timestamp: Date.now() },
                offlineStateRef.current,
                playersRef.current,
                true,
              )

              const puzzleState = offlineStateRef.current.puzzles[puzzle.id]
              if (puzzleState.success) {
                console.log("[v0] Console code correct!")
                obj.correct = true
              } else {
                console.log("[v0] Console code incorrect")
                obj.correct = false
                offlineStateRef.current.errors++
              }
            }
          })
        }

        setSnapshot({ ...offlineStateRef.current, roomId })
      } else {
        // Send to server
      }
    },
    [mode, gameDefinition, currentRoomId, roomId],
  )

  const sendPickPlace = useCallback(
    async (itemId: string, action: "pick" | "place", targetX?: number, targetY?: number) => {
      if (mode === "offline") {
        console.log("[v0] Pick/place:", itemId, action)
        // TODO: Implement offline pick/place logic
      } else {
        // Send to server
      }
    },
    [mode],
  )

  const requestHint = useCallback(
    async (roomId: string) => {
      if (mode === "offline") {
        if (offlineStateRef.current && offlineStateRef.current.hintsUsed < 2) {
          offlineStateRef.current.hintsUsed++
          offlineStateRef.current.score -= 10
          setSnapshot({ ...offlineStateRef.current, roomId })
        }
      } else {
        // Send to server
      }
    },
    [mode],
  )

  const requestSnapshot = useCallback(async () => {
    if (mode === "offline") {
      setSnapshot({ ...offlineStateRef.current, roomId })
    } else {
      // Request from server
    }
  }, [mode, roomId])

  const debugTeleportToRoom = useCallback(
    (targetRoomId: string) => {
      if (mode === "offline" && offlineStateRef.current && gameDefinition) {
        console.log("[v0] Debug teleport to:", targetRoomId)

        const targetRoom = gameDefinition.rooms.find((r: any) => r.id === targetRoomId)
        if (!targetRoom) {
          console.warn("[v0] Room not found:", targetRoomId)
          return
        }

        // Update current room
        setCurrentRoomId(targetRoomId)

        // Teleport player to spawn point
        if (targetRoom.spawn) {
          const player = playersRef.current.get(userId)
          if (player) {
            player.x = targetRoom.spawn.x
            player.y = targetRoom.spawn.y
          }
        }

        console.log("[v0] Teleported to:", targetRoom.name)
      }
    },
    [mode, gameDefinition, userId],
  )

  const debugUnlockAllDoors = useCallback(() => {
    if (mode === "offline" && offlineStateRef.current && gameDefinition) {
      console.log("[v0] Debug: Unlocking all doors")

      gameDefinition.rooms.forEach((room: any) => {
        room.objects.forEach((obj: any) => {
          if (obj.type === "door") {
            const doorObj = offlineStateRef.current.objects[obj.id]
            if (doorObj) {
              doorObj.open = true
            }
          }
        })
      })

      setSnapshot({ ...offlineStateRef.current, roomId })
    }
  }, [mode, gameDefinition, roomId])

  useEffect(() => {
    if (mode === "offline" && offlineStateRef.current && gameDefinition) {
      const currentRoom = gameDefinition.rooms.find((r: any) => r.id === currentRoomId)
      if (currentRoom && currentRoom.puzzles) {
        const isComplete = checkRoomCompletion(currentRoom.puzzles, offlineStateRef.current)

        if (isComplete) {
          console.log("[v0] Room", currentRoomId, "completed!")

          // Add keys/code parts from this room
          if (currentRoom.outputs) {
            if (currentRoom.outputs.keys) {
              currentRoom.outputs.keys.forEach((key: string) => {
                if (!offlineStateRef.current.keys.includes(key)) {
                  offlineStateRef.current.keys.push(key)
                  console.log("[v0] Obtained key:", key)
                }
              })
            }
            if (currentRoom.outputs.codePart) {
              offlineStateRef.current.codeParts[currentRoomId] = currentRoom.outputs.codePart
              console.log("[v0] Obtained code part:", currentRoom.outputs.codePart)
            }
          }

          // Unlock door for this room
          const doorId = `door${currentRoomId}`
          const door = offlineStateRef.current.objects[doorId]
          if (door && !door.open) {
            door.open = true
            console.log("[v0] Door automatically unlocked:", doorId)
          }

          setSnapshot({ ...offlineStateRef.current, roomId })
        }
      }
    }
  }, [mode, gameDefinition, currentRoomId, roomId, snapshot.puzzles])

  return {
    snapshot,
    role,
    gameDefinition,
    currentRoomId,
    sendJoin,
    chooseRole,
    sendMove,
    sendInteract,
    sendConsoleSubmit,
    sendPickPlace,
    requestHint,
    requestSnapshot,
    debugTeleportToRoom,
    debugUnlockAllDoors,
  }
}
