'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getRandomCivilianWord, getRandomWordPair, IMPOSTER_WORD } from '@/data/vietnameseWords'

export type GamePhase = 'setup' | 'names' | 'reveal-roles' | 'playing' | 'voting' | 'reveal-eliminated' | 'imposter-guess' | 'results'

export type PlayerRole = 'civilian' | 'imposter' | 'spy'

export interface Player {
  id: string
  name: string
  role: PlayerRole
  word: string
  votedFor?: string // player id
  votes: number // votes received
}

export interface GameState {
  phase: GamePhase
  playerCount: number
  roundDuration: number // in seconds, 0 means no timer (per player turn)
  players: Player[]
  originalPlayers: Omit<Player, 'role' | 'word' | 'votes'>[] // Store original players for playAgain
  civilianWord: string | null
  currentRevealIndex: number
  timer: number // remaining seconds
  currentPlayerIndex: number // current player talking
  playerTurnTimer: number // timer for current player's turn
  eliminatedPlayerId: string | null // ID of the eliminated player
  imposterCount: number // number of imposters
  spyCount: number // number of spies (0 = no spies)
  spyWord: string | null // word assigned to spy (word1 or word2 from pair)
  imposterHint: string | null // hint assigned to imposters when spy is enabled
  imposterGuessedCorrectly: boolean // true if imposters won by guessing the word
}

interface GameContextType {
  gameState: GameState
  setPlayerCount: (count: number) => void
  setRoundDuration: (duration: number) => void
  setImposterCount: (count: number) => void
  setSpyCount: (count: number) => void
  setPlayers: (players: Omit<Player, 'role' | 'word' | 'votes'>[]) => void
  setPhase: (phase: GamePhase) => void
  assignRoles: (players?: Omit<Player, 'role' | 'word' | 'votes'>[]) => void
  revealNextPlayer: () => void
  startGame: (players?: Omit<Player, 'role' | 'word' | 'votes'>[]) => void
  endRound: () => void
  nextPlayerTurn: () => void
  vote: (voterId: string, targetId: string) => void
  eliminatePlayer: (playerId: string) => void
  processElimination: () => void
  checkGameEnd: (eliminatedPlayerId?: string) => boolean
  calculateResults: () => { winner: 'civilians' | 'imposters' | 'spy'; votedOutPlayer: Player | null }
  resetGame: () => void
  playAgain: () => void
  resetToRevealRoles: () => void
  updateTimer: (seconds: number) => void
  updatePlayerTurnTimer: (seconds: number) => void
  continueAfterTie: () => void
  handleImposterGuess: (guess: string) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

const STORAGE_KEY = 'imposters_game_state'

const defaultGameState: GameState = {
  phase: 'setup',
  playerCount: 0,
  roundDuration: 0, // 0 = no timer
  players: [],
  originalPlayers: [],
  civilianWord: null,
  currentRevealIndex: 0,
  timer: 0,
  currentPlayerIndex: 0,
  playerTurnTimer: 0,
  eliminatedPlayerId: null,
  imposterCount: 1,
  spyCount: 0,
  spyWord: null,
  imposterHint: null,
  imposterGuessedCorrectly: false,
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultGameState)

  // Clear localStorage on mount to reset state on every page load/refresh
  useEffect(() => {
    // Clear any saved state on page load/refresh
    localStorage.removeItem(STORAGE_KEY)
    // Reset to default state
    setGameState(defaultGameState)
  }, [])

  // Save to localStorage whenever gameState changes (but only during active session)
  // Note: This will be cleared on next page load/refresh
  useEffect(() => {
    // Only save if not in default/initial state
    if (gameState.phase !== 'setup' || gameState.playerCount > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState))
    }
  }, [gameState])

  const setPlayerCount = (count: number) => {
    setGameState((prev) => ({ ...prev, playerCount: count }))
  }

  const setImposterCount = (count: number) => {
    setGameState((prev) => ({ ...prev, imposterCount: count }))
  }

  const setSpyCount = (count: number) => {
    setGameState((prev) => ({ ...prev, spyCount: count }))
  }

  const setRoundDuration = (duration: number) => {
    setGameState((prev) => ({ ...prev, roundDuration: duration, timer: duration }))
  }

  const setPlayers = (players: Omit<Player, 'role' | 'word' | 'votes'>[]) => {
    setGameState((prev) => ({
      ...prev,
      players: players.map((p) => ({
        ...p,
        role: 'civilian' as PlayerRole,
        word: '',
        votes: 0,
      })),
    }))
  }

  const setPhase = (phase: GamePhase) => {
    setGameState((prev) => ({ ...prev, phase }))
  }

  const assignRoles = (playersToAssign?: Omit<Player, 'role' | 'word' | 'votes'>[]) => {
    const players = playersToAssign || gameState.players
    const playerCount = players.length
    const imposterCount = gameState.imposterCount
    
    // Store original players for playAgain
    const originalPlayers = players.map((p) => ({
      id: p.id,
      name: p.name,
    }))
    
    // Step 1: Shuffle player array
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    
    let civilianWord: string | null = null
    let spyWord: string | null = null
    let imposterHint: string | null = null
    
    if (gameState.spyCount > 0) {
      // Spy mode: use word pairs
      const wordPair = getRandomWordPair()
      const randomAssignment = Math.random() < 0.5
      civilianWord = randomAssignment ? wordPair.word1 : wordPair.word2
      spyWord = randomAssignment ? wordPair.word2 : wordPair.word1
      imposterHint = wordPair.hint
      
      // Step 2: Assign roles (imposters, spies, civilians)
      // First N are imposters, next spyCount are spies, rest are civilians
      const playersWithRoles = shuffled.map((player, index) => {
        if (index < imposterCount) {
          return {
            ...player,
            role: 'imposter' as PlayerRole,
            word: imposterHint || IMPOSTER_WORD, // Fallback to IMPOSTER_WORD if null
            votes: 0,
            votedFor: undefined,
          }
        } else if (index < imposterCount + gameState.spyCount) {
          // Spies
          return {
            ...player,
            role: 'spy' as PlayerRole,
            word: spyWord || '', // Fallback to empty string if null
            votes: 0,
            votedFor: undefined,
          }
        } else {
          return {
            ...player,
            role: 'civilian' as PlayerRole,
            word: civilianWord || '', // Fallback to empty string if null
            votes: 0,
            votedFor: undefined,
          }
        }
      })
      
      // Step 3: Shuffle again to randomize order
      const finalPlayers = playersWithRoles.sort(() => Math.random() - 0.5)
      
      setGameState((prev) => ({
        ...prev,
        players: finalPlayers,
        originalPlayers,
        civilianWord,
        spyWord,
        imposterHint,
        phase: 'reveal-roles',
        currentRevealIndex: 0,
        imposterGuessedCorrectly: false,
      }))
    } else {
      // No spy mode: use word pairs, imposters get hint
      const wordPair = getRandomWordPair()
      civilianWord = wordPair.word1 // Civilians get word1
      imposterHint = wordPair.hint // Imposters get hint
      
      // Step 2: Assign first N players as imposters, rest as civilians
      const playersWithRoles = shuffled.map((player, index) => {
        const isImposter = index < imposterCount
        return {
          ...player,
          role: (isImposter ? 'imposter' : 'civilian') as PlayerRole,
          word: isImposter ? (imposterHint || IMPOSTER_WORD) : (civilianWord || ''), // Imposters get hint, civilians get word1
          votes: 0,
          votedFor: undefined,
        }
      })
      
      // Step 3: Shuffle again to randomize order
      const finalPlayers = playersWithRoles.sort(() => Math.random() - 0.5)

      setGameState((prev) => ({
        ...prev,
        players: finalPlayers,
        originalPlayers,
        civilianWord,
        spyWord: null,
        imposterHint,
        phase: 'reveal-roles',
        currentRevealIndex: 0,
        imposterGuessedCorrectly: false,
      }))
    }
  }

  const revealNextPlayer = () => {
    if (gameState.currentRevealIndex < gameState.players.length - 1) {
      setGameState((prev) => ({
        ...prev,
        currentRevealIndex: prev.currentRevealIndex + 1,
      }))
    } else {
      // All players have seen their roles, start the game
      setGameState((prev) => ({
        ...prev,
        phase: 'playing',
        timer: prev.roundDuration,
        currentPlayerIndex: 0,
        playerTurnTimer: prev.roundDuration,
      }))
    }
  }

  const startGame = (playersToAssign?: Omit<Player, 'role' | 'word' | 'votes'>[]) => {
    assignRoles(playersToAssign)
  }

  const endRound = () => {
    setGameState((prev) => ({
      ...prev,
      phase: 'voting',
      currentPlayerIndex: 0,
      playerTurnTimer: 0,
    }))
  }

  const nextPlayerTurn = () => {
    setGameState((prev) => {
      if (prev.currentPlayerIndex < prev.players.length - 1) {
        return {
          ...prev,
          currentPlayerIndex: prev.currentPlayerIndex + 1,
          playerTurnTimer: prev.roundDuration,
        }
      } else {
        // All players have talked, end round
        return {
          ...prev,
          phase: 'voting',
          currentPlayerIndex: 0,
          playerTurnTimer: 0,
        }
      }
    })
  }

  const updatePlayerTurnTimer = (seconds: number) => {
    setGameState((prev) => ({ ...prev, playerTurnTimer: seconds }))
  }

  const vote = (voterId: string, targetId: string) => {
    setGameState((prev) => {
      const updatedPlayers = prev.players.map((player) => {
        if (player.id === voterId) {
          return { ...player, votedFor: targetId }
        }
        if (player.id === targetId) {
          return { ...player, votes: player.votes + 1 }
        }
        return player
      })
      return { ...prev, players: updatedPlayers }
    })
  }

  const eliminatePlayer = (playerId: string) => {
    setGameState((prev) => {
      const eliminatedPlayer = prev.players.find(p => p.id === playerId)
      // If eliminated player is an imposter, go to guess phase
      // Otherwise, go to reveal-eliminated phase
      const nextPhase = eliminatedPlayer?.role === 'imposter' ? 'imposter-guess' : 'reveal-eliminated'
      return {
        ...prev,
        eliminatedPlayerId: playerId,
        phase: nextPhase,
      }
    })
  }

  const processElimination = () => {
    setGameState((prev) => {
      if (!prev.eliminatedPlayerId) return prev
      
      const updatedPlayers = prev.players.filter((p) => p.id !== prev.eliminatedPlayerId)
      const imposters = updatedPlayers.filter((p) => p.role === 'imposter')
      const civilians = updatedPlayers.filter((p) => p.role === 'civilian')
      const spies = updatedPlayers.filter((p) => p.role === 'spy')
      
      // Check win conditions after elimination
      const allImpostersEliminated = imposters.length === 0
      const civilianAlive = civilians.length + spies.length
      const civiliansEqualImposters = civilianAlive === imposters.length && imposters.length > 0
      
      // Spy win condition: all imposters eliminated AND spies == civilians
      const spyWins = prev.spyCount > 0 && allImpostersEliminated && spies.length > 0 && spies.length === civilians.length
      
      // Civilians win: all imposters eliminated AND all spies eliminated (only if spy mode is enabled)
      // If spy mode is not enabled, civilians win when all imposters are eliminated
      const civiliansWin = prev.spyCount > 0 
        ? (allImpostersEliminated && spies.length === 0)
        : allImpostersEliminated
      
      if (civiliansWin || civiliansEqualImposters || spyWins) {
        // Game ends
        return {
          ...prev,
          players: updatedPlayers,
          phase: 'results',
          eliminatedPlayerId: null,
        }
      }
      
      // Continue game - reset votes and go back to playing
      return {
        ...prev,
        players: updatedPlayers.map((p) => ({
          ...p,
          votes: 0,
          votedFor: undefined,
        })),
        phase: 'playing',
        timer: prev.roundDuration,
        currentPlayerIndex: 0,
        playerTurnTimer: prev.roundDuration,
        eliminatedPlayerId: null,
      }
    })
  }

  const checkGameEnd = (eliminatedPlayerId?: string) => {
    // If we have an eliminated player ID, check after elimination
    if (eliminatedPlayerId) {
      // The elimination already happened in eliminatePlayer, just return the phase
      return gameState.phase === 'results'
    }
    
    // Otherwise check current state
    const imposters = gameState.players.filter((p) => p.role === 'imposter')
    const civilians = gameState.players.filter((p) => p.role === 'civilian')
    const spies = gameState.players.filter((p) => p.role === 'spy')
    
    const allImpostersEliminated = imposters.length === 0
    const civiliansEqualImposters = civilians.length === imposters.length && imposters.length > 0
    
    // Spy win condition: all imposters eliminated AND spies == civilians
    const spyWins = gameState.spyCount > 0 && allImpostersEliminated && spies.length > 0 && spies.length === civilians.length
    
    // Civilians win: all imposters eliminated AND all spies eliminated (only if spy mode is enabled)
    // If spy mode is not enabled, civilians win when all imposters are eliminated
    const civiliansWin = gameState.spyCount > 0 
      ? (allImpostersEliminated && spies.length === 0)
      : allImpostersEliminated
    
    return civiliansWin || civiliansEqualImposters || spyWins
  }

  const calculateResults = () => {
    const imposters = gameState.players.filter((p) => p.role === 'imposter')
    const civilians = gameState.players.filter((p) => p.role === 'civilian')
    const spies = gameState.players.filter((p) => p.role === 'spy')
    
    const allImpostersEliminated = imposters.length === 0
    const civiliansEqualImposters = civilians.length === imposters.length && imposters.length > 0
    
    // Determine winner
    let winner: 'civilians' | 'imposters' | 'spy' = 'imposters'
    
    // If we're in results phase and there are still imposters alive,
    // it means they won (either by guessing correctly or by civilians == imposters)
    // We check civiliansEqualImposters first, but if that's false and imposters still exist,
    // it means they won by guessing correctly
    if (gameState.spyCount > 0 && allImpostersEliminated && spies.length > 0 && spies.length === civilians.length) {
      // Spy wins: all imposters eliminated AND spies == civilians
      winner = 'spy'
    } else if (gameState.spyCount > 0 && allImpostersEliminated && spies.length === 0) {
      // Civilians win: all imposters eliminated AND all spies eliminated (when spy mode is enabled)
      winner = 'civilians'
    } else if (gameState.spyCount === 0 && allImpostersEliminated) {
      // Civilians win: all imposters eliminated (when spy mode is not enabled)
      winner = 'civilians'
    } else if (civilians.length === 1 && imposters.length === 1) {
      // Civilians win: all imposters eliminated (when spy mode is not enabled)
      winner = 'imposters'
    }    else {
      // Civilians win: all imposters eliminated (when spy mode is not enabled)
      winner = 'civilians'
    } 
    // else if (civiliansEqualImposters) {
    //   // Imposters win if civilians == imposters
    //   winner = 'imposters'
    // } 
    // else if (imposters.length > 0) {
    //   // If imposters still exist and we're in results phase, they won by guessing correctly
    //   winner = 'imposters'
    // }
    
    return { 
      winner, 
      votedOutPlayer: null // Not needed for final results
    }
  }

  const updateTimer = (seconds: number) => {
    setGameState((prev) => ({ ...prev, timer: seconds }))
  }

  const resetGame = () => {
    setGameState(defaultGameState)
    localStorage.removeItem(STORAGE_KEY)
  }

  const continueAfterTie = () => {
    // Reset votes and continue playing after a tie
    setGameState((prev) => ({
      ...prev,
      phase: 'playing',
      players: prev.players.map((p) => ({
        ...p,
        votes: 0,
        votedFor: undefined,
      })),
      currentPlayerIndex: 0,
      playerTurnTimer: prev.roundDuration,
    }))
  }

  const resetToRevealRoles = () => {
    // Restore original players and reassign roles, then go to reveal-roles phase
    const playersToRestore = gameState.originalPlayers.length > 0 
      ? gameState.originalPlayers 
      : gameState.players.map((p) => ({ id: p.id, name: p.name }))
    
    // Reassign roles with the restored players (this will set phase to 'reveal-roles' and reset all state)
    assignRoles(playersToRestore)
  }

  const playAgain = () => {
    // Use resetToRevealRoles to go directly to reveal-roles
    resetToRevealRoles()
  }

  const handleImposterGuess = (guess: string) => {
    setGameState((prev) => {
      if (!prev.eliminatedPlayerId) return prev
      
      const eliminatedPlayer = prev.players.find(p => p.id === prev.eliminatedPlayerId)
      if (!eliminatedPlayer || eliminatedPlayer.role !== 'imposter') return prev
      
      // Check if guess matches the civilian word (case-insensitive, trim whitespace)
      const guessMatches = prev.civilianWord && 
        guess.trim().toLowerCase() === prev.civilianWord.trim().toLowerCase()
      
      if (guessMatches) {
        // Imposter guessed correctly - imposters win!
        return {
          ...prev,
          phase: 'results',
          eliminatedPlayerId: null,
          imposterGuessedCorrectly: true,
        }
      } else {
        // Imposter guessed wrong - continue with normal elimination
        const updatedPlayers = prev.players.filter((p) => p.id !== prev.eliminatedPlayerId)
        const imposters = updatedPlayers.filter((p) => p.role === 'imposter')
        const civilians = updatedPlayers.filter((p) => p.role === 'civilian')
        const spies = updatedPlayers.filter((p) => p.role === 'spy')
        
        // Check win conditions after elimination
        const allImpostersEliminated = imposters.length === 0
        const civilianAlive = civilians.length + spies.length
        const civiliansEqualImposters = civilianAlive === imposters.length && imposters.length > 0
        
        // Spy win condition: all imposters eliminated AND spies == civilians
        const spyWins = prev.spyCount > 0 && allImpostersEliminated && spies.length > 0 && spies.length === civilians.length
        
        // Civilians win: all imposters eliminated AND all spies eliminated (only if spy mode is enabled)
        const civiliansWin = prev.spyCount > 0 
          ? (allImpostersEliminated && spies.length === 0)
          : allImpostersEliminated
        
        if (civiliansWin || civiliansEqualImposters || spyWins) {
          // Game ends
          return {
            ...prev,
            players: updatedPlayers,
            phase: 'results',
            eliminatedPlayerId: null,
          }
        }
        
        // Continue game - reset votes and go back to playing
        return {
          ...prev,
          players: updatedPlayers.map((p) => ({
            ...p,
            votes: 0,
            votedFor: undefined,
          })),
          phase: 'playing',
          timer: prev.roundDuration,
          currentPlayerIndex: 0,
          playerTurnTimer: prev.roundDuration,
          eliminatedPlayerId: null,
        }
      }
    })
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        setPlayerCount,
        setRoundDuration,
        setImposterCount,
        setSpyCount,
        setPlayers,
        setPhase,
        assignRoles,
        revealNextPlayer,
        startGame,
        endRound,
        nextPlayerTurn,
        vote,
        eliminatePlayer,
        processElimination,
        checkGameEnd,
        calculateResults,
        resetGame,
        playAgain,
        resetToRevealRoles,
        updateTimer,
        updatePlayerTurnTimer,
        continueAfterTie,
        handleImposterGuess,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
