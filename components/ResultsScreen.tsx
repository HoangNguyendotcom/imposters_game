'use client'

import { useGame } from '@/contexts/GameContext'
import { useOnlineSyncWithStateUpdate } from '@/hooks/useOnlineSync'

export default function ResultsScreen() {
  const { gameState, resetGame, playAgain, calculateResults, calculatePoints } = useGame()

  // Subscribe to state changes in online mode
  useOnlineSyncWithStateUpdate()

  const { winner, votedOutPlayer } = calculateResults()
  const pointsBreakdown = calculatePoints()
  const imposters = gameState.players.filter((p) => p.role === 'imposter')
  const civilians = gameState.players.filter((p) => p.role === 'civilian')
  const spies = gameState.players.filter((p) => p.role === 'spy')

  // Calculate ranks for each player (1-based, handles ties)
  const getRank = (player: typeof pointsBreakdown[0]) => {
    const higherScores = pointsBreakdown.filter(p => p.totalPoints > player.totalPoints)
    const uniqueHigherScores = new Set(higherScores.map(p => p.totalPoints))
    return uniqueHigherScores.size + 1
  }

  // Get medal icon based on rank
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return ''
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-3xl w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {winner === 'civilians' ? '🎉' : winner === 'spy' ? '🕵️‍♂️' : '😈'}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {winner === 'civilians' ? 'Civilians Win!' : winner === 'spy' ? 'Spy Wins!' : 'Imposters Win!'}
          </h1>
          <p className="text-white/70">
            {winner === 'civilians'
              ? 'All imposters have been eliminated!'
              : winner === 'spy'
              ? 'All imposters eliminated and spy equals civilians!'
              : gameState.imposterGuessedCorrectly
              ? 'The imposter guessed the word correctly!'
              : `The imposter${imposters.length > 1 ? 's' : ''} survived!`}
          </p>
        </div>

        {/* Points Leaderboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Points Breakdown
          </h2>
          <div className="space-y-3">
            {pointsBreakdown.map((player) => {
              const rank = getRank(player)
              const medalIcon = getMedalIcon(rank)

              return (
                <div
                  key={player.playerId}
                  className={`bg-white/10 rounded-lg p-4 border ${
                    rank === 1 ? 'border-yellow-500/50' : 'border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {medalIcon}
                      </span>
                      <span className="text-white font-semibold text-lg">
                        {player.playerName}
                      </span>
                      <span className={`text-sm px-2 py-0.5 rounded ${
                        player.role === 'imposter' ? 'bg-red-500/30 text-red-300' :
                        player.role === 'spy' ? 'bg-purple-500/30 text-purple-300' :
                        'bg-blue-500/30 text-blue-300'
                      }`}>
                        {player.role}
                      </span>
                      {!player.survived && (
                        <span className="text-xs text-white/50">(eliminated)</span>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-yellow-300">
                      {player.totalPoints} pts
                    </span>
                  </div>

                  {/* Expandable breakdown */}
                  <details className="text-sm text-white/70">
                    <summary className="cursor-pointer hover:text-white/90">
                      View breakdown
                    </summary>
                    <ul className="mt-2 space-y-1 pl-4">
                      {player.breakdown.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
          <p className="text-white/80 text-center">
            {gameState.spyCount > 0 ? (
              <>
                <span className="font-semibold">Civilian word:</span>{' '}
                <span className="text-blue-300 font-bold">{gameState.civilianWord}</span>
                {' | '}
                <span className="font-semibold">Spy word:</span>{' '}
                <span className="text-purple-300 font-bold">{gameState.spyWord}</span>
                {' | '}
                <span className="font-semibold">Imposter hint:</span>{' '}
                <span className="text-red-300 font-bold">Gợi ý: {gameState.imposterHint}</span>
              </>
            ) : (
              <>
                <span className="font-semibold">Civilian word:</span>{' '}
                <span className="text-blue-300 font-bold">{gameState.civilianWord}</span>
                {' | '}
                <span className="font-semibold">Imposter hint:</span>{' '}
                <span className="text-red-300 font-bold">Gợi ý: {gameState.imposterHint}</span>
              </>
            )}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={playAgain}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Play Again (Same Players)
          </button> 
          <button
            onClick={resetGame}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 border border-white/20"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  )
}
