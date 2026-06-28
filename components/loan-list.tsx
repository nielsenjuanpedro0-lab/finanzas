'use client'

import { deleteLoan, registrarCuotaPagada } from '@/app/actions/loans'
import { getLoanMetrics, formatARS } from '@/lib/finance-engine'
import type { Loan } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LoanList({ loans, sueldoFijo }: { loans: Loan[]; sueldoFijo: number }) {
  if (loans.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-sm text-gray-400">Sin préstamos registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-900">Préstamos activos</h2>
      {loans.map((loan) => {
        const metrics = getLoanMetrics(loan, sueldoFijo)
        const progress = loan.cuotas_total > 0 ? (loan.cuotas_pagadas / loan.cuotas_total) * 100 : 0
        const debtPct = metrics.porcentajeSueldo
        const pctColor = debtPct > 30 ? 'text-red-500' : debtPct > 15 ? 'text-amber-500' : 'text-emerald-600'

        return (
          <div key={loan.id} className={`border rounded-xl p-5 space-y-4 ${!loan.activo ? 'opacity-50' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{loan.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {loan.cuotas_pagadas}/{loan.cuotas_total} cuotas · Cancela {metrics.fechaCancelacion}
                </p>
              </div>
              <button onClick={() => deleteLoan(loan.id)} className="text-gray-200 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>

            <Progress value={progress} className="h-1.5" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-gray-400">Cuota</p>
                <p className="text-sm font-semibold text-gray-900">${formatARS(loan.cuota_mensual)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">% sueldo</p>
                <p className={`text-sm font-semibold ${pctColor}`}>{Math.round(debtPct)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Pendiente</p>
                <p className="text-sm font-semibold text-gray-700">${formatARS(loan.monto_pendiente)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Interés total</p>
                <p className="text-sm font-semibold text-gray-700">${formatARS(metrics.costoInteres)}</p>
              </div>
            </div>

            {loan.activo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => registrarCuotaPagada(loan.id, loan.cuotas_pagadas, loan.cuotas_total, loan.cuota_mensual, loan.monto_pendiente)}
              >
                Registrar cuota pagada
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
