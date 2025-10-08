/**
 * Zod schema validators for the game JSON definition.
 * Ensures strict parsing and type safety at runtime.
 */

import { z } from "zod"

const RoleSchema = z.enum(["Analyst", "Tech", "Operator", "Logistician"])

const BaseObjectSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  tooltip: z.string().optional(),
  roleLock: RoleSchema.optional(),
})

const SwitchObjectSchema = BaseObjectSchema.extend({
  type: z.literal("switch"),
  state: z.enum(["off", "on"]),
  cooldownMs: z.number(),
  ledId: z.string().optional(),
})

const ValveObjectSchema = BaseObjectSchema.extend({
  type: z.literal("valve"),
  state: z.enum(["off", "on"]),
  cooldownMs: z.number(),
})

const PanelObjectSchema = BaseObjectSchema.extend({
  type: z.literal("panel"),
  content: z.object({
    title: z.string(),
    text: z.string(),
    code: z.string().optional(),
    imageId: z.string().optional(),
  }),
})

const ConsoleObjectSchema = BaseObjectSchema.extend({
  type: z.literal("console"),
  accept: z.enum(["code4", "codeN", "sequence"]),
  validFormatRegex: z.string().optional(),
  sequenceTargets: z.array(z.string()).optional(),
  perStepWindowMs: z.number().optional(),
  cooldownMs: z.number(),
})

const WeightPlateObjectSchema = BaseObjectSchema.extend({
  type: z.literal("weightPlate"),
  requiredWeight: z.number(),
  acceptsItemId: z.string().optional(),
})

const ItemObjectSchema = BaseObjectSchema.extend({
  type: z.literal("item"),
  carriedBy: z.string().nullable(),
  name: z.string(),
})

const DoorObjectSchema = BaseObjectSchema.extend({
  type: z.literal("door"),
  open: z.boolean(),
  lockedBy: z.array(z.string()).optional(),
})

const LEDObjectSchema = BaseObjectSchema.extend({
  type: z.literal("led"),
  state: z.enum(["red", "green"]),
  label: z.enum(["OFF", "ON"]),
  bindsTo: z.string().optional(),
})

const GameObjectSchema = z.discriminatedUnion("type", [
  SwitchObjectSchema,
  ValveObjectSchema,
  PanelObjectSchema,
  ConsoleObjectSchema,
  WeightPlateObjectSchema,
  ItemObjectSchema,
  DoorObjectSchema,
  LEDObjectSchema,
])

const MultiSwitchPuzzleSchema = z.object({
  id: z.string(),
  type: z.literal("multiSwitch"),
  ids: z.array(z.string()),
  simultaneous: z.boolean(),
  playersRequired: z.number(),
  windowMs: z.number(),
  distanceGate: z.object({ minTiles: z.number() }),
  debugSolo: z.object({ latched: z.boolean(), latchMs: z.number() }),
})

const InfoSplitPuzzleSchema = z.object({
  id: z.string(),
  type: z.literal("infoSplit"),
  sourcePanel: z.string(),
  targetConsole: z.string(),
  codeFormat: z.string(),
  soloNote: z.boolean(),
})

const SequencePuzzleSchema = z.object({
  id: z.string(),
  type: z.literal("sequence"),
  order: z.array(z.string()),
  resetOnError: z.boolean(),
  lockMs: z.number(),
  perStepWindowMs: z.number().optional(),
})

const WeightPlatePuzzleSchema = z.object({
  id: z.string(),
  type: z.literal("weightPlate"),
  plates: z.array(z.object({ id: z.string(), need: z.string() })),
})

const PuzzleSchema = z.discriminatedUnion("type", [
  MultiSwitchPuzzleSchema,
  InfoSplitPuzzleSchema,
  SequencePuzzleSchema,
  WeightPlatePuzzleSchema,
])

const PedagogySchema = z.object({
  title: z.string(),
  lines: z.array(z.string()),
  quiz: z.object({
    q: z.string(),
    choices: z.array(z.string()),
    correctIndex: z.number(),
  }),
  analystContext: z.string().optional(),
})

const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  grid: z.object({ cols: z.number(), rows: z.number() }),
  spawn: z.object({ x: z.number(), y: z.number() }),
  objects: z.array(GameObjectSchema),
  puzzles: z.array(PuzzleSchema),
  successCondition: z.string(),
  outputs: z.object({
    keys: z.array(z.string()).optional(),
    codePart: z.string().optional(),
  }),
  pedagogy: PedagogySchema.optional(),
  hint: z.string().optional(),
  finalCodeRule: z.string().optional(),
})

export const GameDefinitionSchema = z.object({
  title: z.string(),
  description: z.string(),
  timer: z.object({
    durationMs: z.number(),
    penaltyAfterMs: z.number(),
    penaltyPerMinute: z.number(),
  }),
  audio: z.object({
    bgm: z.string(),
    sfx: z.object({
      click: z.string(),
      unlock: z.string(),
      error: z.string(),
    }),
  }),
  roles: z.array(RoleSchema),
  ui: z.object({
    adjacencyRange: z.number(),
    controls: z.record(z.string()),
  }),
  scoring: z.object({
    baseScore: z.number(),
    maxHints: z.number(),
    hintCost: z.number(),
    errorPenalty: z.number(),
  }),
  debugSolo: z.object({
    enabled: z.boolean(),
    latchMs: z.number(),
    showStickyNotes: z.boolean(),
    roleSwitch: z.boolean(),
    hotspots: z.boolean(),
  }),
  rooms: z.array(RoomSchema),
  contracts: z.any(),
  fsm: z.any(),
  validationRules: z.any(),
  iotHooks: z.any(),
})

export function validateGameDefinition(data: unknown) {
  return GameDefinitionSchema.parse(data)
}
