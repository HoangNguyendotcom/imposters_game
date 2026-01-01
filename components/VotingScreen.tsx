'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'
import { supabase } from '@/lib/supabaseClient'
import { useOnlineSyncWithStateUpdate } from '@/hooks/useOnlineSync'

export default function VotingScreen() {
  const { gameState, vote, eliminatePlayer, continueAfterTie, resetToRevealRoles, submitVoteOnline, quitRoom } = useGame()

  // Subscribe to state changes in online mode
  useOnlineSyncWithStateUpdate()

  const [currentVoterIndex, setCurrentVoterIndex] = useState(0)
  const [votingComplete, setVotingComplete] = useState(false)
  const [showVoteResults, setShowVoteResults] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingVoteTargetId, setPendingVoteTargetId] = useState<string | null>(null)

  // Online mode state
  const [voteCount, setVoteCount] = useState(0)
  const [hasVotedOnline, setHasVotedOnline] = useState(false)
  const [onlineVotes, setOnlineVotes] = useState<Record<string, number>>({})

  const isOnlineMode = gameState.mode === 'online'
  const currentVoter = gameState.players[currentVoterIndex]
  const hasVoted = currentVoter?.votedFor !== undefined

  // Check if current player is eliminated (online mode only)
  const isEliminated = isOnlineMode && gameState.myPlayerId && !gameState.players.some(p => p.id === gameState.myPlayerId)

  // Subscribe to votes in online mode
  useEffect(() => {
    if (!isOnlineMode || !gameState.roomId) return

    const loadExistingVotes = async () => {
      const { data } = await supabase
        .from('votes')
        .select('*')
        .eq('room_id', gameState.roomId)
        .eq('round_number', gameState.currentRound)

      if (data) {
        setVoteCount(data.length)

        // Check if current player has voted
        const myVote = data.find(v => v.voter_client_id === gameState.myClientId)
        setHasVotedOnline(!!myVote)

        // Count votes for each target
        const voteCounts: Record<string, number> = {}
        data.forEach(v => {
          voteCounts[v.target_player_id] = (voteCounts[v.target_player_id] || 0) + 1
        })
        setOnlineVotes(voteCounts)
      }
    }

    loadExistingVotes()

    const channel = supabase
      .channel(`votes:${gameState.roomId}:${gameState.currentRound}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `room_id=eq.${gameState.roomId}`,
        },
        (payload) => {
          const vote = payload.new as any
          if (vote.round_number === gameState.currentRound) {
            setVoteCount(prev => prev + 1)

            // Check if it's my vote
            if (vote.voter_client_id === gameState.myClientId) {
              setHasVotedOnline(true)
            }

            // Update vote counts
            setOnlineVotes(prev => ({
              ...prev,
              [vote.target_player_id]: (prev[vote.target_player_id] || 0) + 1
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOnlineMode, gameState.roomId, gameState.currentRound, gameState.myClientId])

  // Check if all players have voted (online mode)
  useEffect(() => {
    if (!isOnlineMode || !gameState.isHost) return

    const allVoted = voteCount === gameState.players.length
    if (allVoted && !votingComplete) {
      setVotingComplete(true)
      setShowVoteResults(true)
    }
  }, [isOnlineMode, gameState.isHost, voteCount, gameState.players.length, votingComplete])

  const handleVoteClick = (targetId: string) => {
    if (isOnlineMode) {
      if (!hasVotedOnline) {
        setPendingVoteTargetId(targetId)
        setShowConfirmDialog(true)
      }
    } else {
      if (currentVoter && !hasVoted) {
        setPendingVoteTargetId(targetId)
        setShowConfirmDialog(true)
      }
    }
  }

  const handleConfirmVote = async () => {
    if (!pendingVoteTargetId) return

    if (isOnlineMode) {
      // Online mode: Submit vote to Supabase
      await submitVoteOnline(pendingVoteTargetId)
      setShowConfirmDialog(false)
      setPendingVoteTargetId(null)
      setHasVotedOnline(true)
    } else {
      // Offline mode: Sequential voting
      if (currentVoter) {
        vote(currentVoter.id, pendingVoteTargetId)
        setShowConfirmDialog(false)
        setPendingVoteTargetId(null)

        // Move to next voter
        if (currentVoterIndex < gameState.players.length - 1) {
          setCurrentVoterIndex(currentVoterIndex + 1)
        } else {
          // All votes are in, show vote results first
          setVotingComplete(true)
          setShowVoteResults(true)
        }
      }
    }
  }

  const handleCancelVote = () => {
    setShowConfirmDialog(false)
    setPendingVoteTargetId(null)
  }

  const handleShowEliminated = () => {
    if (isOnlineMode) {
      // Online mode: Use onlineVotes to calculate results
      const voteCounts = gameState.players.map(p => ({
        ...p,
        votes: onlineVotes[p.id] || 0
      }))
      const sortedByVotes = voteCounts.sort((a, b) => b.votes - a.votes)
      const mostVoted = sortedByVotes[0]
      const secondMostVoted = sortedByVotes[1]
      const isTie = secondMostVoted && mostVoted.votes === secondMostVoted.votes && mostVoted.votes > 0

      if (isTie) {
        continueAfterTie()
      } else {
        eliminatePlayer(mostVoted.id)
      }
    } else {
      // Offline mode: Use gameState.players.votes
      const sortedByVotes = [...gameState.players].sort((a, b) => b.votes - a.votes)
      const mostVoted = sortedByVotes[0]
      const secondMostVoted = sortedByVotes[1]
      const isTie = secondMostVoted && mostVoted.votes === secondMostVoted.votes && mostVoted.votes > 0

      if (isTie) {
        continueAfterTie()
      } else {
        eliminatePlayer(mostVoted.id)
      }
    }
  }

  // Eliminated players see a waiting screen (online mode only)
  if (isEliminated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Quit button */}
        {isOnlineMode && (
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
            <div className="text-6xl mb-4">👻</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              You've been eliminated
            </h1>
            <p className="text-white/70 text-lg mb-6">
              Waiting for other players to vote...
            </p>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/60 text-sm">
                {voteCount} / {gameState.players.length} players have voted
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show vote results first
  if (votingComplete && showVoteResults && gameState.phase === 'voting') {
    let sortedByVotes, mostVoted, secondMostVoted, isTie

    if (isOnlineMode) {
      // Online mode: Calculate from onlineVotes
      const voteCounts = gameState.players.map(p => ({
        ...p,
        votes: onlineVotes[p.id] || 0
      }))
      sortedByVotes = voteCounts.sort((a, b) => b.votes - a.votes)
      mostVoted = sortedByVotes[0]
      secondMostVoted = sortedByVotes[1]
      isTie = secondMostVoted && mostVoted.votes === secondMostVoted.votes && mostVoted.votes > 0
    } else {
      // Offline mode: Use gameState.players
      sortedByVotes = [...gameState.players].sort((a, b) => b.votes - a.votes)
      mostVoted = sortedByVotes[0]
      secondMostVoted = sortedByVotes[1]
      isTie = secondMostVoted && mostVoted.votes === secondMostVoted.votes && mostVoted.votes > 0
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-white/20">
        <button
          onClick={resetToRevealRoles}
          className="mb-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 border border-white/20 flex items-center justify-center mx-auto"
          title="Reset"
        >
          <span className="text-lg">🔄</span>
        </button>
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Vote Results
          </h1>

          {isTie && (
            <div className="mb-6 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg p-6 text-center">
              <div className="text-5xl mb-4">⚖️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Tie Vote!</h2>
              <p className="text-white/80">
                    No one is eliminated. The game continues!
              </p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">All Votes:</h2>
            <div className="space-y-3">
              {sortedByVotes.map((player) => (
                <div
                  key={player.id}
                  className={`bg-white/10 rounded-lg p-4 flex justify-between items-center ${
                    isTie && (player.id === mostVoted.id || player.id === secondMostVoted.id)
                      ? 'border-2 border-yellow-500/50'
                      : ''
                  }`}
                >
                  <span className="text-white font-medium text-lg">{player.name}</span>
                  <span className="text-2xl font-bold text-purple-300">
                    {player.votes} {player.votes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {(!isOnlineMode || gameState.isHost) && (
            <button
              onClick={handleShowEliminated}
              className={`w-full font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                isTie
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
              }`}
            >
              {isTie ? 'Continue Playing' : 'Reveal Eliminated Player'}
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

  // Online mode: Show waiting screen if player has voted
  if (isOnlineMode && hasVotedOnline && !votingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-white/20">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Voting
          </h1>

          <div className="text-center mb-6">
            <div className="bg-green-500/20 border-2 border-green-500/50 rounded-lg p-8">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-white text-xl mb-2">Vote submitted!</p>
              <p className="text-white/70 text-sm">
                Waiting for other players to vote...
              </p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Vote Progress</span>
              <span className="text-white font-bold">{voteCount} / {gameState.players.length}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(voteCount / gameState.players.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }


  // Online mode: Voting UI
  if (isOnlineMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-white/20">
          <h1 className="text-4xl font-bold text-white text-center mb-2">
            {gameState.myName}
          </h1>
          <p className="text-white/70 text-center mb-8">
            Who do you think is the imposter?
          </p>

          <div className="mb-6 bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Votes submitted</span>
              <span className="text-white font-bold">{voteCount} / {gameState.players.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            {gameState.players
              .filter((p) => p.name !== gameState.myName)
              .map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleVoteClick(player.id)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 border border-white/20 text-left"
                >
                  {player.name}
                </button>
              ))}
            
            {/* Tie button - only visible to host */}
            {gameState.isHost && (
              <button
                onClick={() => continueAfterTie()}
                className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 border border-yellow-500/40 text-left flex items-center justify-center"
              >
                <span className="mr-2 text-2xl">🤝</span>
                Tie (Bỏ qua lượt vote này)
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && pendingVoteTargetId && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">❓</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Confirm Your Vote
                </h2>
                <p className="text-white/80 text-lg mb-2">
                  You are voting for:
                </p>
                <p className="text-2xl font-bold text-purple-300 mb-4">
                  {gameState.players.find(p => p.id === pendingVoteTargetId)?.name}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelVote}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmVote}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Confirm Vote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Offline mode: Sequential voting
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Quit button */}
      {isOnlineMode && (
        <button
          type="button"
          onClick={quitRoom}
          className="fixed top-3 left-3 z-30 rounded-full bg-red-500/40 border border-red-400/40 text-white text-sm px-4 py-2 shadow-lg backdrop-blur-md hover:bg-red-500/60 transition-all"
        >
          Quit Room
        </button>
      )}

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-white/20">
      <button
          onClick={resetToRevealRoles}
          className="mb-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 border border-white/20 flex items-center justify-center mx-auto"
          title="Reset"
        >
          <span className="text-lg">🔄</span>
        </button>
        <div className="mb-6">
          <div className="text-white/80 text-sm mb-2 text-center">
            Voter {currentVoterIndex + 1} of {gameState.players.length}
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentVoterIndex + 1) / gameState.players.length) * 100}%` }}
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          {currentVoter?.name}
        </h1>
        <p className="text-white/70 text-center mb-8">
          Who do you think is the imposter?
        </p>

        {hasVoted ? (
          <div className="text-center">
            <div className="bg-green-500/20 border-2 border-green-500/50 rounded-lg p-8 mb-6">
              <div className="text-5xl mb-4">✓</div>
              <p className="text-white text-lg">You have voted!</p>
              <p className="text-white/70 text-sm mt-2">
                Pass to next player...
              </p>
            </div>
            {currentVoterIndex < gameState.players.length - 1 && (
              <button
                onClick={() => setCurrentVoterIndex(currentVoterIndex + 1)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Next Voter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {gameState.players
              .filter((p) => p.id !== currentVoter?.id)
              .map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleVoteClick(player.id)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 border border-white/20 text-left"
                >
                  {player.name}
                </button>
              ))}
            <button
              onClick={() => continueAfterTie()}
              className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 border border-yellow-500/40 text-left flex items-center justify-center"
            >
              <span className="mr-2 text-2xl">🤝</span>
              Tie (Bỏ qua lượt vote này)
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingVoteTargetId && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">❓</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Confirm Your Vote
              </h2>
              <p className="text-white/80 text-lg mb-2">
                You are voting for:
              </p>
              <p className="text-2xl font-bold text-purple-300 mb-4">
                {gameState.players.find(p => p.id === pendingVoteTargetId)?.name}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelVote}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVote}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
