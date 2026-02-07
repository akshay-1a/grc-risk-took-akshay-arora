import { useState, useMemo, useCallback, memo } from 'react'
import { API_BASE } from '../config'
import { LEVEL_COLORS } from '../utils/riskLevel'
import Heatmap from './Heatmap'

const StatCard = memo(function StatCard({ label, value, icon, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 transition hover:shadow-md hover:border-slate-300">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent} mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  )
})

const LEVEL_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 }

export default function Dashboard({ risks, loading, error, onRefresh, onDeleteRisk, onDeleteAll }) {
  const [levelFilter, setLevelFilter] = useState('')
  const [sortBy, setSortBy] = useState('id')
  const [sortAsc, setSortAsc] = useState(true)

  const filteredRisks = useMemo(() => {
    const list = levelFilter ? risks.filter((r) => r.level === levelFilter) : risks
    return list.toSorted((a, b) => {
      if (sortBy === 'id') return sortAsc ? a.id - b.id : b.id - a.id
      if (sortBy === 'score') return sortAsc ? a.score - b.score : b.score - a.score
      if (sortBy === 'level') {
        const ordA = LEVEL_ORDER[a.level] ?? 0
        const ordB = LEVEL_ORDER[b.level] ?? 0
        return sortAsc ? ordA - ordB : ordB - ordA
      }
      return 0
    })
  }, [risks, levelFilter, sortBy, sortAsc])

  const stats = useMemo(() => {
    const total = risks.length
    const highCritical = risks.filter((r) => r.level === 'High' || r.level === 'Critical').length
    const avg = total ? (risks.reduce((s, r) => s + r.score, 0) / total).toFixed(2) : '0.00'
    return { total, highCritical, avg }
  }, [risks])

  const handleExportCsv = () => {
    window.open(`${API_BASE}/risks/export/csv`, '_blank')
  }

  const setSort = useCallback(
    (column) => {
      if (sortBy === column) setSortAsc((a) => !a)
      else {
        setSortBy(column)
        setSortAsc(column === 'id')
      }
    },
    [sortBy]
  )

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-red-600 flex items-center gap-2">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}. Is the backend running on port 8000?
        </p>
        <button onClick={onRefresh} className="mt-3 px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300 transition">
          Retry
        </button>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-sm">
        <div className="inline-flex items-center gap-3 text-slate-500" role="status" aria-live="polite">
          <svg className="animate-spin h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-medium">Loading risks...</span>
        </div>
      </section>
    )
  }

  const hasRisks = risks.length > 0

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Dashboard</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="min-touch px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="min-touch px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-w-0">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">Risks Table</h3>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span>Filter by Level:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition"
              >
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Med</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </label>
            {hasRisks && onDeleteAll ? (
              <button
                type="button"
                onClick={onDeleteAll}
                className="min-touch px-3 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition"
              >
                Delete all
              </button>
            ) : null}
          </div>
        </div>

        {filteredRisks.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-500">
            <p className="font-medium">No risks assessed yet – add one above.</p>
            <p className="text-sm mt-1 text-slate-400">Use the form above to add your first risk.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin touch-scroll -mx-px">
            <p className="sm:hidden px-4 py-2 text-xs text-slate-500 bg-slate-50 border-b border-slate-100" role="status">
              Scroll table →
            </p>
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th
                    className="text-left py-3 px-4 font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100 transition"
                    onClick={() => setSort('id')}
                    title="Click to sort"
                  >
                    ID {sortBy === 'id' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Asset</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Threat</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Likelihood</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Impact</th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100 transition"
                    onClick={() => setSort('score')}
                    title="Click to sort"
                  >
                    Score {sortBy === 'score' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100 transition"
                    onClick={() => setSort('level')}
                    title="Click to sort"
                  >
                    Level {sortBy === 'level' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Mitigation Hint</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition"
                    style={{ contentVisibility: 'auto' }}
                  >
                    <td className="py-3 px-4 text-slate-500 tabular-nums">{r.id}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{r.asset}</td>
                    <td className="py-3 px-4 text-slate-600">{r.threat}</td>
                    <td className="py-3 px-4 text-slate-600 tabular-nums">{r.likelihood}</td>
                    <td className="py-3 px-4 text-slate-600 tabular-nums">{r.impact}</td>
                    <td className="py-3 px-4 text-amber-700 font-semibold tabular-nums">{r.score}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${LEVEL_COLORS[r.level] || 'bg-slate-100 text-slate-700'}`}>
                        {r.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs max-w-[180px] truncate" title={r.mitigation_hint}>
                      {r.mitigation_hint}
                    </td>
                    <td className="py-3 px-4">
                      {onDeleteRisk ? (
                        <button
                          type="button"
                          onClick={() => window.confirm(`Delete risk "${r.asset}"?`) && onDeleteRisk(r.id)}
                          className="min-touch p-2 rounded-lg text-red-600 hover:bg-red-50 transition inline-flex items-center justify-center"
                          title="Delete"
                          aria-label={`Delete risk ${r.id}`}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Heatmap risks={risks} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Risks"
          value={stats.total}
          accent="bg-slate-100 text-slate-600"
          icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
        />
        <StatCard
          label="High / Critical"
          value={stats.highCritical}
          accent="bg-amber-100 text-amber-700"
          icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <StatCard
          label="Average Score"
          value={stats.avg}
          accent="bg-emerald-100 text-emerald-700"
          icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
      </div>
    </section>
  )
}
