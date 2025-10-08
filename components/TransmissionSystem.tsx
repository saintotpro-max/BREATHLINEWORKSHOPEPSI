"use client"

import { useState } from "react"
import { Send, Copy, CheckCircle2, Radio } from "lucide-react"

interface TransmissionSystemProps {
  sourceRole: string
  targetRole: string
  dataLabel: string
  dataValue: string
  onTransmit: (value: string) => void
  canTransmit: boolean
}

export function TransmissionSystem({
  sourceRole,
  targetRole,
  dataLabel,
  dataValue,
  onTransmit,
  canTransmit
}: TransmissionSystemProps) {
  const [copied, setCopied] = useState(false)
  const [transmitted, setTransmitted] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(dataValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTransmit = () => {
    if (!canTransmit) return
    onTransmit(dataValue)
    setTransmitted(true)
    setTimeout(() => setTransmitted(false), 3000)
  }

  if (!canTransmit) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-3 border-purple-400 rounded-2xl p-6 shadow-2xl shadow-purple-500/50 max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Radio className="w-6 h-6 text-purple-300 animate-pulse" />
          <div>
            <h3 className="text-white font-bold text-lg">TRANSMISSION REQUISE</h3>
            <p className="text-purple-200 text-sm">
              {sourceRole} → {targetRole}
            </p>
          </div>
        </div>

        {/* Data display */}
        <div className="bg-black/30 rounded-lg p-4 mb-4 border border-purple-400/50">
          <div className="text-purple-300 text-sm mb-1">{dataLabel}</div>
          <div className="text-white font-mono text-3xl font-bold text-center tracking-wider">
            {dataValue}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className={`
              ${copied ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}
              text-white font-semibold py-3 px-4 rounded-lg transition-all
              flex items-center justify-center gap-2
            `}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Copié!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copier
              </>
            )}
          </button>

          <button
            onClick={handleTransmit}
            className={`
              ${transmitted ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}
              text-white font-semibold py-3 px-4 rounded-lg transition-all
              flex items-center justify-center gap-2
              ${transmitted ? '' : 'animate-pulse'}
            `}
          >
            {transmitted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Envoyé!
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Transmettre
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-purple-200 text-xs text-center">
          💡 Utilisez le chat pour communiquer cette information à votre équipe
        </div>
      </div>
    </div>
  )
}

// Composant pour recevoir les transmissions
interface TransmissionReceiverProps {
  role: string
  expectedData: string | null
  receivedData: string | null
  onDataReceived: (data: string) => void
}

export function TransmissionReceiver({
  role,
  expectedData,
  receivedData,
  onDataReceived
}: TransmissionReceiverProps) {
  if (!expectedData || receivedData) return null

  return (
    <div className="fixed top-24 left-4 z-40 animate-in slide-in-from-left duration-500">
      <div className="bg-gradient-to-r from-blue-900 to-cyan-900 border-2 border-cyan-400 rounded-xl p-4 shadow-2xl max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
          <h4 className="text-white font-bold">EN ATTENTE DE TRANSMISSION</h4>
        </div>
        <p className="text-cyan-100 text-sm">
          {role}: Attendez que votre coéquipier vous transmette les informations nécessaires via le chat.
        </p>
        <div className="mt-3 bg-black/30 rounded p-2 text-center">
          <div className="text-cyan-300 text-xs">Données attendues</div>
          <div className="text-white font-mono font-bold text-xl">???</div>
        </div>
      </div>
    </div>
  )
}
