'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'
import { useOnlineSyncWithStateUpdate } from '@/hooks/useOnlineSync'

export default function RoleAssignmentScreen() {
  const { gameState, startGame, revealNextPlayer, resetToRevealRoles, fetchMyRole, setPhase } = useGame()
  const [wordRevealed, setWordRevealed] = useState(false)
  const [isLoadingRole, setIsLoadingRole] = useState(false)

  // Subscribe to state changes in online mode
  useOnlineSyncWithStateUpdate()

  const currentPlayer = gameState.players[gameState.currentRevealIndex]
  const isOnlineMode = gameState.mode === 'online'

  // Fetch role for online mode
  useEffect(() => {
    if (isOnlineMode && !gameState.myRole && gameState.roomId) {
      setIsLoadingRole(true)
      fetchMyRole().finally(() => setIsLoadingRole(false))
    }
  }, [isOnlineMode, gameState.myRole, gameState.roomId, fetchMyRole])

  useEffect(() => {
    // Reset reveal state when moving to next player
    setWordRevealed(false)
  }, [gameState.currentRevealIndex])

  const handleReveal = () => {
    setWordRevealed(true)
  }

  const handleNext = () => {
    if (gameState.currentRevealIndex < gameState.players.length - 1) {
      revealNextPlayer()
    } else {
      // All players have seen their roles
      revealNextPlayer() // This will transition to playing phase
    }
  }

  const progress = ((gameState.currentRevealIndex + 1) / gameState.players.length) * 100

  // Online mode: Show only my role
  if (isOnlineMode) {
    if (isLoadingRole) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-white text-xl">Loading your role...</p>
          </div>
        </div>
      )
    }

    if (!gameState.myRole || !gameState.myWord) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20 text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-white text-xl">Failed to load role. Please refresh.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {gameState.myName}
            </h2>
            <p className="text-white/70 text-lg">
              Your role
            </p>
          </div>

          {!wordRevealed ? (
            <div className="space-y-6">
              <div
                onClick={handleReveal}
                className="bg-white/5 rounded-lg p-12 text-center border-2 border-dashed border-white/20 cursor-pointer hover:bg-white/10 transition-all"
              >
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-white/80 text-lg">
                  Tap to reveal your word
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                className={`rounded-lg p-8 text-center border-2 ${
                  gameState.myRole === 'imposter'
                    ? 'bg-red-500/20 border-red-500/50'
                    : gameState.spyCount > 0
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : gameState.myRole === 'spy'
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-blue-500/20 border-blue-500/50'
                }`}
              >
                <div className="text-5xl mb-4">
                  {gameState.myRole === 'imposter' ? '🕵️' : gameState.spyCount > 0 ? '👤' : (gameState.myRole === 'spy' ? '🕵️‍♂️' : '👤')}
                </div>
                <div className="text-4xl font-bold text-white mb-4">
                  {gameState.myRole === 'imposter' ? `Gợi ý: ${gameState.myWord}` : gameState.myWord}
                </div>
                <div className="text-xl text-white/90 mb-2">
                  {gameState.spyCount > 0
                    ? (gameState.myRole === 'imposter' ? 'IMPOSTER' : 'NOT IMPOSTER')
                    : (gameState.myRole === 'imposter' ? 'IMPOSTER' : gameState.myRole === 'spy' ? 'SPY' : 'CIVILIAN')
                  }
                </div>
                <p className="text-white/70 text-sm">
                  {gameState.myRole === 'imposter'
                    ? 'Find the word with hint. Good luck!'
                    : gameState.myRole === 'spy'
                    ? 'Find the imposter(s)!'
                    : 'Find the imposter(s)!'}
                </p>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-center">
                <p className="text-yellow-200 text-sm">
                  ⚠️ Wait for the host to start the game
                </p>
              </div>

              {gameState.isHost && (
                <button
                  onClick={() => setPhase('playing')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Start Round
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Offline mode: Sequential reveal
  if (!currentPlayer) {
    return null
  }

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
            <span>Player {gameState.currentRevealIndex + 1} of {gameState.players.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {currentPlayer.name}
          </h2>
          <p className="text-white/70 text-lg">
            Click to see your word
          </p>
        </div>

        {!wordRevealed ? (
          <div className="space-y-6">
            <div
              onClick={handleReveal}
              className="bg-white/5 rounded-lg p-12 text-center border-2 border-dashed border-white/20 cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-white/80 text-lg">
                Tap to reveal your word
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className={`rounded-lg p-8 text-center border-2 ${
                currentPlayer.role === 'imposter'
                  ? 'bg-red-500/20 border-red-500/50'
                  : gameState.spyCount > 0
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : currentPlayer.role === 'spy'
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'bg-blue-500/20 border-blue-500/50'
              }`}
            >
              <div className="text-5xl mb-4">
                {currentPlayer.role === 'imposter' ? '🕵️' : gameState.spyCount > 0 ? '👤' : (currentPlayer.role === 'spy' ? '🕵️‍♂️' : '👤')}
              </div>
              <div className="text-4xl font-bold text-white mb-4">
                {currentPlayer.role === 'imposter' ? `Gợi ý: ${currentPlayer.word}` : currentPlayer.word}
              </div>
              <div className="text-xl text-white/90 mb-2">
                {gameState.spyCount > 0
                  ? (currentPlayer.role === 'imposter' ? 'IMPOSTER' : 'NOT IMPOSTER')
                  : (currentPlayer.role === 'imposter' ? 'IMPOSTER' : currentPlayer.role === 'spy' ? 'SPY' : 'CIVILIAN')
                }
              </div>
              <p className="text-white/70 text-sm">
                {currentPlayer.role === 'imposter'
                  ? 'Find the word with hint. Good luck!'
                  : currentPlayer.role === 'spy'
                  ? 'Find the imposter(s)!'
                  : 'Find the imposter(s)!'}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {gameState.currentRevealIndex < gameState.players.length - 1
                ? 'Pass to Next Player'
                : 'Start Round'}
            </button>

            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-center">
              <p className="text-yellow-200 text-sm">
                ⚠️ Make sure no one else sees your word!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

