"use client"

import { useState } from "react"
import { Check, X, Award, Brain } from "lucide-react"

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const R1_QUIZ: QuizQuestion[] = [
  {
    question: "À partir de quel niveau de CO₂ commence-t-on à avoir des pertes de concentration?",
    options: ["600 ppm", "800 ppm", "1000 ppm", "1500 ppm"],
    correctIndex: 2,
    explanation: "À partir de 1000 ppm, le CO₂ affecte la concentration (-15 à -60% selon le niveau)."
  },
  {
    question: "Que signifie HVAC?",
    options: [
      "High Voltage Air Control",
      "Heating, Ventilation, Air Conditioning",
      "Hydraulic Valve Automatic Control",
      "Heavy Volume Air Circulation"
    ],
    correctIndex: 1,
    explanation: "HVAC signifie Heating, Ventilation, Air Conditioning - le système qui gère la qualité de l'air."
  },
  {
    question: "Pourquoi doit-on synchroniser les valves A et B?",
    options: [
      "Pour économiser de l'énergie",
      "Pour éviter un déséquilibre de pression",
      "Pour accélérer le processus",
      "C'est juste une règle de sécurité"
    ],
    correctIndex: 1,
    explanation: "Ouvrir une seule valve créerait un déséquilibre de pression dangereux (surpression ou dépression)."
  },
  {
    question: "Quel est le niveau de CO₂ dans l'air extérieur normal?",
    options: ["200 ppm", "400 ppm", "600 ppm", "800 ppm"],
    correctIndex: 1,
    explanation: "L'air extérieur contient environ 400 ppm de CO₂, c'est la référence naturelle."
  }
]

interface FinalQuizProps {
  roomId: string
  onComplete: (score: number) => void
}

export function FinalQuiz({ roomId, onComplete }: FinalQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])

  const question = R1_QUIZ[currentQuestion]
  const isLastQuestion = currentQuestion === R1_QUIZ.length - 1

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return // Already answered

    setSelectedAnswer(index)
    setShowExplanation(true)

    const isCorrect = index === question.correctIndex
    setAnswers([...answers, isCorrect])
    
    if (isCorrect) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(score + (selectedAnswer === question.correctIndex ? 1 : 0))
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const progress = ((currentQuestion + (selectedAnswer !== null ? 1 : 0)) / R1_QUIZ.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-950 border-4 border-indigo-400 rounded-2xl max-w-3xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="bg-indigo-500 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">QUIZ DE VALIDATION</h2>
                <p className="text-indigo-100 text-sm">Testez vos connaissances acquises!</p>
              </div>
            </div>
            <div className="text-white font-bold text-lg">
              {currentQuestion + 1} / {R1_QUIZ.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-indigo-950 h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Question */}
          <div className="mb-8">
            <h3 className="text-white text-2xl font-semibold mb-6">
              {question.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === question.correctIndex
                const showResult = selectedAnswer !== null

                let buttonClass = "bg-indigo-800 hover:bg-indigo-700 border-indigo-600"
                
                if (showResult) {
                  if (isCorrect) {
                    buttonClass = "bg-green-600 border-green-400"
                  } else if (isSelected && !isCorrect) {
                    buttonClass = "bg-red-600 border-red-400"
                  } else {
                    buttonClass = "bg-indigo-900 border-indigo-700 opacity-50"
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`
                      w-full text-left px-6 py-4 rounded-xl border-2 transition-all
                      ${buttonClass}
                      ${selectedAnswer === null ? 'hover:scale-102 cursor-pointer' : 'cursor-not-allowed'}
                      flex items-center justify-between
                    `}
                  >
                    <span className="text-white font-medium text-lg">{option}</span>
                    {showResult && isCorrect && <Check className="w-6 h-6 text-white" />}
                    {showResult && isSelected && !isCorrect && <X className="w-6 h-6 text-white" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-indigo-800/50 border border-indigo-400/50 rounded-xl p-6 mb-6 animate-in slide-in-from-bottom duration-500">
              <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                💡 Explication
              </h4>
              <p className="text-indigo-100 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Next button */}
          {selectedAnswer !== null && (
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              {isLastQuestion ? (
                <>
                  <Award className="w-6 h-6" />
                  VOIR LES RÉSULTATS
                </>
              ) : (
                <>
                  QUESTION SUIVANTE
                  <Check className="w-6 h-6" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Score display */}
        <div className="bg-indigo-950 px-6 py-3 rounded-b-xl flex items-center justify-between">
          <div className="text-indigo-300 text-sm">
            💯 Score actuel
          </div>
          <div className="text-white font-bold text-lg">
            {score} / {currentQuestion + (selectedAnswer !== null ? 1 : 0)}
          </div>
        </div>
      </div>
    </div>
  )
}

// Results Screen
interface QuizResultsProps {
  score: number
  total: number
  onClose: () => void
}

export function QuizResults({ score, total, onClose }: QuizResultsProps) {
  const percentage = (score / total) * 100
  const isPerfect = score === total
  const isGood = percentage >= 75
  const isPass = percentage >= 50

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-950 border-4 border-purple-400 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl animate-in zoom-in duration-500">
        <div className="p-8 text-center">
          {/* Trophy */}
          <div className="text-8xl mb-4">
            {isPerfect ? "🏆" : isGood ? "🎉" : isPass ? "👍" : "📚"}
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-white mb-2">
            {isPerfect ? "PARFAIT!" : isGood ? "EXCELLENT!" : isPass ? "BIEN JOUÉ!" : "CONTINUEZ D'APPRENDRE!"}
          </h2>

          {/* Score */}
          <div className="text-6xl font-bold mb-4" style={{
            background: "linear-gradient(to right, #10b981, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            {score} / {total}
          </div>

          <div className="text-white text-xl mb-8">
            {percentage.toFixed(0)}% de réussite
          </div>

          {/* Message */}
          <div className="bg-indigo-900/50 rounded-xl p-6 mb-6">
            <p className="text-white text-lg leading-relaxed">
              {isPerfect && "Vous maîtrisez parfaitement les concepts de qualité de l'air!"}
              {isGood && !isPerfect && "Très bonnes connaissances! Vous avez bien compris les enjeux."}
              {isPass && !isGood && "Bonne compréhension générale. Revoyez les explications pour approfondir."}
              {!isPass && "Prenez le temps de relire les débriefings pédagogiques. Chaque détail compte!"}
            </p>
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all hover:scale-105"
          >
            CONTINUER L'AVENTURE
          </button>
        </div>
      </div>
    </div>
  )
}
