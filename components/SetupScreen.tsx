'use client'

import { useState } from 'react'
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

  const autoImposterCount = Math.max(1, Math.floor(count / 4))
  const maxManualImposters = Math.min(2, Math.floor(count / 2))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (count >= 4 && count <= 10) {
      if (!autoCalculate && (manualImposters < 1 || manualImposters > maxManualImposters || manualImposters >= count)) {
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
            <input
              type="number"
              id="playerCount"
              min="4"
              max="10"
              value={count}
              onChange={(e) => {
                const newCount = parseInt(e.target.value) || 4
                setCount(newCount)
                if (!autoCalculate && manualImposters >= newCount) {
                  setManualImposters(Math.min(2, Math.floor(newCount / 2)))
                }
              }}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
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
                  <button
                    type="button"
                    onClick={() => setManualImposters(2)}
                    disabled={maxManualImposters < 2}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      manualImposters === 2
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    2 Imposters
                  </button>
                </div>
                {maxManualImposters < 2 && count < 4 && (
                  <p className="text-white/60 text-sm mt-2 text-center">
                    Need at least 4 players for 2 imposters
                  </p>
                )}
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
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 3)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white text-center focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <p className="text-white/60 text-sm mt-1 text-center">Minutes</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!autoCalculate && (manualImposters >= count || manualImposters < 1)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
