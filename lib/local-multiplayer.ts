/**
 * Local Multiplayer System using BroadcastChannel
 * Allows testing multiplayer on a single machine with multiple browser tabs
 */

"use client"

type MessageType =
  | "player_join"
  | "player_leave"
  | "player_ready"
  | "player_move"
  | "game_state_update"
  | "chat_message"
  | "start_game"

interface Message {
  type: MessageType
  roomCode: string
  playerId: string
  timestamp: number
  data: any
}

interface Player {
  id: string
  name: string
  role: string | null
  isHost: boolean
  isReady: boolean
  x: number
  y: number
  lastSeen: number
}

interface RoomData {
  code: string
  players: Record<string, Player>
  gameState: any
  messages: Array<{
    id: string
    playerId: string
    playerName: string
    text: string
    timestamp: number
  }>
}

const STORAGE_KEY_PREFIX = "breathe_line_room_"
const HEARTBEAT_INTERVAL = 2000
const PLAYER_TIMEOUT = 5000

class LocalMultiplayerManager {
  private channel: BroadcastChannel | null = null
  private roomCode: string | null = null
  private playerId: string
  private listeners: Map<MessageType, Set<(data: any) => void>> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor() {
    this.playerId = this.getOrCreatePlayerId()
  }

  private getOrCreatePlayerId(): string {
    let id = localStorage.getItem("breathe_line_player_id")
    if (!id) {
      id = `player_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      localStorage.setItem("breathe_line_player_id", id)
    }
    return id
  }

  generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  joinRoom(roomCode: string, playerName: string, isHost: boolean = false): boolean {
    this.roomCode = roomCode
    this.channel = new BroadcastChannel(`breathe_line_${roomCode}`)

    // Setup message listener
    this.channel.onmessage = (event: MessageEvent<Message>) => {
      this.handleMessage(event.data)
    }

    // Initialize or get room data
    let roomData = this.getRoomData(roomCode)
    if (!roomData) {
      roomData = {
        code: roomCode,
        players: {},
        gameState: null,
        messages: [],
      }
    }

    // Add this player
    roomData.players[this.playerId] = {
      id: this.playerId,
      name: playerName,
      role: null,
      isHost: isHost,
      isReady: false,
      x: 6,
      y: 6,
      lastSeen: Date.now(),
    }

    this.saveRoomData(roomCode, roomData)

    // Broadcast join
    this.broadcast("player_join", {
      playerId: this.playerId,
      playerName: playerName,
      isHost: isHost,
    })

    // Start heartbeat
    this.startHeartbeat()

    // Clean up disconnected players
    this.cleanupDisconnectedPlayers()

    return true
  }

  leaveRoom(): void {
    if (!this.roomCode) return

    // Broadcast leave
    this.broadcast("player_leave", { playerId: this.playerId })

    // Remove from room
    const roomData = this.getRoomData(this.roomCode)
    if (roomData) {
      delete roomData.players[this.playerId]
      this.saveRoomData(this.roomCode, roomData)
    }

    // Cleanup
    this.stopHeartbeat()
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.roomCode = null
  }

  setReady(ready: boolean): void {
    if (!this.roomCode) return

    const roomData = this.getRoomData(this.roomCode)
    if (roomData && roomData.players[this.playerId]) {
      roomData.players[this.playerId].isReady = ready
      this.saveRoomData(this.roomCode, roomData)

      this.broadcast("player_ready", {
        playerId: this.playerId,
        ready: ready,
      })
    }
  }

  startGame(): void {
    if (!this.roomCode) return
    this.broadcast("start_game", {})
  }

  updatePosition(x: number, y: number): void {
    if (!this.roomCode) return

    const roomData = this.getRoomData(this.roomCode)
    if (roomData && roomData.players[this.playerId]) {
      roomData.players[this.playerId].x = x
      roomData.players[this.playerId].y = y
      roomData.players[this.playerId].lastSeen = Date.now()
      this.saveRoomData(this.roomCode, roomData)

      this.broadcast("player_move", {
        playerId: this.playerId,
        x: x,
        y: y,
      })
    }
  }

  updateGameState(state: any): void {
    if (!this.roomCode) return

    const roomData = this.getRoomData(this.roomCode)
    if (roomData) {
      roomData.gameState = state
      this.saveRoomData(this.roomCode, roomData)

      this.broadcast("game_state_update", { state })
    }
  }

  sendChatMessage(text: string, playerName: string): void {
    if (!this.roomCode) return

    const message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      playerId: this.playerId,
      playerName: playerName,
      text: text,
      timestamp: Date.now(),
    }

    const roomData = this.getRoomData(this.roomCode)
    if (roomData) {
      roomData.messages.push(message)
      // Keep only last 100 messages
      if (roomData.messages.length > 100) {
        roomData.messages = roomData.messages.slice(-100)
      }
      this.saveRoomData(this.roomCode, roomData)
    }

    this.broadcast("chat_message", message)
  }

  getPlayers(): Player[] {
    if (!this.roomCode) return []

    const roomData = this.getRoomData(this.roomCode)
    if (!roomData) return []

    // Clean up timed out players
    const now = Date.now()
    const activePlayers = Object.values(roomData.players).filter(
      (p) => now - p.lastSeen < PLAYER_TIMEOUT
    )

    return activePlayers
  }

  getChatMessages(): Array<{ id: string; playerId: string; playerName: string; text: string; timestamp: number }> {
    if (!this.roomCode) return []

    const roomData = this.getRoomData(this.roomCode)
    return roomData?.messages || []
  }

  getGameState(): any {
    if (!this.roomCode) return null

    const roomData = this.getRoomData(this.roomCode)
    return roomData?.gameState || null
  }

  on(eventType: MessageType, callback: (data: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)
  }

  off(eventType: MessageType, callback: (data: any) => void): void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  private broadcast(type: MessageType, data: any): void {
    if (!this.channel || !this.roomCode) return

    const message: Message = {
      type,
      roomCode: this.roomCode,
      playerId: this.playerId,
      timestamp: Date.now(),
      data,
    }

    this.channel.postMessage(message)
  }

  private handleMessage(message: Message): void {
    // Don't handle our own messages
    if (message.playerId === this.playerId) return

    // Trigger listeners
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach((callback) => callback(message.data))
    }

    // Update room data based on message type
    if (!this.roomCode) return
    const roomData = this.getRoomData(this.roomCode)
    if (!roomData) return

    switch (message.type) {
      case "player_join":
        if (!roomData.players[message.playerId]) {
          roomData.players[message.playerId] = {
            id: message.playerId,
            name: message.data.playerName,
            role: null,
            isHost: message.data.isHost,
            isReady: false,
            x: 6,
            y: 6,
            lastSeen: Date.now(),
          }
          this.saveRoomData(this.roomCode, roomData)
        }
        break

      case "player_leave":
        if (roomData.players[message.playerId]) {
          delete roomData.players[message.playerId]
          this.saveRoomData(this.roomCode, roomData)
        }
        break

      case "player_ready":
        if (roomData.players[message.playerId]) {
          roomData.players[message.playerId].isReady = message.data.ready
          this.saveRoomData(this.roomCode, roomData)
        }
        break

      case "player_move":
        if (roomData.players[message.playerId]) {
          roomData.players[message.playerId].x = message.data.x
          roomData.players[message.playerId].y = message.data.y
          roomData.players[message.playerId].lastSeen = Date.now()
          this.saveRoomData(this.roomCode, roomData)
        }
        break

      case "game_state_update":
        roomData.gameState = message.data.state
        this.saveRoomData(this.roomCode, roomData)
        break

      case "chat_message":
        roomData.messages.push(message.data)
        if (roomData.messages.length > 100) {
          roomData.messages = roomData.messages.slice(-100)
        }
        this.saveRoomData(this.roomCode, roomData)
        break
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (!this.roomCode) return

      const roomData = this.getRoomData(this.roomCode)
      if (roomData && roomData.players[this.playerId]) {
        roomData.players[this.playerId].lastSeen = Date.now()
        this.saveRoomData(this.roomCode, roomData)
      }
    }, HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private cleanupDisconnectedPlayers(): void {
    if (!this.roomCode) return

    const roomData = this.getRoomData(this.roomCode)
    if (!roomData) return

    const now = Date.now()
    let changed = false

    for (const [playerId, player] of Object.entries(roomData.players)) {
      if (now - player.lastSeen > PLAYER_TIMEOUT) {
        delete roomData.players[playerId]
        changed = true
      }
    }

    if (changed) {
      this.saveRoomData(this.roomCode, roomData)
    }
  }

  private getRoomData(roomCode: string): RoomData | null {
    try {
      const json = localStorage.getItem(`${STORAGE_KEY_PREFIX}${roomCode}`)
      return json ? JSON.parse(json) : null
    } catch {
      return null
    }
  }

  private saveRoomData(roomCode: string, data: RoomData): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${roomCode}`, JSON.stringify(data))
    } catch (err) {
      console.error("[LocalMultiplayer] Failed to save room data:", err)
    }
  }

  getPlayerId(): string {
    return this.playerId
  }
}

// Singleton instance
let managerInstance: LocalMultiplayerManager | null = null

export function getLocalMultiplayerManager(): LocalMultiplayerManager {
  if (!managerInstance) {
    managerInstance = new LocalMultiplayerManager()
  }
  return managerInstance
}
