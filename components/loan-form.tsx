'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addLoan } from '@/app/actions/loans'
import { calculateLoanPayment, formatARS } from '@/lib/finance-engine'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function LoanForm() {
  const [nombre, setNombre] = useState('')
  const [capital, setCapital] = useState('')
  const [tasa, setTasa] = useState('')
  const [cuotas, setCuotas] = useState('')
  const [fecha, setFecha] = useState(todayStr())
  const [saving, setSaving] = useState(false)

  const preview = capital && tasa && cuotas
    ? calculateLoanPayment(Number(capital), Number(tasa), Number(cuotas))
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await addLoan(nombre, Number(capital), Number(tasa), Number(cuotas), fecha)
    setNombre('')
    setCapital('')
    setTasa('')
    setCuotas('')
    setFecha(todayStr())
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <Label>Nombre del préstamo</Label>
          <Input placeholder="Ej: Préstamo personal Banco Nación" value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Capital (ARS)</Label>
          <Input type="number" placeholder="1000000" value={capital} onChange={e => setCapital(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>TNA (%)</Label>
          <Input type="number" placeholder="85" value={tasa} onChange={e => setTasa(e.target.value)} required step="0.1" />
        </div>
        <div className="space-y-1">
          <Label>Cuotas</Label>
          <Input type="number" placeholder="12" value={cuotas} onChange={e => setCuotas(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Fecha de inicio</Label>
          <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
        </div>
      </div>

      {preview !== null && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-gray-500">Cuota mensual estimada</p>
          <p className="text-lg font-semibold text-gray-900">${formatARS(Math.round(preview))}</p>
          <p className="text-xs text-gray-400">
            Total a pagar: ${formatARS(Math.round(preview * Number(cuotas)))} · Interés: ${formatARS(Math.round(preview * Number(cuotas) - Number(capital)))}
          </p>
        </div>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? 'Guardando...' : 'Agregar préstamo'}
      </Button>
    </form>
  )
}
