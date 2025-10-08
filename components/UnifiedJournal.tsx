"use client"

import { useState } from "react"
import { X, BookOpen, Target, Lightbulb, TrendingUp, GraduationCap } from "lucide-react"

interface Phase {
  id: string
  label: string
  role: string
  completed: boolean
  current: boolean
  locked: boolean
}

interface UnifiedJournalProps {
  isOpen: boolean
  onClose: () => void
  phases: Phase[]
  overallProgress: number
  briefing: string
  currentObjectives: string[]
  recentDebriefings: Array<{
    title: string
    summary: string
  }>
  hintsFound: string[]
}

export function UnifiedJournal({
  isOpen,
  onClose,
  phases,
  overallProgress,
  briefing,
  currentObjectives,
  recentDebriefings,
  hintsFound
}: UnifiedJournalProps) {
  const [activeTab, setActiveTab] = useState<"briefing" | "objectives" | "progression" | "debriefings" | "hints">("objectives")

  if (!isOpen) return null

  const tabs = [
    { id: "briefing" as const, label: "📜 Briefing", icon: BookOpen },
    { id: "objectives" as const, label: "🎯 Objectifs", icon: Target },
    { id: "progression" as const, label: "📊 Progression", icon: TrendingUp },
    { id: "debriefings" as const, label: "🎓 Débriefings", icon: GraduationCap },
    { id: "hints" as const, label: "💡 Indices", icon: Lightbulb },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-8 border-amber-900 rounded-2xl max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header - Style Livre */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 px-6 py-4 rounded-t-xl flex items-center justify-between border-b-4 border-amber-950">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-100" />
            <div>
              <h2 className="text-2xl font-bold text-amber-50 font-serif">Journal de Mission</h2>
              <p className="text-amber-200 text-sm">BreatheLab-7 - Protocole d'Urgence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-amber-700 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6 text-amber-100" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-amber-200 bg-amber-100/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-amber-50 text-amber-900 border-b-4 border-amber-600"
                  : "text-amber-700 hover:bg-amber-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-amber-50" style={{
          backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)",
          backgroundSize: "50px 50px"
        }}>
          {/* BRIEFING */}
          {activeTab === "briefing" && (
            <div className="prose prose-amber max-w-none">
              <div className="bg-white/80 rounded-lg p-6 shadow-inner border-2 border-amber-200">
                <h3 className="text-xl font-bold text-amber-900 mb-4 font-serif flex items-center gap-2">
                  📜 Briefing Initial - Dr. Lemaire
                </h3>
                <div className="text-amber-900 leading-relaxed whitespace-pre-line font-serif">
                  {briefing}
                </div>
              </div>
            </div>
          )}

          {/* OBJECTIFS */}
          {activeTab === "objectives" && (
            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-6 shadow-inner border-2 border-amber-200">
                <h3 className="text-xl font-bold text-amber-900 mb-4 font-serif flex items-center gap-2">
                  🎯 Objectifs Actuels
                </h3>
                <div className="space-y-3">
                  {currentObjectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded border-l-4 border-amber-600">
                      <div className="text-amber-700 font-bold text-lg">{i + 1}.</div>
                      <div className="text-amber-900 font-medium">{obj}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROGRESSION */}
          {activeTab === "progression" && (
            <div className="space-y-4">
              {/* Barre globale */}
              <div className="bg-white/80 rounded-lg p-6 shadow-inner border-2 border-amber-200">
                <h3 className="text-xl font-bold text-amber-900 mb-4 font-serif">
                  📊 Progression Globale
                </h3>
                <div className="mb-2">
                  <div className="bg-amber-200 rounded-full h-8 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500 flex items-center justify-center text-white font-bold text-sm"
                      style={{ width: `${overallProgress}%` }}
                    >
                      {overallProgress > 10 && `${overallProgress.toFixed(0)}%`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phases */}
              <div className="bg-white/80 rounded-lg p-6 shadow-inner border-2 border-amber-200">
                <h3 className="text-xl font-bold text-amber-900 mb-4 font-serif">
                  🔄 Phases du Protocole
                </h3>
                <div className="space-y-3">
                  {phases.map((phase, i) => (
                    <div
                      key={phase.id}
                      className={`p-4 rounded-lg border-2 ${
                        phase.completed
                          ? "bg-green-50 border-green-500"
                          : phase.current
                          ? "bg-yellow-50 border-yellow-500"
                          : "bg-gray-50 border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {phase.completed && <span className="text-2xl">✅</span>}
                          {phase.current && <span className="text-2xl">⏳</span>}
                          {phase.locked && <span className="text-2xl">🔒</span>}
                          <div>
                            <div className="font-bold text-amber-900">
                              Phase {i + 1}: {phase.label}
                            </div>
                            <div className="text-sm text-amber-700">Rôle: {phase.role}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DÉBRIEFINGS */}
          {activeTab === "debriefings" && (
            <div className="space-y-4">
              {recentDebriefings.length > 0 ? (
                recentDebriefings.map((debriefing, i) => (
                  <div key={i} className="bg-white/80 rounded-lg p-6 shadow-inner border-2 border-amber-200">
                    <h4 className="text-lg font-bold text-amber-900 mb-2 font-serif flex items-center gap-2">
                      🎓 {debriefing.title}
                    </h4>
                    <p className="text-amber-800 leading-relaxed">{debriefing.summary}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white/80 rounded-lg p-6 shadow-inner border-2 border-amber-200 text-center text-amber-600">
                  Aucun débriefing pour le moment. Résolvez des énigmes pour en débloquer!
                </div>
              )}
            </div>
          )}

          {/* INDICES */}
          {activeTab === "hints" && (
            <div className="space-y-4">
              {hintsFound.length > 0 ? (
                hintsFound.map((hint, i) => (
                  <div key={i} className="bg-white/80 rounded-lg p-4 shadow-inner border-2 border-amber-200 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                    <p className="text-amber-900">{hint}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white/80 rounded-lg p-6 shadow-inner border-2 border-amber-200 text-center text-amber-600">
                  Aucun indice trouvé. Explorez la station pour découvrir des informations!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-200 px-6 py-3 rounded-b-xl border-t-2 border-amber-300 flex items-center justify-between">
          <div className="text-amber-800 text-sm font-medium">
            Station BreatheLab-7 - Protocole d'Urgence CO₂
          </div>
          <div className="text-amber-700 text-sm">
            Appuyez sur <kbd className="px-2 py-1 bg-amber-300 rounded">J</kbd> pour ouvrir/fermer
          </div>
        </div>
      </div>
    </div>
  )
}
