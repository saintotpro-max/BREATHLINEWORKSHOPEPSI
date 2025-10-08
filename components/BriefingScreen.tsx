"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, AlertTriangle, Clock, Users } from "lucide-react"

interface BriefingScreenProps {
  onStart: () => void
  players?: Array<{ id: string; name: string; role: string | null; isReady: boolean }>
  isMultiplayer?: boolean
}

export function BriefingScreen({ onStart, players = [], isMultiplayer = false }: BriefingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-4xl w-full p-8 bg-white/95 backdrop-blur space-y-6 my-8">
        <div className="text-center space-y-4 border-b-4 border-red-500 pb-6">
          <div className="flex items-center justify-center gap-4">
            <AlertTriangle className="w-16 h-16 text-red-600 animate-pulse" />
            <div className="text-6xl">🚨</div>
            <AlertTriangle className="w-16 h-16 text-red-600 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900">OPERATION BREATHE LINE</h1>
          <div className="text-2xl text-red-600 font-bold bg-red-100 px-6 py-3 rounded-lg inline-block">
            ALERTE SYSTÈME CRITIQUE
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 space-y-4 border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-red-600" />
            Situation d'Urgence
          </h2>

          <div className="space-y-3 text-gray-800 leading-relaxed">
            <p className="text-lg">
              <strong className="text-red-700">16:47 - Centre de Recherche Atmosphérique</strong>
            </p>

            <p>
              Les capteurs de qualité de l'air ont détecté une montée anormale du CO₂ dans le bâtiment principal. Le
              système de ventilation HVAC a été saboté et ne répond plus aux commandes.
            </p>

            <p>
              <strong className="text-red-700">Niveau actuel : 1320 ppm de CO₂</strong> (seuil critique : 1500 ppm)
            </p>

            <p>
              Vous êtes une équipe d'intervention d'urgence spécialisée en systèmes de ventilation. Votre mission :
              infiltrer les 3 zones du laboratoire, résoudre les énigmes techniques, et restaurer le système avant que
              les niveaux ne deviennent mortels.
            </p>

            <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 mt-4">
              <p className="font-bold text-red-900 text-center text-xl">⏰ TEMPS LIMITE : 30 MINUTES</p>
              <p className="text-center text-red-800 text-sm mt-2">
                Au-delà, l'évacuation automatique sera déclenchée et la mission échouera
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 space-y-4 border-l-4 border-blue-500">
          <h3 className="text-2xl font-bold text-blue-900">🎯 Objectifs de Mission</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <div className="text-2xl">1️⃣</div>
              <div>
                <strong className="text-blue-900">Lobby d'Urgence :</strong>
                <p className="text-sm text-gray-700">
                  Activez les 4 ventilations d'urgence simultanément pour stabiliser temporairement les niveaux de CO₂
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <div className="text-2xl">2️⃣</div>
              <div>
                <strong className="text-blue-900">Laboratoire de Filtration :</strong>
                <p className="text-sm text-gray-700">
                  Recalibrez les capteurs et activez la séquence de filtration dans le bon ordre
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <div className="text-2xl">3️⃣</div>
              <div>
                <strong className="text-blue-900">Salle de Contrôle :</strong>
                <p className="text-sm text-gray-700">
                  Redémarrez le système HVAC principal et déverrouillez la sortie d'évacuation
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 space-y-4 border-l-4 border-purple-500">
          <h3 className="text-xl font-bold text-purple-900">🎮 Contrôles & Interface</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <strong className="text-purple-900">Déplacement :</strong>
              <p className="text-gray-700">Cliquez sur les cases ou utilisez WASD/Flèches</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <strong className="text-purple-900">Interaction :</strong>
              <p className="text-gray-700">
                Appuyez sur <kbd className="px-2 py-1 bg-purple-100 rounded border border-purple-300 font-mono">E</kbd>{" "}
                près d'un objet
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <strong className="text-purple-900">Communication :</strong>
              <p className="text-gray-700">Utilisez le chat d'équipe pour coordonner vos actions</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <strong className="text-purple-900">Indices :</strong>
              <p className="text-gray-700">Bouton 💡 en haut à droite (coûte 10 points)</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <strong className="text-purple-900">Mode Debug :</strong>
              <p className="text-gray-700">
                Touche <kbd className="px-2 py-1 bg-purple-100 rounded border border-purple-300 font-mono">+</kbd> pour
                tester (solo uniquement)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 space-y-3 border-l-4 border-green-500">
          <h3 className="text-xl font-bold text-green-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Coopération d'Équipe Essentielle
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl mb-1">📊</div>
              <strong className="text-green-900">Analyst :</strong>
              <p className="text-gray-700">Lit les panneaux de données, analyse les graphiques CO₂</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl mb-1">🔧</div>
              <strong className="text-green-900">Tech :</strong>
              <p className="text-gray-700">Active les switches, valves et systèmes mécaniques</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl mb-1">⌨️</div>
              <strong className="text-green-900">Operator :</strong>
              <p className="text-gray-700">Entre les codes dans les consoles de contrôle</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl mb-1">📦</div>
              <strong className="text-green-900">Logistician :</strong>
              <p className="text-gray-700">Manipule les objets et équipements mobiles</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-6 space-y-3 border-l-4 border-amber-500">
          <h3 className="text-xl font-bold text-amber-900">📚 Apprentissage Intégré</h3>
          <p className="text-gray-700">
            Tout au long de votre mission, vous découvrirez des informations scientifiques réelles sur :
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-amber-800 ml-4">
            <li>Les effets du CO₂ sur la santé et la cognition</li>
            <li>Le fonctionnement des systèmes de ventilation HVAC</li>
            <li>Les seuils de qualité de l'air intérieur</li>
            <li>Les techniques de filtration multi-étages</li>
            <li>Les bonnes pratiques pour améliorer l'air intérieur</li>
          </ul>
          <p className="text-sm text-amber-900 font-semibold mt-3">
            💡 Après chaque salle, un quiz pédagogique vous permettra de valider vos connaissances !
          </p>
        </div>

        {isMultiplayer && players.length > 0 && (
          <div className="bg-indigo-50 rounded-lg p-6 space-y-3 border-l-4 border-indigo-500">
            <h3 className="text-xl font-bold text-indigo-900">👥 Équipe en Mission</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {players.map((player) => (
                <div key={player.id} className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">👤</div>
                  <div className="font-semibold text-sm text-gray-900">{player.name}</div>
                  <div className="text-xs text-gray-600">{player.role || "En attente..."}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            onClick={onStart}
            className="text-xl px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            🚀 {isMultiplayer ? "Prêt pour la Mission" : "Lancer la Mission"}
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>

        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          Workshop EPSI/WIS 2025 - Escape Tech | Thème : Qualité de l'Air Intérieur
        </div>
      </Card>
    </div>
  )
}
