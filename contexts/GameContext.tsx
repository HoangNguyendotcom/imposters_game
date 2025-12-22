'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getRandomCivilianWord, getRandomWordPair, IMPOSTER_WORD } from '@/data/vietnameseWords'
import { supabase } from '@/lib/supabaseClient'

export type GamePhase =
  | 'setup'
  | 'online-lobby'
  | 'names'
  | 'reveal-roles'
  | 'playing'
  | 'voting'
  | 'reveal-eliminated'
  | 'imposter-guess'
  | 'results'

export type GameMode = 'offline' | 'online'

export type PlayerRole = 'civilian' | 'imposter' | 'spy'

export interface Player {
  id: string
  name: string
  role: PlayerRole
  word: string
  votedFor?: string // player id
  votes: number // votes received
}

// Track each vote cast in a round
export interface VoteRecord {
  voterId: string
  voterRole: PlayerRole
  targetId: string
  targetRole: PlayerRole
  round: number
}

// Track each elimination event
export interface EliminationRecord {
  playerId: string
  playerName: string
  playerRole: PlayerRole
  round: number
  voterIds: string[] // IDs of players who voted for this player
}

// Final points breakdown for each player
export interface PlayerPointsBreakdown {
  playerId: string
  playerName: string
  role: PlayerRole
  survived: boolean
  totalPoints: number
  breakdown: string[] // Human-readable breakdown
}

export interface GameState {
  phase: GamePhase
  mode: GameMode
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
  // Online metadata
  roomId: string | null
  roomCode: string | null
  isHost: boolean
  myName: string | null
  myClientId: string | null      // Current device's client ID
  myPlayerId: string | null      // Current player's ID in the game
  myRole: PlayerRole | null      // Current player's role (fetched privately in online mode)
  myWord: string | null          // Current player's word (fetched privately in online mode)
  // Points tracking
  currentRound: number
  voteHistory: VoteRecord[]
  eliminationHistory: EliminationRecord[]
  allPlayersSnapshot: Player[] // Snapshot at game start for scoring
}

export interface PlayerHistoryEntry {
  name: string
  civilianWins: number
  imposterWins: number
  spyWins: number
  totalPoints: number
  gamesPlayed: number
}

interface GameContextType {
  gameState: GameState
  setGameMode: (mode: GameMode) => void
  setOnlineInfo: (info: { roomId: string; roomCode: string; isHost: boolean; myName: string }) => void
  clearOnlineInfo: () => void
  setPlayerCount: (count: number) => void
  setRoundDuration: (duration: number) => void
  setImposterCount: (count: number) => void
  setSpyCount: (count: number) => void
  setPlayers: (players: Omit<Player, 'role' | 'word' | 'votes'>[]) => void
  setPhase: (phase: GamePhase) => void
  assignRoles: (players?: Omit<Player, 'role' | 'word' | 'votes'>[], imposterCount?: number, spyCount?: number) => void
  revealNextPlayer: () => void
  startGame: (players?: Omit<Player, 'role' | 'word' | 'votes'>[], imposterCount?: number, spyCount?: number) => void
  endRound: () => void
  nextPlayerTurn: () => void
  vote: (voterId: string, targetId: string) => void
  eliminatePlayer: (playerId: string) => void
  processElimination: () => void
  checkGameEnd: (eliminatedPlayerId?: string) => boolean
  calculateResults: () => { winner: 'civilians' | 'imposters' | 'spy'; votedOutPlayer: Player | null }
  calculatePoints: () => PlayerPointsBreakdown[]
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
  // Online sync functions
  syncStateToSupabase: () => Promise<void>
  syncStateFromSupabase: () => Promise<void>
  fetchMyRole: () => Promise<void>
  submitVoteOnline: (targetId: string) => Promise<void>
  initializeClientId: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

const STORAGE_KEY = 'imposters_game_state'
const HISTORY_STORAGE_KEY = 'imposters_game_history'

const defaultGameState: GameState = {
  phase: 'setup',
  mode: 'offline',
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
  roomId: null,
  roomCode: null,
  isHost: false,
  myName: null,
  myClientId: null,
  myPlayerId: null,
  myRole: null,
  myWord: null,
  currentRound: 0,
  voteHistory: [],
  eliminationHistory: [],
  allPlayersSnapshot: [],
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
        // Migrate old entries to include new fields
        const migrated = parsed.map((entry) => ({
          ...entry,
          totalPoints: entry.totalPoints ?? 0,
          gamesPlayed: entry.gamesPlayed ?? (entry.civilianWins + entry.imposterWins + entry.spyWins),
        }))
        setPlayerHistory(migrated)
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
  const persistHistory = useCallback((next: PlayerHistoryEntry[]) => {
    setPlayerHistory(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next))
    }
  }, [])

  const ensurePlayersInHistory = useCallback((players: { name: string }[]) => {
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
          totalPoints: 0,
          gamesPlayed: 0,
        })
        changed = true
      }
    })

    if (changed) {
      persistHistory(updated)
    }
  }, [playerHistory, persistHistory])

  const resetHistory = useCallback(() => {
    persistHistory([])
  }, [persistHistory])

  const removePlayerFromHistory = useCallback((name: string) => {
    persistHistory(playerHistory.filter((entry) => entry.name !== name))
  }, [playerHistory, persistHistory])

  const setPlayerCount = (count: number) => {
    setGameState((prev) => ({ ...prev, playerCount: count }))
  }

  const setGameMode = (mode: GameMode) => {
    setGameState((prev) => ({ ...prev, mode }))
  }

  const setOnlineInfo = (info: { roomId: string; roomCode: string; isHost: boolean; myName: string }) => {
    setGameState((prev) => ({
      ...prev,
      roomId: info.roomId,
      roomCode: info.roomCode,
      isHost: info.isHost,
      myName: info.myName,
      mode: 'online',
    }))
  }

  const clearOnlineInfo = () => {
    setGameState((prev) => ({
      ...prev,
      roomId: null,
      roomCode: null,
      isHost: false,
      myName: null,
      mode: 'offline',
    }))
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

  const setPhase = async (phase: GamePhase) => {
    setGameState((prev) => ({ ...prev, phase }))

    // Sync to Supabase if in online mode and is host
    if (gameState.mode === 'online' && gameState.isHost && gameState.roomId) {
      try {
        await supabase
          .from('room_state')
          .update({ phase })
          .eq('room_id', gameState.roomId)
      } catch (error) {
        console.error('Error syncing phase to Supabase:', error)
      }
    }
  }

  const assignRoles = async (playersToAssign?: Omit<Player, 'role' | 'word' | 'votes'>[], imposterCount?: number, spyCount?: number) => {
    const players = playersToAssign || gameState.players
    const playerCount = players.length
    const finalImposterCount = imposterCount ?? gameState.imposterCount
    const finalSpyCount = spyCount ?? gameState.spyCount

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

    if (finalSpyCount > 0) {
      // Spy mode: use word pairs
      const wordPair = getRandomWordPair()
      const randomAssignment = Math.random() < 0.5
      civilianWord = randomAssignment ? wordPair.word1 : wordPair.word2
      spyWord = randomAssignment ? wordPair.word2 : wordPair.word1
      imposterHint = wordPair.hint
      console.log('[assignRoles] Generated NEW words (spy mode):', { civilianWord, spyWord, imposterHint })

      // Step 2: Assign roles (imposters, spies, civilians)
      // First N are imposters, next spyCount are spies, rest are civilians
      const playersWithRoles = shuffled.map((player, index) => {
        if (index < finalImposterCount) {
          return {
            ...player,
            role: 'imposter' as PlayerRole,
            word: imposterHint || IMPOSTER_WORD, // Fallback to IMPOSTER_WORD if null
            votes: 0,
            votedFor: undefined,
          }
        } else if (index < finalImposterCount + finalSpyCount) {
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

      // Online mode: Write roles to player_roles table FIRST before changing phase
      if (gameState.mode === 'online' && gameState.isHost && gameState.roomId) {
        await writeRolesToSupabase(finalPlayers, gameState.roomId, civilianWord, spyWord, imposterHint)
      }

      setGameState((prev) => ({
        ...prev,
        players: finalPlayers,
        originalPlayers,
        civilianWord,
        spyWord,
        imposterHint,
        imposterCount: finalImposterCount,
        spyCount: finalSpyCount,
        phase: 'reveal-roles',
        currentRevealIndex: 0,
        imposterGuessedCorrectly: false,
        historyRecorded: false,
        currentRound: 1,
        voteHistory: [],
        eliminationHistory: [],
        allPlayersSnapshot: finalPlayers.map(p => ({ ...p })),
      }))
    } else {
      // No spy mode: use word pairs, imposters get hint
      const wordPair = getRandomWordPair()
      civilianWord = wordPair.word1 // Civilians get word1
      imposterHint = wordPair.hint // Imposters get hint
      console.log('[assignRoles] Generated NEW words (no-spy mode):', { civilianWord, imposterHint })
      
      // Step 2: Assign first N players as imposters, rest as civilians
      const playersWithRoles = shuffled.map((player, index) => {
        const isImposter = index < finalImposterCount
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

      // Online mode: Write roles to player_roles table FIRST before changing phase
      if (gameState.mode === 'online' && gameState.isHost && gameState.roomId) {
        await writeRolesToSupabase(finalPlayers, gameState.roomId, civilianWord, null, imposterHint)
      }

      setGameState((prev) => ({
        ...prev,
        players: finalPlayers,
        originalPlayers,
        civilianWord,
        spyWord: null,
        imposterHint,
        imposterCount: finalImposterCount,
        spyCount: finalSpyCount,
        phase: 'reveal-roles',
        currentRevealIndex: 0,
        imposterGuessedCorrectly: false,
        historyRecorded: false,
        currentRound: 1,
        voteHistory: [],
        eliminationHistory: [],
        allPlayersSnapshot: finalPlayers.map(p => ({ ...p })),
      }))
    }

    // Helper function to write roles to Supabase
    async function writeRolesToSupabase(
      players: Player[],
      roomId: string,
      civilianWord: string | null,
      spyWord: string | null,
      imposterHint: string | null
    ) {
      try {
        console.log('[writeRolesToSupabase] Cleaning up old roles and writing new ones for room:', roomId)
        // Delete existing roles for this room
        await supabase.from('player_roles').delete().eq('room_id', roomId)

        // Get room_players to map client_ids
        const { data: roomPlayers } = await supabase
          .from('room_players')
          .select('id, client_id, name')
          .eq('room_id', roomId)

        if (!roomPlayers) {
          console.error('No room players found for room:', roomId)
          return
        }

        // Insert new roles - match by ID since player.id is the room_players UUID
        const roleInserts = players.map((player) => {
          const roomPlayer = roomPlayers.find((rp) => String(rp.id) === player.id)
          if (!roomPlayer) {
            console.error('No room player found for player:', player.id, player.name)
          }
          return {
            room_id: roomId,
            player_id: player.id,
            client_id: roomPlayer?.client_id || '',
            role: player.role,
            word: player.word,
          }
        })

        const { error } = await supabase.from('player_roles').insert(roleInserts)
        if (error) {
          console.error('Error inserting player roles:', error)
          throw error
        }

        // Sync game state to room_state
        const stateToSync = {
          phase: 'reveal-roles',
          civilianWord,
          spyWord,
          imposterHint,
          currentRound: 1,
          currentPlayerIndex: 0,
          playerTurnTimer: 0,
          roundDuration: gameState.roundDuration,
          imposterCount: finalImposterCount,
          spyCount: finalSpyCount,
          eliminatedPlayerId: null,
          imposterGuessedCorrectly: false,
          players: players.map(p => ({
            id: p.id,
            name: p.name,
            votes: p.votes,
            votedFor: p.votedFor,
          })),
          voteHistory: [],
          eliminationHistory: [],
        }

        console.log('[writeRolesToSupabase] Syncing state with NEW words and EMPTY vote history:', {
          civilianWord,
          spyWord,
          imposterHint,
          voteHistoryLength: 0,
          eliminationHistoryLength: 0
        })

        await supabase
          .from('room_state')
          .update({ state_json: stateToSync, phase: 'reveal-roles' })
          .eq('room_id', roomId)
      } catch (error) {
        console.error('Error writing roles to Supabase:', error)
      }
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

  const startGame = (playersToAssign?: Omit<Player, 'role' | 'word' | 'votes'>[], imposterCount?: number, spyCount?: number) => {
    assignRoles(playersToAssign, imposterCount, spyCount)
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
      const voter = prev.players.find((p) => p.id === voterId)
      const target = prev.players.find((p) => p.id === targetId)

      // Record the vote
      const voteRecord: VoteRecord = {
        voterId,
        voterRole: voter?.role || 'civilian',
        targetId,
        targetRole: target?.role || 'civilian',
        round: prev.currentRound,
      }

      const updatedPlayers = prev.players.map((player) => {
        if (player.id === voterId) {
          return { ...player, votedFor: targetId }
        }
        if (player.id === targetId) {
          return { ...player, votes: player.votes + 1 }
        }
        return player
      })

      return {
        ...prev,
        players: updatedPlayers,
        voteHistory: [...prev.voteHistory, voteRecord],
      }
    })
  }

  const eliminatePlayer = (playerId: string) => {
    setGameState((prev) => {
      const eliminatedPlayer = prev.players.find(p => p.id === playerId)

      // Record voters for this player
      const voterIds = prev.players
        .filter(p => p.votedFor === playerId)
        .map(p => p.id)

      // Create elimination record
      const eliminationRecord: EliminationRecord = {
        playerId,
        playerName: eliminatedPlayer?.name || '',
        playerRole: eliminatedPlayer?.role || 'civilian',
        round: prev.currentRound,
        voterIds,
      }

      // If eliminated player is an imposter, go to guess phase
      // Otherwise, go to reveal-eliminated phase
      const nextPhase = eliminatedPlayer?.role === 'imposter' ? 'imposter-guess' : 'reveal-eliminated'

      return {
        ...prev,
        eliminatedPlayerId: playerId,
        phase: nextPhase,
        eliminationHistory: [...prev.eliminationHistory, eliminationRecord],
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
        currentRound: prev.currentRound + 1,
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

  const calculateResults = useCallback((): { winner: 'civilians' | 'imposters' | 'spy'; votedOutPlayer: Player | null } => {
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
  }, [gameState])

  const calculatePoints = useCallback((): PlayerPointsBreakdown[] => {
    const { winner } = calculateResults()
    const pointsBreakdown: PlayerPointsBreakdown[] = []

    // Use allPlayersSnapshot which contains all original players with their roles
    gameState.allPlayersSnapshot.forEach((player) => {
      let basePoints = 0
      let votingPoints = 0
      let roundSurvivalPoints = 0
      const breakdown: string[] = []

      // Check if player survived (still in players array)
      const survived = gameState.players.some((p) => p.id === player.id)

      // Calculate rounds survived for this player
      const playerEliminationRecord = gameState.eliminationHistory.find((e) => e.playerId === player.id)
      const roundsSurvived = playerEliminationRecord
        ? playerEliminationRecord.round - 1
        : gameState.currentRound

      if (player.role === 'civilian') {
        if (winner === 'civilians') {
          if (survived) {
            basePoints = 100
            breakdown.push('+100: Team won and survived')
          } else {
            basePoints = 50
            breakdown.push('+50: Team won but was eliminated')
          }
        } else {
          basePoints = 0
          breakdown.push('0: Team lost')
        }

        // Calculate voting points for ALL votes (not just eliminations)
        gameState.voteHistory
          .filter((v) => v.voterId === player.id)
          .forEach((vote) => {
            if (vote.targetRole === 'imposter') {
              votingPoints += 30
              breakdown.push(`+30: Voted for Imposter`)
            } else if (vote.targetRole === 'spy') {
              votingPoints += 15
              breakdown.push(`+15: Voted for Spy`)
            } else if (vote.targetRole === 'civilian') {
              votingPoints -= 10
              breakdown.push(`-10: Voted for Civilian`)
            }
          })
      } else if (player.role === 'spy') {
        if (winner === 'spy') {
          basePoints = 150
          breakdown.push('+150: Spy win condition met')
        } else {
          basePoints = 0
          breakdown.push('0: Spy did not win')
        }

        // Voting bonus for voting for civilians (ALWAYS awarded)
        gameState.voteHistory
          .filter((v) => v.voterId === player.id && v.targetRole === 'civilian')
          .forEach((vote) => {
            votingPoints += 20
            breakdown.push(`+20: Voted for Civilian`)
          })
      } else if (player.role === 'imposter') {
        if (winner === 'imposters') {
          basePoints = 150
          breakdown.push('+150: Guessed keyword correctly')
        } else {
          basePoints = 0
          breakdown.push('0: Failed to guess keyword')
        }

        // Round survival points (ALWAYS awarded regardless of win/loss)
        roundSurvivalPoints = roundsSurvived * 30
        if (roundSurvivalPoints > 0) {
          breakdown.push(`+${roundSurvivalPoints}: Survived ${roundsSurvived} round(s)`)
        }

        // Voting bonus for voting for civilians
        gameState.voteHistory
          .filter((v) => v.voterId === player.id && v.targetRole === 'civilian')
          .forEach((vote) => {
            votingPoints += 20
            breakdown.push(`+20: Voted for Civilian`)
          })
      }

      const totalPoints = basePoints + votingPoints + roundSurvivalPoints

      pointsBreakdown.push({
        playerId: player.id,
        playerName: player.name,
        role: player.role,
        survived,
        totalPoints,
        breakdown,
      })
    })

    return pointsBreakdown.sort((a, b) => b.totalPoints - a.totalPoints)
  }, [gameState, calculateResults])

  const updateTimer = (seconds: number) => {
    setGameState((prev) => ({ ...prev, timer: seconds }))
  }

  const resetGame = useCallback(() => {
    // In online mode, clean up Supabase data before resetting
    if (gameState.mode === 'online' && gameState.roomId) {
      // Delete player roles and votes for this room
      supabase.from('player_roles').delete().eq('room_id', gameState.roomId).then(() => {
        console.log('[resetGame] Cleaned up player_roles')
      })
      supabase.from('votes').delete().eq('room_id', gameState.roomId).then(() => {
        console.log('[resetGame] Cleaned up votes')
      })
    }

    setGameState(defaultGameState)
    localStorage.removeItem(STORAGE_KEY)
  }, [gameState.mode, gameState.roomId])

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

    // Clean up old votes before reassigning (player_roles is cleaned in assignRoles)
    if (gameState.mode === 'online' && gameState.roomId && gameState.isHost) {
      supabase.from('votes').delete().eq('room_id', gameState.roomId).then(() => {
        console.log('[resetToRevealRoles] Cleaned up old votes')
      })
    }

    // Reassign roles with the restored players - this generates NEW words and resets vote/elimination history
    assignRoles(playersToRestore, gameState.imposterCount, gameState.spyCount)
  }

  const playAgain = () => {
    // Use resetToRevealRoles to go directly to reveal-roles with new roles/words
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
          currentRound: prev.currentRound + 1,
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
    const pointsBreakdown = calculatePoints()

    const updatedHistory = [...playerHistory]

    pointsBreakdown.forEach((playerPoints) => {
      const idx = updatedHistory.findIndex((h) => h.name === playerPoints.playerName)

      const isWinner =
        (winner === 'civilians' && playerPoints.role === 'civilian') ||
        (winner === 'imposters' && playerPoints.role === 'imposter') ||
        (winner === 'spy' && playerPoints.role === 'spy')

      if (idx === -1) {
        updatedHistory.push({
          name: playerPoints.playerName,
          civilianWins: isWinner && playerPoints.role === 'civilian' ? 1 : 0,
          imposterWins: isWinner && playerPoints.role === 'imposter' ? 1 : 0,
          spyWins: isWinner && playerPoints.role === 'spy' ? 1 : 0,
          totalPoints: playerPoints.totalPoints,
          gamesPlayed: 1,
        })
      } else {
        const entry = updatedHistory[idx]
        const newTotalPoints = entry.totalPoints + playerPoints.totalPoints
        const newGamesPlayed = entry.gamesPlayed + 1

        updatedHistory[idx] = {
          ...entry,
          civilianWins: entry.civilianWins + (isWinner && playerPoints.role === 'civilian' ? 1 : 0),
          imposterWins: entry.imposterWins + (isWinner && playerPoints.role === 'imposter' ? 1 : 0),
          spyWins: entry.spyWins + (isWinner && playerPoints.role === 'spy' ? 1 : 0),
          totalPoints: newTotalPoints,
          gamesPlayed: newGamesPlayed,
        }
      }
    })

    persistHistory(updatedHistory)
    setGameState((prev) => ({ ...prev, historyRecorded: true }))
  }, [gameState.phase, gameState.historyRecorded, calculateResults, calculatePoints, playerHistory, persistHistory])

  // ====================
  // Online Sync Functions
  // ====================

  // Initialize or retrieve client ID (unique per device)
  // NOTE: Must use the same key as OnlineLobbyScreen
  const initializeClientId = useCallback(() => {
    if (typeof window === 'undefined') return

    let clientId = localStorage.getItem('imposters_client_id')
    if (!clientId) {
      clientId = `client-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem('imposters_client_id', clientId)
    }

    setGameState((prev) => ({ ...prev, myClientId: clientId }))
  }, [])

  // Initialize clientId on mount
  useEffect(() => {
    initializeClientId()
  }, [initializeClientId])

  // Sync game state to Supabase (host only)
  const syncStateToSupabase = useCallback(async () => {
    if (!gameState.roomId || !gameState.isHost) return

    console.log('[syncStateToSupabase] Syncing state to Supabase:', {
      phase: gameState.phase,
      currentPlayerIndex: gameState.currentPlayerIndex,
      playersCount: gameState.players.length,
    })

    try {
      const stateToSync = {
        phase: gameState.phase,
        civilianWord: gameState.civilianWord,
        spyWord: gameState.spyWord,
        imposterHint: gameState.imposterHint,
        currentRound: gameState.currentRound,
        currentPlayerIndex: gameState.currentPlayerIndex,
        playerTurnTimer: gameState.playerTurnTimer,
        roundDuration: gameState.roundDuration,
        imposterCount: gameState.imposterCount,
        spyCount: gameState.spyCount,
        eliminatedPlayerId: gameState.eliminatedPlayerId,
        imposterGuessedCorrectly: gameState.imposterGuessedCorrectly,
        players: gameState.players.map(p => ({
          id: p.id,
          name: p.name,
          votes: p.votes,
          votedFor: p.votedFor,
          // role and word are NOT included - stored separately
        })),
        voteHistory: gameState.voteHistory,
        eliminationHistory: gameState.eliminationHistory,
      }

      await supabase
        .from('room_state')
        .update({ state_json: stateToSync, phase: gameState.phase })
        .eq('room_id', gameState.roomId)
    } catch (error) {
      console.error('Error syncing state to Supabase:', error)
    }
  }, [gameState])

  // Sync game state from Supabase (non-host players)
  const syncStateFromSupabase = useCallback(async () => {
    if (!gameState.roomId || gameState.isHost) return

    console.log('[syncStateFromSupabase] Fetching state for room:', gameState.roomId)

    try {
      const { data, error } = await supabase
        .from('room_state')
        .select('state_json, phase')
        .eq('room_id', gameState.roomId)
        .single()

      if (error) {
        console.error('[syncStateFromSupabase] Error fetching room state:', error)
        return
      }

      if (data && data.state_json) {
        const syncedState = data.state_json as any
        console.log('[syncStateFromSupabase] Synced state:', {
          phase: data.phase,
          currentPlayerIndex: syncedState.currentPlayerIndex,
          playersCount: syncedState.players?.length,
        })

        setGameState((prev) => ({
          ...prev,
          phase: data.phase as GamePhase,
          civilianWord: syncedState.civilianWord ?? prev.civilianWord,
          spyWord: syncedState.spyWord ?? prev.spyWord,
          imposterHint: syncedState.imposterHint ?? prev.imposterHint,
          currentRound: syncedState.currentRound ?? prev.currentRound,
          currentPlayerIndex: syncedState.currentPlayerIndex ?? prev.currentPlayerIndex,
          playerTurnTimer: syncedState.playerTurnTimer ?? prev.playerTurnTimer,
          roundDuration: syncedState.roundDuration ?? prev.roundDuration,
          imposterCount: syncedState.imposterCount ?? prev.imposterCount,
          spyCount: syncedState.spyCount ?? prev.spyCount,
          eliminatedPlayerId: syncedState.eliminatedPlayerId ?? prev.eliminatedPlayerId,
          imposterGuessedCorrectly: syncedState.imposterGuessedCorrectly ?? prev.imposterGuessedCorrectly,
          players: syncedState.players?.map((p: any) => {
            // For non-host players, they only know their own role (from fetchMyRole)
            // Other players' roles are not synced (privacy)
            const existingPlayer = prev.players.find(pp => pp.id === p.id)
            return {
              id: p.id,
              name: p.name,
              votes: p.votes ?? 0,
              votedFor: p.votedFor,
              role: existingPlayer?.role || 'civilian',
              word: existingPlayer?.word || '',
            }
          }) ?? prev.players,
          voteHistory: syncedState.voteHistory ?? prev.voteHistory,
          eliminationHistory: syncedState.eliminationHistory ?? prev.eliminationHistory,
        }))
      }
    } catch (error) {
      console.error('Error syncing state from Supabase:', error)
    }
  }, [gameState.roomId, gameState.isHost])

  // Fetch current player's role from player_roles table
  const fetchMyRole = useCallback(async () => {
    if (!gameState.roomId || !gameState.myClientId) {
      console.error('Cannot fetch role: missing roomId or myClientId', {
        roomId: gameState.roomId,
        myClientId: gameState.myClientId,
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('player_roles')
        .select('role, word, player_id')
        .eq('room_id', gameState.roomId)
        .eq('client_id', gameState.myClientId)
        .single()

      if (error) {
        console.error('Error fetching role:', error)
        throw error
      }

      if (data) {
        setGameState((prev) => ({
          ...prev,
          myRole: data.role as PlayerRole,
          myWord: data.word,
          myPlayerId: data.player_id,
        }))
      }
    } catch (error) {
      console.error('Error fetching my role:', error)
    }
  }, [gameState.roomId, gameState.myClientId])

  // Submit vote in online mode
  const submitVoteOnline = useCallback(async (targetId: string) => {
    if (!gameState.roomId || !gameState.myPlayerId) return

    try {
      await supabase.from('votes').insert({
        room_id: gameState.roomId,
        voter_client_id: gameState.myClientId,
        voter_player_id: gameState.myPlayerId,
        target_player_id: targetId,
        round_number: gameState.currentRound,
      })
    } catch (error) {
      console.error('Error submitting vote:', error)
    }
  }, [gameState.roomId, gameState.myClientId, gameState.myPlayerId, gameState.currentRound])

  // Auto-sync state to Supabase when host makes changes
  useEffect(() => {
    if (gameState.mode === 'online' && gameState.isHost && gameState.roomId) {
      // Don't sync during setup or lobby
      if (gameState.phase === 'setup' || gameState.phase === 'online-lobby') return

      syncStateToSupabase()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameState.mode,
    gameState.isHost,
    gameState.roomId,
    gameState.phase,
    gameState.currentPlayerIndex,
    gameState.eliminatedPlayerId,
    // Don't include playerTurnTimer - we don't need to sync every second!
    // Don't include syncStateToSupabase or players to avoid infinite loop
  ])

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameMode,
        setOnlineInfo,
        clearOnlineInfo,
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
        calculatePoints,
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
        // Online sync functions
        syncStateToSupabase,
        syncStateFromSupabase,
        fetchMyRole,
        submitVoteOnline,
        initializeClientId,
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
