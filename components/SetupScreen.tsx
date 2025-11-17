'use client'

import { useState, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function SetupScreen() {
  const { 
    gameState, 
    setPlayerCount, 
    setRoundDuration, 
    setPhase, 
    setImposterCount,
    setSpyCount
  } = useGame()
  const [count, setCount] = useState(gameState.playerCount || 4)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (count >= 4 && count <= 10) {
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
      setPlayerCount(count)
      setImposterCount(imposters)
      if (timerEnabled) {
        setRoundDuration(timerMinutes * 60)
      } else {
        setRoundDuration(0)
      }
      setSpyCount(finalSpyCount)
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
                  const newMax = getMaxImposters(newCount)
                  if (imposters > newMax) {
                    setImposters(newMax)
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
      </div>
    </div>
  )
}
