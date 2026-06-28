export const dynamic = 'force-dynamic'
import { getTransactions } from '@/app/actions/transactions'
import { getWallets } from '@/app/actions/wallets'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionList } from '@/components/transaction-list'
import { MonthSelector } from '@/components/month-selector'

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { mes } = await searchParams
  const month = mes || getCurrentMonth()
  const [transactions, wallets] = await Promise.all([
    getTransactions(month),
    getWallets(),
  ])

  const totalIngresos = transactions.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
  const totalGastos = transactions.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Movimientos</h1>
        <p className="text-sm text-gray-500 mt-1">Registrá tus ingresos y gastos diarios</p>
      </div>

      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Cargar movimiento</h2>
        <TransactionForm wallets={wallets} />
      </div>

      <div className="border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Historial</h2>
          <MonthSelector currentMonth={month} />
        </div>
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Ingresos</p>
            <p className="text-lg font-semibold text-emerald-600">${new Intl.NumberFormat('es-AR').format(totalIngresos)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Gastos</p>
            <p className="text-lg font-semibold text-red-500">${new Intl.NumberFormat('es-AR').format(totalGastos)}</p>
          </div>
        </div>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  )
}

