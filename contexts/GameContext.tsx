'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getRandomCivilianWord, IMPOSTER_WORD } from '@/data/vietnameseWords'

export type GamePhase = 'setup' | 'names' | 'reveal-roles' | 'playing' | 'voting' | 'reveal-eliminated' | 'results'

export type PlayerRole = 'civilian' | 'imposter'

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
  civilianWord: string | null
  currentRevealIndex: number
  timer: number // remaining seconds
  currentPlayerIndex: number // current player talking
  playerTurnTimer: number // timer for current player's turn
  eliminatedPlayerId: string | null // ID of the eliminated player
  autoCalculateImposters: boolean // true = auto-calculate, false = manual
  manualImposterCount: number // manual imposter count (only used if autoCalculateImposters is false)
}

interface GameContextType {
  gameState: GameState
  setPlayerCount: (count: number) => void
  setRoundDuration: (duration: number) => void
  setAutoCalculateImposters: (auto: boolean) => void
  setManualImposterCount: (count: number) => void
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
  calculateResults: () => { civiliansWon: boolean; votedOutPlayer: Player | null }
  resetGame: () => void
  playAgain: () => void
  updateTimer: (seconds: number) => void
  updatePlayerTurnTimer: (seconds: number) => void
  getImposterCount: () => number
}

const GameContext = createContext<GameContextType | undefined>(undefined)

const STORAGE_KEY = 'imposters_game_state'

const defaultGameState: GameState = {
  phase: 'setup',
  playerCount: 0,
  roundDuration: 0, // 0 = no timer
  players: [],
  civilianWord: null,
  currentRevealIndex: 0,
  timer: 0,
  currentPlayerIndex: 0,
  playerTurnTimer: 0,
  eliminatedPlayerId: null,
  autoCalculateImposters: true,
  manualImposterCount: 1,
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

  const getImposterCount = () => {
    if (gameState.autoCalculateImposters) {
      return Math.max(1, Math.floor(gameState.playerCount / 4))
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
      ? Math.max(1, Math.floor(playerCount / 4))
      : gameState.manualImposterCount
    
    // Step 1: Shuffle player array
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    
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
    const civilianWord = getRandomCivilianWord()
    const finalPlayers = finalShuffled.map((player) => ({
      ...player,
      word: player.role === 'civilian' ? civilianWord : IMPOSTER_WORD,
    }))

    setGameState((prev) => ({
      ...prev,
      players: finalPlayers,
      civilianWord,
      phase: 'reveal-roles',
      currentRevealIndex: 0,
    }))
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
      
      // Check win conditions after elimination
      const allImpostersEliminated = imposters.length === 0
      const civiliansEqualImposters = civilians.length === imposters.length && imposters.length > 0
      
      if (allImpostersEliminated || civiliansEqualImposters) {
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
    
    const allImpostersEliminated = imposters.length === 0
    const civiliansEqualImposters = civilians.length === imposters.length && imposters.length > 0
    
    return allImpostersEliminated || civiliansEqualImposters
  }

  const calculateResults = () => {
    const imposters = gameState.players.filter((p) => p.role === 'imposter')
    const civilians = gameState.players.filter((p) => p.role === 'civilian')
    
    // Civilians win if all imposters are eliminated
    // Imposters win if civilians == imposters
    const civiliansWon = imposters.length === 0
    
    return { 
      civiliansWon, 
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

  const playAgain = () => {
    // Keep same players but reset game state
    setGameState((prev) => ({
      ...prev,
      phase: 'names',
      players: prev.players.map((p) => ({
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
    }))
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        setPlayerCount,
        setRoundDuration,
        setAutoCalculateImposters,
        setManualImposterCount,
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
