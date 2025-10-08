import { useMemo } from "react"

interface ObjectiveStep {
  id: string
  text: string
  role?: string
  completed: boolean
  current: boolean
  puzzleId?: string
}

interface UseObjectivesProps {
  currentRoomId: string
  puzzleState: Record<string, { solved?: boolean; success?: boolean }>
}

// Définition des objectifs par salle
const roomObjectives: Record<string, ObjectiveStep[]> = {
  R1: [
    {
      id: "R1_read_panel",
      text: "📊 Lire les données CO₂",
      role: "Analyst",
      completed: false,
      current: false,
      puzzleId: "step1_readPanel"
    },
    {
      id: "R1_enter_code",
      text: "⌨️ Entrer le code B14",
      role: "Operator",
      completed: false,
      current: false,
      puzzleId: "step2_enterCode"
    },
    {
      id: "R1_switches",
      text: "🔧 Activer Switch A & B (simultané)",
      role: "Tech",
      completed: false,
      current: false,
      puzzleId: "step3_switches"
    },
    {
      id: "R1_confirm",
      text: "✅ Valider le système HVAC",
      role: "Analyst",
      completed: false,
      current: false,
      puzzleId: "step4_confirm"
    }
  ],
  R2: [
    {
      id: "R2_read_graph",
      text: "Analyser le graphique CO₂",
      role: "Analyst",
      completed: false,
      current: false
    },
    {
      id: "R2_valve_sequence",
      text: "Ouvrir les valves dans l'ordre",
      role: "Tech",
      completed: false,
      current: false
    },
    {
      id: "R2_activate_filters",
      text: "Activer les 3 filtres",
      role: "Operator",
      completed: false,
      current: false
    }
  ],
  R3: [
    {
      id: "R3_button_sequence",
      text: "Activer boutons A→B→C",
      role: "Tech",
      completed: false,
      current: false
    },
    {
      id: "R3_sync_switches",
      text: "Synchroniser les switches",
      role: "Tech",
      completed: false,
      current: false
    },
    {
      id: "R3_launch_hvac",
      text: "Lancer le système HVAC",
      role: "Operator",
      completed: false,
      current: false
    }
  ]
}

export function useObjectives({ currentRoomId, puzzleState }: UseObjectivesProps) {
  const objectives = useMemo(() => {
    const baseObjectives = roomObjectives[currentRoomId] || []
    
    // Mettre à jour l'état de chaque objectif
    let firstIncomplete = -1
    const updated = baseObjectives.map((obj, index) => {
      // Vérifier si le puzzle est résolu
      const isCompleted = obj.puzzleId 
        ? (puzzleState[obj.puzzleId]?.solved || puzzleState[obj.puzzleId]?.success || false)
        : false
      
      // Le premier objectif non complété est "current"
      const isCurrent = firstIncomplete === -1 && !isCompleted
      if (isCurrent) firstIncomplete = index
      
      return {
        ...obj,
        completed: isCompleted,
        current: isCurrent
      }
    })
    
    return updated
  }, [currentRoomId, puzzleState])

  const currentObjective = objectives.find(obj => obj.current)
  const nextObjectives = objectives.filter(obj => !obj.completed && !obj.current).slice(0, 2)
  const completedCount = objectives.filter(obj => obj.completed).length
  const totalCount = objectives.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return {
    objectives,
    currentObjective,
    nextObjectives,
    completedCount,
    totalCount,
    progress,
    allCompleted: completedCount === totalCount && totalCount > 0
  }
}
