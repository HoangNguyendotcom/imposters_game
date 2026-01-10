'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'
import { useOnlineSyncWithStateUpdate } from '@/hooks/useOnlineSync'

export default function SetupScreen() {
  const {
    gameState,
    setGameMode,
    setPlayerCount,
    setRoundDuration,
    setPhase,
    setImposterCount,
    setSpyCount,
    startGame,
  } = useGame()

  // Subscribe to state changes in online mode
  useOnlineSyncWithStateUpdate()
  const [count, setCount] = useState(gameState.playerCount || 3)
  const [imposters, setImposters] = useState(
    gameState.imposterCount || 0
  )
  const [timerEnabled, setTimerEnabled] = useState(true) // Default to enabled
  const [timerMinutes, setTimerMinutes] = useState(
    gameState.roundDuration > 0 ? Math.floor(gameState.roundDuration / 60) : 1
  )
  const [spyCount, setSpyCountLocal] = useState(
    gameState.spyCount !== undefined ? gameState.spyCount : 0
  )

  const isOnline = gameState.mode === 'online'
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Imposter options based on player count:
  // If players < 7: max 1 imposter
  // If players >= 7: max 2 imposters
  const getMaxImposters = (playerCount: number): number => {
    if (playerCount >= 7) return 2
    return 1
  }
  
  const maxImposters = getMaxImposters(count)
  
  // Calculate max spies: maxTotal - imposters
  // Max total (imposters + spies) = floor(playerCount / 2)
  const maxTotal = Math.floor(count / 2) // Max total imposters + spies
  const maxSpies = Math.max(0, maxTotal - imposters)

  // Ensure imposters is valid when player count changes
  useEffect(() => {
    if (imposters > maxImposters) {
      setImposters(maxImposters)
    }
  }, [count, maxImposters, imposters])
  
  // Ensure spyCount is valid when player count or imposter count changes
  useEffect(() => {
    const maxTotal = Math.floor(count / 2)
    const newMaxSpies = Math.max(0, maxTotal - imposters)
    if (spyCount > newMaxSpies) {
      setSpyCountLocal(newMaxSpies)
    }
  }, [count, imposters, spyCount])

  // Khi vào từ online lobby, đồng bộ lại count với số player trong room
  useEffect(() => {
    if (isOnline && gameState.playerCount > 0) {
      setCount(gameState.playerCount)
    }
  }, [isOnline, gameState.playerCount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (count >= 3 && count <= 10) {
      if (imposters < 0 || imposters > maxImposters) {
        return
      }
      // Validate total constraint: imposters + spies > 0 (at least 1 total)
      if (imposters + spyCount === 0) {
        return
      }
      // Validate total constraint: imposters + spies <= floor(playerCount / 2)
      const maxTotal = Math.floor(count / 2)
      let finalSpyCount = spyCount
      if (imposters + spyCount > maxTotal) {
        // Adjust spy count if needed
        finalSpyCount = Math.max(0, maxTotal - imposters)
        setSpyCountLocal(finalSpyCount)
      }
      // Cập nhật cấu hình chung
      if (!isOnline) {
        setPlayerCount(count)
      } else if (gameState.playerCount !== count) {
        // đảm bảo state khớp số player trong room
        setPlayerCount(count)
      }
      setImposterCount(imposters)
      if (timerEnabled) {
        setRoundDuration(timerMinutes * 60)
      } else {
        setRoundDuration(0)
      }
      setSpyCount(finalSpyCount)

      if (isOnline) {
        // Online: Show confirmation dialog before starting
        setShowConfirmDialog(true)
      } else {
        // Offline: host sẽ nhập tên ở NameCollectionScreen
        setPhase('names')
      }
    }
  }

  const handleConfirmStart = () => {
    // Online: tên đã có từ room_players, bỏ qua NameCollectionScreen
    startGame(undefined, imposters, spyCount)
    setShowConfirmDialog(false)
  }

  const handleCancelStart = () => {
    setShowConfirmDialog(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
        <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-2">
          Imposters? 🤔
        </h1>

        <div className="flex justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              setGameMode('offline')
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold border ${
              gameState.mode === 'offline'
                ? 'bg-white text-purple-700 border-white'
                : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10'
            }`}
          >
            Play Offline
          </button>
          <button
            type="button"
            onClick={() => {
              setGameMode('online')
              setPhase('online-lobby')
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold border ${
              gameState.mode === 'online'
                ? 'bg-emerald-400 text-emerald-950 border-emerald-300'
                : 'bg-emerald-500/10 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/20'
            }`}
          >
            Play Online (beta)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="playerCount"
              className="block text-white text-lg mb-3 font-medium"
            >
              Number of Players
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const newCount = Math.max(3, count - 1)
                  setCount(newCount)
                  const newMax = getMaxImposters(newCount)
                  if (imposters > newMax) {
                    setImposters(newMax)
                  }
                }}
                disabled={isOnline || count <= 3}
                className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                id="playerCount"
                min="3"
                max="10"
                value={count}
                readOnly={isOnline}
                onChange={(e) => {
                  if (isOnline) return
                  const newCount = parseInt(e.target.value) || 3
                  const clampedCount = Math.min(10, Math.max(3, newCount))
                  setCount(clampedCount)
                  const newMax = getMaxImposters(clampedCount)
                  if (imposters > newMax) {
                    setImposters(newMax)
                  }
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  const newCount = Math.min(10, count + 1)
                  setCount(newCount)
                  const newMax = getMaxImposters(newCount)
                  if (imposters > newMax) {
                    setImposters(newMax)
                  }
                }}
                disabled={isOnline || count >= 10}
                className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-white/60 text-sm mt-2 text-center">
              Minimum: 3 | Maximum: 10
            </p>
          </div>

          <div>
            <label
              htmlFor="imposterCount"
              className="block text-white text-lg mb-3 font-medium"
            >
              Number of Imposters
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const newCount = Math.max(0, imposters - 1)
                  setImposters(newCount)
                }}
                disabled={imposters <= 0}
                className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                id="imposterCount"
                min="0"
                max={maxImposters}
                value={imposters}
                onChange={(e) => {
                  const newCount = parseInt(e.target.value) || 0
                  const clampedCount = Math.min(maxImposters, Math.max(0, newCount))
                  setImposters(clampedCount)
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  const newCount = Math.min(maxImposters, imposters + 1)
                  setImposters(newCount)
                }}
                disabled={imposters >= maxImposters}
                className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-white/60 text-sm mt-2 text-center">
              Min: 0 | Max: {maxImposters} imposter{maxImposters !== 1 ? 's' : ''}
            </p>
            {imposters + spyCount === 0 && (
              <p className="text-yellow-300 text-sm mt-2 text-center font-medium">
                ⚠️ Total imposters + spies must be at least 1
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="spyCount"
              className="block text-white text-lg mb-3 font-medium"
            >
              Number of Spies
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const newCount = Math.max(0, spyCount - 1)
                  setSpyCountLocal(newCount)
                }}
                disabled={spyCount <= 0}
                className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                id="spyCount"
                min="0"
                max={maxSpies}
                value={spyCount}
                onChange={(e) => {
                  const newCount = parseInt(e.target.value) || 0
                  const clampedCount = Math.min(maxSpies, Math.max(0, newCount))
                  setSpyCountLocal(clampedCount)
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  const newCount = Math.min(maxSpies, spyCount + 1)
                  setSpyCountLocal(newCount)
                }}
                disabled={spyCount >= maxSpies}
                className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                +
              </button>
            </div>
            {maxSpies === 0 && (
              <p className="text-white/60 text-sm text-center mt-2">
                Max spies reached (imposters + spies ≤ {Math.floor(count / 2)})
              </p>
            )}
            <p className="text-white/60 text-sm mt-2 text-center">
              Max: {maxSpies} spy{maxSpies !== 1 ? 'ies' : ''} (Total imposters + spies ≤ {Math.floor(count / 2)})
            </p>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-white font-medium">Enable Round Timer</span>
            </label>
            {timerEnabled && (
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTimerMinutes(Math.max(1, timerMinutes - 1))}
                    disabled={timerMinutes <= 1}
                    className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={timerMinutes}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 1
                      const clampedMinutes = Math.min(10, Math.max(1, minutes))
                      setTimerMinutes(clampedMinutes)
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setTimerMinutes(Math.min(10, timerMinutes + 1))}
                    disabled={timerMinutes >= 10}
                    className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-white/60 text-sm mt-1 text-center">Minutes</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={imposters < 0 || imposters > maxImposters || imposters + spyCount === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Get Started!!!
          </button>
        </form>

        {/* Confirmation Dialog for Online Mode */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-white/20">
              <h3 className="text-2xl font-bold text-white text-center mb-4">
                Ready to Start?
              </h3>
              <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
                <p className="text-white/90 text-sm mb-3 text-center">
                  Game settings:
                </p>
                <ul className="text-white/80 text-sm space-y-2">
                  <li>👥 <span className="font-semibold">{count}</span> players</li>
                  <li>🎭 <span className="font-semibold">{imposters}</span> imposter{imposters !== 1 ? 's' : ''}</li>
                  <li>🕵️ <span className="font-semibold">{spyCount}</span> spy{spyCount !== 1 ? 'ies' : ''}</li>
                  <li>⏱️ {timerEnabled ? `${timerMinutes} minute${timerMinutes !== 1 ? 's' : ''} per round` : 'No timer'}</li>
                </ul>
                <p className="text-yellow-300/90 text-xs mt-4 text-center">
                  ⚠️ Make sure everyone is ready!
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelStart}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-white/20"
                >
                  Back to Settings
                </button>
                <button
                  onClick={handleConfirmStart}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Start Game!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
