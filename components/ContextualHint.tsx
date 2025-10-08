"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Lightbulb, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContextualHintProps {
  hint: string
  onDismiss: () => void
}

export function ContextualHint({ hint, onDismiss }: ContextualHintProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onDismiss()
    }, 10000) // Auto-dismiss after 10 seconds

    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!show) return null

  return (
    <div className="fixed bottom-24 right-4 z-40 animate-in slide-in-from-bottom-4">
      <Card className="bg-amber-50 border-amber-200 p-4 max-w-sm shadow-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-amber-900 mb-1">Indice</div>
            <p className="text-sm text-amber-800">{hint}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShow(false)} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
