"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, Play, WifiOff } from "lucide-react"
import { GameHUD } from "@/components/GameHUD"
import { PanelModal } from "@/components/PanelModal"
import { ConsoleModal } from "@/components/ConsoleModal"
import { PedagogyModal } from "@/components/PedagogyModal"
import IsoRoom from "@/components/iso-room"
import WindowFrame from "@/components/window-frame"
import { useGameSync } from "@/hooks/useGameSync"
import { useMultiplayer } from "@/hooks/use-multiplayer"
import type { Role, GameDefinition } from "@/state/types"
import { ObjectiveDisplay } from "@/components/ObjectiveDisplay"
import { BriefingScreen } from "@/components/BriefingScreen"
import { InteractionPrompt } from "@/components/InteractionPrompt"
import { DebugPanel } from "@/components/DebugPanel"
import { NarrativeOverlay } from "@/components/NarrativeOverlay"
import { ChatPanel } from "@/components/ChatPanel"
import { SuccessNotification } from "@/components/SuccessNotification"
import { TutorialOverlay } from "@/components/TutorialOverlay"
import { CO2Gauge } from "@/components/CO2Gauge"
import { MissionJournal } from "@/components/MissionJournal"
import { DrLemaireMessage } from "@/components/DrLemaireMessage"
import { ContextualHint } from "@/components/ContextualHint"
import { TimeWarning } from "@/components/TimeWarning"
import { MiniGameModal } from "@/components/MiniGameModal"
import { LobbyScreen } from "@/components/LobbyScreen"
import { MiniMap } from "@/components/MiniMap"
import { RoomTransition } from "@/components/RoomTransition"
import { CurrentObjective } from "@/components/CurrentObjective"
import { RoomInfo } from "@/components/RoomInfo"
import { TopBar } from "@/components/TopBar"
import { NotificationManager } from "@/components/GameNotification"
import { useObjectives } from "@/hooks/use-objectives"
import { useNotifications } from "@/hooks/use-notifications"
import { useGameSounds } from "@/hooks/use-game-sounds"
import { DebriefingManager } from "@/components/PedagogicalDebriefing"
import { UnifiedJournal } from "@/components/UnifiedJournal"
import { AmbientLight } from "@/components/VisualEffects"
import { SyncTimer } from "@/components/SyncTimer"
import { useCO2Simulation } from "@/hooks/use-co2-simulation"
import { useDebriefingManager } from "@/hooks/use-debriefing-manager"

function getOrCreateId(key: string) {
  try {
    const existing = localStorage.getItem(key)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(key, id)
    return id
  } catch {
    return "guest-" + Math.random().toString(36).slice(2, 10)
  }
}

function getOrCreateName() {
  try {
    const existing = localStorage.getItem("pp_name")
    if (existing) return existing
    const defaultName = `Joueur${Math.floor(Math.random() * 9000) + 1000}`
    localStorage.setItem("pp_name", defaultName)
    return defaultName
  } catch {
    return `Joueur${Math.floor(Math.random() * 9000) + 1000}`
  }
}

// Helper: Trouver la prochaine salle
function getNextRoomId(currentId: string, gameData: any): string | null {
  const roomOrder = ["R1", "R2", "R3", "EXIT"]
  const currentIndex = roomOrder.indexOf(currentId)
  if (currentIndex >= 0 && currentIndex < roomOrder.length - 1) {
    return roomOrder[currentIndex + 1]
  }
  return null
}

type GamePhase = "lobby" | "multiLobby" | "briefing" | "roleSelect" | "playing" | "victory" | "defeat"

export default function Page() {
  const [uid, setUid] = useState("")
  const [displayName, setDisplayName] = useState("Guest")
  const [customName, setCustomName] = useState("")

  const [phase, setPhase] = useState<GamePhase>("lobby")
  const [gameMode, setGameMode] = useState<"online" | "offline">("offline")
  const [roomCode, setRoomCode] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [gameData, setGameData] = useState<GameDefinition | null>(null)
  const [multiPlayers, setMultiPlayers] = useState<any[]>([])
  const [localMultiManager, setLocalMultiManager] = useState<any>(null)

  const [muted, setMuted] = useState(false)
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null)
  const [selectedConsole, setSelectedConsole] = useState<string | null>(null)
  const [pedagogyContent, setPedagogyContent] = useState<any>(null)
  const [nearbyObject, setNearbyObject] = useState<any>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [selectedDoor, setSelectedDoor] = useState<string | null>(null)
  const [showNarrative, setShowNarrative] = useState(false)
  const [narrativeRoomId, setNarrativeRoomId] = useState<string | null>(null)
  const [visitedRooms, setVisitedRooms] = useState<Set<string>>(new Set())
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [contextualHint, setContextualHint] = useState<string | null>(null)
  const [lastHintTime, setLastHintTime] = useState(0)
  const [showTimeWarning, setShowTimeWarning] = useState(false)
  const [lastTimeWarning, setLastTimeWarning] = useState(0)
  const [newMessageCount, setNewMessageCount] = useState(0)
  const prevMessageCountRef = useRef(0)
  const [selectedMiniGame, setSelectedMiniGame] = useState<{ objectId: string; gameType: "simon" | "co2graph" | "wiring" | "timing" } | null>(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [joinCode, setJoinCode] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    playerId: string
    playerName: string
    text: string
    timestamp: number
  }>>([])
  const [drLemaireMessage, setDrLemaireMessage] = useState<string | null>(null)
  const [puzzlesSolvedCount, setPuzzlesSolvedCount] = useState(0)
  const [puzzleUpdateTrigger, setPuzzleUpdateTrigger] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionFrom, setTransitionFrom] = useState("")
  const [transitionTo, setTransitionTo] = useState("")
  const [journalOpen, setJournalOpen] = useState(false)
  const [notifiedPuzzles, setNotifiedPuzzles] = useState<Set<string>>(new Set())
  const [notifiedRooms, setNotifiedRooms] = useState<Set<string>>(new Set())
  const [syncTimerActive, setSyncTimerActive] = useState(false)
  const [firstSwitchTime, setFirstSwitchTime] = useState<number | null>(null)

  // NOUVEAU: Hook pour notifications (ne dépend pas de currentRoomId/snapshot)
  const { 
    notifications, 
    notifyPuzzleSolved, 
    notifyObjectComplete,
    notifyRoomComplete,
    removeNotification 
  } = useNotifications()

  // NOUVEAU: Hook pour sons du jeu
  const sounds = useGameSounds(muted)

  // Local multiplayer always available (no Supabase needed)
  const offlineMode = false // Multijoueur local toujours disponible

  useEffect(() => {
    setUid(getOrCreateId("pp_uid"))
    setDisplayName(getOrCreateName())
  }, [])

  useEffect(() => {
    fetch("/game/breathe-line.json")
      .then((res) => res.json())
      .then((data) => setGameData(data))
      .catch((err) => console.error("[v0] Failed to load game data:", err))
  }, [])

  // Initialize multiplayer manager (Firebase)
  useEffect(() => {
    if (typeof window !== "undefined" && gameMode === "online") {
      import("@/lib/firebase/multiplayer").then((module) => {
        const manager = module.getFirebaseMultiplayerManager()
        if (manager.isAvailable()) {
          setLocalMultiManager(manager)
          console.log("[App] Firebase multiplayer initialized")
        } else {
          console.error("[App] Firebase not available")
        }
      }).catch((error) => {
        console.error("[App] Failed to load Firebase:", error)
      })
    }
  }, [gameMode])

  // Update players list from Firebase multiplayer
  useEffect(() => {
    if (!localMultiManager || !roomCode) {
      console.log("[Multi] Skipping listeners setup - missing manager or room code")
      return
    }

    console.log("[Multi] 🎮 Setting up Firebase listeners for room:", roomCode)

    // Subscribe to players list
    const unsubscribePlayers = localMultiManager.subscribePlayers((players: any[]) => {
      console.log("[Multi] 👥 Players received from Firebase:", players)
      setMultiPlayers(players)
      console.log("[Multi] Players state updated:", players.length)
    })

    // Subscribe to game start event
    const unsubscribeGameStart = localMultiManager.subscribeGameStart(() => {
      console.log("[Multi] 🚀🚀🚀 GAME STARTING CALLBACK TRIGGERED!")
      console.log("[Multi] Current phase:", phase)
      console.log("[Multi] Changing phase to: briefing")
      setPhase("briefing")
      console.log("[Multi] Phase change requested")
    })

    // Subscribe to chat messages
    const unsubscribeMessages = localMultiManager.subscribeMessages((msg: any) => {
      console.log("[Multi] 💬 Message received:", msg)
      setChatMessages(prev => {
        // Éviter les doublons
        if (prev.find(m => m.id === msg.id)) return prev
        return [...prev, {
          id: msg.id || Date.now().toString(),
          playerId: msg.playerId,
          playerName: msg.playerName,
          text: msg.text,
          timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Date.now()
        }]
      })
    })

    console.log("[Multi] ✅ Listeners setup complete")

    return () => {
      console.log("[Multi] 🧹 Cleaning up listeners")
      unsubscribePlayers()
      unsubscribeGameStart()
      unsubscribeMessages()
    }
  }, [localMultiManager, roomCode])

  const {
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
    debugTeleportToRoom,
    debugUnlockAllDoors,
  } = useGameSync({
    mode: gameMode,
    roomId: roomCode || "solo",
    userId: uid,
    displayName,
  })

  const { messages, sendMessage, others } = useMultiplayer({
    room: "EscapeGame",
    userId: uid || "boot",
    name: displayName,
    offline: offlineMode || gameMode === "offline",
  })

  // NOUVEAU: Hook objectifs dynamiques (après useGameSync)
  const objectives = useObjectives({
    currentRoomId,
    puzzleState: snapshot.puzzles
  })

  // REFONTE: Hooks CO2 simulation et débriefings (APRÈS useGameSync pour avoir snapshot)
  const co2 = useCO2Simulation({
    initialLevel: 1000,
    riseRate: 0.5,
    fallRate: 2,
    maxLevel: 2000,
    minLevel: 400,
    systemActive: snapshot.puzzles["step2_enterCode"]?.success || false
  })

  const { debriefings, addDebriefing, dismissDebriefing } = useDebriefingManager()

  // REFONTE: Surveillance synchronisation switches A & B (3 secondes)
  useEffect(() => {
    if (phase !== "playing" || currentRoomId !== "R1") return
    
    const swA = snapshot.objects["swA"]
    const swB = snapshot.objects["swB"]
    
    // Si les deux switches sont ON, succès
    if (swA?.state === "on" && swB?.state === "on") {
      setSyncTimerActive(false)
      setFirstSwitchTime(null)
      return
    }
    
    // Si un seul switch est ON, démarrer le timer
    if ((swA?.state === "on" && swB?.state !== "on") || (swB?.state === "on" && swA?.state !== "on")) {
      if (!syncTimerActive) {
        setSyncTimerActive(true)
        setFirstSwitchTime(Date.now())
      }
    } else {
      // Si les deux sont OFF, réinitialiser
      setSyncTimerActive(false)
      setFirstSwitchTime(null)
    }
  }, [phase, currentRoomId, snapshot.objects, syncTimerActive])

  // NOUVEAU: Détecter quand un puzzle est résolu et notifier
  useEffect(() => {
    if (phase !== "playing" || !gameData) return

    // Vérifier chaque puzzle
    Object.entries(snapshot.puzzles).forEach(([puzzleId, puzzleData]) => {
      if (puzzleData.success && !notifiedPuzzles.has(puzzleId)) {
        // Puzzle vient d'être résolu
        const puzzle = gameData.rooms
          .flatMap(r => r.puzzles || [])
          .find(p => p.id === puzzleId)
        
        if (puzzle) {
          notifyPuzzleSolved(puzzle.id, displayName)
          sounds.puzzleSolved() // Son!
          
          // REFONTE: Ajouter débriefing pédagogique si disponible
          const room = gameData.rooms.find(r => r.puzzles?.some(p => p.id === puzzleId))
          const puzzleData = room?.puzzles?.find(p => p.id === puzzleId)
          
          // Trouver l'objet lié au puzzle selon son type
          let obj: any = null
          let debriefingToShow: any = null
          
          if (puzzleData) {
            if (puzzleData.type === 'infoSplit') {
              // Pour infoSplit: chercher sourcePanel ou targetConsole
              const sourceId = (puzzleData as any).sourcePanel
              const targetId = (puzzleData as any).targetConsole
              
              // Prioriser sourcePanel pour débriefing
              obj = room?.objects?.find(o => o.id === sourceId)
              if (!obj) obj = room?.objects?.find(o => o.id === targetId)
              
              // Chercher débriefing dans panel ou console
              if (obj?.panel?.debriefing) debriefingToShow = obj.panel.debriefing
              else if (obj?.debriefing) debriefingToShow = obj.debriefing
              else if (obj?.console?.debriefing) debriefingToShow = obj.console.debriefing
            }
            else if (puzzleData.type === 'multiSwitch') {
              // Pour multiSwitch: chercher les switches
              const switchIds = (puzzleData as any).ids || []
              // Prendre le débriefing du dernier switch (celui qui complète)
              for (const switchId of switchIds.reverse()) {
                obj = room?.objects?.find(o => o.id === switchId)
                if (obj?.debriefing) {
                  debriefingToShow = obj.debriefing
                  break
                }
              }
            }
            else if (puzzleData.type === 'multiValve') {
              // Pour multiValve: chercher les valves
              const valveIds = (puzzleData as any).ids || []
              // Prendre le débriefing de la dernière valve
              for (const valveId of valveIds.reverse()) {
                obj = room?.objects?.find(o => o.id === valveId)
                if (obj?.debriefing) {
                  debriefingToShow = obj.debriefing
                  break
                }
              }
            }
            else if (puzzleData.type === 'sequence') {
              // Pour sequence: chercher les filtres dans l'ordre
              const filterIds = (puzzleData as any).order || []
              // Prendre le débriefing du dernier filtre
              for (const filterId of filterIds.reverse()) {
                obj = room?.objects?.find(o => o.id === filterId)
                if (obj?.debriefing) {
                  debriefingToShow = obj.debriefing
                  break
                }
              }
            }
          }
          
          if (debriefingToShow) {
            console.log('[DEBUG] Débriefing trouvé pour puzzle', puzzleId, ':', debriefingToShow.title)
            addDebriefing(puzzleId, debriefingToShow)
          } else {
            console.warn('[DEBUG] Aucun débriefing trouvé pour puzzle', puzzleId)
          }
          
          // Marquer comme notifié
          setNotifiedPuzzles(prev => new Set(prev).add(puzzleId))
        }
      }
    })

    // Vérifier si une salle est complétée
    const currentRoom = gameData.rooms.find(r => r.id === currentRoomId)
    if (currentRoom && currentRoom.puzzles && !notifiedRooms.has(currentRoomId)) {
      const allSolved = currentRoom.puzzles.every(p => snapshot.puzzles[p.id]?.success)
      if (allSolved) {
        notifyRoomComplete(currentRoom.name)
        sounds.roomComplete() // Son de victoire!
        sounds.doorOpen() // Son porte qui s'ouvre
        setNotifiedRooms(prev => new Set(prev).add(currentRoomId))
      }
    }
  }, [snapshot.puzzles, phase, gameData, currentRoomId, displayName, notifyPuzzleSolved, notifyRoomComplete, notifiedPuzzles, notifiedRooms])

  useEffect(() => {
    if (phase === "playing") {
      const hasSeenTutorial = localStorage.getItem("breathe_line_tutorial_seen")
      if (!hasSeenTutorial) {
        setShowTutorial(true)
      }
    }
  }, [phase])

  useEffect(() => {
    if (phase !== "playing" || !gameData || !snapshot) return

    const now = Date.now()
    if (now - lastHintTime < 30000) return // Don't spam hints (30s cooldown)

    const currentRoom = gameData.rooms.find((r) => r.id === currentRoomId)
    if (!currentRoom || !currentRoom.puzzles) return

    // Check if player is stuck (no progress in 60 seconds)
    const incompletePuzzles = currentRoom.puzzles.filter((p) => !snapshot.puzzles[p.id]?.solved)

    if (incompletePuzzles.length > 0 && snapshot.errors > 2) {
      // Player has made errors, provide a hint
      const puzzle = incompletePuzzles[0]
      let hint = currentRoom.hint || "Explorez la salle et cherchez des indices."

      if (puzzle.type === "multiSwitch") {
        hint =
          "Astuce : Les switches doivent être activés simultanément. En mode debug, le système maintient l'état pendant quelques secondes."
      } else if (puzzle.type === "sequence") {
        hint = "Astuce : L'ordre est important. Cherchez un panneau qui indique la séquence correcte."
      } else if (puzzle.type === "infoSplit") {
        hint =
          "Astuce : Un Analyst peut lire le panneau pour trouver le code. Un Operator peut l'entrer dans la console."
      }

      setContextualHint(hint)
      setLastHintTime(now)
    }
  }, [phase, gameData, snapshot, currentRoomId, lastHintTime])

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      setNewMessageCount((prev) => prev + (messages.length - prevMessageCountRef.current))
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length])

  useEffect(() => {
    if (phase !== "playing") return

    const minutes = Math.floor(snapshot.timerMs / 60000)

    if ((minutes === 5 || minutes === 2 || minutes === 1) && lastTimeWarning !== minutes) {
      setLastTimeWarning(minutes)
      setShowTimeWarning(true)
    }
  }, [phase, snapshot.timerMs, lastTimeWarning])

  const handleUseHint = useCallback(
    (roomId: string) => {
      requestHint(roomId)
      const currentRoom = gameData?.rooms.find((r) => r.id === roomId)
      if (currentRoom && currentRoom.hint) {
        setContextualHint(currentRoom.hint)
        setLastHintTime(Date.now())
      }
    },
    [requestHint, gameData],
  )

  const handleStartGame = useCallback(
    (mode: "online" | "offline") => {
      setGameMode(mode)
      if (customName.trim()) {
        setDisplayName(customName.trim())
        try {
          localStorage.setItem("pp_name", customName.trim())
        } catch {}
      }
      
      if (mode === "online") {
        // Show room selection (create or join)
        setPhase("lobby")
      } else {
        setPhase("briefing")
      }
    },
    [customName],
  )

  const handleCreateRoom = useCallback(async () => {
    if (!localMultiManager) return
    
    const code = localMultiManager.generateRoomCode()
    console.log("[App] Creating room with code:", code)
    
    const success = await localMultiManager.joinRoom(code, displayName, true)
    
    if (success) {
      console.log("[App] Room created successfully, setting state...")
      setRoomCode(code)
      setIsHost(true)
      
      // Attendre que Firebase propage les données
      setTimeout(() => {
        setPhase("multiLobby")
        console.log("[App] Moved to multiLobby phase")
      }, 500)
    }
  }, [localMultiManager, displayName])

  const handleJoinRoom = useCallback(async (code: string) => {
    if (!localMultiManager) return
    
    console.log("[App] Joining room:", code)
    const success = await localMultiManager.joinRoom(code, displayName, false)
    
    if (success) {
      console.log("[App] Joined successfully, setting state...")
      setRoomCode(code)
      setIsHost(false)
      
      // Attendre que Firebase propage les données
      setTimeout(() => {
        setPhase("multiLobby")
        console.log("[App] Moved to multiLobby phase")
      }, 500)
    } else {
      alert("Impossible de rejoindre la partie. Vérifiez le code.")
    }
  }, [localMultiManager, displayName])

  const handleLeaveRoom = useCallback(() => {
    if (localMultiManager) {
      localMultiManager.leaveRoom()
    }
    setRoomCode("")
    setIsHost(false)
    setPhase("lobby")
  }, [localMultiManager])

  const handlePlayerReady = useCallback((ready: boolean) => {
    if (localMultiManager) {
      localMultiManager.setReady(ready)
    }
  }, [localMultiManager])

  const handleStartMultiGame = useCallback(() => {
    if (localMultiManager && isHost) {
      localMultiManager.startGame()
    }
  }, [localMultiManager, isHost])

  const handleBriefingComplete = useCallback(() => {
    setPhase("roleSelect")
  }, [])

  const handleSendChatMessage = useCallback((text: string) => {
    if (localMultiManager && gameMode === "online") {
      localMultiManager.sendChatMessage(text, displayName)
    } else {
      // Mode solo: ajouter le message directement
      const newMessage = {
        id: Date.now().toString(),
        playerId: uid,
        playerName: displayName,
        text: text,
        timestamp: Date.now()
      }
      setChatMessages(prev => [...prev, newMessage])
    }
  }, [localMultiManager, gameMode, displayName, uid])

  const handleRoleSelect = useCallback(
    async (selectedRole: Role) => {
      console.log("[App] Role selected:", selectedRole)
      
      // Update role in game state
      await chooseRole(selectedRole)
      
      // Update role in Firebase if multiplayer
      if (localMultiManager && gameMode === "online") {
        await localMultiManager.updatePlayer({ role: selectedRole })
        console.log("[App] Role updated in Firebase")
      }
      
      await sendJoin()
      setPhase("playing")
    },
    [chooseRole, sendJoin, localMultiManager, gameMode],
  )

  const handleInteract = useCallback(
    (objectId: string) => {
      if (!gameData) return

      const obj = gameData.rooms.flatMap((r) => r.objects).find((o) => o.id === objectId)

      if (!obj) return
      
      // VÉRIFICATION CRITIQUE: Vérifier les prérequis AVANT toute interaction
      const objState = snapshot.objects[objectId]
      if (!objState) {
        console.warn("[v0] Object state not found:", objectId)
        return
      }

      // Vérifier role lock
      if (obj.roleLock && role !== obj.roleLock) {
        console.warn("[v0] Wrong role:", role, "required:", obj.roleLock)
        alert(`❌ Accès refusé!\n\nCet objet nécessite le rôle: ${obj.roleLock}\nVotre rôle: ${role || "Aucun"}`)
        return
      }

      // Vérifier requires (prérequis)
      if (obj.requires && obj.requires.length > 0) {
        const allMetRequires = obj.requires.every((puzzleId) => {
          return snapshot.puzzles[puzzleId]?.success === true
        })
        
        if (!allMetRequires) {
          const missingRequires = obj.requires.filter((puzzleId) => {
            return !snapshot.puzzles[puzzleId]?.success
          })
          console.warn("[v0] Missing prerequisites:", missingRequires)
          alert(`❌ Prérequis non remplis!\n\nVous devez d'abord compléter:\n${missingRequires.join(', ')}`)
          return
        }
      }

      // Vérifier si déjà complété (pour éviter les boucles)
      const allPuzzles = gameData.rooms.flatMap((r: any) => r.puzzles || [])
      const relatedPuzzles = allPuzzles.filter((puzzle: any) => {
        if (obj.type === "panel" && puzzle.type === "infoSplit") {
          return puzzle.sourcePanel === objectId && puzzle.targetConsole === objectId
        }
        if (obj.type === "console" && puzzle.type === "infoSplit") {
          return puzzle.targetConsole === objectId
        }
        if ((obj.type === "switch" || obj.type === "valve") && (puzzle.type === "multiSwitch" || puzzle.type === "multiValve")) {
          return puzzle.ids?.includes(objectId)
        }
        return false
      })

      const alreadySolved = relatedPuzzles.some((puzzle: any) => {
        return snapshot.puzzles[puzzle.id]?.success === true
      })

      if (alreadySolved) {
        console.warn("[v0] Already completed:", objectId)
        alert("✅ Cette énigme est déjà résolue!")
        return
      }
      
      // Notification multijoueur
      if (gameMode === "online" && localMultiManager) {
        const objectName = obj.id.replace(/([A-Z])/g, ' $1').trim()
        localMultiManager.sendChatMessage(
          `🎯 ${displayName} interagit avec ${objectName}`,
          "Système"
        )
      }

      console.log("[v0] Interacting with object:", objectId, obj.type)

      if (obj.miniGame) {
        setSelectedMiniGame({ objectId, gameType: obj.miniGame as "simon" | "co2graph" | "wiring" | "timing" })
        return
      }

      if (obj.type === "door") {
        const door = obj as any
        // Check if door is open/unlocked
        const doorState = snapshot.objects[objectId]
        if (doorState?.open !== false) {
          // Find which room this door leads to
          const currentRoom = gameData.rooms.find((r) => r.id === currentRoomId)
          const currentRoomIndex = gameData.rooms.findIndex((r) => r.id === currentRoomId)

          if (currentRoomIndex < gameData.rooms.length - 1) {
            const nextRoom = gameData.rooms[currentRoomIndex + 1]
            debugTeleportToRoom(nextRoom.id)
          }
        } else {
          alert("Cette porte est verrouillée. Résolvez les énigmes pour l'ouvrir.")
        }
        return
      }

      if (obj.type === "panel" && obj.panel) {
        setSelectedPanel(objectId)
      } else if (obj.type === "console" && obj.console) {
        setSelectedConsole(objectId)
      } else {
        // For switches, valves, etc.
        sendInteract(objectId, debugMode)
      }
    },
    [gameData, sendInteract, snapshot, currentRoomId, debugTeleportToRoom, debugMode, role, gameMode, localMultiManager, displayName],
  )

  const handleDebugTeleport = useCallback(
    (roomId: string) => {
      debugTeleportToRoom(roomId)
    },
    [debugTeleportToRoom],
  )

  const handleDebugUnlockAll = useCallback(() => {
    debugUnlockAllDoors()
  }, [debugUnlockAllDoors])

  const handleDebugReset = useCallback(() => {
    window.location.reload()
  }, [])

  // Helper pour afficher un message de succès avec auto-fermeture
  const showSuccessMessage = useCallback((message: string, duration = 3000) => {
    setSuccessMessage(message)
    const timer = setTimeout(() => setSuccessMessage(null), duration)
    return () => clearTimeout(timer)
  }, [])

  const handleDebugRoleChange = useCallback(
    (newRole: Role) => {
      chooseRole(newRole)
      console.log("[v0] Debug: Role changed to", newRole)
      setSuccessMessage(`Role changed to ${newRole}`)
      setTimeout(() => setSuccessMessage(null), 2000)
    },
    [chooseRole],
  )

  const handleMiniGameComplete = useCallback(
    (success: boolean, points: number) => {
      if (success && selectedMiniGame) {
        setPlayerScore((prev) => prev + points)
        setSuccessMessage(`+${points} points! 🎉`)
        setTimeout(() => setSuccessMessage(null), 2500)

        // FIX: Activer l'objet directement au lieu de toggle
        const obj = snapshot.objects[selectedMiniGame.objectId]
        if (obj) {
          // Mettre le switch/valve à ON (pas toggle!)
          if (obj.type === "switch" || obj.type === "valve") {
            obj.state = "on"
            
            // Mettre à jour la LED liée si existe
            if (obj.ledId) {
              const led = snapshot.objects[obj.ledId]
              if (led) {
                led.state = "green"
                led.label = "ON"
              }
            }
            
            // FIX: Pour switch/valve avec mini-jeu, vérifier si puzzle multiSwitch/multiValve complété
            const room = gameData?.rooms?.find((r: any) => r.id === snapshot.roomId)
            const multiPuzzle = room?.puzzles?.find((p: any) => 
              (p.type === "multiSwitch" || p.type === "multiValve") && 
              (p.ids?.includes(selectedMiniGame.objectId) || p.objects?.includes(selectedMiniGame.objectId))
            )
            
            if (multiPuzzle) {
              // Vérifier si TOUS les objets du puzzle sont maintenant "on"
              const objectIds = multiPuzzle.ids || multiPuzzle.objects || []
              const allObjectsOn = objectIds.every((objId: string) => {
                const o = snapshot.objects[objId]
                return o && o.state === "on"
              })
              
              if (allObjectsOn) {
                snapshot.puzzles[multiPuzzle.id] = {
                  ...snapshot.puzzles[multiPuzzle.id],
                  success: true,
                  solvedAt: Date.now()
                }
                console.log("[v0] Multi-switch/valve puzzle solved:", multiPuzzle.id)
                // Forcer recalcul du compteur
                setPuzzleUpdateTrigger(prev => prev + 1)
              }
            }
            
            // NE PAS appeler sendInteract (évite toggle qui remet à "off")
          }
          
          // FIX: Pour console, définir lastInput avec le code correct pour valider le puzzle
          if (obj.type === "console" && obj.console) {
            obj.lastInput = obj.console.correctCode
            obj.completed = true
            console.log("[v0] Console completed with code:", obj.console.correctCode)
            // Appeler sendInteract pour valider le puzzle infoSplit
            sendInteract(selectedMiniGame.objectId, debugMode)
            // Forcer recalcul du compteur
            setPuzzleUpdateTrigger(prev => prev + 1)
          }
        }
      }
      setSelectedMiniGame(null)
    },
    [selectedMiniGame, sendInteract, debugMode, snapshot, gameData],
  )

  useEffect(() => {
    if (phase === "playing" && currentRoomId && !visitedRooms.has(currentRoomId)) {
      setNarrativeRoomId(currentRoomId)
      setShowNarrative(true)
      setVisitedRooms((prev) => new Set([...prev, currentRoomId]))
    }
  }, [currentRoomId, phase, visitedRooms])

  useEffect(() => {
    if (phase !== "playing") return

    const handleKeyPress = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null
      const tag = active?.tagName?.toLowerCase()
      if (active?.isContentEditable || tag === "input" || tag === "textarea") return

      if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        setDebugMode((prev) => {
          console.log("[v0] Debug mode toggled:", !prev)
          return !prev
        })
        return
      }

      if (debugMode && (e.key === "r" || e.key === "R")) {
        e.preventDefault()
        const roles: Role[] = ["Analyst", "Tech", "Operator", "Logistician"]
        const currentIndex = role ? roles.indexOf(role) : -1
        const nextRole = roles[(currentIndex + 1) % roles.length]
        handleDebugRoleChange(nextRole)
        return
      }

      // REFONTE: Toggle Journal avec touche J
      if (e.key === "j" || e.key === "J") {
        e.preventDefault()
        setJournalOpen(prev => !prev)
        return
      }

      // Also support Enter as alternative
      if (e.key === "*" || e.key === "Enter") {
        e.preventDefault()
        if (nearbyObject) {
          console.log("[v0] Attempting to interact with:", nearbyObject.id, nearbyObject.type)
          handleInteract(nearbyObject.id)
        } else {
          console.log("[v0] No nearby object to interact with")
        }
      }

      if (debugMode && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault()
        const rooms = ["R1", "R2", "R3", "EXIT"]
        const roomIndex = Number.parseInt(e.key) - 1
        if (rooms[roomIndex]) {
          console.log("[v0] Debug teleporting to room:", rooms[roomIndex])
          handleDebugTeleport(rooms[roomIndex])
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [phase, nearbyObject, handleInteract, debugMode, handleDebugTeleport, role, handleDebugRoleChange])

  useEffect(() => {
    if (phase === "playing" && gameData && snapshot) {
      const currentRoom = gameData.rooms.find((r: any) => r.id === currentRoomId)
      if (currentRoom && currentRoom.puzzles) {
        const isComplete = currentRoom.puzzles.every((p: any) => snapshot.puzzles[p.id]?.success)

        if (isComplete && currentRoom.pedagogy && !pedagogyContent) {
          setSuccessMessage(`✓ ${currentRoom.name} Complete!`)
          setTimeout(() => setSuccessMessage(null), 2000)
          setTimeout(() => {
            setPedagogyContent(currentRoom.pedagogy)
          }, 1000)
        }
      }
    }
  }, [phase, gameData, snapshot, currentRoomId, pedagogyContent])

  // Messages Dr. Lemaire basés sur la salle et les événements
  useEffect(() => {
    if (phase !== "playing") return
    
    // Message au changement de salle
    if (currentRoomId === "R1" && !drLemaireMessage) {
      setDrLemaireMessage("R1")
    } else if (currentRoomId === "R2" && !drLemaireMessage) {
      setDrLemaireMessage("R2")
    } else if (currentRoomId === "R3" && !drLemaireMessage) {
      setDrLemaireMessage("R3")
    }
  }, [currentRoomId, phase])

  // Compter les puzzles résolus
  useEffect(() => {
    if (phase !== "playing" || !gameData) return
    
    const allPuzzles = gameData.rooms.flatMap((r: any) => r.puzzles || [])
    const solvedCount = allPuzzles.filter((p: any) => snapshot.puzzles[p.id]?.success).length
    setPuzzlesSolvedCount(solvedCount)
  }, [snapshot.puzzles, gameData, phase, puzzleUpdateTrigger])

  useEffect(() => {
    if (phase !== "playing" || !gameData) return

    // Vérifier le timer (avec logs pour debug)
    console.log("[App] Timer check - timerMs:", snapshot.timerMs, "minutes:", Math.floor(snapshot.timerMs / 60000))
    
    // Messages d'alerte basés sur le timer
    const minutes = Math.floor(snapshot.timerMs / 60000)
    if (minutes === 5 && !drLemaireMessage) {
      setDrLemaireMessage("warning_5min")
    } else if (minutes === 1 && !drLemaireMessage) {
      setDrLemaireMessage("warning_1min")
    }
    
    if (snapshot.timerMs <= 0) {
      console.log("[App] ⏰ Timer expired, game over")
      setPhase("defeat")
      setDrLemaireMessage("defeat")
      return
    }

    const allPuzzles = gameData.rooms.flatMap((r) => r.puzzles || [])
    const allSolved = allPuzzles.every((p) => snapshot.puzzles[p.id]?.solved)
    if (allSolved && allPuzzles.length > 0) {
      console.log("[App] 🎉 All puzzles solved, victory!")
      setPhase("victory")
      setDrLemaireMessage("victory")
    }
  }, [phase, snapshot.timerMs, gameData])

  // ÉCRAN 1: Lobby principal - Choix mode solo/multi (NOUVEAU DESIGN)
  if (phase === "lobby" && gameMode === "offline") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${Math.random() * 100 + 20}px`,
                height: `${Math.random() * 100 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl w-full animate-fade-in-up">
            {/* Hero Section */}
            <div className="text-center mb-8 space-y-4">
              <div className="inline-block animate-bounce-slow">
                <div className="text-8xl mb-4">🌬️</div>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 mb-2 animate-gradient">
                BREATHE LINE
              </h1>
              <p className="text-xl md:text-2xl text-cyan-100 font-medium">
                Escape Game Coopératif sur la Qualité de l'Air
              </p>
              <div className="flex items-center justify-center gap-3 text-cyan-300">
                <span className="px-3 py-1 bg-cyan-500/20 rounded-full text-sm font-semibold border border-cyan-400/30">
                  🎮 Multijoueur
                </span>
                <span className="px-3 py-1 bg-blue-500/20 rounded-full text-sm font-semibold border border-blue-400/30">
                  🧠 Éducatif
                </span>
                <span className="px-3 py-1 bg-indigo-500/20 rounded-full text-sm font-semibold border border-indigo-400/30">
                  ⏱️ 30 min
                </span>
              </div>
            </div>

            {/* Main Card */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <div className="p-8 space-y-6">
                {/* Mission Brief */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🎯</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-cyan-100 mb-2 text-lg">Votre Mission</h3>
                      <p className="text-cyan-200/90 text-sm leading-relaxed">
                        Une équipe d'experts infiltrés dans un laboratoire de recherche. Le système de ventilation a été compromis.
                        <span className="font-semibold text-cyan-100"> Résolvez les énigmes, rétablissez la qualité de l'air, et évacuez avant l'asphyxie!</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Player Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cyan-100">Entrez votre nom</label>
                  <Input
                    placeholder="Votre pseudonyme d'agent..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 text-center text-lg h-12 focus:border-cyan-400 focus:ring-cyan-400/50"
                  />
                </div>

                {/* Game Mode Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleStartGame("offline")}
                    disabled={!gameData}
                    className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    <div className="relative z-10 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <Play className="w-6 h-6" />
                        <span className="text-xl font-bold">Mode Solo</span>
                      </div>
                      <p className="text-white/80 text-sm">Jouez seul pour comprendre les mécaniques</p>
                    </div>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                  </button>

                  <button
                    onClick={() => handleStartGame("online")}
                    disabled={!gameData}
                    className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    <div className="relative z-10 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-6 h-6" />
                        <span className="text-xl font-bold">Multijoueur</span>
                      </div>
                      <p className="text-white/80 text-sm">Coopérez avec 2-4 joueurs en temps réel</p>
                    </div>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                  </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-2xl mb-1">👥</div>
                    <div className="text-xs font-semibold text-cyan-100">2-4 Joueurs</div>
                    <div className="text-xs text-cyan-300/70">Coopératif</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🧩</div>
                    <div className="text-xs font-semibold text-cyan-100">4 Salles</div>
                    <div className="text-xs text-cyan-300/70">Énigmes variées</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎓</div>
                    <div className="text-xs font-semibold text-cyan-100">Éducatif</div>
                    <div className="text-xs text-cyan-300/70">Air intérieur</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Footer */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-cyan-300/60 text-sm">
                Workshop EPSI/WIS 2025 • Escape Tech Challenge
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-cyan-400/80">
                <span className="px-2 py-1 bg-green-500/20 rounded border border-green-400/30">
                  ✨ Firebase Realtime
                </span>
                <span className="px-2 py-1 bg-blue-500/20 rounded border border-blue-400/30">
                  ⚡ Next.js 15
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-float { animation: float linear infinite; }
          .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
          .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
          .animate-gradient { 
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}</style>
      </div>
    )
  }

  // ÉCRAN 2: Sélection créer/rejoindre room (mode online)
  if (phase === "lobby" && gameMode === "online") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 bg-white/95 backdrop-blur">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mode Multijoueur</h1>
            <p className="text-gray-700">Créez une nouvelle partie ou rejoignez-en une</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Créer une partie */}
              <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <div className="text-4xl mb-3">🎮</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Créer une partie</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Démarrez une nouvelle partie et invitez vos coéquipiers
                </p>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleCreateRoom}
                  disabled={!localMultiManager}
                >
                  Créer
                </Button>
              </div>

              {/* Rejoindre une partie */}
              <div className="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 transition-colors">
                <div className="text-4xl mb-3">🔗</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Rejoindre une partie</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Entrez le code de la partie
                </p>
                <Input
                  placeholder="CODE (4 caractères)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="text-center font-mono text-lg mb-3"
                />
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleJoinRoom(joinCode)}
                  disabled={!localMultiManager || joinCode.length !== 4}
                >
                  Rejoindre
                </Button>
              </div>
            </div>

            <Button variant="outline" onClick={() => setPhase("lobby")} className="bg-transparent">
              ← Retour
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              💡 <strong>Astuce:</strong> Ouvrez plusieurs onglets pour tester le multijoueur localement
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // ÉCRAN 3: Lobby multijoueur - Attente des joueurs
  if (phase === "multiLobby") {
    const localPlayer = multiPlayers.find((p) => p.id === uid) || {
      id: uid,
      name: displayName,
      role: null,
      isHost: isHost,
      isReady: false,
    }

    return (
      <LobbyScreen
        roomCode={roomCode}
        isHost={isHost}
        localPlayer={localPlayer}
        players={multiPlayers}
        onStart={handleStartMultiGame}
        onLeave={handleLeaveRoom}
        onReady={handlePlayerReady}
      />
    )
  }

  if (phase === "briefing") {
    return (
      <BriefingScreen 
        onStart={handleBriefingComplete} 
        players={multiPlayers}
        isMultiplayer={gameMode === "online"}
      />
    )
  }

  if (phase === "roleSelect") {
    const roles: { role: Role; icon: string; desc: string }[] = [
      { role: "Analyst", icon: "📊", desc: "Lit les panneaux et analyse les données" },
      { role: "Tech", icon: "🔧", desc: "Active les interrupteurs et valves" },
      { role: "Operator", icon: "⌨️", desc: "Entre les codes dans les consoles" },
      { role: "Logistician", icon: "📦", desc: "Ramasse et place les objets" },
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full p-8 bg-white/95 backdrop-blur">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Choisissez votre rôle</h2>
            <p className="text-gray-700">Chaque rôle a des capacités uniques nécessaires pour réussir</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {roles.map(({ role, icon, desc }) => (
                <Button
                  key={role}
                  size="lg"
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-blue-50 hover:border-blue-500 bg-transparent"
                  onClick={() => handleRoleSelect(role)}
                >
                  <div className="text-4xl">{icon}</div>
                  <div className="font-semibold text-lg">{role}</div>
                  <div className="text-sm text-gray-600">{desc}</div>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (phase === "victory") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 bg-white/95 backdrop-blur text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <h2 className="text-4xl font-bold text-gray-900">Victoire !</h2>
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-green-600">Score: {snapshot.score}/100</p>
            <p className="text-gray-700">Temps restant: {Math.floor(snapshot.timerMs / 60000)} minutes</p>
            <p className="text-gray-700">Indices utilisés: {snapshot.hintsUsed}</p>
            <p className="text-gray-700">Erreurs: {snapshot.errors}</p>
          </div>
          <Button size="lg" onClick={() => window.location.reload()}>
            Rejouer
          </Button>
        </Card>
      </div>
    )
  }

  if (phase === "defeat") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 bg-white/95 backdrop-blur text-center space-y-6">
          <div className="text-6xl">⏰</div>
          <h2 className="text-4xl font-bold text-gray-900">Temps écoulé !</h2>
          <p className="text-gray-700">Vous n'avez pas réussi à vous échapper à temps...</p>
          <div className="space-y-2">
            <p className="text-gray-700">Score final: {snapshot.score}/100</p>
            <p className="text-gray-700">Indices utilisés: {snapshot.hintsUsed}</p>
            <p className="text-gray-700">Erreurs: {snapshot.errors}</p>
          </div>
          <Button size="lg" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </Card>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Chargement du jeu...</div>
      </div>
    )
  }

  const currentRoom = gameData?.rooms.find((r) => r.id === currentRoomId) || gameData?.rooms[0]

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e]">
      <main className="flex-1 relative">
        {/* NOUVEAU: Top Bar */}
        <TopBar
          timerMs={snapshot.timerMs}
          co2Level={co2.currentLevel}
          hintsUsed={snapshot.hintsUsed}
          maxHints={2}
          onOpenJournal={() => setJournalOpen(!journalOpen)}
        />

        {/* OLD GameHUD - On garde pour compatibilité mais caché */}
        <div className="hidden">
          <GameHUD
            state={snapshot}
            role={role}
            onUseHint={() => handleUseHint(currentRoomId)}
            onMuteToggle={() => setMuted(!muted)}
            muted={muted}
            maxHints={2}
            hintCost={10}
          />
        </div>

        {/* Journal de Mission (conditionnel) */}
        {journalOpen && (
          <MissionJournal
            currentRoomId={currentRoomId}
            snapshot={snapshot}
            gameData={gameData}
          />
        )}

        {/* Messages Dr. Lemaire */}
        {drLemaireMessage && (
          <DrLemaireMessage
            roomId={currentRoomId}
            trigger={drLemaireMessage}
            onDismiss={() => setDrLemaireMessage(null)}
          />
        )}

        {showTimeWarning && <TimeWarning remainingMs={snapshot.timerMs} onDismiss={() => setShowTimeWarning(false)} />}

        {/* NOUVEAU: Système de notifications */}
        <NotificationManager
          notifications={notifications}
          onDismiss={removeNotification}
        />

        {/* REFONTE: Ambiance lumineuse */}
        {currentRoomId === "R1" && (
          <AmbientLight co2Level={co2.currentLevel} />
        )}

        {/* REFONTE: Timer synchronisation switches */}
        {currentRoomId === "R1" && (() => {
          // FIX: Lire windowMs depuis le puzzle au lieu de hardcoder
          const switchPuzzle = currentRoom?.puzzles?.find((p: any) => p.id === "step3_switches") as any
          const windowMs = (switchPuzzle?.windowMs as number) || 3000
          
          return (
            <SyncTimer
              isActive={syncTimerActive}
              durationMs={windowMs}
              onExpire={() => {
                setSyncTimerActive(false)
                setFirstSwitchTime(null)
                // Réinitialiser les switches
                const swA = snapshot.objects["swA"]
                const swB = snapshot.objects["swB"]
                if (swA) swA.state = "off"
                if (swB) swB.state = "off"
              }}
            />
          )
        })()}

        {/* REFONTE: Journal Unifié (remplace Protocole + Journal) */}
        <UnifiedJournal
          isOpen={journalOpen}
          onClose={() => setJournalOpen(false)}
          phases={(() => {
            // FIX: Générer phases dynamiquement depuis puzzles au lieu de hardcoder
            if (!currentRoom?.puzzles) return []
            
            return currentRoom.puzzles.map((puzzle: any, index: number) => {
              const puzzleState = snapshot.puzzles[puzzle.id]
              const prevPuzzle = index > 0 ? currentRoom.puzzles[index - 1] : null
              const prevCompleted = prevPuzzle ? snapshot.puzzles[prevPuzzle.id]?.success : true
              
              // Trouver le rôle depuis les objectives
              const objective = objectives.objectives.find(o => o.puzzleId === puzzle.id)
              
              return {
                id: puzzle.id,
                label: objective?.text.replace(/^[📊⌨️🔧✅]\s+/, '') || puzzle.id,
                role: objective?.role || "Team",
                completed: puzzleState?.success || false,
                current: prevCompleted && !puzzleState?.success,
                locked: !prevCompleted
              }
            })
          })()}
          overallProgress={(() => {
            // FIX: Calculer dynamiquement depuis currentRoom.puzzles au lieu de hardcoder R1
            const completedCount = currentRoom?.puzzles?.filter(p => 
              snapshot.puzzles[p.id]?.success
            ).length || 0
            const totalCount = currentRoom?.puzzles?.length || 1
            return (completedCount / totalCount) * 100
          })()}
          briefing="28 octobre 2025, 23h47 - Station BreatheLab-7

Équipe, réveil d'urgence! Le système HVAC est compromis. 
Le CO₂ monte dangereusement: 1000 ppm et ça grimpe.

À 1500 ppm, pertes de conscience.
À 2000 ppm, mortel.

Vous avez 30 minutes pour:
1. DIAGNOSTIQUER la panne (Analyst)
2. RÉACTIVER les filtres (Operator)  
3. DÉBLOQUER les valves (Tech)

La tempête nous piège ici. Chaque minute compte.
Bonne chance."
          currentObjectives={objectives.objectives.map(o => o.text)}
          recentDebriefings={debriefings.map(d => ({
            title: d.content.title,
            summary: d.content.explanation.substring(0, 200) + "..."
          }))}
          hintsFound={(() => {
            // FIX: Afficher hints seulement si utilisés
            const allHints = [
              "Le code zone se calcule: Lettre + (valeur/100)",
              "Les valves doivent être synchronisées dans une fenêtre de 3 secondes",
              "Les filtres HEPA doivent être activés avant les filtres Carbon"
            ]
            // Afficher seulement le nombre de hints utilisés
            return allHints.slice(0, snapshot.hintsUsed)
          })()}
          puzzlesSolved={puzzlesSolvedCount}
          totalPuzzles={currentRoom?.puzzles?.length || 0}
        />

        <DebriefingManager
          debriefings={debriefings}
          onDismiss={dismissDebriefing}
        />

        {/* NOUVEAU: Bottom UI Components - Objectifs dynamiques */}
        <CurrentObjective
          title={`Mission: ${currentRoom?.name || "Chargement..."}`}
          steps={objectives.objectives}
          currentRole={role || undefined}
          needsTransmission={snapshot.puzzles["step1_readPanel"]?.success && !snapshot.puzzles["step2_enterCode"]?.success}
        />

        <RoomInfo
          roomName={currentRoom?.name || "Unknown Room"}
          roomId={currentRoomId}
          playerCount={gameMode === "online" ? multiPlayers.length : 1}
          puzzlesCompleted={currentRoom?.puzzles?.filter(p => snapshot.puzzles[p.id]?.success).length || 0}
          puzzlesTotal={currentRoom?.puzzles?.length || 0}
          isMultiplayer={gameMode === "online"}
        />

        <MiniMap
          rooms={gameData.rooms.slice(0, 4).map(r => ({
            id: r.id,
            name: r.name,
            completed: r.puzzles?.every(p => snapshot.puzzles[p.id]?.success) || false,
            locked: r.id !== currentRoomId && !(r.puzzles?.every(p => snapshot.puzzles[p.id]?.success))
          }))}
          currentRoomId={currentRoomId}
        />

        {/* OLD ObjectiveDisplay - Commenté pour test */}
        {/* {gameData && <ObjectiveDisplay gameData={gameData} snapshot={snapshot} currentRoomId={currentRoomId} />} */}

        <InteractionPrompt nearbyObject={nearbyObject} playerRole={role} canInteract={true} snapshot={snapshot} />

        <div className="w-full h-screen">
          <IsoRoom
            room={(currentRoom?.name || "Lobby") as any}
            selfName={displayName}
            onBubble={(text) => sendMessage(text)}
            recentMessages={messages.slice(-10)}
            peers={gameMode === "online" ? multiPlayers.filter(p => p.id !== uid).map(p => ({
              id: p.id,
              name: p.name,
              x: p.x || 2,
              y: p.y || 6,
              color: "#3b82f6",
              facing: "S" as const,
              dance: false,
              sit: false,
              wave: false,
              laugh: false
            })) : others}
            onStep={(pos) => {
              sendMove(pos)
              // Update Firebase position in online mode
              if (gameMode === "online" && localMultiManager) {
                localMultiManager.updatePlayer({ x: pos.x, y: pos.y })
              }
              if (gameData && currentRoom) {
                const adjacencyRange = gameData.ui?.adjacencyRange || 2
                const nearby = currentRoom.objects.find((obj: any) => {
                  const dx = Math.abs(obj.x - pos.x)
                  const dy = Math.abs(obj.y - pos.y)
                  const distance = Math.max(dx, dy)
                  return distance <= adjacencyRange
                })

                if (nearby !== nearbyObject) {
                  setNearbyObject(nearby || null)
                  if (nearby) {
                    console.log(
                      "[v0] Nearby object detected:",
                      nearby.id,
                      nearby.name,
                      "at distance:",
                      Math.max(Math.abs(nearby.x - pos.x), Math.abs(nearby.y - pos.y)),
                    )
                  }
                }

                // NOUVEAU: Détection porte automatique
                const nearbyDoor = currentRoom.objects.find((obj: any) => {
                  if (obj.type !== "door") return false
                  const dx = Math.abs(obj.x - pos.x)
                  const dy = Math.abs(obj.y - pos.y)
                  return Math.max(dx, dy) <= 1
                })

                if (nearbyDoor && snapshot.objects[nearbyDoor.id]?.open && !isTransitioning) {
                  // Porte ouverte et pas déjà en transition
                  const nextRoomId = getNextRoomId(currentRoomId, gameData)
                  if (nextRoomId) {
                    console.log("[AutoDoor] Transition vers", nextRoomId)
                    setIsTransitioning(true)
                    setTransitionFrom(currentRoom.name)
                    setTransitionTo(gameData.rooms.find(r => r.id === nextRoomId)?.name || nextRoomId)
                  }
                }
              }
            }}
            dancing={false}
            party={false}
            waving={false}
            laughing={false}
            sitToggleSeq={0}
            onSitChange={() => {}}
            audioEnabled={!muted}
            currentTrackId={undefined}
            isPlaying={false}
            onMusicBoxToggle={() => {}}
            gameObjects={currentRoom?.objects || []}
            gameState={snapshot}
            onInteract={handleInteract}
            nearbyObject={nearbyObject}
          />
        </div>

        {showNarrative && narrativeRoomId && (
          <NarrativeOverlay roomId={narrativeRoomId} onDismiss={() => setShowNarrative(false)} />
        )}

        {successMessage && <SuccessNotification message={successMessage} onDismiss={() => setSuccessMessage(null)} />}

        {showTutorial && <TutorialOverlay onComplete={() => setShowTutorial(false)} />}

        {contextualHint && <ContextualHint hint={contextualHint} onDismiss={() => setContextualHint(null)} />}

        {debugMode && phase === "playing" && (
          <DebugPanel
            currentRoomId={currentRoomId}
            onTeleport={handleDebugTeleport}
            onUnlockAll={handleDebugUnlockAll}
            onResetGame={handleDebugReset}
            gameState={snapshot}
            currentRole={role}
            onRoleChange={(r) => handleDebugRoleChange(r as Role)}
          />
        )}

        {phase === "playing" && (
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            playerName={displayName}
          />
        )}

        {selectedMiniGame && (
          <MiniGameModal
            gameType={selectedMiniGame.gameType}
            onComplete={handleMiniGameComplete}
            onClose={() => setSelectedMiniGame(null)}
          />
        )}

        {/* NOUVEAU: Transition entre salles */}
        {isTransitioning && (
          <RoomTransition
            fromRoom={transitionFrom}
            toRoom={transitionTo}
            onComplete={() => {
              const nextRoomId = getNextRoomId(currentRoomId, gameData)
              if (nextRoomId && gameData) {
                debugTeleportToRoom(nextRoomId)
                setIsTransitioning(false)
                setTransitionFrom("")
                setTransitionTo("")
              }
            }}
          />
        )}
      </main>


      {selectedPanel && (
        <PanelModal
          panelId={selectedPanel}
          gameData={gameData}
          onClose={() => {
            // Valider le puzzle panelRead quand le panel est fermé
            sendInteract(selectedPanel, debugMode)
            // Forcer recalcul du compteur
            setPuzzleUpdateTrigger(prev => prev + 1)
            setSelectedPanel(null)
          }}
          canRead={role === "Analyst"}
        />
      )}

      {selectedConsole && (
        <ConsoleModal
          consoleId={selectedConsole}
          gameData={gameData}
          onClose={() => setSelectedConsole(null)}
          onSubmit={(input) => {
            sendConsoleSubmit(selectedConsole, input)
            setSelectedConsole(null)
          }}
          canOperate={role === "Operator"}
        />
      )}

      {pedagogyContent && (
        <PedagogyModal open={true} onContinue={() => setPedagogyContent(null)} pedagogy={pedagogyContent} role={role} />
      )}
    </div>
  )
}
