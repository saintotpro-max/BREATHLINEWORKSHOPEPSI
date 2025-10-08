import { useState, useCallback } from "react"

interface DebriefingContent {
  title: string
  explanation: string
  didYouKnow: string
  realWorldApplication: string
  unlocked?: string
}

interface Debriefing {
  id: string
  content: DebriefingContent
}

export function useDebriefingManager() {
  const [debriefings, setDebriefings] = useState<Debriefing[]>([])

  const addDebriefing = useCallback((puzzleId: string, debriefing: any) => {
    const content: DebriefingContent = {
      title: debriefing.title || "Énigme résolue!",
      explanation: debriefing.explanation || "",
      didYouKnow: debriefing.didYouKnow || "",
      realWorldApplication: debriefing.realWorld || debriefing.realWorldApplication || "",
      unlocked: debriefing.unlocked
    }

    setDebriefings(prev => [...prev, {
      id: `${puzzleId}-${Date.now()}`,
      content
    }])
  }, [])

  const dismissDebriefing = useCallback((id: string) => {
    setDebriefings(prev => prev.filter(d => d.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setDebriefings([])
  }, [])

  return {
    debriefings,
    addDebriefing,
    dismissDebriefing,
    clearAll,
    hasDebriefing: debriefings.length > 0
  }
}
