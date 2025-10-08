"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, X } from "lucide-react"

interface TutorialStep {
  title: string
  description: string
  image?: string
  highlight?: string
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Bienvenue dans Breathe Line",
    description:
      "Vous êtes une équipe d'experts infiltrés dans un laboratoire. Votre mission : résoudre les énigmes sur la ventilation et la qualité de l'air pour déverrouiller la sortie avant la fin du chronomètre.",
  },
  {
    title: "Déplacement",
    description:
      "Cliquez sur une case pour vous déplacer, ou utilisez les touches WASD (ZQSD sur AZERTY) pour vous déplacer. Votre personnage se déplacera automatiquement vers la destination.",
  },
  {
    title: "Interaction",
    description:
      "Approchez-vous d'un objet interactif (switch, valve, panneau, console). Quand vous êtes assez proche, un prompt 'Press E' apparaît. Appuyez sur E pour interagir avec l'objet.",
  },
  {
    title: "Rôles et Restrictions",
    description:
      "Chaque objet nécessite un rôle spécifique : Tech pour les switches/valves, Analyst pour les panneaux, Operator pour les consoles, Logistician pour les objets. En mode debug, appuyez sur R pour changer de rôle.",
  },
  {
    title: "Énigmes Coopératives",
    description:
      "Certaines énigmes nécessitent plusieurs joueurs agissant simultanément (ex: activer 2 switches en même temps). En mode solo, le système maintient l'état pendant quelques secondes pour vous permettre de tester.",
  },
  {
    title: "Mode Debug",
    description:
      "Appuyez sur + pour ouvrir le panneau debug. Vous pouvez téléporter entre les salles (touches 1-4), changer de rôle (touche R), et déverrouiller toutes les portes pour tester le jeu librement.",
  },
]

interface TutorialOverlayProps {
  onComplete: () => void
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("breathe_line_tutorial_seen")
    if (hasSeenTutorial) {
      setShow(false)
      onComplete()
    }
  }, [onComplete])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem("breathe_line_tutorial_seen", "true")
    setShow(false)
    onComplete()
  }

  if (!show) return null

  const step = tutorialSteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white p-8 relative">
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-4 right-4"
          onClick={handleSkip}
          aria-label="Skip tutorial"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              Étape {currentStep + 1} / {tutorialSteps.length}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
          </div>

          <p className="text-gray-700 leading-relaxed">{step.description}</p>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={handleSkip}>
              Passer le tutoriel
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button onClick={handleNext}>
                {currentStep < tutorialSteps.length - 1 ? (
                  <>
                    Suivant <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "Commencer"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
