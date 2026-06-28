'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addTransaction } from '@/app/actions/transactions'
import { GASTO_CATEGORIES, INGRESO_CATEGORIES } from '@/lib/categories'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function TransactionForm() {
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
  const [fecha, setFecha] = useState(todayStr())
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)

  const categories = tipo === 'gasto' ? GASTO_CATEGORIES : INGRESO_CATEGORIES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoria) return
    setSaving(true)
    await addTransaction(fecha, tipo, Number(monto), categoria, descripcion)
    setMonto('')
    setDescripcion('')
    setCategoria('')
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => { setTipo('gasto'); setCategoria('') }}
          className={`py-2 rounded-lg text-sm font-medium transition-colors border ${tipo === 'gasto' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => { setTipo('ingreso'); setCategoria('') }}
          className={`py-2 rounded-lg text-sm font-medium transition-colors border ${tipo === 'ingreso' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-500 border-gray-200'}`}
        >
          Ingreso
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Fecha</Label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Monto (ARS)</Label>
          <Input type="number" placeholder="10000" value={monto} onChange={(e) => setMonto(e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Categoría</Label>
          <Select value={categoria} onValueChange={(v) => setCategoria(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Descripción (opcional)</Label>
          <Input placeholder="Ej: Supermercado Día" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Guardando...' : 'Agregar movimiento'}
      </Button>
    </form>
  )
}
