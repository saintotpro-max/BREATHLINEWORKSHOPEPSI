import { useState, useCallback } from "react"

interface Notification {
  id: string
  message: string
  type: "success" | "warning" | "info"
  playerName?: string
  timestamp: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((
    message: string,
    type: "success" | "warning" | "info" = "info",
    playerName?: string
  ) => {
    const id = `notif-${Date.now()}-${Math.random()}`
    const notification: Notification = {
      id,
      message,
      type,
      playerName,
      timestamp: Date.now()
    }

    setNotifications(prev => [...prev, notification])

    // Auto-remove après 4 secondes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4000)

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Notifications spécifiques au jeu
  const notifyPuzzleSolved = useCallback((puzzleName: string, playerName?: string) => {
    addNotification(
      `a résolu: ${puzzleName}`,
      "success",
      playerName
    )
  }, [addNotification])

  const notifyObjectComplete = useCallback((objectName: string, playerName?: string) => {
    addNotification(
      `a activé: ${objectName}`,
      "success",
      playerName
    )
  }, [addNotification])

  const notifyRoomComplete = useCallback((roomName: string) => {
    addNotification(
      `Salle complétée: ${roomName}! Passage déverrouillé`,
      "success"
    )
  }, [addNotification])

  const notifyError = useCallback((message: string) => {
    addNotification(
      message,
      "warning"
    )
  }, [addNotification])

  const notifyInfo = useCallback((message: string) => {
    addNotification(
      message,
      "info"
    )
  }, [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    // Helpers spécifiques
    notifyPuzzleSolved,
    notifyObjectComplete,
    notifyRoomComplete,
    notifyError,
    notifyInfo
  }
}
