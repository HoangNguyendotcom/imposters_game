'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function ActiveGameRound() {
  const { gameState, nextPlayerTurn, updatePlayerTurnTimer, resetToRevealRoles } = useGame()
  const [playerTimer, setPlayerTimer] = useState(gameState.playerTurnTimer)

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]

  useEffect(() => {
    setPlayerTimer(gameState.playerTurnTimer)
  }, [gameState.playerTurnTimer, gameState.currentPlayerIndex])

  useEffect(() => {
    if (gameState.roundDuration > 0 && gameState.phase === 'playing' && currentPlayer) {
      const interval = setInterval(() => {
        setPlayerTimer((prev) => {
          const newTime = Math.max(0, prev - 1)
          updatePlayerTurnTimer(newTime)
          if (newTime === 0) {
            clearInterval(interval)
            // Auto-advance to next player when timer runs out
            setTimeout(() => {
              nextPlayerTurn()
            }, 500)
          }
          return newTime
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [gameState.roundDuration, gameState.phase, gameState.currentPlayerIndex, currentPlayer, updatePlayerTurnTimer, nextPlayerTurn])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentPlayer) {
    return null
  }

  const progress = ((gameState.currentPlayerIndex + 1) / gameState.players.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
        <button
          onClick={resetToRevealRoles}
          className="mb-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 border border-white/20 flex items-center justify-center mx-auto"
          title="Reset"
        >
          <span className="text-lg">🔄</span>
        </button>

        <div className="mb-6">
          <div className="flex justify-between text-white/80 text-sm mb-2">
            <span>Player {gameState.currentPlayerIndex + 1} of {gameState.players.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white text-center mb-4">
          {currentPlayer.name}'s Turn
        </h1>
        
        {gameState.roundDuration > 0 ? (
          <div className="text-center mb-8">
            <div
              className={`text-8xl font-bold mb-4 ${
                playerTimer <= 10 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}
            >
              {formatTime(playerTimer)}
            </div>
            {playerTimer <= 10 && playerTimer > 0 && (
              <p className="text-yellow-300 text-lg">Time running out!</p>
            )}
            {playerTimer === 0 && (
              <p className="text-white/70 text-lg mt-4">Time's up!</p>
            )}
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⏱️</div>
            <p className="text-white/70 text-lg">No timer set</p>
          </div>
        )}

        <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
          <p className="text-white/80 text-center text-lg">
            It's your turn to talk!
          </p>
        </div>

        <button
          onClick={nextPlayerTurn}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          {gameState.currentPlayerIndex < gameState.players.length - 1
            ? 'Next Player'
            : 'End Round & Vote'}
        </button>
      </div>
    </div>
  )
}
