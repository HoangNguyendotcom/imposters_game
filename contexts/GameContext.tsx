'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getRandomCivilianWord, getRandomWordPair, IMPOSTER_WORD } from '@/data/vietnameseWords'
import { supabase } from '@/lib/supabaseClient'
import { SCORING } from '@/data/scoringConstants'

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

// Timeout record when a player runs out of time
export interface TimeoutRecord {
  playerId: string
  playerName: string
  round: number
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
  winner: 'civilians' | 'imposters' | 'spy' | null // Winner of the game (synced from host in online mode)
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
  timeoutHistory: TimeoutRecord[] // Track players who ran out of time
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
  quitRoom: () => Promise<void>
  deleteRoomFromSupabase: () => Promise<void>
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
  nextPlayerTurn: (timedOut?: boolean) => void
  vote: (voterId: string, targetId: string) => void
  eliminatePlayer: (playerId: string) => void
  processElimination: () => void
  checkGameEnd: (eliminatedPlayerId?: string) => boolean
  calculateResults: () => { winner: 'civilians' | 'imposters' | 'spy'; votedOutPlayer: Player | null }
  calculatePoints: (voteHistoryOverride?: VoteRecord[]) => PlayerPointsBreakdown[]
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
  fetchVoteHistoryFromSupabase: () => Promise<VoteRecord[]>
  clearVotesFromSupabase: () => Promise<void>
  saveGameResultToSupabase: (pointsBreakdown: PlayerPointsBreakdown[], winner: 'civilians' | 'imposters' | 'spy') => Promise<void>
  updateLocalScoresAfterCalculation: (pointsBreakdown: PlayerPointsBreakdown[]) => void
  loadRoomGameHistory: () => Promise<any[]>
  initializeClientId: () => void
  saveOnlineSession: () => void
  restoreOnlineSession: () => Promise<boolean>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

const STORAGE_KEY = 'imposters_game_state'
const HISTORY_STORAGE_KEY = 'imposters_game_history'
const ONLINE_SESSION_KEY = 'imposters_online_session'

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
  winner: null,
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
  timeoutHistory: [],
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(defaultGameState)
  const [playerHistory, setPlayerHistory] = useState<PlayerHistoryEntry[]>([])

  // Will restore online session later (after functions are defined)

  // Load history on mount (kept across page refreshes)
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Load local history (offline mode only)
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
    // Online mode: Room-specific game history is loaded via loadRoomGameHistory()
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
    // Clear online session from localStorage
    localStorage.removeItem(ONLINE_SESSION_KEY)
    console.log('[clearOnlineInfo] Cleared online session from localStorage')

    setGameState((prev) => ({
      ...prev,
      roomId: null,
      roomCode: null,
      isHost: false,
      myName: null,
      mode: 'offline',
    }))
  }

  const quitRoom = async () => {
    console.log('[quitRoom] Non-host player quitting room...')

    try {
      // Remove player from room_players in Supabase
      if (gameState.roomId && gameState.myClientId) {
        console.log('[quitRoom] Removing player from room_players:', {
          roomId: gameState.roomId,
          clientId: gameState.myClientId,
        })

        const { error } = await supabase
          .from('room_players')
          .delete()
          .eq('room_id', gameState.roomId)
          .eq('client_id', gameState.myClientId)

        if (error) {
          console.error('[quitRoom] Error removing player from room:', error)
        } else {
          console.log('[quitRoom] Successfully removed player from room')
        }
      }

      // Clear online session and reset game state
      clearOnlineInfo()

      // Reset to default game state and return to setup
      setGameState(defaultGameState)
      localStorage.removeItem(STORAGE_KEY)

      console.log('[quitRoom] Player has quit the room, returned to setup screen')
    } catch (err) {
      console.error('[quitRoom] Exception:', err)
    }
  }

  const deleteRoomFromSupabase = async () => {
    if (!gameState.roomId || !gameState.isHost) {
      console.log('[deleteRoomFromSupabase] Not host or no room')
      return
    }

    try {
      console.log('[deleteRoomFromSupabase] Deleting room:', gameState.roomId)

      // Delete related data (explicit cleanup)
      // 1. Delete player_roles
      await supabase.from('player_roles').delete().eq('room_id', gameState.roomId)
      console.log('[deleteRoomFromSupabase] Deleted player_roles')

      // 2. Delete votes
      await supabase.from('votes').delete().eq('room_id', gameState.roomId)
      console.log('[deleteRoomFromSupabase] Deleted votes')

      // 3. Delete room_state
      await supabase.from('room_state').delete().eq('room_id', gameState.roomId)
      console.log('[deleteRoomFromSupabase] Deleted room_state')

      // 4. Delete room_players
      await supabase.from('room_players').delete().eq('room_id', gameState.roomId)
      console.log('[deleteRoomFromSupabase] Deleted room_players')

      // 5. Delete room itself
      const { error: roomError } = await supabase.from('rooms').delete().eq('id', gameState.roomId)
      if (roomError) {
        console.error('[deleteRoomFromSupabase] Error deleting room:', roomError)
        throw roomError
      }

      console.log('[deleteRoomFromSupabase] Room deleted successfully')
    } catch (error) {
      console.error('[deleteRoomFromSupabase] Error:', error)
      throw error
    }
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
    // Calculate timer values if entering playing phase
    const isStartingPlay = phase === 'playing'

    setGameState((prev) => ({
      ...prev,
      phase,
      // Initialize timer when entering playing phase
      ...(isStartingPlay ? {
        playerTurnTimer: prev.roundDuration,
        currentPlayerIndex: 0,
        timer: prev.roundDuration,
      } : {})
    }))

    // Sync to Supabase if in online mode and is host
    if (gameState.mode === 'online' && gameState.isHost && gameState.roomId) {
      try {
        const updateData: any = { phase }
        // Also sync timer values when starting play
        if (isStartingPlay) {
          updateData.playerTurnTimer = gameState.roundDuration
          updateData.currentPlayerIndex = 0
        }
        await supabase
          .from('room_state')
          .update(updateData)
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

    // Clear old votes from Supabase before starting a new game (online mode only)
    if (gameState.mode === 'online' && gameState.isHost && gameState.roomId) {
      console.log('[assignRoles] Clearing old votes before starting new game')
      await clearVotesFromSupabase()
    }

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
        timeoutHistory: [],
        winner: null,
        // Clear myRole and myWord so fetchMyRole will be triggered again in online mode
        myRole: null,
        myWord: null,
      }))
    } else {
      // No spy mode: use word pairs, imposters get hint
      const wordPair = getRandomWordPair()
      civilianWord = Math.random() < 0.5 ? wordPair.word1 : wordPair.word2 // Randomly choose word1 or word2
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
        timeoutHistory: [],
        winner: null,
        // Clear myRole and myWord so fetchMyRole will be triggered again in online mode
        myRole: null,
        myWord: null,
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
          timeoutHistory: [],
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

  const nextPlayerTurn = (timedOut: boolean = false) => {
    setGameState((prev) => {
      const currentPlayer = prev.players[prev.currentPlayerIndex]
      const newTimeoutHistory = timedOut && currentPlayer ? [
        ...prev.timeoutHistory,
        {
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          round: prev.currentRound,
        }
      ] : prev.timeoutHistory

      if (prev.currentPlayerIndex < prev.players.length - 1) {
        return {
          ...prev,
          currentPlayerIndex: prev.currentPlayerIndex + 1,
          playerTurnTimer: prev.roundDuration,
          timeoutHistory: newTimeoutHistory,
        }
      } else {
        // All players have talked, end round
        return {
          ...prev,
          phase: 'voting',
          currentPlayerIndex: 0,
          playerTurnTimer: 0,
          timeoutHistory: newTimeoutHistory,
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
          return { ...prev, players: updatedPlayers, phase: 'results', eliminatedPlayerId: null, winner: 'spy' }
        }
        // Civilians win if all spies are also eliminated
        if (spies.length === 0) {
          return { ...prev, players: updatedPlayers, phase: 'results', eliminatedPlayerId: null, winner: 'civilians' }
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

  const calculatePoints = useCallback((voteHistoryOverride?: VoteRecord[]): PlayerPointsBreakdown[] => {
    const { winner } = calculateResults()
    const pointsBreakdown: PlayerPointsBreakdown[] = []

    // Use provided voteHistory or fall back to gameState.voteHistory
    const voteHistory = voteHistoryOverride || gameState.voteHistory

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
            basePoints = SCORING.CIVILIAN_WIN_SURVIVED
            breakdown.push(`+${SCORING.CIVILIAN_WIN_SURVIVED}: Team won and survived`)
          } else {
            basePoints = SCORING.CIVILIAN_WIN_ELIMINATED
            breakdown.push(`+${SCORING.CIVILIAN_WIN_ELIMINATED}: Team won but was eliminated`)
          }
        } else {
          basePoints = 0
          breakdown.push('0: Team lost')
        }

        // Calculate voting points for ALL votes (not just eliminations)
        voteHistory
          .filter((v) => v.voterId === player.id)
          .forEach((vote) => {
            if (vote.targetRole === 'imposter') {
              votingPoints += SCORING.CIVILIAN_VOTE_FOR_IMPOSTER
              breakdown.push(`+${SCORING.CIVILIAN_VOTE_FOR_IMPOSTER}: Voted for Imposter`)
            } else if (vote.targetRole === 'spy') {
              votingPoints += SCORING.CIVILIAN_VOTE_FOR_SPY
              breakdown.push(`+${SCORING.CIVILIAN_VOTE_FOR_SPY}: Voted for Spy`)
            } else if (vote.targetRole === 'civilian') {
              votingPoints += SCORING.CIVILIAN_VOTE_FOR_CIVILIAN
              breakdown.push(`${SCORING.CIVILIAN_VOTE_FOR_CIVILIAN}: Voted for Civilian`)
            }
          })
      } else if (player.role === 'spy') {
        if (winner === 'spy') {
          basePoints = SCORING.SPY_WIN
          breakdown.push(`+${SCORING.SPY_WIN}: Spy win condition met`)
        } else {
          basePoints = 0
          breakdown.push('0: Spy did not win')
        }

        // Voting bonus for voting for civilians (ALWAYS awarded)
        voteHistory
          .filter((v) => v.voterId === player.id && v.targetRole === 'civilian')
          .forEach((vote) => {
            votingPoints += SCORING.SPY_VOTE_FOR_CIVILIAN
            breakdown.push(`+${SCORING.SPY_VOTE_FOR_CIVILIAN}: Voted for Civilian`)
          })

        // Penalty for voting for spy
        voteHistory
          .filter((v) => v.voterId === player.id && v.targetRole === 'spy')
          .forEach((vote) => {
            votingPoints += SCORING.SPY_VOTE_FOR_SPY
            breakdown.push(`${SCORING.SPY_VOTE_FOR_SPY}: Voted for Spy`)
          })
      } else if (player.role === 'imposter') {
        if (winner === 'imposters') {
          basePoints = SCORING.IMPOSTER_WIN
          breakdown.push(`+${SCORING.IMPOSTER_WIN}: Guessed keyword correctly`)
        } else {
          basePoints = 0
          breakdown.push('0: Failed to guess keyword')
        }

        // Round survival points (ALWAYS awarded regardless of win/loss)
        roundSurvivalPoints = roundsSurvived * SCORING.IMPOSTER_ROUND_SURVIVAL
        if (roundSurvivalPoints > 0) {
          breakdown.push(`+${roundSurvivalPoints}: Survived ${roundsSurvived} round(s)`)
        }

        // Voting bonus for voting for spies
        voteHistory
          .filter((v) => v.voterId === player.id && v.targetRole === 'spy')
          .forEach((vote) => {
            votingPoints += SCORING.IMPOSTER_VOTE_FOR_SPY
            breakdown.push(`+${SCORING.IMPOSTER_VOTE_FOR_SPY}: Voted for Spy`)
          })

        // Penalty for voting for imposter
        voteHistory
          .filter((v) => v.voterId === player.id && v.targetRole === 'imposter')
          .forEach((vote) => {
            votingPoints += SCORING.IMPOSTER_VOTE_FOR_IMPOSTER
            breakdown.push(`${SCORING.IMPOSTER_VOTE_FOR_IMPOSTER}: Voted for Imposter`)
          })
      }

      // Timeout penalty
      const timeoutCount = gameState.timeoutHistory.filter(t => t.playerId === player.id).length
      const timeoutPenalty = timeoutCount * SCORING.TIMEOUT_PENALTY

      if (timeoutPenalty < 0) {
        breakdown.push(`${timeoutPenalty}: Ran out of time (${timeoutCount}x)`)
      }

      const totalPoints = basePoints + votingPoints + roundSurvivalPoints + timeoutPenalty

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
    localStorage.removeItem(ONLINE_SESSION_KEY)
    console.log('[resetGame] Cleared online session from localStorage')
  }, [gameState.mode, gameState.roomId])

  const continueAfterTie = () => {
    // Reset votes and continue playing after a tie
    // Increment currentRound so the next vote uses a new round_number in Supabase
    // This preserves vote history for scoring while allowing players to vote again
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
      currentRound: prev.currentRound + 1,
    }))
  }

  const resetToRevealRoles = () => {
    console.log('[resetToRevealRoles] Called - preparing to reassign roles with NEW words')
    console.log('[resetToRevealRoles] Current state before reset:', {
      civilianWord: gameState.civilianWord,
      spyWord: gameState.spyWord,
      imposterHint: gameState.imposterHint,
      voteHistoryLength: gameState.voteHistory.length,
      eliminationHistoryLength: gameState.eliminationHistory.length,
    })

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
      // Vietnamese classifiers/stopwords to remove
      const stopwords = [
        'con', 'cái', 'quả', 'trái', 'cây', 'bức', 'chiếc', 'tấm', 'cuốn',
        'bông', 'hạt', 'viên', 'tờ', 'lá', 'cặp', 'đôi', 'bộ', 'món', 'bài',
        'ngôi', 'căn', 'toà', 'tòa', 'con', 'cục', 'miếng', 'khúc', 'mảnh',
        'que', 'sợi', 'tia', 'làn', 'cơn', 'trận', 'cuộc', 'vụ', 'múi'
      ]

      // Function to normalize word by removing stopwords
      const normalizeWord = (word: string): string => {
        const normalized = word.trim().toLowerCase()
        const words = normalized.split(/\s+/)

        // Remove stopwords from the beginning
        const filtered = words.filter((w, index) => {
          // Only remove if it's the first word and it's a stopword
          if (index === 0 && stopwords.includes(w)) {
            return false
          }
          return true
        })

        return filtered.join(' ')
      }

      const normalizedCivilianWord = prev.civilianWord ? normalizeWord(prev.civilianWord) : ''
      const normalizedGuess = normalizeWord(guess)

      const guessMatches = normalizedCivilianWord && normalizedGuess === normalizedCivilianWord

      // If guess is correct, Imposters always win
      if (guessMatches) {
        return {
          ...prev,
          phase: 'results',
          eliminatedPlayerId: null,
          imposterGuessedCorrectly: true,
          winner: 'imposters',
        }
      }

      // --- GUESS IS WRONG ---

      // Scenario 1: Final guess with 2 players left (1 imposter, 1 other)
      if (prev.players.length === 2 && prev.players.some((p) => p.role === 'imposter')) {
        // Imposter guessed wrong and loses. The other player wins.
        const finalPlayers = prev.players.filter((p) => p.role !== 'imposter')
        const winner = finalPlayers[0]?.role === 'spy' ? 'spy' : 'civilians'
        return {
          ...prev,
          players: finalPlayers,
          phase: 'results',
          imposterGuessedCorrectly: false,
          eliminatedPlayerId: null,
          winner,
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
            return { ...prev, players: updatedPlayers, phase: 'results', eliminatedPlayerId: null, winner: 'spy' }
          }
          // Civilians win if all spies are also eliminated
          if (spies.length === 0) {
            return { ...prev, players: updatedPlayers, phase: 'results', eliminatedPlayerId: null, winner: 'civilians' }
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

    // Skip auto-record for online mode - history is saved to Supabase in ResultsScreen
    // after vote history is fetched for accurate scores
    if (gameState.mode === 'online') {
      console.log('[auto-record] Skipping auto-record for online mode - history saved to Supabase')
      setGameState((prev) => ({ ...prev, historyRecorded: true }))
      return
    }

    const { winner } = calculateResults()
    const pointsBreakdown = calculatePoints()

    // Update local history (for offline mode only)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.phase, gameState.historyRecorded, calculateResults, calculatePoints, playerHistory, persistHistory, gameState.mode, gameState.isHost])

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
        winner: gameState.winner,
        players: gameState.players.map(p => ({
          id: p.id,
          name: p.name,
          votes: p.votes,
          votedFor: p.votedFor,
          // role and word are NOT included - stored separately
        })),
        voteHistory: gameState.voteHistory,
        eliminationHistory: gameState.eliminationHistory,
        timeoutHistory: gameState.timeoutHistory,
      }

      await supabase
        .from('room_state')
        .update({ state_json: stateToSync, phase: gameState.phase })
        .eq('room_id', gameState.roomId)
    } catch (error) {
      console.error('Error syncing state to Supabase:', error)
    }
  }, [gameState])

  // Sync game state from Supabase (non-host players, or host during restore)
  const syncStateFromSupabase = useCallback(async (forceSync = false, roomIdOverride?: string) => {
    const roomId = roomIdOverride || gameState.roomId
    if (!roomId || (gameState.isHost && !forceSync)) return

    console.log('[syncStateFromSupabase] Fetching state for room:', roomId)

    try {
      const { data, error } = await supabase
        .from('room_state')
        .select('state_json, phase')
        .eq('room_id', roomId)
        .single()

      if (error) {
        console.error('[syncStateFromSupabase] Error fetching room state:', error)
        return
      }

      if (data && data.state_json) {
        const syncedState = data.state_json as any
        console.log('[syncStateFromSupabase] Synced state:', {
          phase: data.phase,
          winner: syncedState.winner,
          currentPlayerIndex: syncedState.currentPlayerIndex,
          playersCount: syncedState.players?.length,
          civilianWord: syncedState.civilianWord,
          spyWord: syncedState.spyWord,
          imposterHint: syncedState.imposterHint,
          voteHistoryLength: syncedState.voteHistory?.length,
          eliminationHistoryLength: syncedState.eliminationHistory?.length,
        })

        setGameState((prev) => {
          console.log('[syncStateFromSupabase] Previous state words:', {
            civilianWord: prev.civilianWord,
            spyWord: prev.spyWord,
            imposterHint: prev.imposterHint,
          })

          // Only clear myRole/myWord when TRANSITIONING to reveal-roles (not every sync during reveal-roles)
          // Check if phase is CHANGING from something else to reveal-roles AND it's round 1
          const isPhaseChanging = prev.phase !== data.phase
          const isTransitioningToRevealRoles = isPhaseChanging && data.phase === 'reveal-roles' && syncedState.currentRound === 1
          const shouldClearRole = isTransitioningToRevealRoles && prev.myRole !== null

          if (shouldClearRole) {
            console.log('[syncStateFromSupabase] Phase transitioning to reveal-roles - Clearing myRole and myWord for new game')
          }

          return {
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
            winner: syncedState.winner ?? prev.winner,
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
            timeoutHistory: syncedState.timeoutHistory ?? prev.timeoutHistory,
            // Clear myRole and myWord ONLY when transitioning to reveal-roles (not on every sync)
            myRole: shouldClearRole ? null : prev.myRole,
            myWord: shouldClearRole ? null : prev.myWord,
          }
        })
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

    console.log('[fetchMyRole] Fetching role from Supabase for client:', gameState.myClientId)

    try {
      const { data, error } = await supabase
        .from('player_roles')
        .select('role, word, player_id')
        .eq('room_id', gameState.roomId)
        .eq('client_id', gameState.myClientId)
        .maybeSingle()

      if (error) {
        console.error('[fetchMyRole] Error fetching role:', error)
        throw error
      }

      if (data) {
        console.log('[fetchMyRole] Successfully fetched role:', {
          role: data.role,
          word: data.word,
          playerId: data.player_id,
        })
        setGameState((prev) => ({
          ...prev,
          myRole: data.role as PlayerRole,
          myWord: data.word,
          myPlayerId: data.player_id,
        }))
      } else {
        console.log('[fetchMyRole] No role found yet for this client - roles may not be assigned')
      }
    } catch (error) {
      console.error('[fetchMyRole] Error:', error)
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

  // Fetch all votes from Supabase and populate voteHistory (host only, for scoring)
  const fetchVoteHistoryFromSupabase = useCallback(async (): Promise<VoteRecord[]> => {
    if (!gameState.roomId || !gameState.isHost) {
      console.log('[fetchVoteHistoryFromSupabase] Skipping - not host or no roomId')
      return []
    }

    console.log('[fetchVoteHistoryFromSupabase] Fetching all votes for room:', gameState.roomId)

    try {
      // Fetch all votes for this room
      const { data: votes, error } = await supabase
        .from('votes')
        .select('voter_player_id, target_player_id, round_number')
        .eq('room_id', gameState.roomId)
        .order('round_number', { ascending: true })

      if (error) {
        console.error('[fetchVoteHistoryFromSupabase] Error fetching votes:', error)
        return []
      }

      if (!votes || votes.length === 0) {
        console.log('[fetchVoteHistoryFromSupabase] No votes found')
        return []
      }

      console.log('[fetchVoteHistoryFromSupabase] Found votes:', votes.length)

      // Convert Supabase votes to VoteRecord format
      // We need to look up roles from allPlayersSnapshot
      const voteRecords: VoteRecord[] = votes.map((vote) => {
        const voter = gameState.allPlayersSnapshot.find(p => p.id === vote.voter_player_id)
        const target = gameState.allPlayersSnapshot.find(p => p.id === vote.target_player_id)

        return {
          voterId: vote.voter_player_id,
          voterRole: voter?.role || 'civilian',
          targetId: vote.target_player_id,
          targetRole: target?.role || 'civilian',
          round: vote.round_number,
        }
      })

      console.log('[fetchVoteHistoryFromSupabase] Converted vote records:', voteRecords.length)

      // Update gameState with the complete vote history
      setGameState((prev) => ({
        ...prev,
        voteHistory: voteRecords,
      }))

      // Also return the vote records for immediate use
      return voteRecords
    } catch (error) {
      console.error('[fetchVoteHistoryFromSupabase] Error:', error)
      return []
    }
  }, [gameState.roomId, gameState.isHost, gameState.allPlayersSnapshot])

  // Clear all votes from Supabase for the current room (called when starting a new game)
  const clearVotesFromSupabase = useCallback(async () => {
    if (!gameState.roomId || !gameState.isHost) {
      console.log('[clearVotesFromSupabase] Skipping - not host or no roomId')
      return
    }

    console.log('[clearVotesFromSupabase] Clearing all votes for room:', gameState.roomId)

    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('room_id', gameState.roomId)

      if (error) {
        console.error('[clearVotesFromSupabase] Error clearing votes:', error)
        return
      }

      console.log('[clearVotesFromSupabase] Successfully cleared all votes')

      // Also clear voteHistory in local state
      setGameState((prev) => ({
        ...prev,
        voteHistory: [],
      }))
    } catch (error) {
      console.error('[clearVotesFromSupabase] Error:', error)
    }
  }, [gameState.roomId, gameState.isHost])

  // Save game result to Supabase (online mode only, host only to avoid duplicates)
  const saveGameResultToSupabase = useCallback(async (pointsBreakdown: PlayerPointsBreakdown[], winner: 'civilians' | 'imposters' | 'spy') => {
    if (gameState.mode !== 'online' || !gameState.isHost || !gameState.roomId) {
      console.log('[saveGameResultToSupabase] Skipping - not online mode, not host, or no roomId')
      return
    }

    console.log('[saveGameResultToSupabase] Saving game result for room:', gameState.roomId)

    try {
      // Get the current game number for this room
      const { data: existingResults } = await supabase
        .from('game_results')
        .select('game_number')
        .eq('room_id', gameState.roomId)
        .order('game_number', { ascending: false })
        .limit(1)

      const gameNumber = existingResults && existingResults.length > 0 ? existingResults[0].game_number + 1 : 1

      // Prepare player results
      const playerResults = pointsBreakdown.map((player) => ({
        playerId: player.playerId,
        playerName: player.playerName,
        role: player.role,
        totalPoints: player.totalPoints,
        survived: player.survived,
      }))

      // Insert the game result
      const { error } = await supabase
        .from('game_results')
        .insert({
          room_id: gameState.roomId,
          game_number: gameNumber,
          winner: winner,
          civilian_word: gameState.civilianWord,
          spy_word: gameState.spyWord,
          imposter_hint: gameState.imposterHint,
          player_results: playerResults,
        })

      if (error) {
        console.error('[saveGameResultToSupabase] Error saving game result:', error)
      } else {
        console.log('[saveGameResultToSupabase] Game result saved successfully as game #', gameNumber)
      }
    } catch (error) {
      console.error('[saveGameResultToSupabase] Error:', error)
    }
  }, [gameState.mode, gameState.isHost, gameState.roomId, gameState.civilianWord, gameState.spyWord, gameState.imposterHint])

  // Update local gameState with accurate scores after calculating with complete vote history
  const updateLocalScoresAfterCalculation = useCallback((pointsBreakdown: PlayerPointsBreakdown[]) => {
    console.log('[updateLocalScoresAfterCalculation] Updating local scores with calculated values')

    // Note: We don't update player.votes or other game state here
    // We just store the calculated points for display purposes
    // The actual score calculation is done in calculatePoints() using the vote history

    // The pointsBreakdown already contains all the information we need
    // and calculatePoints() will use the updated voteHistory to calculate correctly
    // So we don't actually need to modify gameState here

    console.log('[updateLocalScoresAfterCalculation] Points breakdown ready:',
      pointsBreakdown.map(p => ({ name: p.playerName, points: p.totalPoints }))
    )
  }, [])

  // Load game results from Supabase for current room
  const loadRoomGameHistory = useCallback(async () => {
    if (!gameState.roomId) {
      console.log('[loadRoomGameHistory] No roomId, skipping')
      return []
    }

    console.log('[loadRoomGameHistory] Loading game history for room:', gameState.roomId)

    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('room_id', gameState.roomId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[loadRoomGameHistory] Error loading game results:', error)
        return []
      }

      if (!data || data.length === 0) {
        console.log('[loadRoomGameHistory] No game history found for this room')
        return []
      }

      console.log('[loadRoomGameHistory] Loaded', data.length, 'game results')
      return data
    } catch (error) {
      console.error('[loadRoomGameHistory] Error:', error)
      return []
    }
  }, [gameState.roomId])

  // Save online session to localStorage (for resume after refresh)
  const saveOnlineSession = useCallback(() => {
    if (gameState.mode !== 'online' || !gameState.roomId) return

    const session = {
      roomId: gameState.roomId,
      roomCode: gameState.roomCode,
      myName: gameState.myName,
      myClientId: gameState.myClientId,
      myPlayerId: gameState.myPlayerId,
      isHost: gameState.isHost,
      timestamp: Date.now(),
    }

    localStorage.setItem(ONLINE_SESSION_KEY, JSON.stringify(session))
    console.log('[saveOnlineSession] Saved online session:', session)
  }, [gameState.mode, gameState.roomId, gameState.roomCode, gameState.myName, gameState.myClientId, gameState.myPlayerId, gameState.isHost])

  // Restore online session from localStorage and reconnect to room
  const restoreOnlineSession = useCallback(async (): Promise<boolean> => {
    try {
      const stored = localStorage.getItem(ONLINE_SESSION_KEY)
      if (!stored) {
        console.log('[restoreOnlineSession] No saved session found')
        return false
      }

      const session = JSON.parse(stored)
      console.log('[restoreOnlineSession] Found saved session:', session)

      // Check if session is still valid (not older than 24 hours)
      const hoursSinceLastSave = (Date.now() - session.timestamp) / (1000 * 60 * 60)
      if (hoursSinceLastSave > 24) {
        console.log('[restoreOnlineSession] Session expired (older than 24 hours)')
        localStorage.removeItem(ONLINE_SESSION_KEY)
        return false
      }

      // Check if room still exists
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, code')
        .eq('id', session.roomId)
        .single()

      if (roomError || !room) {
        console.log('[restoreOnlineSession] Room no longer exists')
        localStorage.removeItem(ONLINE_SESSION_KEY)
        return false
      }

      // Check if player is still in room
      const { data: player, error: playerError } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', session.roomId)
        .eq('client_id', session.myClientId)
        .single()

      if (playerError || !player) {
        console.log('[restoreOnlineSession] Player no longer in room')
        localStorage.removeItem(ONLINE_SESSION_KEY)
        return false
      }

      // Restore online state
      setGameState((prev) => ({
        ...prev,
        mode: 'online',
        roomId: session.roomId,
        roomCode: session.roomCode,
        myName: session.myName,
        myClientId: session.myClientId,
        myPlayerId: session.myPlayerId || player.id,
        isHost: session.isHost,
      }))

      console.log('[restoreOnlineSession] Session restored successfully')

      // Sync current room state from Supabase (force sync for both host and non-host)
      await syncStateFromSupabase(true, session.roomId)

      // Fetch player role if in game
      await fetchMyRole()

      return true
    } catch (error) {
      console.error('[restoreOnlineSession] Error restoring session:', error)
      localStorage.removeItem(ONLINE_SESSION_KEY)
      return false
    }
  }, [syncStateFromSupabase, fetchMyRole])

  // Auto-save online session when relevant fields change
  useEffect(() => {
    if (gameState.mode === 'online' && gameState.roomId) {
      saveOnlineSession()
    }
  }, [gameState.mode, gameState.roomId, gameState.roomCode, gameState.myName, gameState.myClientId, gameState.myPlayerId, gameState.isHost, saveOnlineSession])

  // On mount: Try to restore online session from localStorage
  useEffect(() => {
    const attemptRestore = async () => {
      console.log('[mount] Attempting to restore online session...')
      const restored = await restoreOnlineSession()

      if (!restored) {
        // No online session to restore, clear offline state
        localStorage.removeItem(STORAGE_KEY)
        console.log('[mount] No online session found, starting fresh')
      } else {
        console.log('[mount] Online session restored successfully')
      }
    }

    attemptRestore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-refresh: Sync state when tab becomes visible again
  useEffect(() => {
    if (gameState.mode !== 'online' || !gameState.roomId) return

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('[Visibility] Tab became visible, syncing state from Supabase...')

        // Sync state from Supabase (works for both host and non-host)
        await syncStateFromSupabase(gameState.isHost)

        // Fetch role if needed (only in reveal-roles or later phases)
        if (!gameState.myRole && (gameState.phase === 'reveal-roles' || gameState.phase === 'playing' || gameState.phase === 'voting')) {
          try {
            await fetchMyRole()
          } catch (error) {
            // Silently ignore - role might not be assigned yet
            console.log('[Visibility] Role not available yet, will retry on next sync')
          }
        }

        console.log('[Visibility] State synced successfully')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [gameState.mode, gameState.roomId, gameState.isHost, gameState.myRole, gameState.phase, syncStateFromSupabase, fetchMyRole])

  // Subscribe to room_players changes to detect host promotion
  useEffect(() => {
    if (gameState.mode !== 'online' || !gameState.roomId || !gameState.myPlayerId) return

    console.log('[GameContext] Subscribing to room_players for host promotion detection')

    const channel = supabase
      .channel(`room_players_host:${gameState.roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${gameState.roomId}`,
        },
        async (payload) => {
          // Check if the updated player is me and if I became host
          const updatedPlayer = payload.new as any
          if (updatedPlayer.id === gameState.myPlayerId && updatedPlayer.is_host && !gameState.isHost) {
            console.log('[GameContext] Detected host promotion! Updating local state...')
            setGameState((prev) => ({
              ...prev,
              isHost: true,
            }))
          }
        }
      )
      .subscribe()

    return () => {
      console.log('[GameContext] Unsubscribing from room_players_host')
      supabase.removeChannel(channel)
    }
  }, [gameState.mode, gameState.roomId, gameState.myPlayerId, gameState.isHost])

  // Auto-sync state to Supabase when host makes changes
  useEffect(() => {
    if (gameState.mode === 'online' && gameState.isHost && gameState.roomId) {
      // Don't sync during setup or lobby
      if (gameState.phase === 'setup' || gameState.phase === 'online-lobby') return

      // Don't sync during reveal-roles phase - assignRoles already synced!
      // This prevents overwriting the new words with stale state
      if (gameState.phase === 'reveal-roles') return

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
        quitRoom,
        deleteRoomFromSupabase,
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
        fetchVoteHistoryFromSupabase,
        clearVotesFromSupabase,
        saveGameResultToSupabase,
        updateLocalScoresAfterCalculation,
        loadRoomGameHistory,
        initializeClientId,
        saveOnlineSession,
        restoreOnlineSession,
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
