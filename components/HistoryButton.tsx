'use client'

import { useState, useMemo } from 'react'
import { useGame } from '@/contexts/GameContext'

export default function HistoryButton() {
  const { playerHistory, resetHistory, removePlayerFromHistory } = useGame()
  const [isOpen, setIsOpen] = useState(false)

  const hasHistory = playerHistory.length > 0

  const sortedHistory = useMemo(
    () =>
      [...playerHistory].sort((a, b) => {
        const aTotal = a.civilianWins + a.imposterWins + a.spyWins
        const bTotal = b.civilianWins + b.imposterWins + b.spyWins
        return bTotal - aTotal
      }),
    [playerHistory]
  )

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
          <div className="bg-slate-950 border border-white/20 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
              <h2 className="text-lg font-semibold text-white">Player History</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white text-sm px-2 py-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900/60">
              <p className="text-xs text-white/70">
                Lưu số lần chiến thắng của từng người chơi theo vai trò (Civilian / Imposter / Spy).
              </p>
              <button
                type="button"
                onClick={resetHistory}
                disabled={!hasHistory}
                className="text-xs px-3 py-1 rounded-full border border-red-400/80 bg-red-600/10 text-red-200 hover:bg-red-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reset all
              </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto flex-1 bg-slate-950">
              {!hasHistory ? (
                <p className="text-sm text-white/60 text-center">
                  Chưa có dữ liệu nào. Hãy chơi vài ván để bắt đầu ghi lịch sử!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-white/80 border-separate border-spacing-y-1">
                    <thead>
                      <tr className="bg-slate-800/90 text-xs uppercase tracking-wide text-white/70">
                        <th className="px-4 py-2 rounded-l-lg">Player</th>
                        <th className="px-3 py-2 text-center">Total Wins</th>
                        <th className="px-3 py-2 text-center">Civilian</th>
                        <th className="px-3 py-2 text-center">Imposter</th>
                        <th className="px-3 py-2 text-center">Spy</th>
                        <th className="px-3 py-2 rounded-r-lg text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedHistory.map((entry) => {
                        const total =
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
                              <span className="text-white font-semibold">
                                {total}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="text-blue-300 font-semibold">
                                {entry.civilianWins}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="text-red-300 font-semibold">
                                {entry.imposterWins}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="text-purple-300 font-semibold">
                                {entry.spyWins}
                              </span>
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


