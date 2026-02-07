import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { API_BASE } from './config'
import RiskForm from './components/RiskForm'

const Dashboard = lazy(() => import('./components/Dashboard'))

const FALLBACK_LOADING = (
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

export default function App() {
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRisks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/risks`)
      if (!res.ok) throw new Error('Failed to load risks')
      const data = await res.json()
      setRisks(data)
    } catch (e) {
      setError(e.message)
      setRisks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRisks()
  }, [fetchRisks])

  const onAssessSuccess = useCallback(() => {
    fetchRisks()
  }, [fetchRisks])

  const deleteRisk = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${API_BASE}/risks/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Delete failed')
        fetchRisks()
      } catch (e) {
        setError(e.message)
      }
    },
    [fetchRisks]
  )

  const deleteAllRisks = useCallback(async () => {
    if (!window.confirm('Delete all risks? This cannot be undone.')) return
    try {
      const res = await fetch(`${API_BASE}/risks`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      fetchRisks()
    } catch (e) {
      setError(e.message)
    }
  }, [fetchRisks])

  return (
    <div className="min-h-screen bg-slate-100 min-w-0">
      <header className="border-b border-slate-200 bg-white shadow-sm safe-area-pad">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                GRC Risk Assessment
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Likelihood x Impact matrix · NIST SP 800-30 / ISO 27001
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              <span className="text-xs font-medium text-emerald-700">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 min-w-0 pb-[env(safe-area-inset-bottom)]">
        <RiskForm onSuccess={onAssessSuccess} />
        <Suspense fallback={FALLBACK_LOADING}>
          <Dashboard
            risks={risks}
            loading={loading}
            error={error}
            onRefresh={fetchRisks}
            onDeleteRisk={deleteRisk}
            onDeleteAll={deleteAllRisks}
          />
        </Suspense>
      </main>
    </div>
  )
}
