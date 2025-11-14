'use client'

import { useState } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function VotingScreen() {
  const { gameState, vote, eliminatePlayer } = useGame()
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0)
  const [votingComplete, setVotingComplete] = useState(false)
  const [showVoteResults, setShowVoteResults] = useState(false)

  const currentVoter = gameState.players[currentVoterIndex]
  const hasVoted = currentVoter?.votedFor !== undefined

  const handleVote = (targetId: string) => {
    if (currentVoter && !hasVoted) {
      vote(currentVoter.id, targetId)
      
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

  const handleShowEliminated = () => {
    // Calculate who was voted out
    const sortedByVotes = [...gameState.players].sort((a, b) => b.votes - a.votes)
    const mostVoted = sortedByVotes[0]
    // Eliminate the player (this will transition to reveal-eliminated phase)
    eliminatePlayer(mostVoted.id)
  }

  // Show vote results first
  if (votingComplete && showVoteResults && gameState.phase === 'voting') {
    const sortedByVotes = [...gameState.players].sort((a, b) => b.votes - a.votes)
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-white/20">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Vote Results
          </h1>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">All Votes:</h2>
            <div className="space-y-3">
              {sortedByVotes.map((player) => (
                <div
                  key={player.id}
                  className="bg-white/10 rounded-lg p-4 flex justify-between items-center"
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
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Reveal Eliminated Player
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-white/20">
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
                  onClick={() => handleVote(player.id)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 border border-white/20 text-left"
                >
                  {player.name}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
