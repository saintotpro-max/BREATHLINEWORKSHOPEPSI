"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, MessageCircle, X } from "lucide-react"

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  text: string
  timestamp: number
}

interface ChatPanelProps {
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
  playerName: string
}

export function ChatPanel({ messages, onSendMessage, playerName }: ChatPanelProps) {
  const [message, setMessage] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 h-96 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Chat d'équipe</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-blue-700 rounded p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            Aucun message. Commencez à communiquer!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg ${
                msg.playerName === playerName
                  ? "bg-blue-100 ml-4"
                  : "bg-white mr-4"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-xs text-gray-700">
                  {msg.playerName}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-900">{msg.text}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="flex-1"
            maxLength={200}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Appuyez sur Entrée pour envoyer
        </div>
      </div>
    </Card>
  )
}
