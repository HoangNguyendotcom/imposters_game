'use client'

import { useGame } from '@/contexts/GameContext'

export default function ResultsScreen() {
  const { gameState, resetGame, playAgain, calculateResults } = useGame()

  const { winner, votedOutPlayer } = calculateResults()
  const imposters = gameState.players.filter((p) => p.role === 'imposter')
  const civilians = gameState.players.filter((p) => p.role === 'civilian')
  const spies = gameState.players.filter((p) => p.role === 'spy')

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
              : `The imposter${imposters.length > 1 ? 's' : ''} survived!`}
          </p>
        </div>

        {/* <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-red-500/20 rounded-lg p-6 border-2 border-red-500/50">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🕵️</span> Imposter{imposters.length > 1 ? 's' : ''}
            </h2>
            <div className="space-y-3">
              {imposters.map((player) => (
                <div
                  key={player.id}
                  className="bg-white/10 rounded-lg p-4"
                >
                  <div className="text-white font-semibold text-lg mb-1">
                    {player.name}
                  </div>
                  <div className="text-red-300 font-bold text-xl">
                    {player.word}
                  </div>
                  <div className="text-white/60 text-sm mt-1">
                    Received {player.votes} {player.votes === 1 ? 'vote' : 'votes'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/20 rounded-lg p-6 border-2 border-blue-500/50">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>👤</span> Civilian{civilians.length > 1 ? 's' : ''}
            </h2>
            <div className="space-y-3">
              {civilians.map((player) => (
                <div
                  key={player.id}
                  className="bg-white/10 rounded-lg p-4"
                >
                  <div className="text-white font-semibold text-lg mb-1">
                    {player.name}
                  </div>
                  <div className="text-blue-300 font-bold text-xl">
                    {player.word}
                  </div>
                  <div className="text-white/60 text-sm mt-1">
                    Received {player.votes} {player.votes === 1 ? 'vote' : 'votes'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}

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
                <span className="text-red-300 font-bold">{gameState.imposterHint}</span>
              </>
            ) : (
              <>
                <span className="font-semibold">Civilian word:</span>{' '}
                <span className="text-blue-300 font-bold">{gameState.civilianWord}</span>
                {' | '}
                <span className="font-semibold">Imposter hint:</span>{' '}
                <span className="text-red-300 font-bold">{gameState.imposterHint}</span>
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
