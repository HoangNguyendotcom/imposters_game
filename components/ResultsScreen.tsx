'use client'

import { useEffect, useState } from 'react'
import { useGame } from '@/contexts/GameContext'
import { useOnlineSyncWithStateUpdate } from '@/hooks/useOnlineSync'

export default function ResultsScreen() {
  const { gameState, resetGame, playAgain, calculateResults, calculatePoints, fetchVoteHistoryFromSupabase, saveGameResultToSupabase, loadRoomGameHistory, quitRoom } = useGame()
  const [resultSaved, setResultSaved] = useState(false)

  // Subscribe to state changes in online mode
  useOnlineSyncWithStateUpdate()

  const isOnlineMode = gameState.mode === 'online'
  const isHost = gameState.isHost

  // Fetch vote history and save result in a single sequential flow (for accurate scoring)
  useEffect(() => {
    if (isOnlineMode && isHost && !resultSaved) {
      console.log('[ResultsScreen] Host starting result calculation flow...')

      // Sequential flow: fetch votes -> calculate with fetched data -> save
      const processResults = async () => {
        // Step 1: Fetch votes from Supabase (returns the voteRecords directly)
        console.log('[ResultsScreen] Step 1: Fetching vote history from Supabase...')
        const voteRecords = await fetchVoteHistoryFromSupabase()

        // Step 2: Calculate results using the fetched vote records (no need to wait for state update)
        console.log('[ResultsScreen] Step 2: Calculating results with fetched vote history...')
        const { winner } = calculateResults()
        const pointsBreakdown = calculatePoints(voteRecords)

        console.log('[ResultsScreen] Calculated points with complete vote history:', {
          voteHistoryLength: voteRecords.length,
          pointsBreakdown: pointsBreakdown.map(p => ({ name: p.playerName, points: p.totalPoints }))
        })

        // Step 3: Save to Supabase
        console.log('[ResultsScreen] Step 3: Saving game result to Supabase...')
        await saveGameResultToSupabase(pointsBreakdown, winner)
        console.log('[ResultsScreen] Game result saved to Supabase')
        setResultSaved(true)
      }

      processResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnlineMode, isHost, resultSaved])

  // Reset flag when leaving results screen (phase changes)
  useEffect(() => {
    if (gameState.phase !== 'results') {
      setResultSaved(false)
    }
  }, [gameState.phase])

  // Use the winner from gameState (synced from host in online mode)
  // For offline mode or as fallback, calculate the winner if not set
  let winner = gameState.winner
  if (!winner && !isOnlineMode) {
    // Offline mode: calculate winner as fallback
    const calculated = calculateResults()
    winner = calculated.winner
    console.log('[ResultsScreen] Offline mode - calculated winner as fallback:', winner)
  }

  const imposters = gameState.players.filter((p) => p.role === 'imposter')
  const civilians = gameState.players.filter((p) => p.role === 'civilian')
  const spies = gameState.players.filter((p) => p.role === 'spy')

  // Debug logging
  console.log('[ResultsScreen] Displaying results:', {
    winner: winner,
    gameStateWinner: gameState.winner,
    civilianWord: gameState.civilianWord,
    spyWord: gameState.spyWord,
    imposterHint: gameState.imposterHint,
    currentRound: gameState.currentRound,
    voteHistoryLength: gameState.voteHistory.length,
    eliminationHistoryLength: gameState.eliminationHistory.length,
    isOnlineMode,
    isHost,
  })

  // In online mode, non-host players must wait for winner to be synced from host
  if (isOnlineMode && !isHost && !winner) {
    console.log('[ResultsScreen] Non-host player waiting for winner to be synced from host...')
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Quit button for non-host players */}
        {isOnlineMode && !gameState.isHost && (
          <button
            type="button"
            onClick={quitRoom}
            className="fixed top-3 left-3 z-30 rounded-full bg-red-500/40 border border-red-400/40 text-white text-sm px-4 py-2 shadow-lg backdrop-blur-md hover:bg-red-500/60 transition-all"
          >
            Quit Room
          </button>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Loading Results...
            </h1>
            <p className="text-white/70">
              Waiting for final results from host...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Final fallback: if winner is still null (shouldn't happen), calculate it
  if (!winner) {
    console.warn('[ResultsScreen] Winner is null, calculating as fallback')
    const calculated = calculateResults()
    winner = calculated.winner
  }

  // Debug vote history details
  if (isOnlineMode && isHost && gameState.voteHistory.length > 0) {
    console.log('[ResultsScreen] Vote history for scoring:', gameState.voteHistory)
  }

  // Only calculate points breakdown if we're showing it (host or offline mode)
  const shouldShowPointsBreakdown = !isOnlineMode || isHost
  const pointsBreakdown = shouldShowPointsBreakdown ? calculatePoints() : []

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

  // Determine if current player won (for non-host online mode)
  const myRole = gameState.myRole
  const didIWin =
    (winner === 'civilians' && myRole === 'civilian') ||
    (winner === 'imposters' && myRole === 'imposter') ||
    (winner === 'spy' && myRole === 'spy')

  // Non-host player in online mode - Show simplified results
  if (isOnlineMode && !isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Quit button for non-host players */}
        {isOnlineMode && !gameState.isHost && (
          <button
            type="button"
            onClick={quitRoom}
            className="fixed top-3 left-3 z-30 rounded-full bg-red-500/40 border border-red-400/40 text-white text-sm px-4 py-2 shadow-lg backdrop-blur-md hover:bg-red-500/60 transition-all"
          >
            Quit Room
          </button>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {didIWin ? '🎉' : '😔'}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {didIWin ? 'You Win!' : 'You Lose!'}
            </h1>
            <p className="text-white/70 mb-4">
              {winner === 'civilians' ? 'Civilians Win!' : winner === 'spy' ? 'Spy Wins!' : 'Imposters Win!'}
            </p>
            <p className="text-white/60 text-sm">
              {winner === 'civilians'
                ? 'All imposters were eliminated!'
                : winner === 'spy'
                ? 'Spy achieved victory!'
                : gameState.imposterGuessedCorrectly
                ? 'The imposter guessed the word correctly!'
                : 'The imposters survived!'}
            </p>
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

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-blue-200 text-sm">
              ⏳ Waiting for host to start next game...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Host or offline mode - Show full points breakdown
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
