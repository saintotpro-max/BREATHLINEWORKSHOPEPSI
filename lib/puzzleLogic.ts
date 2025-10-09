/**
 * Pure functions for puzzle validation and state updates.
 * All puzzle logic is deterministic and side-effect free.
 */

import type {
  GameSnapshot,
  MultiSwitchPuzzle,
  MultiValvePuzzle,
  InfoSplitPuzzle,
  SequencePuzzle,
  WeightPlatePuzzle,
  Puzzle,
  GameObject,
  PlayerState,
} from "@/state/types"

/**
 * Calculate Chebyshev distance (chessboard distance) between two points
 * This is more appropriate for isometric games than Manhattan distance
 */
export function chebyshevDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2))
}

/**
 * Calculate Manhattan distance between two points
 * @deprecated Use chebyshevDistance for isometric games
 */
export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

/**
 * Check if all players are at minimum distance from each other
 */
export function checkPlayerDistances(players: Map<string, PlayerState>, minTiles: number): boolean {
  const playerArray = Array.from(players.values())
  if (playerArray.length < 2) return true // Solo mode always passes

  for (let i = 0; i < playerArray.length; i++) {
    for (let j = i + 1; j < playerArray.length; j++) {
      const dist = chebyshevDistance(playerArray[i].x, playerArray[i].y, playerArray[j].x, playerArray[j].y)
      if (dist < minTiles) return false
    }
  }
  return true
}

/**
 * Check multiSwitch puzzle completion
 */
export function checkMultiSwitch(
  puzzle: MultiSwitchPuzzle,
  snapshot: GameSnapshot,
  players: Map<string, PlayerState>,
  debugSolo: boolean,
): { success: boolean; reason?: string } {
  // Check prerequisites first
  if (puzzle.requires && !checkPrerequisites(puzzle.requires, snapshot)) {
    return { success: false, reason: "Prerequisites not met" }
  }

  // Check if all switches are ON
  const allOn = puzzle.ids.every((id) => {
    const obj = snapshot.objects[id]
    return obj && obj.state === "on"
  })

  if (!allOn) {
    return { success: false, reason: "Not all switches activated" }
  }

  // Check distance gate
  if (puzzle.distanceGate && !debugSolo) {
    const distanceOk = checkPlayerDistances(players, puzzle.distanceGate.minTiles)
    if (!distanceOk) {
      return { success: false, reason: "Players too close together" }
    }
  }

  // Check simultaneity window (if required)
  if (puzzle.simultaneous && !debugSolo) {
    const puzzleState = snapshot.puzzles[puzzle.id] || {}
    const lastActivations = puzzle.ids.map((id) => puzzleState[`${id}_ts`] || 0)
    const maxTs = Math.max(...lastActivations)
    const minTs = Math.min(...lastActivations.filter((t) => t > 0))

    if (maxTs - minTs > puzzle.windowMs) {
      return { success: false, reason: "Switches not activated simultaneously" }
    }
  }

  return { success: true }
}

/**
 * Check infoSplit puzzle completion
 */
export function checkInfoSplit(puzzle: InfoSplitPuzzle, snapshot: GameSnapshot): { success: boolean; reason?: string } {
  // Check prerequisites first
  if (puzzle.requires && !checkPrerequisites(puzzle.requires, snapshot)) {
    return { success: false, reason: "Prerequisites not met" }
  }

  const consoleObj = snapshot.objects[puzzle.targetConsole]
  if (!consoleObj || !consoleObj.lastInput) {
    return { success: false, reason: "No code entered" }
  }

  // Get the correct code from the source panel
  const panelObj = snapshot.objects[puzzle.sourcePanel]
  // FIX: Chercher dans panel.code au lieu de content.code
  const correctCode = panelObj?.panel?.code || panelObj?.content?.code
  
  if (!correctCode) {
    return { success: false, reason: "Panel code not found" }
  }

  const correct = consoleObj.lastInput === correctCode
  return {
    success: correct,
    reason: correct ? undefined : "Incorrect code",
  }
}

/**
 * Check sequence puzzle completion
 */
export function checkSequence(
  puzzle: SequencePuzzle,
  snapshot: GameSnapshot,
): { success: boolean; progress: number; reason?: string } {
  const puzzleState = snapshot.puzzles[puzzle.id] || {}
  const currentStep = puzzleState.currentStep || 0

  if (currentStep >= puzzle.order.length) {
    return { success: true, progress: puzzle.order.length }
  }

  return {
    success: false,
    progress: currentStep,
    reason: `Step ${currentStep + 1}/${puzzle.order.length}`,
  }
}

/**
 * Check weightPlate puzzle completion
 */
export function checkWeightPlate(
  puzzle: WeightPlatePuzzle,
  snapshot: GameSnapshot,
  players: Map<string, PlayerState>,
): { success: boolean; reason?: string } {
  for (const plate of puzzle.plates) {
    const plateObj = snapshot.objects[plate.id]
    if (!plateObj) continue

    const playersOnPlate = Array.from(players.values()).filter((p) => p.x === plateObj.x && p.y === plateObj.y)

    let currentWeight = playersOnPlate.length

    // Check if item is on plate
    if (plate.need.includes("chock") || plate.need.includes("item")) {
      const itemOnPlate = plateObj.hasItem || false
      if (itemOnPlate) currentWeight += 1
    }

    if (currentWeight < plateObj.requiredWeight) {
      return { success: false, reason: `Plate ${plate.id} needs more weight` }
    }
  }

  return { success: true }
}

/**
 * Check multiValve puzzle completion (same logic as multiSwitch but for valves)
 */
export function checkMultiValve(
  puzzle: MultiValvePuzzle,
  snapshot: GameSnapshot,
  players: Map<string, PlayerState>,
  debugSolo: boolean,
): { success: boolean; reason?: string } {
  // Check if all valves are ON
  const allOn = puzzle.ids.every((id) => {
    const obj = snapshot.objects[id]
    return obj && obj.state === "on"
  })

  if (!allOn) {
    return { success: false, reason: "Not all valves activated" }
  }

  // Check distance gate
  if (puzzle.distanceGate && !debugSolo) {
    const distanceOk = checkPlayerDistances(players, puzzle.distanceGate.minTiles)
    if (!distanceOk) {
      return { success: false, reason: "Players too close together" }
    }
  }

  // Check simultaneity window (if required)
  if (puzzle.simultaneous && !debugSolo) {
    const puzzleState = snapshot.puzzles[puzzle.id] || {}
    const lastActivations = puzzle.ids.map((id) => puzzleState[`${id}_ts`] || 0)
    const maxTs = Math.max(...lastActivations)
    const minTs = Math.min(...lastActivations.filter((t) => t > 0))

    if (maxTs - minTs > puzzle.windowMs) {
      return { success: false, reason: "Valves not activated simultaneously" }
    }
  }

  return { success: true }
}

/**
 * Update puzzle state after an interaction
 */
export function updatePuzzleState(
  puzzle: Puzzle,
  action: { type: string; objectId?: string; timestamp: number },
  snapshot: GameSnapshot,
  players: Map<string, PlayerState>,
  debugSolo: boolean,
): GameSnapshot {
  const newSnapshot = { 
    ...snapshot,
    puzzles: { ...snapshot.puzzles }
  }
  const puzzleState = { ...(newSnapshot.puzzles[puzzle.id] || {}) }

  switch (puzzle.type) {
    case "multiSwitch": {
      const msPuzzle = puzzle as MultiSwitchPuzzle
      if (action.type === "toggle" && action.objectId) {
        // Record activation timestamp
        puzzleState[`${action.objectId}_ts`] = action.timestamp

        // In debug solo mode with latching, keep switches on
        if (debugSolo && msPuzzle.debugSolo.latched) {
          setTimeout(() => {
            // Switches stay on for latchMs
          }, msPuzzle.debugSolo.latchMs)
        }
      }

      // Check completion
      const result = checkMultiSwitch(msPuzzle, newSnapshot, players, debugSolo)
      puzzleState.success = result.success
      puzzleState.reason = result.reason
      break
    }

    case "multiValve": {
      const mvPuzzle = puzzle as MultiValvePuzzle
      if (action.type === "toggle" && action.objectId) {
        // Record activation timestamp
        puzzleState[`${action.objectId}_ts`] = action.timestamp

        // In debug solo mode with latching, keep valves on
        if (debugSolo && mvPuzzle.debugSolo.latched) {
          setTimeout(() => {
            // Valves stay on for latchMs
          }, mvPuzzle.debugSolo.latchMs)
        }
      }

      // Check completion
      const result = checkMultiValve(mvPuzzle, newSnapshot, players, debugSolo)
      puzzleState.success = result.success
      puzzleState.reason = result.reason
      break
    }

    case "sequence": {
      const seqPuzzle = puzzle as SequencePuzzle
      if (action.type === "activate" && action.objectId) {
        const currentStep = puzzleState.currentStep || 0
        const expectedId = seqPuzzle.order[currentStep]

        if (action.objectId === expectedId) {
          // Correct step
          puzzleState.currentStep = currentStep + 1
          puzzleState.lastStepTs = action.timestamp

          if (currentStep + 1 >= seqPuzzle.order.length) {
            puzzleState.success = true
          }
        } else if (seqPuzzle.resetOnError) {
          // Wrong step - reset
          puzzleState.currentStep = 0
          puzzleState.locked = true
          puzzleState.lockUntil = action.timestamp + seqPuzzle.lockMs
          newSnapshot.errors = (newSnapshot.errors || 0) + 1
        }
      }

      // Check if lock expired
      if (puzzleState.locked && action.timestamp > puzzleState.lockUntil) {
        puzzleState.locked = false
      }
      break
    }

    case "weightPlate": {
      const wpPuzzle = puzzle as WeightPlatePuzzle
      // Weight plates are checked continuously based on player positions
      const result = checkWeightPlate(wpPuzzle, newSnapshot, players)
      puzzleState.success = result.success
      puzzleState.reason = result.reason
      break
    }

    case "infoSplit": {
      const infoPuzzle = puzzle as InfoSplitPuzzle
      
      // FIX: Gérer panelRead pour les puzzles où targetConsole === sourcePanel (lecture simple)
      if (action.type === "panelRead") {
        // Si c'est juste une lecture (panel → panel), marquer comme réussi
        if (infoPuzzle.targetConsole === infoPuzzle.sourcePanel) {
          puzzleState.success = true
          puzzleState.reason = undefined
        }
      }
      
      // InfoSplit is checked when console input is submitted
      if (action.type === "consoleSubmit") {
        const result = checkInfoSplit(infoPuzzle, newSnapshot)
        puzzleState.success = result.success
        puzzleState.reason = result.reason
      }
      break
    }
  }

  newSnapshot.puzzles[puzzle.id] = puzzleState
  return newSnapshot
}

/**
 * Check if a room is complete (all puzzles solved)
 */
export function checkRoomCompletion(roomPuzzles: Puzzle[], snapshot: GameSnapshot): boolean {
  return roomPuzzles.every((puzzle) => {
    const state = snapshot.puzzles[puzzle.id]
    return state && state.success === true
  })
}

/**
 * Check if prerequisites are satisfied
 */
export function checkPrerequisites(requires: string[] | undefined, snapshot: GameSnapshot): boolean {
  if (!requires || requires.length === 0) {
    return true // No prerequisites
  }

  // All required puzzles must be completed
  return requires.every((puzzleId) => {
    const puzzleState = snapshot.puzzles[puzzleId]
    return puzzleState && puzzleState.success === true
  })
}

/**
 * Check if player can interact with an object
 */
export function canInteract(
  player: PlayerState, 
  obj: GameObject, 
  adjacencyRange: number, 
  snapshot?: GameSnapshot,
  debugMode = false,
  gameDefinition?: any
): boolean {
  const distance = chebyshevDistance(player.x, player.y, obj.x, obj.y)

  if (distance > adjacencyRange) {
    console.log(`[v0] Distance check failed: ${distance} > ${adjacencyRange}`)
    return false
  }

  if (debugMode) {
    return true
  }

  // Check role lock
  if (obj.roleLock && player.role !== obj.roleLock) {
    console.log(`[v0] Role check failed: ${player.role} cannot interact with ${obj.roleLock}-locked object`)
    return false
  }

  // Check prerequisites
  if (snapshot && obj.requires) {
    const prereqsMet = checkPrerequisites(obj.requires, snapshot)
    if (!prereqsMet) {
      console.log(`[v0] Prerequisites not met for ${obj.id}:`, obj.requires)
      return false
    }
  }

  // NOUVEAU: Vérifier si le puzzle associé à cet objet est déjà résolu
  if (snapshot && gameDefinition) {
    const allPuzzles = gameDefinition.rooms.flatMap((r: any) => r.puzzles || [])
    
    // Trouver les puzzles liés à cet objet
    const relatedPuzzles = allPuzzles.filter((puzzle: Puzzle) => {
      // Panel: sourcePanel === obj.id && targetConsole === obj.id (lecture simple)
      if (obj.type === "panel" && puzzle.type === "infoSplit") {
        return puzzle.sourcePanel === obj.id && puzzle.targetConsole === obj.id
      }
      // Console: targetConsole === obj.id
      if (obj.type === "console" && puzzle.type === "infoSplit") {
        return puzzle.targetConsole === obj.id
      }
      // Switch/Valve: ids.includes(obj.id)
      if ((obj.type === "switch" || obj.type === "valve") && (puzzle.type === "multiSwitch" || puzzle.type === "multiValve")) {
        return puzzle.ids?.includes(obj.id)
      }
      return false
    })

    // Si un des puzzles liés est déjà résolu, bloquer l'interaction
    const alreadySolved = relatedPuzzles.some((puzzle: Puzzle) => {
      return snapshot.puzzles[puzzle.id]?.success === true
    })

    if (alreadySolved) {
      console.log(`[v0] Object ${obj.id} already completed`)
      return false
    }
  }

  return true
}
