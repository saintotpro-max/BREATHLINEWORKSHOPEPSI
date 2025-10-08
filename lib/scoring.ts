/**
 * Scoring system for the escape game.
 * Calculates final score based on time, hints, errors, and completion.
 */

export interface ScoreBreakdown {
  baseScore: number
  timeBonus: number
  hintPenalty: number
  errorPenalty: number
  completionBonus: number
  finalScore: number
  rank: "S" | "A" | "B" | "C" | "D"
}

export function calculateScore(
  timerMs: number,
  totalDurationMs: number,
  hintsUsed: number,
  errors: number,
  roomsCompleted: number,
  totalRooms: number,
  hintCost = 10,
  errorCost = 2,
): ScoreBreakdown {
  const baseScore = 100

  // Time bonus: more time remaining = higher bonus (max 50 points)
  const timeRatio = timerMs / totalDurationMs
  const timeBonus = Math.floor(timeRatio * 50)

  // Hint penalty
  const hintPenalty = hintsUsed * hintCost

  // Error penalty
  const errorPenalty = errors * errorCost

  // Completion bonus
  const completionRatio = roomsCompleted / totalRooms
  const completionBonus = Math.floor(completionRatio * 30)

  // Calculate final score
  const finalScore = Math.max(0, baseScore + timeBonus + completionBonus - hintPenalty - errorPenalty)

  // Determine rank
  let rank: "S" | "A" | "B" | "C" | "D"
  if (finalScore >= 140) rank = "S"
  else if (finalScore >= 120) rank = "A"
  else if (finalScore >= 100) rank = "B"
  else if (finalScore >= 80) rank = "C"
  else rank = "D"

  return {
    baseScore,
    timeBonus,
    hintPenalty,
    errorPenalty,
    completionBonus,
    finalScore,
    rank,
  }
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export function getTimerColor(ms: number, totalMs: number): string {
  const ratio = ms / totalMs
  if (ratio > 0.5) return "text-green-500"
  if (ratio > 0.25) return "text-orange-500"
  return "text-red-500"
}
