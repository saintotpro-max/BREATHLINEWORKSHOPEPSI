/**
 * Supabase Realtime Subscription Utilities
 * Handles real-time game state synchronization between players
 */

"use client"

import { createClient } from "@supabase/supabase-js"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { GameSnapshot } from "@/state/types"

// Initialize Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("[Supabase] Missing environment variables. Realtime disabled.")
      return null
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey)
    console.log("[Supabase] Client initialized")
  }

  return supabaseClient
}

/**
 * Subscribe to game state changes for a specific room
 * @param roomId - Unique room identifier
 * @param onUpdate - Callback when state changes
 * @returns Unsubscribe function
 */
export function subscribeToGameState(
  roomId: string,
  onUpdate: (state: GameSnapshot) => void,
): (() => void) | null {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  console.log(`[Realtime] Subscribing to game state for room: ${roomId}`)

  // Create channel for this room
  const channel: RealtimeChannel = supabase
    .channel(`game-state:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to INSERT, UPDATE, DELETE
        schema: "public",
        table: "game_states",
        filter: `room_id=eq.${roomId}`,
      },
      (payload: any) => {
        console.log("[Realtime] Game state changed:", payload)

        if (payload.new && payload.new.state) {
          onUpdate(payload.new.state as GameSnapshot)
        }
      },
    )
    .subscribe((status) => {
      console.log(`[Realtime] Subscription status: ${status}`)
    })

  // Return unsubscribe function
  return () => {
    console.log(`[Realtime] Unsubscribing from room: ${roomId}`)
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to chat messages for a specific room
 * @param roomId - Unique room identifier
 * @param onMessage - Callback when new message arrives
 * @returns Unsubscribe function
 */
export function subscribeToChatMessages(
  roomId: string,
  onMessage: (message: { id: string; user_id: string; user_name: string; message: string; created_at: string }) => void,
): (() => void) | null {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  console.log(`[Realtime] Subscribing to chat for room: ${roomId}`)

  const channel: RealtimeChannel = supabase
    .channel(`chat:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `room=eq.${roomId}`,
      },
      (payload: any) => {
        console.log("[Realtime] New chat message:", payload)

        if (payload.new) {
          onMessage(payload.new)
        }
      },
    )
    .subscribe((status) => {
      console.log(`[Realtime] Chat subscription status: ${status}`)
    })

  return () => {
    console.log(`[Realtime] Unsubscribing from chat: ${roomId}`)
    supabase.removeChannel(channel)
  }
}

/**
 * Update game state in database (triggers real-time update for all subscribers)
 * @param roomId - Unique room identifier
 * @param state - Game snapshot to save
 */
export async function updateGameState(roomId: string, state: GameSnapshot): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) return

  try {
    const { error } = await supabase
      .from("game_states")
      .upsert(
        {
          id: `game-${roomId}`,
          room_id: roomId,
          state: state,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

    if (error) {
      console.error("[Supabase] Error updating game state:", error)
    } else {
      console.log("[Supabase] Game state updated successfully")
    }
  } catch (err) {
    console.error("[Supabase] Exception updating game state:", err)
  }
}

/**
 * Send a chat message to the room
 * @param roomId - Unique room identifier
 * @param userId - User ID
 * @param userName - User display name
 * @param message - Message text
 */
export async function sendChatMessage(
  roomId: string,
  userId: string,
  userName: string,
  message: string,
): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) return

  try {
    const { error } = await supabase.from("chat_messages").insert({
      room: roomId,
      user_id: userId,
      user_name: userName,
      message: message,
    })

    if (error) {
      console.error("[Supabase] Error sending message:", error)
    } else {
      console.log("[Supabase] Message sent successfully")
    }
  } catch (err) {
    console.error("[Supabase] Exception sending message:", err)
  }
}

/**
 * Load chat history for a room
 * @param roomId - Unique room identifier
 * @param limit - Maximum number of messages to retrieve
 * @returns Array of chat messages
 */
export async function loadChatHistory(
  roomId: string,
  limit: number = 50,
): Promise<Array<{ id: string; user_id: string; user_name: string; message: string; created_at: string }>> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room", roomId)
      .order("created_at", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("[Supabase] Error loading chat history:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("[Supabase] Exception loading chat history:", err)
    return []
  }
}

/**
 * Load current game state for a room
 * @param roomId - Unique room identifier
 * @returns Game snapshot or null
 */
export async function loadGameState(roomId: string): Promise<GameSnapshot | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from("game_states")
      .select("state")
      .eq("room_id", roomId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No row found - this is normal for a new room
        console.log("[Supabase] No existing game state for room:", roomId)
        return null
      }
      console.error("[Supabase] Error loading game state:", error)
      return null
    }

    return data?.state as GameSnapshot
  } catch (err) {
    console.error("[Supabase] Exception loading game state:", err)
    return null
  }
}

/**
 * Generate a random room code (4 characters)
 * @returns Room code (e.g. "ABCD")
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Exclude confusing chars (I, O, 0, 1)
  let code = ""
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Check if Supabase is configured and available
 * @returns true if configured, false otherwise
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
