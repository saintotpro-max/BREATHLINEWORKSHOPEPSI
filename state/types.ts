/**
 * Type definitions for the educational escape game system.
 * Defines all game objects, puzzles, state, and network contracts.
 */

export type Role = "Analyst" | "Tech" | "Operator" | "Logistician"

export type ObjectState = "off" | "on" | "red" | "green"

export interface BaseObject {
  id: string
  type: string
  name?: string
  x: number
  y: number
  tooltip?: string
  roleLock?: Role
  requires?: string[]
  miniGame?: string
}

export interface SwitchObject extends BaseObject {
  type: "switch"
  state: ObjectState
  cooldownMs: number
  ledId?: string
  debriefing?: any
}

export interface ValveObject extends BaseObject {
  type: "valve"
  state: ObjectState
  cooldownMs: number
}

export interface PanelObject extends BaseObject {
  type: "panel"
  panel?: {
    title: string
    text: string
    code?: string
    imageId?: string
    debriefing?: any
  }
  content?: {
    title: string
    text: string
    code?: string
    imageId?: string
  }
}

export interface ConsoleObject extends BaseObject {
  type: "console"
  accept?: "code4" | "codeN" | "sequence"
  validFormatRegex?: string
  sequenceTargets?: string[]
  perStepWindowMs?: number
  cooldownMs?: number
  console?: {
    accept: "code4" | "codeN" | "sequence"
    validFormatRegex?: string
    correctCode?: string
  }
  lastInput?: string
  correct?: boolean
  debriefing?: any
}

export interface WeightPlateObject extends BaseObject {
  type: "weightPlate"
  requiredWeight: number
  acceptsItemId?: string
}

export interface ItemObject extends BaseObject {
  type: "item"
  carriedBy: string | null
}

export interface DoorObject extends BaseObject {
  type: "door"
  open: boolean
  lockedBy?: string[]
}

export interface LEDObject extends BaseObject {
  type: "led"
  state: "red" | "green"
  label: "OFF" | "ON"
  bindsTo?: string
}

export type GameObject =
  | SwitchObject
  | ValveObject
  | PanelObject
  | ConsoleObject
  | WeightPlateObject
  | ItemObject
  | DoorObject
  | LEDObject

export interface MultiSwitchPuzzle {
  id: string
  type: "multiSwitch"
  ids: string[]
  simultaneous: boolean
  playersRequired: number
  windowMs: number
  distanceGate: { minTiles: number }
  debugSolo: { latched: boolean; latchMs: number }
  requires?: string[]
}

export interface InfoSplitPuzzle {
  id: string
  type: "infoSplit"
  sourcePanel: string
  targetConsole: string
  codeFormat: string
  soloNote: boolean
  requires?: string[]
}

export interface SequencePuzzle {
  id: string
  type: "sequence"
  order: string[]
  resetOnError: boolean
  lockMs: number
  perStepWindowMs?: number
}

export interface WeightPlatePuzzle {
  id: string
  type: "weightPlate"
  plates: Array<{ id: string; need: string }>
}

export interface MultiValvePuzzle {
  id: string
  type: "multiValve"
  ids: string[]
  simultaneous: boolean
  playersRequired: number
  windowMs: number
  distanceGate: { minTiles: number }
  debugSolo: { latched: boolean; latchMs: number }
}

export type Puzzle = MultiSwitchPuzzle | InfoSplitPuzzle | SequencePuzzle | WeightPlatePuzzle | MultiValvePuzzle

export interface Pedagogy {
  title: string
  lines: string[]
  quiz: {
    q: string
    choices: string[]
    correctIndex: number
  }
  analystContext?: string
}

export interface Room {
  id: string
  name: string
  grid: { cols: number; rows: number }
  spawn: { x: number; y: number }
  objects: GameObject[]
  puzzles: Puzzle[]
  successCondition: string
  outputs: {
    keys?: string[]
    codePart?: string
  }
  pedagogy?: Pedagogy
  hint?: string
  finalCodeRule?: string
}

export interface GameDefinition {
  title: string
  description: string
  timer: {
    durationMs: number
    penaltyAfterMs: number
    penaltyPerMinute: number
  }
  audio: {
    bgm: string
    sfx: {
      click: string
      unlock: string
      error: string
    }
  }
  roles: Role[]
  ui: {
    adjacencyRange: number
    controls: Record<string, string>
  }
  scoring: {
    baseScore: number
    maxHints: number
    hintCost: number
    errorPenalty: number
  }
  debugSolo: {
    enabled: boolean
    latchMs: number
    showStickyNotes: boolean
    roleSwitch: boolean
    hotspots: boolean
  }
  rooms: Room[]
  contracts: any
  fsm: any
  validationRules: any
  iotHooks: any
}

export interface GameSnapshot {
  roomId: string
  timerMs: number
  score: number
  errors: number
  hintsUsed: number
  objects: Record<string, any>
  puzzles: Record<string, any>
  keys: string[]
  codeParts: Record<string, string>
}

export interface PlayerState {
  sessionId: string
  displayName: string
  role: Role | null
  x: number
  y: number
  facing: "N" | "S" | "E" | "W"
}

// Network message types
export interface Envelope<T = any> {
  type: string
  ts: number
  rid: string | null
  rev: number
  payload: T
}

export type ClientMessage =
  | { type: "Join"; displayName: string; roomId: string }
  | { type: "ChooseRole"; role: Role }
  | { type: "MoveIntent"; to: { x: number; y: number } }
  | { type: "InteractIntent"; objectId: string }
  | { type: "ConsoleSubmit"; consoleId: string; input: string }
  | { type: "PickPlaceIntent"; itemId: string; action: "pick" | "place"; targetX?: number; targetY?: number }
  | { type: "UseHint"; roomId: string }
  | { type: "RequestSnapshot" }
  | { type: "Chat"; text: string }

export type ServerMessage =
  | { type: "Snapshot"; state: GameSnapshot }
  | { type: "PlayerJoined"; sessionId: string; displayName: string }
  | { type: "PlayerLeft"; sessionId: string }
  | { type: "PlayerMoved"; sessionId: string; x: number; y: number }
  | { type: "ObjectState"; objectId: string; state: any }
  | { type: "PuzzleProgress"; roomId: string; progress: any }
  | { type: "PuzzleSolved"; roomId: string }
  | { type: "DoorOpened"; doorId: string }
  | { type: "Timer"; timerMs: number }
  | { type: "Score"; score: number; errors: number; hintsUsed: number }
  | { type: "HintUsed"; roomId: string; remaining: number }
  | { type: "Error"; code: string; message: string }
  | { type: "GameOver"; cause: "win" | "timeout" | "reset" }
