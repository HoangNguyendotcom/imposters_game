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
  historyRecorded: boolean // ensure history for this game is only recorded once
}

export interface PlayerHistoryEntry {
  name: string
  civilianWins: number
  imposterWins: number
  spyWins: number
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
  playerHistory: PlayerHistoryEntry[]
  resetHistory: () => void
  removePlayerFromHistory: (name: string) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

const STORAGE_KEY = 'imposters_game_state'
const HISTORY_STORAGE_KEY = 'imposters_game_history'

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
  imposterCount: 0,
  spyCount: 0,
  spyWord: null,
  imposterHint: null,
  imposterGuessedCorrectly: false,
  historyRecorded: false,
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultGameState)
  const [playerHistory, setPlayerHistory] = useState<PlayerHistoryEntry[]>([])

  // Clear localStorage on mount to reset state on every page load/refresh
  useEffect(() => {
    // Clear any saved state on page load/refresh
    localStorage.removeItem(STORAGE_KEY)
    // Reset to default state
    setGameState(defaultGameState)
  }, [])

  // Load history on mount (kept across page refreshes)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as PlayerHistoryEntry[]
        setPlayerHistory(parsed)
      }
    } catch {
      // ignore malformed history
    }
  }, [])

  // Save to localStorage whenever gameState changes (but only during active session)
  // Note: This will be cleared on next page load/refresh
  useEffect(() => {
    // Only save if not in default/initial state
    if (gameState.phase !== 'setup' || gameState.playerCount > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState))
    }
  }, [gameState])

  // Helper to persist history
  const persistHistory = (next: PlayerHistoryEntry[]) => {
    setPlayerHistory(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next))
    }
  }

  const ensurePlayersInHistory = (players: { name: string }[]) => {
    if (!players.length) return

    const updated = [...playerHistory]
    let changed = false

    players.forEach((p) => {
      const existing = updated.find((h) => h.name === p.name)
      if (!existing) {
        updated.push({
          name: p.name,
          civilianWins: 0,
          imposterWins: 0,
          spyWins: 0,
        })
        changed = true
      }
    })

    if (changed) {
      persistHistory(updated)
    }
  }

  const resetHistory = () => {
    persistHistory([])
  }

  const removePlayerFromHistory = (name: string) => {
    persistHistory(playerHistory.filter((entry) => entry.name !== name))
  }

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
    // Ngay sau khi nhập tên xong (NameCollectionScreen), tạo list player rỗng trong history
    ensurePlayersInHistory(players)

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
        historyRecorded: false,
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
        historyRecorded: false,
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
      
      // New rule: if 2 players left (1 imposter, 1 other), imposter gets to guess
      if (updatedPlayers.length === 2 && imposters.length === 1) {
        return {
          ...prev,
          players: updatedPlayers,
          phase: 'imposter-guess',
          eliminatedPlayerId: null, // Clear the ID, not relevant for this guess
        }
      }
      
      // New win condition logic
      // If all imposters are eliminated, check for spy/civilian win conditions
      if (imposters.length === 0) {
        // Spy wins if spies equal civilians
        if (prev.spyCount > 0 && spies.length > 0 && spies.length === civilians.length) {
          return { ...prev, players: updatedPlayers, phase: 'results', eliminatedPlayerId: null }
        }
        // Civilians win if all spies are also eliminated
        if (spies.length === 0) {
          return { ...prev, players: updatedPlayers, phase: 'results', eliminatedPlayerId: null }
        }
        // Otherwise, the game continues between spies and civilians
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

  const calculateResults = (): { winner: 'civilians' | 'imposters' | 'spy'; votedOutPlayer: Player | null } => {
    const { players, imposterGuessedCorrectly } = gameState

    // Imposters have only one win condition
    if (imposterGuessedCorrectly) {
      return { winner: 'imposters', votedOutPlayer: null }
    }

    // If imposters didn't win, the winner is determined by the remaining players.
    const spies = players.filter((p) => p.role === 'spy')
    const civilians = players.filter((p) => p.role === 'civilian')

    // Spy win conditions:
    // 1. They equal the number of civilians.
    // 2. They are the only non-imposter group left (covers 1v1 loss vs spy).
    if (spies.length > 0 && (spies.length === civilians.length || civilians.length === 0)) {
      return { winner: 'spy', votedOutPlayer: null }
    }

    // If spies haven't won, civilians win by default (as imposters have already lost).
    return { winner: 'civilians', votedOutPlayer: null }
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
      const guessMatches =
        prev.civilianWord && guess.trim().toLowerCase() === prev.civilianWord.trim().toLowerCase()

      // If guess is correct, Imposters always win
      if (guessMatches) {
        return {
          ...prev,
          phase: 'results',
          eliminatedPlayerId: null,
          imposterGuessedCorrectly: true,
        }
      }

      // --- GUESS IS WRONG ---

      // Scenario 1: Final guess with 2 players left (1 imposter, 1 other)
      if (prev.players.length === 2 && prev.players.some((p) => p.role === 'imposter')) {
        // Imposter guessed wrong and loses. The other player wins.
        const finalPlayers = prev.players.filter((p) => p.role !== 'imposter')
        return {
          ...prev,
          players: finalPlayers,
          phase: 'results',
          imposterGuessedCorrectly: false,
          eliminatedPlayerId: null,
        }
      }

      // Scenario 2: An imposter was just voted out and guessed wrong
      const eliminatedPlayer = prev.players.find((p) => p.id === prev.eliminatedPlayerId)
      if (eliminatedPlayer && eliminatedPlayer.role === 'imposter') {
        // Continue with normal elimination of the imposter
        const updatedPlayers = prev.players.filter((p) => p.id !== prev.eliminatedPlayerId)
        const imposters = updatedPlayers.filter((p) => p.role === 'imposter')
        const civilians = updatedPlayers.filter((p) => p.role === 'civilian')
        const spies = updatedPlayers.filter((p) => p.role === 'spy')

        // Check for other win conditions now that this imposter is gone
        if (imposters.length === 0) {
          // Spy wins if spies equal civilians
          if (prev.spyCount > 0 && spies.length > 0 && spies.length === civilians.length) {
            return { ...prev, players: updatedPlayers, phase: 'results', eliminatedPlayerId: null }
          }
          // Civilians win if all spies are also eliminated
          if (spies.length === 0) {
            return { ...prev, players: updatedPlayers, phase: 'results', eliminatedPlayerId: null }
          }
          // Otherwise, the game continues between spies and civilians
        }

        // If game is not over, continue to next round
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

      // Fallback if something unexpected happens
      return prev
    })
  }

  // Automatically record history when a game reaches results phase (once per game)
  useEffect(() => {
    if (gameState.phase !== 'results' || gameState.historyRecorded) return

    const { winner } = calculateResults()

    const winningRole: PlayerRole =
      winner === 'civilians' ? 'civilian' : winner === 'imposters' ? 'imposter' : 'spy'

    const winningPlayers = gameState.players.filter((p) => p.role === winningRole)

    if (winningPlayers.length === 0) {
      // Still mark as recorded to avoid infinite loop
      setGameState((prev) => ({ ...prev, historyRecorded: true }))
      return
    }

    const updatedHistory = [...playerHistory]

    winningPlayers.forEach((player) => {
      const idx = updatedHistory.findIndex((h) => h.name === player.name)
      if (idx === -1) {
        updatedHistory.push({
          name: player.name,
          civilianWins: winningRole === 'civilian' ? 1 : 0,
          imposterWins: winningRole === 'imposter' ? 1 : 0,
          spyWins: winningRole === 'spy' ? 1 : 0,
        })
      } else {
        const entry = updatedHistory[idx]
        updatedHistory[idx] = {
          ...entry,
          civilianWins: entry.civilianWins + (winningRole === 'civilian' ? 1 : 0),
          imposterWins: entry.imposterWins + (winningRole === 'imposter' ? 1 : 0),
          spyWins: entry.spyWins + (winningRole === 'spy' ? 1 : 0),
        }
      }
    })

    persistHistory(updatedHistory)
    setGameState((prev) => ({ ...prev, historyRecorded: true }))
  }, [gameState.phase, gameState.historyRecorded, gameState.players, playerHistory, calculateResults])

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
        playerHistory,
        resetHistory,
        removePlayerFromHistory,
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
