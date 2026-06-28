'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addFixedExpense, toggleFixedExpense, deleteFixedExpense } from '@/app/actions/fixed-expenses'
import { formatARS } from '@/lib/finance-engine'
import { GASTO_CATEGORIES } from '@/lib/categories'
import type { FixedExpense } from '@/lib/types'
import { Trash2 } from 'lucide-react'

export function FixedExpensesList({ expenses }: { expenses: FixedExpense[] }) {
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!categoria) return
    setAdding(true)
    await addFixedExpense(nombre, Number(monto), categoria)
    setNombre('')
    setMonto('')
    setCategoria('')
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {expenses.length === 0 && (
          <p className="text-sm text-gray-400">Sin gastos fijos aún</p>
        )}
        {expenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={e.activo}
                onChange={() => toggleFixedExpense(e.id, !e.activo)}
                className="rounded border-gray-300"
              />
              <div>
                <p className={`text-sm font-medium ${!e.activo ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{e.nombre}</p>
                <p className="text-xs text-gray-400">{e.categoria}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${!e.activo ? 'text-gray-400' : 'text-gray-700'}`}>${formatARS(e.monto)}</span>
              <button onClick={() => deleteFixedExpense(e.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-3 pt-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agregar nuevo</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input placeholder="Alquiler" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <Input type="number" placeholder="Monto (ARS)" value={monto} onChange={(e) => setMonto(e.target.value)} required />
          <Select value={categoria} onValueChange={(v) => setCategoria(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {GASTO_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="outline" disabled={adding} size="sm">
          {adding ? 'Agregando...' : '+ Agregar gasto fijo'}
        </Button>
      </form>
    </div>
  )
}
