"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { REAL_CO2_DATA, generateDailyCO2Pattern } from "@/lib/realCO2Data"

interface CO2GraphPanelProps {
  data?: Array<{ time: string; ppm: number }>
  currentPPM: number
  showHistorical?: boolean
}

export function CO2GraphPanel({ data, currentPPM, showHistorical = false }: CO2GraphPanelProps) {
  const defaultData = data || generateDailyCO2Pattern(8, "high")

  const getStatusColor = (ppm: number) => {
    if (ppm < 800) return "text-green-600"
    if (ppm < 1000) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusText = (ppm: number) => {
    if (ppm < 800) return "OPTIMAL"
    if (ppm < 1000) return "ACCEPTABLE"
    if (ppm < 1500) return "ALERT"
    return "CRITICAL"
  }

  return (
    <div className="bg-slate-900 rounded-lg p-4 border-2 border-cyan-500 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-cyan-400 font-bold text-lg">CO₂ MONITORING SYSTEM</h3>
        <div className="flex items-center gap-2">
          <div className={`text-2xl font-mono font-bold ${getStatusColor(currentPPM)}`}>{currentPPM} ppm</div>
          <div
            className={`text-xs font-bold px-2 py-1 rounded ${
              currentPPM < 800 ? "bg-green-600" : currentPPM < 1000 ? "bg-yellow-600" : "bg-red-600"
            } text-white`}
          >
            {getStatusText(currentPPM)}
          </div>
        </div>
      </div>

      <div className="mb-2 text-xs text-cyan-300">
        <span className="font-semibold">Reference:</span> Outdoor air ≈ {REAL_CO2_DATA.indoor.outdoor} ppm |
        Well-ventilated ≈ {REAL_CO2_DATA.indoor.wellVentilated} ppm
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={defaultData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: "12px" }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} domain={[400, 2000]} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #06b6d4", borderRadius: "4px" }}
            labelStyle={{ color: "#06b6d4" }}
          />
          <ReferenceLine
            y={800}
            stroke="#22c55e"
            strokeDasharray="3 3"
            label={{ value: "Good", fill: "#22c55e", fontSize: 10 }}
          />
          <ReferenceLine
            y={1000}
            stroke="#eab308"
            strokeDasharray="3 3"
            label={{ value: "Alert", fill: "#eab308", fontSize: 10 }}
          />
          <ReferenceLine
            y={1500}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: "Critical", fill: "#ef4444", fontSize: 10 }}
          />
          <Line type="monotone" dataKey="ppm" stroke="#06b6d4" strokeWidth={3} dot={{ fill: "#06b6d4", r: 4 }} />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-green-900/30 border border-green-600 rounded p-2">
          <div className="text-green-400 font-bold">OPTIMAL</div>
          <div className="text-green-300">&lt; 800 ppm</div>
          <div className="text-green-200 text-[10px] mt-1">Good concentration</div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-600 rounded p-2">
          <div className="text-yellow-400 font-bold">ALERT</div>
          <div className="text-yellow-300">800-1000 ppm</div>
          <div className="text-yellow-200 text-[10px] mt-1">Increase ventilation</div>
        </div>
        <div className="bg-red-900/30 border border-red-600 rounded p-2">
          <div className="text-red-400 font-bold">CRITICAL</div>
          <div className="text-red-300">&gt; 1000 ppm</div>
          <div className="text-red-200 text-[10px] mt-1">Drowsiness, headaches</div>
        </div>
      </div>

      {showHistorical && (
        <div className="mt-3 p-2 bg-blue-900/30 border border-blue-500 rounded text-xs text-blue-200">
          <div className="font-semibold text-blue-300 mb-1">Did you know?</div>
          <div>
            Atmospheric CO₂ has risen from {REAL_CO2_DATA.atmospheric[0].ppm} ppm in {REAL_CO2_DATA.atmospheric[0].year}{" "}
            to {REAL_CO2_DATA.atmospheric[REAL_CO2_DATA.atmospheric.length - 1].ppm} ppm in{" "}
            {REAL_CO2_DATA.atmospheric[REAL_CO2_DATA.atmospheric.length - 1].year} (Mauna Loa Observatory data).
          </div>
        </div>
      )}
    </div>
  )
}
