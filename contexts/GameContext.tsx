'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getRandomCivilianWord, getRandomWordPair, IMPOSTER_WORD } from '@/data/vietnameseWords'

export type GamePhase = 'setup' | 'names' | 'reveal-roles' | 'playing' | 'voting' | 'reveal-eliminated' | 'results'

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
  autoCalculateImposters: boolean // true = auto-calculate, false = manual
  manualImposterCount: number // manual imposter count (only used if autoCalculateImposters is false)
  hasSpy: boolean // true = enable spy role
  spyWord: string | null // word assigned to spy (word1 or word2 from pair)
  imposterHint: string | null // hint assigned to imposters when spy is enabled
}

interface GameContextType {
  gameState: GameState
  setPlayerCount: (count: number) => void
  setRoundDuration: (duration: number) => void
  setAutoCalculateImposters: (auto: boolean) => void
  setManualImposterCount: (count: number) => void
  setHasSpy: (hasSpy: boolean) => void
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
  updateTimer: (seconds: number) => void
  updatePlayerTurnTimer: (seconds: number) => void
  getImposterCount: () => number
  continueAfterTie: () => void
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
  autoCalculateImposters: true,
  manualImposterCount: 1,
  hasSpy: false,
  spyWord: null,
  imposterHint: null,
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

  const setAutoCalculateImposters = (auto: boolean) => {
    setGameState((prev) => ({ ...prev, autoCalculateImposters: auto }))
  }

  const setManualImposterCount = (count: number) => {
    setGameState((prev) => ({ ...prev, manualImposterCount: count }))
  }

  const setHasSpy = (hasSpy: boolean) => {
    setGameState((prev) => ({ ...prev, hasSpy }))
  }

  const getImposterCount = () => {
    if (gameState.autoCalculateImposters) {
      // Auto-calculate: always 1 imposter
      return 1
    }
    return gameState.manualImposterCount
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
    const imposterCount = gameState.autoCalculateImposters
      ? 1 // Auto-calculate: always 1 imposter
      : gameState.manualImposterCount
    
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
    
    if (gameState.hasSpy) {
      // Spy mode: use word pairs
      const wordPair = getRandomWordPair()
      civilianWord = wordPair.word1 // Civilians get word1
      spyWord = wordPair.word2 // Spy gets word2
      imposterHint = wordPair.hint // Imposters get hint
      
      // Step 2: Assign roles (imposters, spy, civilians)
      // First N are imposters, next 1 is spy (if hasSpy), rest are civilians
      const playersWithRoles = shuffled.map((player, index) => {
        if (index < imposterCount) {
          return {
            ...player,
            role: 'imposter' as PlayerRole,
            word: imposterHint || IMPOSTER_WORD, // Fallback to IMPOSTER_WORD if null
            votes: 0,
            votedFor: undefined,
          }
        } else if (index === imposterCount) {
          // One spy
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
      }))
    } else {
      // Normal mode: no spy
      // Step 2: Assign first N players as imposters, rest as civilians
      const playersWithRoles = shuffled.map((player, index) => {
        const isImposter = index < imposterCount
        return {
          ...player,
          role: (isImposter ? 'imposter' : 'civilian') as PlayerRole,
          word: isImposter ? IMPOSTER_WORD : '', // Will be set to civilian word below
          votes: 0,
          votedFor: undefined,
        }
      })
      
      // Step 3: Shuffle again to randomize order
      const finalShuffled = playersWithRoles.sort(() => Math.random() - 0.5)
      
      // Step 4: Get random civilian word and assign to all civilians
      civilianWord = getRandomCivilianWord()
      const finalPlayers = finalShuffled.map((player) => ({
        ...player,
        word: player.role === 'civilian' ? (civilianWord || '') : IMPOSTER_WORD,
      }))

      setGameState((prev) => ({
        ...prev,
        players: finalPlayers,
        originalPlayers,
        civilianWord,
        spyWord: null,
        imposterHint: null,
        phase: 'reveal-roles',
        currentRevealIndex: 0,
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
      // Store eliminated player ID and transition to reveal phase
      return {
        ...prev,
        eliminatedPlayerId: playerId,
        phase: 'reveal-eliminated',
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
      const civiliansEqualImposters = civilians.length === imposters.length && imposters.length > 0
      
      // Spy win condition: all imposters eliminated AND spies == civilians
      const spyWins = prev.hasSpy && allImpostersEliminated && spies.length > 0 && spies.length === civilians.length
      
      // Civilians win: all imposters eliminated AND all spies eliminated (only if spy mode is enabled)
      // If spy mode is not enabled, civilians win when all imposters are eliminated
      const civiliansWin = prev.hasSpy 
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
    const spyWins = gameState.hasSpy && allImpostersEliminated && spies.length > 0 && spies.length === civilians.length
    
    // Civilians win: all imposters eliminated AND all spies eliminated (only if spy mode is enabled)
    // If spy mode is not enabled, civilians win when all imposters are eliminated
    const civiliansWin = gameState.hasSpy 
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
    
    if (gameState.hasSpy && allImpostersEliminated && spies.length > 0 && spies.length === civilians.length) {
      // Spy wins: all imposters eliminated AND spies == civilians
      winner = 'spy'
    } else if (gameState.hasSpy && allImpostersEliminated && spies.length === 0) {
      // Civilians win: all imposters eliminated AND all spies eliminated (when spy mode is enabled)
      winner = 'civilians'
    } else if (!gameState.hasSpy && allImpostersEliminated) {
      // Civilians win: all imposters eliminated (when spy mode is not enabled)
      winner = 'civilians'
    } else if (civiliansEqualImposters) {
      // Imposters win if civilians == imposters
      winner = 'imposters'
    }
    
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

  const playAgain = () => {
    // Restore original players and reset game state
    setGameState((prev) => {
      // Use originalPlayers if available, otherwise fall back to current players
      const playersToRestore = prev.originalPlayers.length > 0 
        ? prev.originalPlayers 
        : prev.players.map((p) => ({ id: p.id, name: p.name }))
      
      return {
        ...prev,
        phase: 'names',
        players: playersToRestore.map((p) => ({
          id: p.id,
          name: p.name,
          role: 'civilian' as PlayerRole,
          word: '',
          votes: 0,
        })),
        civilianWord: null,
        currentRevealIndex: 0,
        timer: 0,
        currentPlayerIndex: 0,
        playerTurnTimer: 0,
        eliminatedPlayerId: null,
        autoCalculateImposters: true,
        manualImposterCount: 1,
        hasSpy: prev.hasSpy, // Keep spy setting
        spyWord: null,
        imposterHint: null,
      }
    })
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        setPlayerCount,
        setRoundDuration,
        setAutoCalculateImposters,
        setManualImposterCount,
        setHasSpy,
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
        updateTimer,
        updatePlayerTurnTimer,
        getImposterCount,
        continueAfterTie,
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
