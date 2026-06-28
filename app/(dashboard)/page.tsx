export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getProfile } from '@/app/actions/profile'
import { getFixedExpenses } from '@/app/actions/fixed-expenses'
import { getTransactions } from '@/app/actions/transactions'
import { getLoans } from '@/app/actions/loans'
import { getWallets } from '@/app/actions/wallets'
import { computeDiagnosis, formatARS } from '@/lib/finance-engine'
import { Phasebadge } from '@/components/phase-badge'
import { BudgetBars } from '@/components/budget-bars'
import type { Wallet } from '@/lib/types'

const WALLET_EMOJIS: Record<string, string> = {
  efectivo: '💵', banco: '🏦', virtual: '📱', inversion: '📈', otro: '🗂',
}

const PHASE_LABELS = {
  supervivencia: 'Supervivencia',
  estabilizacion: 'Estabilización',
  crecimiento: 'Crecimiento',
  riqueza: 'Riqueza',
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel() {
  return new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) redirect('/configuracion')

  const [fixedExpenses, transactions, loans, wallets] = await Promise.all([
    getFixedExpenses(),
    getTransactions(),
    getLoans(),
    getWallets(),
  ])

  const currentMonth = getCurrentMonth()
  const diagnosis = computeDiagnosis(profile, fixedExpenses, transactions, loans, currentMonth)

  const scoreColor =
    diagnosis.healthScore >= 80 ? 'text-emerald-600' :
    diagnosis.healthScore >= 50 ? 'text-amber-500' : 'text-red-500'

  const disponibleColor = diagnosis.disponible >= 0 ? 'text-gray-900' : 'text-red-500'

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 capitalize">{getMonthLabel()}</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen financiero</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-xl p-5 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Disponible</p>
          <p className={`text-2xl font-semibold ${disponibleColor}`}>
            ${formatARS(diagnosis.disponible)}
          </p>
          <p className="text-xs text-gray-400">Este mes</p>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Salud financiera</p>
          <p className={`text-2xl font-semibold ${scoreColor}`}>
            {diagnosis.healthScore}<span className="text-base font-normal text-gray-400">/100</span>
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full transition-all ${diagnosis.healthScore >= 80 ? 'bg-emerald-500' : diagnosis.healthScore >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
              style={{ width: `${diagnosis.healthScore}%` }}
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Fase actual</p>
          <Phasebadge phase={diagnosis.phase} />
          <p className="text-xs text-gray-400">{PHASE_LABELS[diagnosis.phase]}</p>
        </div>
      </div>

      {/* Ingresos vs Gastos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ingresos estimados</p>
          <p className="text-xl font-semibold text-emerald-600">${formatARS(profile.sueldo_fijo + profile.otros_ingresos_estimados)}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gastos del mes</p>
          <p className="text-xl font-semibold text-red-500">${formatARS(diagnosis.totalGastos)}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cuotas</p>
          <p className="text-xl font-semibold text-gray-700">${formatARS(diagnosis.totalCuotas)}</p>
        </div>
      </div>

      {/* Billeteras */}
      {wallets.length > 0 && (
        <div className="border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Mis billeteras</h2>
            <span className="text-sm font-semibold text-gray-700">
              Total: ${formatARS(wallets.reduce((s, w) => s + w.saldo, 0))}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {wallets.map((w: Wallet) => (
              <div key={w.id} className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="text-xs text-gray-500">{WALLET_EMOJIS[w.tipo]} {w.nombre}</p>
                <p className="text-sm font-semibold text-gray-900">${formatARS(w.saldo)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan del mes + Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Plan del mes</h2>
          <BudgetBars distribution={diagnosis.budgetDistribution} totalIngresos={profile.sueldo_fijo + profile.otros_ingresos_estimados} />
        </div>

        <div className="space-y-4">
          {diagnosis.alerts.length > 0 && (
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-5 space-y-2">
              <h2 className="text-sm font-semibold text-amber-800">Alertas</h2>
              {diagnosis.alerts.map((alert, i) => (
                <p key={i} className="text-sm text-amber-700">⚠ {alert}</p>
              ))}
            </div>
          )}

          <div className="border border-gray-200 rounded-xl p-5 space-y-2">
            <h2 className="text-sm font-semibold text-gray-900">Recomendación</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{diagnosis.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
