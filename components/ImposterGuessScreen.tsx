'use client'

import { useState } from 'react'
import { useGame } from '@/contexts/GameContext'
import { useOnlineSyncWithStateUpdate } from '@/hooks/useOnlineSync'

export default function ImposterGuessScreen() {
  const { gameState, handleImposterGuess } = useGame()
  const [guess, setGuess] = useState('')

  // Subscribe to state changes in online mode
  useOnlineSyncWithStateUpdate()

  const isOnlineMode = gameState.mode === 'online'

  // Scenario 1: A voted-out imposter is guessing
  const eliminatedPlayer = gameState.eliminatedPlayerId
    ? gameState.players.find((p) => p.id === gameState.eliminatedPlayerId)
    : null

  // Scenario 2: Final 1v1 guess
  const lastImposter =
    gameState.players.length === 2 ? gameState.players.find((p) => p.role === 'imposter') : null

  const guessingPlayer = eliminatedPlayer || lastImposter

  // In online mode, check if I'm the one who should be guessing
  const isMyTurnToGuess = isOnlineMode && gameState.myRole === 'imposter'

  if (!guessingPlayer || guessingPlayer.role !== 'imposter') {
    // This screen should not be visible if there's no imposter guessing
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-white text-xl">Loading guess screen...</p>
      </div>
    )
  }

  const isFinalGuess = !!lastImposter

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (guess.trim()) {
      handleImposterGuess(guess)
    }
  }

  // Online mode: Show waiting screen for non-imposters
  if (isOnlineMode && !isMyTurnToGuess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Imposter is guessing...
            </h1>
            <p className="text-white/70 text-lg">
              Waiting for the imposter to make their guess.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🕵️</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {guessingPlayer.name}
          </h1>
          <p className="text-2xl text-red-300 font-bold mb-4">
            IMPOSTER
          </p>
          <p className="text-white/80 text-lg mb-2">
            {isFinalGuess ? 'This is your final chance!' : 'You have been voted out!'}
          </p>
          <p className="text-white/70 text-base">
            You have one chance to guess the civilian word.
          </p>
          <p className="text-yellow-300 font-semibold mt-4">
            If you guess correctly, Imposters win!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="guess" className="block text-white text-lg mb-3 font-medium">
              What is the civilian word?
            </label>
            <input
              type="text"
              id="guess"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess..."
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white text-xl placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!guess.trim()}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Submit Guess
          </button>
        </form>
      </div>
    </div>
  )
}
