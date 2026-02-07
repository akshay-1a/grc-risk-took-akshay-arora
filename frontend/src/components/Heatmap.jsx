import { useState, useMemo } from 'react'
import { scoreToLevel, HEATMAP_COLORS, heatmapTextColor } from '../utils/riskLevel'

export default function Heatmap({ risks }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  const { grid, cellAssets } = useMemo(() => {
    const grid = Array(5).fill(null).map(() => Array(5).fill(0))
    const cellAssets = Array(5).fill(null).map(() => Array(5).fill(null).map(() => []))
    for (const r of risks) {
      const li = r.likelihood - 1
      const im = r.impact - 1
      if (li >= 0 && li < 5 && im >= 0 && im < 5) {
        grid[li][im] += 1
        cellAssets[li][im].push(r.asset)
      }
    }
    return { grid, cellAssets }
  }, [risks])

  const getCellStyle = (likelihood, impact, count) => {
    const score = (likelihood + 1) * (impact + 1)
    const level = scoreToLevel(score)
    const bg = HEATMAP_COLORS[level] || '#e2e8f0'
    const textColor = heatmapTextColor(level)
    const isEmpty = count === 0
    return {
      backgroundColor: isEmpty ? '#f1f5f9' : bg,
      color: isEmpty ? '#64748b' : textColor,
    }
  }

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-w-0">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Risk Heatmap</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            5x5 grid · Rows: Likelihood 1–5 (left). Columns: Impact 1–5 (top). Cell = count of risks.
          </p>
        </div>

        <div className="overflow-x-auto scrollbar-thin touch-scroll">
          <div className="inline-block min-w-0">
            <table className="w-full max-w-lg mx-auto border-collapse" role="grid" aria-label="Risk heatmap 5 by 5">
              <thead>
                <tr>
                  <th className="w-14 p-2 text-xs font-semibold text-slate-600 uppercase tracking-wider align-bottom border-b border-slate-200">
                    <span className="block text-center">Likelihood \ Impact</span>
                  </th>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="p-2 text-xs font-semibold text-slate-600 uppercase tracking-wider align-bottom border-b border-slate-200 min-w-[4rem]">
                      <span className="block text-center">Impact {i}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4].map((li) => (
                  <tr key={li}>
                    <th className="p-2 text-xs font-semibold text-slate-600 align-middle border-r border-slate-200 bg-slate-50/80">
                      <span className="block text-center">Likelihood {li + 1}</span>
                    </th>
                    {[0, 1, 2, 3, 4].map((im) => {
                      const count = grid[li][im]
                      const assets = cellAssets[li][im] || []
                      const cellStyle = getCellStyle(li, im, count)
                      const isHovered = hoveredCell && hoveredCell.li === li && hoveredCell.im === im
                      return (
                        <td key={im} className="p-1.5 align-middle relative">
                          <div
                            className={`
                              relative flex items-center justify-center min-h-[3.5rem] rounded-lg font-bold tabular-nums text-base
                              transition-all duration-150 cursor-default border-2
                              ${isHovered ? 'border-slate-800 ring-2 ring-amber-400 ring-offset-2 scale-105 z-10 shadow-md' : 'border-transparent hover:border-slate-300'}
                            `}
                            style={cellStyle}
                            onMouseEnter={() => setHoveredCell({ li, im, count, assets })}
                            onMouseLeave={() => setHoveredCell(null)}
                            title={assets.length > 0 ? assets.join(', ') : ''}
                          >
                            {count}
                            {/* Floating tooltip on hover: list of matching asset names */}
                            {isHovered && (
                              <div
                                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs shadow-xl border border-slate-600 min-w-[160px] max-w-[260px] pointer-events-none animate-fade-up"
                                role="tooltip"
                              >
                                <p className="font-semibold text-slate-200 mb-1.5 whitespace-nowrap">
                                  Matching assets:
                                </p>
                                {assets.length > 0 ? (
                                  <ul className="space-y-0.5 max-h-32 overflow-y-auto scrollbar-thin">
                                    {assets.map((a, i) => (
                                      <li key={i} className="truncate">· {a}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-slate-400">None</p>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: HEATMAP_COLORS.Low }} /> Low</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: HEATMAP_COLORS.Medium }} /> Med</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: HEATMAP_COLORS.High }} /> High</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: HEATMAP_COLORS.Critical }} /> Critical</span>
        </div>
      </div>
    </div>
  )
}
