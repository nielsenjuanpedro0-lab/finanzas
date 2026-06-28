import type { FinancialPhase } from '@/lib/types'

const PHASE_CONFIG = {
  supervivencia: { emoji: '🔴', color: 'text-red-600', bg: 'bg-red-50' },
  estabilizacion: { emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50' },
  crecimiento: { emoji: '🟢', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  riqueza: { emoji: '🔵', color: 'text-blue-600', bg: 'bg-blue-50' },
}

export function Phasebadge({ phase }: { phase: FinancialPhase }) {
  const config = PHASE_CONFIG[phase]
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${config.color}`}>
      {config.emoji} {phase.charAt(0).toUpperCase() + phase.slice(1)}
    </span>
  )
}

// alias for typo in dashboard page
export { Phasebadge as Phasebage }
