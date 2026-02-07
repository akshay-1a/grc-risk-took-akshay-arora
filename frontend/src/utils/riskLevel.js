export function scoreToLevel(score) {
  if (score >= 19) return 'Critical'
  if (score >= 13) return 'High'
  if (score >= 6) return 'Medium'
  return 'Low'
}

export function getMitigationHint(level) {
  const hints = {
    Low: 'Accept / Monitor',
    Medium: 'Plan mitigation',
    High: 'Prioritize action (NIST PR.AC)',
    Critical: 'Immediate mitigation + escalation',
  }
  return hints[level] ?? 'Accept / Monitor'
}

export const LEVEL_COLORS = {
  Low: 'bg-emerald-100 text-emerald-800 font-medium',
  Medium: 'bg-amber-100 text-amber-900 font-medium',
  High: 'bg-orange-100 text-orange-900 font-medium',
  Critical: 'bg-red-100 text-red-800 font-medium',
}

export const HEATMAP_COLORS = {
  Low: '#00FF00',
  Medium: '#FFFF00',
  High: '#FFA500',
  Critical: '#FF0000',
}

export function heatmapTextColor(level) {
  return level === 'Critical' ? '#ffffff' : '#1a1a1a'
}