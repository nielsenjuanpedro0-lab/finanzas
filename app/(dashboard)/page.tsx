export const dynamic = 'force-dynamic'
import Link from 'next/link'
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
import { ArrowRight, Plus } from 'lucide-react'

const WALLET_EMOJIS: Record<string, string> = {
  efectivo: '💵', banco: '🏦', virtual: '📱', inversion: '📈', otro: '🗂',
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
  const monthTx = transactions.filter(t => t.fecha.startsWith(currentMonth))

  // REAL: lo que realmente entrò y saliò este mes
  const ingresosReales = monthTx.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const gastosVariablesReales = monthTx.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const gastosFijosActivos = fixedExpenses.filter(e => e.activo).reduce((s, e) => s + e.monto, 0)
  const cuotasMensuales = loans.filter(l => l.activo).reduce((s, l) => s + l.cuota_mensual, 0)
  const gastosRealesMes = gastosVariablesReales + gastosFijosActivos + cuotasMensuales
  const balanceMes = ingresosReales - gastosRealesMes

  // SALDO REAL: billeteras
  const saldoTotal = wallets.reduce((s, w) => s + w.saldo, 0)

  // PRESUPUESTO: planificación basada en sueldo configurado
  const ingresosPlanificados = profile.sueldo_fijo + profile.otros_ingresos_estimados
  const diagnosis = computeDiagnosis(profile, fixedExpenses, transactions, loans, currentMonth)

  // ¿Cobró el sueldo este mes?
  const cobroSueldo = ingresosReales >= profile.sueldo_fijo * 0.8
  const sueldoPendiente = cobroSueldo ? 0 : profile.sueldo_fijo - ingresosReales

  const balanceColor = balanceMes >= 0 ? 'text-emerald-600' : 'text-red-500'
  const scoreColor = diagnosis.healthScore >= 80 ? 'text-emerald-600' : diagnosis.healthScore >= 50 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">{getMonthLabel()}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tu panorama financiero</p>
        </div>
        <Link
          href="/movimientos"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          Movimiento
        </Link>
      </div>

      {/* Aviso sueldo pendiente */}
      {profile.sueldo_fijo > 0 && !cobroSueldo && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
          <div>
            <p className="text-sm font-medium text-blue-800">Sueldo pendiente de cobro</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Cuando lo cobrés, registralo en Movimientos → Ingreso → Sueldo fijo
            </p>
          </div>
          <p className="text-lg font-semibold text-blue-700">${formatARS(sueldoPendiente)}</p>
        </div>
      )}

      {/* ── ZONA 1: AHORA ── */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tu plata ahora</p>

        {wallets.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center space-y-2">
            <p className="text-sm text-gray-400">Sin billeteras configuradas</p>
            <Link href="/configuracion" className="text-sm text-gray-700 underline underline-offset-2">
              Agregar billeteras →
            </Link>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Saldo total</p>
                <p className="text-3xl font-semibold text-gray-900 mt-0.5">${formatARS(saldoTotal)}</p>
              </div>
              <Link href="/configuracion" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                Editar <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
              {wallets.map((w: Wallet) => (
                <div key={w.id} className="p-4 space-y-1">
                  <p className="text-xs text-gray-400">{WALLET_EMOJIS[w.tipo]} {w.nombre}</p>
                  <p className="text-sm font-semibold text-gray-900">${formatARS(w.saldo)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── ZONA 2: ESTE MES (real) ── */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Este mes — real</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded-xl p-5 space-y-1">
            <p className="text-xs text-gray-400">Ingresos cobrados</p>
            <p className="text-2xl font-semibold text-emerald-600">${formatARS(ingresosReales)}</p>
            {profile.sueldo_fijo > 0 && (
              <p className="text-xs text-gray-400">
                de ${formatARS(ingresosPlanificados)} esperados
              </p>
            )}
          </div>
          <div className="border border-gray-200 rounded-xl p-5 space-y-1">
            <p className="text-xs text-gray-400">Gastos totales</p>
            <p className="text-2xl font-semibold text-red-500">${formatARS(gastosRealesMes)}</p>
            <div className="space-y-0.5 mt-1">
              {gastosFijosActivos > 0 && <p className="text-xs text-gray-400">Fijos: ${formatARS(gastosFijosActivos)}</p>}
              {cuotasMensuales > 0 && <p className="text-xs text-gray-400">Cuotas: ${formatARS(cuotasMensuales)}</p>}
              {gastosVariablesReales > 0 && <p className="text-xs text-gray-400">Variables: ${formatARS(gastosVariablesReales)}</p>}
            </div>
          </div>
          <div className={`border rounded-xl p-5 space-y-1 ${balanceMes >= 0 ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
            <p className="text-xs text-gray-400">Balance del mes</p>
            <p className={`text-2xl font-semibold ${balanceColor}`}>
              {balanceMes >= 0 ? '+' : ''}${formatARS(balanceMes)}
            </p>
            <p className="text-xs text-gray-400">
              {balanceMes >= 0 ? 'Vas bien este mes' : 'Gastás más de lo que cobrás'}
            </p>
          </div>
        </div>

        {/* Transacciones recientes */}
        {monthTx.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500">Últimos movimientos</p>
              <Link href="/movimientos" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            <div>
              {monthTx.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${t.tipo === 'ingreso' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <div>
                      <p className="text-sm text-gray-800">{t.descripcion || t.categoria}</p>
                      <p className="text-xs text-gray-400">{t.categoria} · {new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${t.tipo === 'ingreso' ? 'text-emerald-600' : 'text-gray-700'}`}>
                    {t.tipo === 'ingreso' ? '+' : '-'}${formatARS(t.monto)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {monthTx.length === 0 && (
          <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center space-y-2">
            <p className="text-sm text-gray-400">Sin movimientos registrados este mes</p>
            <Link href="/movimientos" className="text-sm text-gray-700 underline underline-offset-2">
              Registrar primer movimiento →
            </Link>
          </div>
        )}
      </section>

      {/* ── ZONA 3: PRESUPUESTO ── */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Presupuesto planificado</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="border border-gray-200 rounded-xl p-5 space-y-1">
            <p className="text-xs text-gray-400">Salud financiera</p>
            <p className={`text-2xl font-semibold ${scoreColor}`}>
              {diagnosis.healthScore}<span className="text-sm font-normal text-gray-400">/100</span>
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
              <div
                className={`h-1 rounded-full ${diagnosis.healthScore >= 80 ? 'bg-emerald-500' : diagnosis.healthScore >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${diagnosis.healthScore}%` }}
              />
            </div>
            <div className="pt-1">
              <Phasebadge phase={diagnosis.phase} />
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 space-y-3">
            <p className="text-xs text-gray-400">Distribución recomendada del sueldo</p>
            <BudgetBars distribution={diagnosis.budgetDistribution} totalIngresos={ingresosPlanificados} />
          </div>

          <div className="space-y-3">
            {diagnosis.alerts.length > 0 && (
              <div className="border border-amber-100 bg-amber-50 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Alertas</p>
                {diagnosis.alerts.map((alert, i) => (
                  <p key={i} className="text-xs text-amber-700">⚠ {alert}</p>
                ))}
              </div>
            )}
            <div className="border border-gray-200 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recomendación</p>
              <p className="text-sm text-gray-600 leading-relaxed">{diagnosis.recommendation}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
