'use client'

import { useState } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function VotingScreen() {
  const { gameState, vote, eliminatePlayer, continueAfterTie, resetToRevealRoles } = useGame()
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0)
  const [votingComplete, setVotingComplete] = useState(false)
  const [showVoteResults, setShowVoteResults] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingVoteTargetId, setPendingVoteTargetId] = useState<string | null>(null)

  const currentVoter = gameState.players[currentVoterIndex]
  const hasVoted = currentVoter?.votedFor !== undefined

  const handleVoteClick = (targetId: string) => {
    if (currentVoter && !hasVoted) {
      setPendingVoteTargetId(targetId)
      setShowConfirmDialog(true)
    }
  }

  const handleConfirmVote = () => {
    if (currentVoter && pendingVoteTargetId) {
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

  const handleCancelVote = () => {
    setShowConfirmDialog(false)
    setPendingVoteTargetId(null)
  }

  const handleShowEliminated = () => {
    // Calculate who was voted out
    const sortedByVotes = [...gameState.players].sort((a, b) => b.votes - a.votes)
    const mostVoted = sortedByVotes[0]
    const secondMostVoted = sortedByVotes[1]
    
    // Check if there's a tie between top 2 players
    const isTie = secondMostVoted && mostVoted.votes === secondMostVoted.votes && mostVoted.votes > 0
    
    if (isTie) {
      // No one is eliminated, continue playing
      continueAfterTie()
    } else {
      // Eliminate the player (this will transition to reveal-eliminated phase)
      eliminatePlayer(mostVoted.id)
    }
  }

  // Show vote results first
  if (votingComplete && showVoteResults && gameState.phase === 'voting') {
    const sortedByVotes = [...gameState.players].sort((a, b) => b.votes - a.votes)
    const mostVoted = sortedByVotes[0]
    const secondMostVoted = sortedByVotes[1]
    const isTie = secondMostVoted && mostVoted.votes === secondMostVoted.votes && mostVoted.votes > 0
    
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
        </div>
      </div>
    )
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
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingVoteTargetId && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-4xl p-8 max-w-md w-full border border-white/30">
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
              <p className="text-white/60 text-sm">
                This action cannot be undone.
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
