'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function NameCollectionScreen() {
  const { gameState, setPlayers, setPhase, startGame } = useGame()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [names, setNames] = useState<string[]>(
    Array(gameState.playerCount).fill('')
  )

  useEffect(() => {
    // Pre-fill names from existing players if available
    if (gameState.players.length > 0) {
      const existingNames = gameState.players.map((p) => p.name)
      setNames((prev) => {
        const newNames = [...prev]
        existingNames.forEach((name, idx) => {
          if (idx < newNames.length) newNames[idx] = name
        })
        return newNames
      })
    }
  }, [])

  const handleNameChange = (value: string) => {
    const newNames = [...names]
    newNames[currentIndex] = value
    setNames(newNames)
  }

  const handleNext = () => {
    if (names[currentIndex].trim()) {
      if (currentIndex < gameState.playerCount - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // All names collected, create players and assign roles
        const players = names.map((name, index) => ({
          id: `player-${index}`,
          name: name.trim(),
        }))
        setPlayers(players)
        startGame(players)
      }
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setPhase('setup')
    }
  }

  const progress = ((currentIndex + 1) / gameState.playerCount) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
        <div className="mb-6">
          <div className="flex justify-between text-white/80 text-sm mb-2">
            <span>Player {currentIndex + 1} of {gameState.playerCount}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Enter Player Name
        </h2>

        <div className="space-y-6">
          <input
            type="text"
            value={names[currentIndex]}
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && names[currentIndex].trim()) {
                handleNext()
              }
            }}
            placeholder={`Player ${currentIndex + 1}'s name`}
            className="w-full px-4 py-4 rounded-lg bg-white/20 border border-white/30 text-white text-xl text-center focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder-white/40"
            autoFocus
          />

          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-white/20"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!names[currentIndex].trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {currentIndex < gameState.playerCount - 1 ? 'Next' : 'Start Game'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
