export const dynamic = 'force-dynamic'
import { getLoans } from '@/app/actions/loans'
import { getProfile } from '@/app/actions/profile'
import { LoanList } from '@/components/loan-list'
import { LoanForm } from '@/components/loan-form'
import { formatARS } from '@/lib/finance-engine'

export default async function PrestamosPage() {
  const [loans, profile] = await Promise.all([getLoans(), getProfile()])

  const activeLoans = loans.filter(l => l.activo)
  const totalCuotas = activeLoans.reduce((s, l) => s + l.cuota_mensual, 0)
  const sueldoFijo = profile?.sueldo_fijo ?? 0
  const debtRatio = sueldoFijo > 0 ? totalCuotas / sueldoFijo : 0

  const semaforo =
    debtRatio > 0.3 ? { color: 'text-red-500', bg: 'bg-red-50 border-red-200', msg: 'Cuotas superan el 30% del sueldo. Pausá inversiones.' } :
    debtRatio > 0.15 ? { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', msg: 'Cuotas entre 15–30% del sueldo. Reducí gastos variables.' } :
    { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', msg: 'Carga de deuda saludable. Podés invertir normalmente.' }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Préstamos</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión de deudas y cuotas</p>
      </div>

      {activeLoans.length > 0 && (
        <div className={`border rounded-xl p-4 ${semaforo.bg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total cuotas mensuales</p>
              <p className={`text-xl font-semibold ${semaforo.color}`}>${formatARS(totalCuotas)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{Math.round(debtRatio * 100)}% del sueldo</p>
            </div>
            <p className={`text-sm font-medium max-w-xs text-right ${semaforo.color}`}>{semaforo.msg}</p>
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Agregar préstamo</h2>
        <LoanForm />
      </div>

      <LoanList loans={loans} sueldoFijo={sueldoFijo} />
    </div>
  )
}
