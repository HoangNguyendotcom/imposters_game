'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function SetupScreen() {
  const { 
    gameState, 
    setPlayerCount, 
    setRoundDuration, 
    setPhase, 
    setAutoCalculateImposters,
    setManualImposterCount,
    getImposterCount 
  } = useGame()
  const [count, setCount] = useState(gameState.playerCount || 4)
  const [autoCalculate, setAutoCalculate] = useState(
    gameState.autoCalculateImposters !== undefined ? gameState.autoCalculateImposters : true
  )
  const [manualImposters, setManualImposters] = useState(
    gameState.manualImposterCount || 1
  )
  const [timerEnabled, setTimerEnabled] = useState(true) // Default to enabled
  const [timerMinutes, setTimerMinutes] = useState(
    gameState.roundDuration > 0 ? Math.floor(gameState.roundDuration / 60) : 1
  )

  // Auto-calculate: always 1 imposter
  const autoImposterCount = 1
  
  // Manual imposter options based on player count:
  // 4-5 players: 1 imposter
  // 6-8 players: 1 or 2 imposters
  // 9-10 players: 1, 2, or 3 imposters
  const getMaxImposters = (playerCount: number): number => {
    if (playerCount >= 9) return 3
    if (playerCount >= 6) return 2
    return 1
  }
  
  const maxManualImposters = getMaxImposters(count)

  // Ensure manualImposters is valid when player count changes or when switching to manual mode
  useEffect(() => {
    if (!autoCalculate && manualImposters > maxManualImposters) {
      setManualImposters(maxManualImposters)
    }
  }, [count, autoCalculate, maxManualImposters, manualImposters])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (count >= 4 && count <= 10) {
      if (!autoCalculate && (manualImposters < 1 || manualImposters > maxManualImposters)) {
        return
      }
      setPlayerCount(count)
      setAutoCalculateImposters(autoCalculate)
      if (!autoCalculate) {
        setManualImposterCount(manualImposters)
      }
      if (timerEnabled) {
        setRoundDuration(timerMinutes * 60)
      } else {
        setRoundDuration(0)
      }
      setPhase('names')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20">
        <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-2">
        Imposters? 🤔
        </h1>

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
                  const newCount = Math.max(4, count - 1)
                  setCount(newCount)
                  if (!autoCalculate) {
                    const newMax = getMaxImposters(newCount)
                    if (manualImposters > newMax) {
                      setManualImposters(newMax)
                    }
                  }
                }}
                disabled={count <= 4}
                className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                id="playerCount"
                min="4"
                max="10"
                value={count}
                onChange={(e) => {
                  const newCount = parseInt(e.target.value) || 4
                  const clampedCount = Math.min(10, Math.max(4, newCount))
                  setCount(clampedCount)
                  if (!autoCalculate) {
                    const newMax = getMaxImposters(clampedCount)
                    if (manualImposters > newMax) {
                      setManualImposters(newMax)
                    }
                  }
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  const newCount = Math.min(10, count + 1)
                  setCount(newCount)
                  if (!autoCalculate) {
                    const newMax = getMaxImposters(newCount)
                    if (manualImposters > newMax) {
                      setManualImposters(newMax)
                    }
                  }
                }}
                disabled={count >= 10}
                className="w-12 h-12 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-white/60 text-sm mt-2 text-center">
              Minimum: 4 | Maximum: 10
            </p>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={autoCalculate}
                onChange={(e) => setAutoCalculate(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-white font-medium">Auto-calculate Imposters</span>
            </label>
            {autoCalculate ? (
              <p className="text-white/70 text-sm text-center font-medium bg-white/5 rounded-lg p-3">
                Imposters: {autoImposterCount} 
              </p>
            ) : (
              <div>
                <label
                  htmlFor="imposterCount"
                  className="block text-white text-sm mb-2 font-medium"
                >
                  Number of Imposters
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setManualImposters(1)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      manualImposters === 1
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    1 Imposter
                  </button>
                  {maxManualImposters >= 2 && (
                    <button
                      type="button"
                      onClick={() => setManualImposters(2)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        manualImposters === 2
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      2 Imposters
                    </button>
                  )}
                  {maxManualImposters >= 3 && (
                    <button
                      type="button"
                      onClick={() => setManualImposters(3)}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                        manualImposters === 3
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      3 Imposters
                    </button>
                  )}
                </div>
              </div>
            )}
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
            disabled={!autoCalculate && (manualImposters < 1 || manualImposters > maxManualImposters)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
