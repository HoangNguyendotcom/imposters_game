'use client'

import { useState, useMemo, useEffect } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function HistoryButton() {
  const { gameState, playerHistory, resetHistory, removePlayerFromHistory, loadRoomGameHistory } = useGame()
  const [isOpen, setIsOpen] = useState(false)
  const [roomGameHistory, setRoomGameHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const isOnlineMode = gameState.mode === 'online'
  const hasRoomId = gameState.roomId !== null

  // Load room-specific game history when opening in online mode
  useEffect(() => {
    if (isOpen && isOnlineMode && hasRoomId) {
      setLoading(true)
      setRoomGameHistory([])
      loadRoomGameHistory().then((history) => {
        setRoomGameHistory(history)
        setLoading(false)
      })
    } else if (!isOpen) {
      // Reset when closed
      setRoomGameHistory([])
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isOnlineMode, hasRoomId])

  const hasHistory = isOnlineMode ? roomGameHistory.length > 0 : playerHistory.length > 0

  const sortedHistory = useMemo(
    () =>
      [...playerHistory].sort((a, b) => b.totalPoints - a.totalPoints),
    [playerHistory]
  )

  // Calculate cumulative player stats from room game history
  const playerStats = useMemo(() => {
    if (!isOnlineMode || roomGameHistory.length === 0) return []

    const statsMap = new Map<string, {
      name: string
      totalPoints: number
      gamesPlayed: number
      civilianWins: number
      imposterWins: number
      spyWins: number
    }>()

    roomGameHistory.forEach((game) => {
      game.player_results.forEach((player: any) => {
        const existing = statsMap.get(player.playerName) || {
          name: player.playerName,
          totalPoints: 0,
          gamesPlayed: 0,
          civilianWins: 0,
          imposterWins: 0,
          spyWins: 0,
        }

        const isWinner =
          (game.winner === 'civilians' && player.role === 'civilian') ||
          (game.winner === 'imposters' && player.role === 'imposter') ||
          (game.winner === 'spy' && player.role === 'spy')

        statsMap.set(player.playerName, {
          ...existing,
          totalPoints: existing.totalPoints + player.totalPoints,
          gamesPlayed: existing.gamesPlayed + 1,
          civilianWins: existing.civilianWins + (isWinner && player.role === 'civilian' ? 1 : 0),
          imposterWins: existing.imposterWins + (isWinner && player.role === 'imposter' ? 1 : 0),
          spyWins: existing.spyWins + (isWinner && player.role === 'spy' ? 1 : 0),
        })
      })
    })

    return Array.from(statsMap.values()).sort((a, b) => b.totalPoints - a.totalPoints)
  }, [isOnlineMode, roomGameHistory])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-3 right-3 z-30 rounded-full bg-black/40 border border-white/40 text-white text-sm px-4 py-2 shadow-lg backdrop-blur-md hover:bg-black/60 transition-all"
      >
        History
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-slate-950 border border-white/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
              <h2 className="text-lg font-semibold text-white">
                {isOnlineMode ? 'Game History (This Room)' : 'Player History'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white text-sm px-2 py-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900/60">
              <p className="text-xs text-white/70">
                {isOnlineMode
                  ? 'Lịch sử các game đã chơi trong phòng này.'
                  : 'Lưu điểm số và số lần chiến thắng của từng người chơi theo vai trò (Civilian / Imposter / Spy).'}
              </p>
              {!isOnlineMode && (
                <button
                  type="button"
                  onClick={resetHistory}
                  disabled={!hasHistory}
                  className="text-xs px-3 py-1 rounded-full border border-red-400/80 bg-red-600/10 text-red-200 hover:bg-red-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Reset all
                </button>
              )}
            </div>

            <div className="px-6 py-4 overflow-y-auto flex-1 bg-slate-950">
              {loading ? (
                <p className="text-sm text-white/60 text-center">Loading...</p>
              ) : !hasHistory ? (
                <p className="text-sm text-white/60 text-center">
                  {isOnlineMode
                    ? 'Chưa có game nào trong phòng này. Hãy chơi một ván để bắt đầu!'
                    : 'Chưa có dữ liệu nào. Hãy chơi vài ván để bắt đầu ghi lịch sử!'}
                </p>
              ) : isOnlineMode ? (
                <div className="space-y-6">
                  {/* Player Stats Summary Table */}
                  {playerStats.length > 0 && (
                    <div className="bg-slate-800/50 border border-slate-700/80 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-3">Player Stats (All Games)</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-white/80 border-separate border-spacing-y-1">
                          <thead>
                            <tr className="bg-slate-700/90 text-xs uppercase tracking-wide text-white/70">
                              <th className="px-4 py-2 rounded-l-lg">Player</th>
                              <th className="px-3 py-2 text-center">Total Points</th>
                              <th className="px-3 py-2 text-center">Games</th>
                              <th className="px-3 py-2 rounded-r-lg text-center">Wins (C/I/S)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {playerStats.map((player, index) => (
                              <tr
                                key={player.name}
                                className={`transition-colors border border-slate-600/80 ${
                                  index === 0 ? 'bg-yellow-500/10' : 'bg-slate-800/90 hover:bg-slate-700/90'
                                }`}
                              >
                                <td className="px-4 py-2 rounded-l-lg">
                                  <div className="flex items-center gap-2">
                                    {index === 0 && <span className="text-lg">🥇</span>}
                                    {index === 1 && <span className="text-lg">🥈</span>}
                                    {index === 2 && <span className="text-lg">🥉</span>}
                                    <span className="text-white font-semibold">{player.name}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className="text-yellow-300 font-bold text-base">
                                    {player.totalPoints}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className="text-white/80">{player.gamesPlayed}</span>
                                </td>
                                <td className="px-3 py-2 rounded-r-lg text-center">
                                  <div className="flex gap-1 justify-center text-xs">
                                    <span className="text-blue-300">{player.civilianWins}C</span>
                                    <span className="text-white/40">/</span>
                                    <span className="text-red-300">{player.imposterWins}I</span>
                                    <span className="text-white/40">/</span>
                                    <span className="text-purple-300">{player.spyWins}S</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Individual Game Results */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-sm">Game History</h3>
                    {roomGameHistory.map((game, index) => (
                    <div key={game.id} className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">
                          Game #{game.game_number}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60">
                            {new Date(game.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            game.winner === 'civilians' ? 'bg-blue-500/20 text-blue-300' :
                            game.winner === 'spy' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {game.winner === 'civilians' ? 'Civilians Win' :
                             game.winner === 'spy' ? 'Spy Wins' :
                             'Imposters Win'}
                          </span>
                        </div>
                      </div>

                      {/* Words reveal */}
                      <div className="mb-3 text-xs text-white/60 space-x-2">
                        <span>Civilian: <span className="text-blue-300">{game.civilian_word}</span></span>
                        {game.spy_word && (
                          <span>| Spy: <span className="text-purple-300">{game.spy_word}</span></span>
                        )}
                        <span>| Hint: <span className="text-red-300">{game.imposter_hint}</span></span>
                      </div>

                      {/* Player results */}
                      <div className="space-y-1">
                        {game.player_results.map((player: any, playerIndex: number) => (
                          <div key={playerIndex} className="flex items-center justify-between bg-slate-800/50 rounded px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white/90">{player.playerName}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                player.role === 'imposter' ? 'bg-red-500/30 text-red-300' :
                                player.role === 'spy' ? 'bg-purple-500/30 text-purple-300' :
                                'bg-blue-500/30 text-blue-300'
                              }`}>
                                {player.role}
                              </span>
                              {!player.survived && (
                                <span className="text-[10px] text-white/40">(eliminated)</span>
                              )}
                            </div>
                            <span className="text-yellow-300 font-bold">{player.totalPoints} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-white/80 border-separate border-spacing-y-1">
                    <thead>
                      <tr className="bg-slate-800/90 text-xs uppercase tracking-wide text-white/70">
                        <th className="px-4 py-2 rounded-l-lg">Player</th>
                        <th className="px-3 py-2 text-center">Total Points</th>
                        <th className="px-3 py-2 text-center">Games</th>
                        <th className="px-3 py-2 text-center">Wins (C/I/S)</th>
                        <th className="px-3 py-2 rounded-r-lg text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedHistory.map((entry) => {
                        const totalWins =
                          entry.civilianWins + entry.imposterWins + entry.spyWins

                        return (
                          <tr
                            key={entry.name}
                            className="bg-slate-900/90 hover:bg-slate-800/90 transition-colors border border-slate-700/80"
                          >
                            <td className="px-4 py-2 rounded-l-lg">
                              <div className="flex flex-col">
                                <span className="text-white font-semibold">{entry.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="text-yellow-300 font-bold text-base">
                                {entry.totalPoints || 0}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="text-white/80">
                                {entry.gamesPlayed || 0}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex gap-1 justify-center text-xs">
                                <span className="text-blue-300">{entry.civilianWins}C</span>
                                <span className="text-white/40">/</span>
                                <span className="text-red-300">{entry.imposterWins}I</span>
                                <span className="text-white/40">/</span>
                                <span className="text-purple-300">{entry.spyWins}S</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 rounded-r-lg text-center">
                              <button
                                type="button"
                                onClick={() => removePlayerFromHistory(entry.name)}
                                className="text-[11px] text-red-200 hover:text-red-100 border border-red-400/80 rounded-full px-3 py-1 bg-red-600/10 hover:bg-red-600/30"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}


