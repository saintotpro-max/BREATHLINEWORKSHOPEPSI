"use client"

import { useState } from "react"
import { Book, ChevronRight, Check, Lock, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MissionPhase {
  id: string
  title: string
  room: string
  tasks: Array<{ id: string; text: string; completed: boolean }>
  completed: boolean
  locked: boolean
}

interface MissionJournalProps {
  currentRoomId: string
  snapshot: any
  gameData: any
}

export function MissionJournal({ currentRoomId, snapshot, gameData }: MissionJournalProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Définir les phases de mission
  const getPhases = (): MissionPhase[] => {
    const phases: MissionPhase[] = [
      {
        id: "phase1",
        title: "PHASE 1: STABILISATION",
        room: "Control Room",
        tasks: [
          { 
            id: "code", 
            text: "Déchiffrer le code console (Analyst → Operator)",
            completed: snapshot.puzzles?.["infoSplit_R1"]?.success || false
          },
          { 
            id: "switches", 
            text: "Activer switches A & B simultanément (Tech)",
            completed: snapshot.puzzles?.["multiSwitch_R1"]?.success || false
          },
          { 
            id: "door", 
            text: "Ouvrir la porte vers Lab Filtration",
            completed: snapshot.objects?.["doorR1"]?.open || false
          }
        ],
        completed: snapshot.puzzles?.["multiSwitch_R1"]?.success && snapshot.objects?.["doorR1"]?.open,
        locked: false
      },
      {
        id: "phase2",
        title: "PHASE 2: FILTRATION",
        room: "Lab Filtration",
        tasks: [
          { 
            id: "graph", 
            text: "Analyser le graphique CO₂ (Analyst)",
            completed: false
          },
          { 
            id: "sequence", 
            text: "Déterminer séquence valves",
            completed: false
          },
          { 
            id: "activate", 
            text: "Activer filtration multi-étages",
            completed: false
          }
        ],
        completed: false,
        locked: currentRoomId === "R1"
      },
      {
        id: "phase3",
        title: "PHASE 3: REDÉMARRAGE HVAC",
        room: "Central HVAC",
        tasks: [
          { 
            id: "code", 
            text: "Entrer code de sécurité final",
            completed: false
          },
          { 
            id: "sync", 
            text: "Synchroniser modules HVAC",
            completed: false
          },
          { 
            id: "exit", 
            text: "Déverrouiller sortie d'évacuation",
            completed: false
          }
        ],
        completed: false,
        locked: currentRoomId !== "R3"
      }
    ]
    
    return phases
  }
  
  const phases = getPhases()
  const currentPhase = phases.find(p => !p.completed && !p.locked) || phases[0]
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 left-4 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
      >
        <Book className="w-5 h-5" />
        <span className="font-semibold">Journal</span>
        {currentPhase && !currentPhase.completed && (
          <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
            {currentPhase.tasks.filter(t => !t.completed).length}
          </span>
        )}
      </button>
    )
  }
  
  return (
    <div className="fixed top-20 left-4 z-40 w-96 bg-black/90 backdrop-blur-md rounded-lg border border-gray-700 shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-white" />
          <h3 className="text-white font-bold">Journal de Mission</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
        >
          ✕
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Objectif principal */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-400 font-semibold text-sm mb-1">🎯 OBJECTIF PRINCIPAL</div>
          <div className="text-white text-sm">
            Restaurer le système de ventilation avant évacuation forcée
          </div>
        </div>
        
        {/* Phases */}
        <div className="space-y-3">
          {phases.map((phase, idx) => {
            const isActive = phase.id === currentPhase?.id
            
            return (
              <div 
                key={phase.id}
                className={`rounded-lg border transition-all ${
                  phase.completed 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : isActive 
                      ? 'bg-blue-900/30 border-blue-500' 
                      : phase.locked
                        ? 'bg-gray-800/30 border-gray-700'
                        : 'bg-gray-800/50 border-gray-600'
                }`}
              >
                {/* Phase Header */}
                <div className="px-3 py-2 flex items-center gap-2">
                  {phase.completed ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : isActive ? (
                    <ChevronRight className="w-5 h-5 text-blue-400" />
                  ) : phase.locked ? (
                    <Lock className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${
                      phase.completed ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {phase.title}
                    </div>
                    <div className="text-xs text-gray-500">{phase.room}</div>
                  </div>
                  {phase.completed && (
                    <span className="text-xs text-green-400 font-semibold">TERMINÉ</span>
                  )}
                  {phase.locked && (
                    <span className="text-xs text-gray-500">VERROUILLÉ</span>
                  )}
                </div>
                
                {/* Tasks */}
                {!phase.locked && (
                  <div className="px-3 pb-2 space-y-1">
                    {phase.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        {task.completed ? (
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        )}
                        <span className={task.completed ? 'text-gray-400 line-through' : 'text-gray-300'}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Stats */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <div className="text-gray-400 text-xs font-semibold mb-2">📊 STATISTIQUES</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-300">
              Temps: {Math.floor(snapshot.timerMs / 60000)}:{String(Math.floor((snapshot.timerMs % 60000) / 1000)).padStart(2, '0')}
            </div>
            <div className="text-gray-300">
              Score: {snapshot.score}/100
            </div>
            <div className="text-gray-300">
              Indices: {snapshot.hintsUsed}/2
            </div>
            <div className="text-gray-300">
              Erreurs: {snapshot.errors}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
