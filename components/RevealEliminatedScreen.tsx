'use client'

import { useGame } from '@/contexts/GameContext'
import { useOnlineSyncWithStateUpdate } from '@/hooks/useOnlineSync'

export default function RevealEliminatedScreen() {
  const { gameState, processElimination } = useGame()

  // Subscribe to state changes in online mode
  useOnlineSyncWithStateUpdate()

  const isOnlineMode = gameState.mode === 'online'

  const eliminatedPlayer = gameState.players.find(
    (p) => p.id === gameState.eliminatedPlayerId
  )

  if (!eliminatedPlayer) {
    return null
  }

  const handleContinue = () => {
    processElimination()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Player Eliminated
        </h1>

        <div className={`rounded-lg p-8 text-center border-2 mb-6 ${
          eliminatedPlayer.role === 'imposter'
            ? 'bg-red-500/20 border-red-500/50'
            : gameState.spyCount > 0
            ? 'bg-blue-500/20 border-blue-500/50'
            : eliminatedPlayer.role === 'spy'
            ? 'bg-purple-500/20 border-purple-500/50'
            : 'bg-blue-500/20 border-blue-500/50'
        }`}>
          <div className="text-6xl mb-4">
            {eliminatedPlayer.role === 'imposter' ? '🕵️' : gameState.spyCount > 0 ? '👤' : (eliminatedPlayer.role === 'spy' ? '🕵️‍♂️' : '👤')}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {eliminatedPlayer.name}
          </h2>
          <p className="text-2xl text-white/90 mb-4">
            {gameState.spyCount > 0
              ? (eliminatedPlayer.role === 'imposter' ? 'IMPOSTER' : 'NOT IMPOSTER')
              : (eliminatedPlayer.role === 'imposter' ? 'IMPOSTER' : eliminatedPlayer.role === 'spy' ? 'SPY' : 'CIVILIAN')
            }
          </p>
          <p className="text-white/70">
            Received {eliminatedPlayer.votes} {eliminatedPlayer.votes === 1 ? 'vote' : 'votes'}
          </p>
        </div>

        {(!isOnlineMode || gameState.isHost) && (
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Continue
          </button>
        )}

        {isOnlineMode && !gameState.isHost && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-center">
            <p className="text-blue-200 text-sm">
              ⏳ Waiting for host to continue...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

