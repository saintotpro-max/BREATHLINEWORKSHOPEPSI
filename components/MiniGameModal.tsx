"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface MiniGameModalProps {
  gameType: "simon" | "co2graph" | "wiring" | "timing"
  onComplete: (success: boolean, points: number) => void
  onClose: () => void
}

export function MiniGameModal({ gameType, onComplete, onClose }: MiniGameModalProps) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border-2 border-cyan-400 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">
            {gameType === "simon" && "Switch Activation"}
            {gameType === "co2graph" && "CO₂ Data Analysis"}
            {gameType === "wiring" && "Console Wiring"}
            {gameType === "timing" && "Valve Timing"}
          </h2>
          <p className="text-sm text-slate-400">Complete the mini-game to activate</p>
        </div>

        {gameType === "simon" && <SimonGame onSuccess={() => onComplete(true, 20)} />}
        {gameType === "co2graph" && <CO2GraphGame onSuccess={() => onComplete(true, 25)} />}
        {gameType === "wiring" && <WiringGame onSuccess={() => onComplete(true, 30)} />}
        {gameType === "timing" && <TimingGame onSuccess={() => onComplete(true, 15)} />}
      </div>
    </div>
  )
}

function SimonGame({ onSuccess }: { onSuccess: () => void }) {
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [level, setLevel] = useState(1)

  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"]
  const colorNames = ["Red", "Blue", "Green", "Yellow"]

  useEffect(() => {
    startNewRound()
  }, [])

  const startNewRound = () => {
    const newSequence = [...sequence, Math.floor(Math.random() * 4)]
    setSequence(newSequence)
    setPlayerSequence([])
    playSequence(newSequence)
  }

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true)
    for (const color of seq) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setActiveButton(color)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setActiveButton(null)
    }
    setIsPlaying(false)
  }

  const handleButtonClick = (index: number) => {
    if (isPlaying) return

    const newPlayerSequence = [...playerSequence, index]
    setPlayerSequence(newPlayerSequence)

    setActiveButton(index)
    setTimeout(() => setActiveButton(null), 300)

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setTimeout(() => {
        alert("Wrong! Try again.")
        setSequence([])
        setPlayerSequence([])
        setLevel(1)
        startNewRound()
      }, 500)
      return
    }

    if (newPlayerSequence.length === sequence.length) {
      if (level >= 3) {
        setTimeout(() => {
          onSuccess()
        }, 500)
      } else {
        setTimeout(() => {
          setLevel(level + 1)
          startNewRound()
        }, 1000)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-white">Simon Says - Level {level}/3</p>
        <p className="text-sm text-slate-400">Watch the sequence, then repeat it</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={isPlaying}
            className={`h-32 rounded-lg border-4 transition-all ${color} ${
              activeButton === index ? "scale-95 brightness-150" : "brightness-75"
            } ${isPlaying ? "cursor-not-allowed" : "cursor-pointer hover:brightness-100"}`}
          >
            <span className="text-2xl font-bold text-white drop-shadow-lg">{colorNames[index]}</span>
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-slate-400">
        {isPlaying ? "Watch carefully..." : `Your turn! (${playerSequence.length}/${sequence.length})`}
      </div>
    </div>
  )
}

function CO2GraphGame({ onSuccess }: { onSuccess: () => void }) {
  const [selectedPoints, setSelectedPoints] = useState<number[]>([])
  const correctPoints = [2, 5, 7]

  const dataPoints = [
    { x: 0, y: 400, label: "8am", dangerous: false },
    { x: 1, y: 600, label: "10am", dangerous: false },
    { x: 2, y: 1100, label: "12pm", dangerous: true },
    { x: 3, y: 900, label: "2pm", dangerous: false },
    { x: 4, y: 800, label: "4pm", dangerous: false },
    { x: 5, y: 1300, label: "6pm", dangerous: true },
    { x: 6, y: 950, label: "8pm", dangerous: false },
    { x: 7, y: 1200, label: "10pm", dangerous: true },
  ]

  const handlePointClick = (index: number) => {
    if (selectedPoints.includes(index)) {
      setSelectedPoints(selectedPoints.filter((p) => p !== index))
    } else {
      setSelectedPoints([...selectedPoints, index])
    }
  }

  const handleSubmit = () => {
    const correct =
      correctPoints.every((p) => selectedPoints.includes(p)) && selectedPoints.length === correctPoints.length
    if (correct) {
      onSuccess()
    } else {
      alert("Not quite! Select all times when CO₂ exceeded 1000 ppm.")
      setSelectedPoints([])
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-white">CO₂ Data Analysis</p>
        <p className="text-sm text-slate-400">Select all times when CO₂ exceeded 1000 ppm (danger threshold)</p>
      </div>

      <div className="relative h-64 rounded-lg border border-slate-700 bg-slate-800 p-4">
        <div className="absolute inset-0 flex items-end justify-around p-4">
          {dataPoints.map((point, index) => (
            <button
              key={index}
              onClick={() => handlePointClick(index)}
              className={`flex flex-col items-center transition-all ${
                selectedPoints.includes(index) ? "scale-110" : ""
              }`}
            >
              <div
                className={`mb-2 h-2 w-2 rounded-full ${
                  selectedPoints.includes(index)
                    ? "bg-cyan-400 ring-4 ring-cyan-400/50"
                    : point.dangerous
                      ? "bg-red-500"
                      : "bg-green-500"
                }`}
                style={{ marginBottom: `${(point.y / 1500) * 200}px` }}
              />
              <span className="text-xs text-slate-400">{point.label}</span>
              <span className="text-xs font-semibold text-white">{point.y}</span>
            </button>
          ))}
        </div>
        <div className="absolute left-4 top-4 text-xs text-slate-500">
          <div>1500 ppm</div>
          <div className="mt-16">1000 ppm (threshold)</div>
          <div className="mt-16">500 ppm</div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-cyan-600"
      >
        Submit Analysis
      </button>
    </div>
  )
}

function WiringGame({ onSuccess }: { onSuccess: () => void }) {
  const [connections, setConnections] = useState<{ [key: string]: string }>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)

  const leftPorts = [
    { id: "L1", color: "red", label: "Power" },
    { id: "L2", color: "blue", label: "Data" },
    { id: "L3", color: "green", label: "Ground" },
    { id: "L4", color: "yellow", label: "Signal" },
  ]

  const rightPorts = [
    { id: "R1", color: "yellow", label: "Signal" },
    { id: "R2", color: "red", label: "Power" },
    { id: "R3", color: "green", label: "Ground" },
    { id: "R4", color: "blue", label: "Data" },
  ]

  const correctConnections = {
    L1: "R2",
    L2: "R4",
    L3: "R3",
    L4: "R1",
  }

  const handleLeftClick = (id: string) => {
    if (selectedLeft === id) {
      setSelectedLeft(null)
    } else {
      setSelectedLeft(id)
    }
  }

  const handleRightClick = (id: string) => {
    if (selectedLeft) {
      setConnections({ ...connections, [selectedLeft]: id })
      setSelectedLeft(null)
    }
  }

  const handleSubmit = () => {
    const correct = Object.keys(correctConnections).every((key) => connections[key] === correctConnections[key])
    if (correct) {
      onSuccess()
    } else {
      alert("Incorrect wiring! Match colors and labels.")
      setConnections({})
      setSelectedLeft(null)
    }
  }

  const getPortColor = (color: string) => {
    const colors: { [key: string]: string } = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
    }
    return colors[color] || "bg-gray-500"
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-white">Wiring Puzzle</p>
        <p className="text-sm text-slate-400">Connect matching ports by color and label</p>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex flex-col gap-3">
          {leftPorts.map((port) => (
            <button
              key={port.id}
              onClick={() => handleLeftClick(port.id)}
              className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
                selectedLeft === port.id
                  ? "border-cyan-400 bg-cyan-400/20"
                  : connections[port.id]
                    ? "border-green-500 bg-green-500/20"
                    : "border-slate-600 bg-slate-800 hover:border-slate-500"
              }`}
            >
              <div className={`h-4 w-4 rounded-full ${getPortColor(port.color)}`} />
              <span className="text-sm font-semibold text-white">{port.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 text-center text-slate-500">
          <div className="text-xs">Click left port, then right port to connect</div>
          {selectedLeft && <div className="mt-2 text-cyan-400">Selected: {selectedLeft}</div>}
        </div>

        <div className="flex flex-col gap-3">
          {rightPorts.map((port) => (
            <button
              key={port.id}
              onClick={() => handleRightClick(port.id)}
              className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
                Object.values(connections).includes(port.id)
                  ? "border-green-500 bg-green-500/20"
                  : "border-slate-600 bg-slate-800 hover:border-slate-500"
              }`}
            >
              <span className="text-sm font-semibold text-white">{port.label}</span>
              <div className={`h-4 w-4 rounded-full ${getPortColor(port.color)}`} />
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(connections).length < 4}
        className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit Wiring ({Object.keys(connections).length}/4)
      </button>
    </div>
  )
}

function TimingGame({ onSuccess }: { onSuccess: () => void }) {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [targetZone, setTargetZone] = useState({ start: 40, end: 60 })
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState("Click START to begin")

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsRunning(false)
            return 0
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isRunning])

  const handleStart = () => {
    setIsRunning(true)
    setProgress(0)
    setMessage("Click STOP when the bar is in the green zone!")
  }

  const handleStop = () => {
    if (!isRunning) return

    setIsRunning(false)
    const inZone = progress >= targetZone.start && progress <= targetZone.end

    if (inZone) {
      setMessage("Perfect timing! Valve activated.")
      setTimeout(() => onSuccess(), 1000)
    } else {
      setAttempts(attempts + 1)
      setMessage(`Missed! Try again. (Attempt ${attempts + 1})`)
      setTimeout(() => {
        setProgress(0)
        setMessage("Click START to try again")
      }, 1500)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg font-semibold text-white">Timing Challenge</p>
        <p className="text-sm text-slate-400">Stop the bar in the green zone to activate the valve</p>
      </div>

      <div className="space-y-2">
        <div className="relative h-12 overflow-hidden rounded-lg border-2 border-slate-700 bg-slate-800">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-0 h-full bg-green-500/30"
            style={{ left: `${targetZone.start}%`, width: `${targetZone.end - targetZone.start}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white drop-shadow-lg">{progress.toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span className="text-green-400">
            Target: {targetZone.start}% - {targetZone.end}%
          </span>
          <span>100%</span>
        </div>
      </div>

      <div className="text-center">
        <p
          className={`text-sm font-semibold ${message.includes("Perfect") ? "text-green-400" : message.includes("Missed") ? "text-red-400" : "text-slate-400"}`}
        >
          {message}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="flex-1 rounded-lg bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          START
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="flex-1 rounded-lg bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          STOP
        </button>
      </div>
    </div>
  )
}
