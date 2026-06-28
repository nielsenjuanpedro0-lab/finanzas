import type { BudgetDistribution } from '@/lib/types'
import { formatARS } from '@/lib/finance-engine'

const ITEMS = [
  { key: 'necesidades' as const, label: 'Necesidades', color: 'bg-gray-800' },
  { key: 'estiloDeVida' as const, label: 'Estilo de vida', color: 'bg-gray-500' },
  { key: 'emergencia' as const, label: 'Emergencia', color: 'bg-emerald-500' },
  { key: 'inversion' as const, label: 'Inversión', color: 'bg-blue-400' },
  { key: 'colchon' as const, label: 'Colchón', color: 'bg-gray-300' },
]

export function BudgetBars({ distribution, totalIngresos }: { distribution: BudgetDistribution; totalIngresos: number }) {
  return (
    <div className="space-y-3">
      {ITEMS.map(({ key, label, color }) => {
        const item = distribution[key]
        const pct = Math.min(100, item.actual > 0 ? item.actual : (item.monto / totalIngresos) * 100)
        const overLimit = item.actual > 0 && item.actual > item.limite
        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">{label}</span>
              <span className={`text-xs font-medium ${overLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {item.actual > 0 ? `${Math.round(item.actual)}%` : `${item.limite}%`} · ${formatARS(item.monto)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${overLimit ? 'bg-red-400' : color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
