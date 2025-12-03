'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useGame } from '@/contexts/GameContext'

type LobbyView = 'choose' | 'create' | 'join'

interface RoomPlayer {
  id: string
  name: string
  is_host: boolean
}

function getOrCreateClientId() {
  if (typeof window === 'undefined') return ''
  const key = 'imposters_client_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const newId = `client-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(key, newId)
  return newId
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function OnlineLobbyScreen() {
  const {
    gameState,
    setPhase,
    setGameMode,
    setOnlineInfo,
    setPlayerCount,
    setPlayers,
  } = useGame()
  const [view, setView] = useState<LobbyView>('choose')
  const [name, setName] = useState(gameState.myName || '')
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [roomId, setRoomId] = useState<string | null>(gameState.roomId)
  const [players, setLobbyPlayers] = useState<RoomPlayer[]>([])
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clientId = useMemo(() => getOrCreateClientId(), [])

  useEffect(() => {
    if (!roomId) return

    let isCancelled = false

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('room_players')
        .select('id, name, is_host')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading room players', error)
        return
      }
      if (!isCancelled && data) {
        setLobbyPlayers(data as RoomPlayer[])
      }
    }

    fetchPlayers()

    const channel = supabase
      .channel(`room_players:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => {
          fetchPlayers()
        }
      )
      .subscribe()

    return () => {
      isCancelled = true
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const handleBackToSetup = () => {
    setGameMode('offline')
    setPhase('setup')
  }

  const handleGoToCreate = () => {
    setView('create')
    setError(null)
  }

  const handleGoToJoin = () => {
    setView('join')
    setError(null)
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên của bạn')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const code = generateRoomCode()
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: clientId,
        })
        .select()
        .single()

      if (roomError || !room) {
        throw roomError || new Error('Không thể tạo room')
      }

      const { error: playerError } = await supabase.from('room_players').insert({
        room_id: room.id,
        client_id: clientId,
        name: name.trim(),
        is_host: true,
      })

      if (playerError) {
        throw playerError
      }

      const { error: stateError } = await supabase.from('room_state').insert({
        room_id: room.id,
        phase: 'setup',
        state_json: {},
      })

      if (stateError) {
        // Not fatal for lobby, log only
        // eslint-disable-next-line no-console
        console.warn('Error creating initial room_state', stateError)
      }

      setOnlineInfo({
        roomId: room.id,
        roomCode: room.code,
        isHost: true,
        myName: name.trim(),
      })
      setRoomId(room.id)
      setView('choose')
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError('Có lỗi khi tạo room. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên của bạn')
      return
    }
    if (!roomCodeInput.trim()) {
      setError('Vui lòng nhập mã phòng')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, code')
        .ilike('code', roomCodeInput.trim())
        .single()

      if (roomError || !room) {
        setError('Không tìm thấy phòng với mã này')
        setLoading(false)
        return
      }

      const { error: playerError } = await supabase.from('room_players').insert({
        room_id: room.id,
        client_id: clientId,
        name: name.trim(),
        is_host: false,
      })

      if (playerError) {
        throw playerError
      }

      setOnlineInfo({
        roomId: room.id,
        roomCode: room.code,
        isHost: false,
        myName: name.trim(),
      })
      setRoomId(room.id)
      setView('choose')
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError('Có lỗi khi join room. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartGameAsHost = async () => {
    if (!roomId || !gameState.isHost) return

    setStarting(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('room_players')
        .select('id, name')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error || !data || data.length === 0) {
        setError('Không thể lấy danh sách người chơi để bắt đầu game.')
        setStarting(false)
        return
      }

      if (data.length < 4) {
        setError('Cần ít nhất 4 người chơi để bắt đầu game online.')
        setStarting(false)
        return
      }

      const playerList = data.map((p) => ({
        id: String(p.id),
        name: p.name as string,
      }))

      // Cập nhật số lượng player và dùng tên từ room_players
      setPlayerCount(playerList.length)
      setPlayers(playerList)

      // Sau khi có danh sách players, chuyển host sang màn Setup để cấu hình imposters/spies/timer
      setPhase('setup')
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err)
      setError('Có lỗi khi bắt đầu game. Thử lại sau.')
    } finally {
      setStarting(false)
    }
  }

  const title = (() => {
    if (view === 'create') return 'Create Online Room'
    if (view === 'join') return 'Join Online Room'
    return 'Play Online'
  })()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 max-w-lg w-full border border-white/20">
        <button
          type="button"
          onClick={handleBackToSetup}
          className="text-xs text-white/60 hover:text-white mb-4"
        >
          ← Back
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
          {title}
        </h2>

        {view === 'choose' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoToCreate}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Create Room (Host)
            </button>
            <button
              type="button"
              onClick={handleGoToJoin}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-white/20"
            >
              Join Room
            </button>

            {roomId && (
              <div className="mt-6 bg-black/20 border border-white/20 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-2">Current online session:</p>
                {gameState.roomCode && (
                  <p className="text-xs text-emerald-300 mb-2">
                    Room code:{' '}
                    <span className="font-mono tracking-[0.3em] bg-black/40 px-2 py-1 rounded border border-emerald-400/60">
                      {gameState.roomCode}
                    </span>
                  </p>
                )}
                <p className="text-xs text-white/60 mb-1">
                  Name: <span className="font-semibold text-white">{gameState.myName}</span>
                </p>
                <p className="text-xs text-white/60 mb-3">
                  Role:{' '}
                  <span className="font-semibold text-white">
                    {gameState.isHost ? 'Host' : 'Player'}
                  </span>
                </p>
                <p className="text-xs text-white/60 mb-2">Players in room:</p>
                {players.length === 0 ? (
                  <p className="text-xs text-white/40">No players yet.</p>
                ) : (
                  <ul className="text-xs text-white/80 space-y-1">
                    {players.map((p) => (
                      <li key={p.id}>
                        {p.is_host ? '⭐ ' : ''}
                        {p.name}
                      </li>
                    ))}
                  </ul>
                )}

                {gameState.isHost && (
                  <button
                    type="button"
                    onClick={handleStartGameAsHost}
                    disabled={starting || players.length < 4}
                    className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {starting ? 'Starting...' : 'Start Game (min 4 players)'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'create' && (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2 font-medium">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/15 border border-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                placeholder="Nhập tên của bạn"
              />
            </div>

            {error && (
              <p className="text-xs text-red-300 bg-red-900/40 border border-red-500/50 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setView('choose')}
                className="flex-1 bg-white/5 hover:bg-white/15 text-white font-semibold py-3 px-4 rounded-lg border border-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-lg text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </form>
        )}

        {view === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2 font-medium">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/15 border border-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                placeholder="Nhập tên của bạn"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2 font-medium">
                Room code
              </label>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-lg bg-white/15 border border-white/30 text-white text-sm tracking-[0.3em] text-center uppercase focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                placeholder="ABC123"
              />
            </div>

            {error && (
              <p className="text-xs text-red-300 bg-red-900/40 border border-red-500/50 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setView('choose')}
                className="flex-1 bg-white/5 hover:bg:white/15 text-white font-semibold py-3 px-4 rounded-lg border border-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


