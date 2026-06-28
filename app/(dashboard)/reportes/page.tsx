export const dynamic = 'force-dynamic'
import { getTransactions } from '@/app/actions/transactions'
import { getProfile } from '@/app/actions/profile'
import { getFixedExpenses } from '@/app/actions/fixed-expenses'
import { getLoans } from '@/app/actions/loans'
import { computeDiagnosis, formatARS } from '@/lib/finance-engine'
import { ReportCharts } from '@/components/report-charts'

function getLast6Months() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export default async function ReportesPage() {
  const [allTransactions, profile, fixedExpenses, loans] = await Promise.all([
    getTransactions(),
    getProfile(),
    getFixedExpenses(),
    getLoans(),
  ])

  const months = getLast6Months()

  const monthlyData = months.map(month => {
    const monthTx = allTransactions.filter(t => t.fecha.startsWith(month))
    const ingresos = monthTx.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
    const gastos = monthTx.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
    const label = new Date(month + '-01').toLocaleDateString('es-AR', { month: 'short' })
    return { month, label, ingresos, gastos }
  })

  const currentMonth = months[months.length - 1]
  const prevMonth = months[months.length - 2]
  const currentTx = allTransactions.filter(t => t.fecha.startsWith(currentMonth))
  const prevTx = allTransactions.filter(t => t.fecha.startsWith(prevMonth))

  const currentGastos = currentTx.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const prevGastos = prevTx.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const gastosChange = prevGastos > 0 ? ((currentGastos - prevGastos) / prevGastos) * 100 : 0

  const categoryData = Object.entries(
    currentTx.filter(t => t.tipo === 'gasto').reduce<Record<string, number>>((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.monto
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const healthScores = profile ? months.map(month => {
    const diagnosis = computeDiagnosis(profile, fixedExpenses, allTransactions, loans, month)
    const label = new Date(month + '-01').toLocaleDateString('es-AR', { month: 'short' })
    return { month, label, score: diagnosis.healthScore }
  }) : []

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500 mt-1">Últimos 6 meses</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500">Gastos este mes</p>
          <p className="text-xl font-semibold text-gray-900">${formatARS(currentGastos)}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500">vs mes anterior</p>
          <p className={`text-xl font-semibold ${gastosChange > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {gastosChange > 0 ? '+' : ''}{Math.round(gastosChange)}%
          </p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500">Salud financiera</p>
          <p className="text-xl font-semibold text-gray-900">
            {healthScores[healthScores.length - 1]?.score ?? 0}/100
          </p>
        </div>
      </div>

      <ReportCharts
        monthlyData={monthlyData}
        categoryData={categoryData}
        healthScores={healthScores}
      />
    </div>
  )
}
