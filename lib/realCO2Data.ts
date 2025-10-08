// This data represents actual atmospheric CO2 measurements
export const REAL_CO2_DATA = {
  // Historical atmospheric CO2 levels (ppm) from Mauna Loa Observatory
  atmospheric: [
    { year: 1960, ppm: 316.91 },
    { year: 1970, ppm: 325.68 },
    { year: 1980, ppm: 338.75 },
    { year: 1990, ppm: 354.39 },
    { year: 2000, ppm: 369.55 },
    { year: 2010, ppm: 389.9 },
    { year: 2020, ppm: 414.24 },
    { year: 2024, ppm: 422.0 },
  ],

  // Indoor CO2 levels by scenario (ppm)
  indoor: {
    outdoor: 420,
    wellVentilated: 600,
    typical: 800,
    poorVentilation: 1200,
    crowdedRoom: 1800,
    dangerous: 2500,
  },

  // Health effects by CO2 level
  effects: [
    { range: "400-600", effect: "Normal outdoor/well-ventilated indoor air", color: "green" },
    { range: "600-1000", effect: "Acceptable indoor air quality", color: "yellow" },
    { range: "1000-2000", effect: "Drowsiness, poor concentration, headaches", color: "orange" },
    { range: "2000-5000", effect: "Headaches, sleepiness, poor air quality", color: "red" },
    { range: ">5000", effect: "Serious health risks, immediate action required", color: "darkred" },
  ],

  // Ventilation rates needed
  ventilation: {
    low: { ppm: 1500, acph: 0.5, description: "Minimal ventilation" },
    medium: { ppm: 1000, acph: 1.0, description: "Standard ventilation" },
    good: { ppm: 800, acph: 2.0, description: "Good ventilation" },
    excellent: { ppm: 600, acph: 4.0, description: "Excellent ventilation" },
  },
}

// Generate realistic indoor CO2 progression over a day
export function generateDailyCO2Pattern(startHour = 8, occupancy: "low" | "medium" | "high" = "medium") {
  const baselinePPM = 420
  const occupancyMultiplier = { low: 1.5, medium: 2.5, high: 4.0 }[occupancy]

  const pattern = []
  for (let hour = startHour; hour < startHour + 8; hour++) {
    const displayHour = hour % 24
    const timeLabel = `${displayHour.toString().padStart(2, "0")}:00`

    // Simulate CO2 buildup over the day
    const hoursSinceStart = hour - startHour
    const buildupFactor = Math.min(hoursSinceStart / 6, 1) // Peaks after 6 hours
    const ppm = Math.round(baselinePPM + buildupFactor * 800 * occupancyMultiplier)

    pattern.push({ time: timeLabel, ppm })
  }

  return pattern
}
