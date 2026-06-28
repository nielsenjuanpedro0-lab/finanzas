'use client'

import { deleteTransaction } from '@/app/actions/transactions'
import { formatARS } from '@/lib/finance-engine'
import type { Transaction } from '@/lib/types'
import { Trash2 } from 'lucide-react'

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">Sin movimientos este mes</p>
  }

  return (
    <div className="space-y-1">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 group">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shrink-0 ${t.tipo === 'ingreso' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <div>
              <p className="text-sm text-gray-900">{t.descripcion || t.categoria}</p>
              <p className="text-xs text-gray-400">{t.categoria} · {new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${t.tipo === 'ingreso' ? 'text-emerald-600' : 'text-gray-700'}`}>
              {t.tipo === 'ingreso' ? '+' : '-'}${formatARS(t.monto)}
            </span>
            <button
              onClick={() => deleteTransaction(t.id)}
              className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
