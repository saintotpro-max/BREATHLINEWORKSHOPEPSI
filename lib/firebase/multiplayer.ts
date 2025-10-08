/**
 * Firebase Multiplayer Manager
 * Professional implementation of real-time multiplayer using Firebase Realtime Database
 * 
 * Architecture:
 * /rooms/{roomCode}/
 *   - players/{playerId}/
 *   - gameState/
 *   - messages/{messageId}/
 *   - metadata/
 */

"use client"

import {
  ref,
  set,
  update,
  onValue,
  off,
  push,
  serverTimestamp,
  onDisconnect,
  remove,
  get,
} from "firebase/database"
import { getFirebaseDatabase, isFirebaseConfigured } from "./config"
import type { GameSnapshot } from "@/state/types"

// Types
export interface Player {
  id: string
  name: string
  role: string | null
  isHost: boolean
  isReady: boolean
  x: number
  y: number
  lastSeen: number | object // Can be serverTimestamp
  connected: boolean
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  text: string
  timestamp: number | object
}

export interface RoomMetadata {
  code: string
  createdAt: number | object
  hostId: string
  gameStarted: boolean
}

type MessageCallback = (data: any) => void

/**
 * Firebase Multiplayer Manager
 * Handles all real-time multiplayer operations
 */
export class FirebaseMultiplayerManager {
  private database: ReturnType<typeof getFirebaseDatabase> | null = null
  private roomCode: string | null = null
  private playerId: string
  private listeners: Map<string, Set<MessageCallback>> = new Map()
  private unsubscribers: Array<() => void> = []

  constructor() {
    this.playerId = this.getOrCreatePlayerId()
    
    if (isFirebaseConfigured()) {
      try {
        this.database = getFirebaseDatabase()
        console.log("[Firebase MP] Manager initialized")
      } catch (error) {
        console.error("[Firebase MP] Failed to initialize:", error)
      }
    } else {
      console.warn("[Firebase MP] Firebase not configured")
    }
  }

  /**
   * Get or create a unique player ID
   */
  private getOrCreatePlayerId(): string {
    if (typeof window === "undefined") return `player_${Date.now()}`
    
    let id = localStorage.getItem("breathe_line_player_id")
    if (!id) {
      id = `player_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      localStorage.setItem("breathe_line_player_id", id)
    }
    return id
  }

  /**
   * Generate a unique room code
   */
  generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Join or create a room
   */
  async joinRoom(roomCode: string, playerName: string, isHost: boolean = false): Promise<boolean> {
    if (!this.database) {
      console.error("[Firebase MP] Database not initialized")
      return false
    }

    this.roomCode = roomCode
    console.log(`[Firebase MP] Joining room: ${roomCode}`)

    try {
      const roomRef = ref(this.database, `rooms/${roomCode}`)
      const playerRef = ref(this.database, `rooms/${roomCode}/players/${this.playerId}`)

      // Check if room exists
      const roomSnapshot = await get(roomRef)
      
      if (!roomSnapshot.exists() && isHost) {
        // Create new room
        await set(ref(this.database, `rooms/${roomCode}/metadata`), {
          code: roomCode,
          createdAt: serverTimestamp(),
          hostId: this.playerId,
          gameStarted: false,
        })
        console.log("[Firebase MP] Room created")
      }

      // Add player to room
      const playerData: Player = {
        id: this.playerId,
        name: playerName,
        role: null,
        isHost: isHost,
        isReady: false,
        x: 6,
        y: 6,
        lastSeen: serverTimestamp(),
        connected: true,
      }

      await set(playerRef, playerData)

      // Setup disconnect handler
      const disconnectRef = onDisconnect(playerRef)
      await disconnectRef.update({ connected: false, lastSeen: serverTimestamp() })

      // Setup heartbeat
      this.startHeartbeat()

      console.log("[Firebase MP] Joined successfully")
      return true
    } catch (error) {
      console.error("[Firebase MP] Failed to join room:", error)
      return false
    }
  }

  /**
   * Leave the current room
   */
  async leaveRoom(): Promise<void> {
    if (!this.database || !this.roomCode) return

    try {
      const playerRef = ref(this.database, `rooms/${this.roomCode}/players/${this.playerId}`)
      await update(playerRef, {
        connected: false,
        lastSeen: serverTimestamp(),
      })

      // Clean up listeners
      this.unsubscribers.forEach((unsub) => unsub())
      this.unsubscribers = []

      console.log("[Firebase MP] Left room")
      this.roomCode = null
    } catch (error) {
      console.error("[Firebase MP] Failed to leave room:", error)
    }
  }

  /**
   * Set player ready status
   */
  async setReady(ready: boolean): Promise<void> {
    if (!this.database || !this.roomCode) return

    try {
      const playerRef = ref(this.database, `rooms/${this.roomCode}/players/${this.playerId}`)
      await update(playerRef, { isReady: ready })
      console.log(`[Firebase MP] Ready status: ${ready}`)
    } catch (error) {
      console.error("[Firebase MP] Failed to set ready:", error)
    }
  }

  /**
   * Start the game (host only)
   */
  async startGame(): Promise<void> {
    if (!this.database || !this.roomCode) return

    try {
      const metadataRef = ref(this.database, `rooms/${this.roomCode}/metadata`)
      await update(metadataRef, { gameStarted: true })
      console.log("[Firebase MP] Game started")
    } catch (error) {
      console.error("[Firebase MP] Failed to start game:", error)
    }
  }

  /**
   * Update player position
   */
  async updatePosition(x: number, y: number): Promise<void> {
    if (!this.database || !this.roomCode) return

    try {
      const playerRef = ref(this.database, `rooms/${this.roomCode}/players/${this.playerId}`)
      await update(playerRef, { x, y, lastSeen: serverTimestamp() })
    } catch (error) {
      console.error("[Firebase MP] Failed to update position:", error)
    }
  }

  /**
   * Update player data (role, status, etc.)
   */
  async updatePlayer(data: Partial<Player>): Promise<void> {
    if (!this.database || !this.roomCode) return

    try {
      const playerRef = ref(this.database, `rooms/${this.roomCode}/players/${this.playerId}`)
      await update(playerRef, { ...data, lastSeen: serverTimestamp() })
      console.log("[Firebase MP] Player updated:", data)
    } catch (error) {
      console.error("[Firebase MP] Failed to update player:", error)
    }
  }

  /**
   * Update game state
   */
  async updateGameState(state: GameSnapshot): Promise<void> {
    if (!this.database || !this.roomCode) return

    try {
      const stateRef = ref(this.database, `rooms/${this.roomCode}/gameState`)
      await set(stateRef, {
        ...state,
        updatedAt: serverTimestamp(),
        updatedBy: this.playerId,
      })
    } catch (error) {
      console.error("[Firebase MP] Failed to update game state:", error)
    }
  }

  /**
   * Send a chat message
   */
  async sendChatMessage(text: string, playerName: string): Promise<void> {
    if (!this.database || !this.roomCode) return

    try {
      const messagesRef = ref(this.database, `rooms/${this.roomCode}/messages`)
      await push(messagesRef, {
        playerId: this.playerId,
        playerName: playerName,
        text: text,
        timestamp: serverTimestamp(),
      })
      console.log("[Firebase MP] Message sent")
    } catch (error) {
      console.error("[Firebase MP] Failed to send message:", error)
    }
  }

  /**
   * Subscribe to players list
   */
  subscribePlayers(callback: (players: Player[]) => void): () => void {
    if (!this.database || !this.roomCode) return () => {}

    const playersRef = ref(this.database, `rooms/${this.roomCode}/players`)
    
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const players = Object.values(data) as Player[]
        callback(players.filter((p) => p.connected))
      } else {
        callback([])
      }
    })

    this.unsubscribers.push(() => off(playersRef))
    return () => off(playersRef)
  }

  /**
   * Subscribe to messages
   */
  subscribeMessages(callback: (message: ChatMessage) => void): () => void {
    if (!this.database || !this.roomCode) return () => {}

    const messagesRef = ref(this.database, `rooms/${this.roomCode}/messages`)
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val() as ChatMessage
        message.id = childSnapshot.key || ""
        callback(message)
      })
    })

    this.unsubscribers.push(() => off(messagesRef))
    return () => off(messagesRef)
  }

  /**
   * Subscribe to game state changes
   */
  subscribeGameState(callback: (state: any) => void): () => void {
    if (!this.database || !this.roomCode) {
      console.error("[Firebase MP] Cannot subscribe to game state: no database or room code")
      return () => {}
    }

    console.log("[Firebase MP] Subscribing to game state for room:", this.roomCode)
    const stateRef = ref(this.database, `rooms/${this.roomCode}/gameState`)
    
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        console.log("[Firebase MP] 🎮 Game state update received:", data)
        callback(data)
      }
    })

    this.unsubscribers.push(() => off(stateRef))
    return () => off(stateRef)
  }

  /**
   * Subscribe to game start event
   */
  subscribeGameStart(callback: () => void): () => void {
    if (!this.database || !this.roomCode) {
      console.error("[Firebase MP] Cannot subscribe to game start: no database or room code")
      return () => {}
    }

    console.log("[Firebase MP] Subscribing to game start for room:", this.roomCode)
    const metadataRef = ref(this.database, `rooms/${this.roomCode}/metadata`)
    
    let hasTriggered = false
    
    const unsubscribe = onValue(metadataRef, (snapshot) => {
      const data = snapshot.val()
      console.log("[Firebase MP] Game start subscription update:", data)
      
      if (data && data.gameStarted && !hasTriggered) {
        hasTriggered = true
        console.log("[Firebase MP] 🚀 GAME START TRIGGERED!")
        callback()
      }
    })

    this.unsubscribers.push(() => off(metadataRef))
    return () => off(metadataRef)
  }

  /**
   * Get current players list (one-time read)
   */
  async getPlayers(): Promise<Player[]> {
    if (!this.database || !this.roomCode) return []

    try {
      const playersRef = ref(this.database, `rooms/${this.roomCode}/players`)
      const snapshot = await get(playersRef)
      
      if (snapshot.exists()) {
        const data = snapshot.val()
        const players = Object.values(data) as Player[]
        return players.filter((p) => p.connected)
      }
      return []
    } catch (error) {
      console.error("[Firebase MP] Failed to get players:", error)
      return []
    }
  }

  /**
   * Start heartbeat to keep player alive
   */
  private heartbeatInterval: NodeJS.Timeout | null = null

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(async () => {
      if (!this.database || !this.roomCode) return

      try {
        const playerRef = ref(this.database, `rooms/${this.roomCode}/players/${this.playerId}`)
        await update(playerRef, { lastSeen: serverTimestamp() })
      } catch (error) {
        console.error("[Firebase MP] Heartbeat failed:", error)
      }
    }, 3000) // Every 3 seconds
  }

  /**
   * Get player ID
   */
  getPlayerId(): string {
    return this.playerId
  }

  /**
   * Check if Firebase is available
   */
  isAvailable(): boolean {
    return this.database !== null
  }
}

// Singleton instance
let managerInstance: FirebaseMultiplayerManager | null = null

/**
 * Get the Firebase Multiplayer Manager instance (singleton)
 */
export function getFirebaseMultiplayerManager(): FirebaseMultiplayerManager {
  if (!managerInstance) {
    managerInstance = new FirebaseMultiplayerManager()
  }
  return managerInstance
}
