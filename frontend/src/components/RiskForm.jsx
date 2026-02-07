import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../config'
import { scoreToLevel } from '../utils/riskLevel'

export default function RiskForm({ onSuccess }) {
  const [asset, setAsset] = useState('')
  const [threat, setThreat] = useState('')
  const [likelihood, setLikelihood] = useState(3)
  const [impact, setImpact] = useState(3)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3500)
    return () => clearTimeout(t)
  }, [showToast])

  const score = likelihood * impact
  const level = scoreToLevel(score)

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setSubmitError(null)
      setSubmitting(true)
      try {
        const res = await fetch(`${API_BASE}/assess-risk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asset, threat, likelihood, impact }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.detail || res.statusText || 'Assessment failed')
        setAsset('')
        setThreat('')
        setLikelihood(3)
        setImpact(3)
        setShowToast(true)
        onSuccess?.()
      } catch (err) {
        setSubmitError(err.message)
      } finally {
        setSubmitting(false)
      }
    },
    [asset, threat, likelihood, impact, onSuccess]
  )

  return (
    <>
      {showToast && (
        <div
          role="alert"
          className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-lg animate-toast-in border border-emerald-500/50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="font-medium">Risk added!</span>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="ml-1 rounded-lg p-1 hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <section className="relative rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 lg:p-8 min-w-0">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">New Risk Assessment</h2>
            <p className="text-sm text-slate-500">Add asset, threat, and score dimensions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Asset</label>
              <input
                type="text"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                placeholder="e.g. Customer Database"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Threat</label>
              <input
                type="text"
                value={threat}
                onChange={(e) => setThreat(e.target.value)}
                placeholder="e.g. Unauthorized Access"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Likelihood <span className="text-slate-500 font-normal">(1–5)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={likelihood}
                  onChange={(e) => setLikelihood(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-semibold text-sm tabular-nums">
                  {likelihood}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Impact <span className="text-slate-500 font-normal">(1–5)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={impact}
                  onChange={(e) => setImpact(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-semibold text-sm tabular-nums">
                  {impact}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-500">Preview</span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-sm">
              Score <span className="text-amber-600 font-bold">{score}</span>
            </span>
            <span className="text-slate-400">·</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium">
              Level <span className="font-semibold text-slate-900">{level}</span>
            </span>
          </div>

          {submitError && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="min-touch px-6 py-3 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 focus:ring-2 focus:ring-amber-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </span>
            ) : (
              'Assess Risk'
            )}
          </button>
        </form>
      </section>
    </>
  )
}
