'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addTransaction } from '@/app/actions/transactions'
import { GASTO_CATEGORIES, INGRESO_CATEGORIES } from '@/lib/categories'
import type { Wallet } from '@/lib/types'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

const WALLET_EMOJIS: Record<string, string> = {
  efectivo: '💵',
  banco: '🏦',
  virtual: '📱',
  inversion: '📈',
  otro: '🗂',
}

export function TransactionForm({ wallets }: { wallets: Wallet[] }) {
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
  const [fecha, setFecha] = useState(todayStr())
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [walletId, setWalletId] = useState('')
  const [saving, setSaving] = useState(false)

  const categories = tipo === 'gasto' ? GASTO_CATEGORIES : INGRESO_CATEGORIES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoria) return
    setSaving(true)
    await addTransaction(fecha, tipo, Number(monto), categoria, descripcion, walletId || undefined)
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
          className={`py-2.5 rounded-lg text-sm font-medium transition-colors border ${tipo === 'gasto' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => { setTipo('ingreso'); setCategoria('') }}
          className={`py-2.5 rounded-lg text-sm font-medium transition-colors border ${tipo === 'ingreso' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
        >
          Ingreso
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Fecha</Label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Monto</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <Input type="number" placeholder="10.000" value={monto} onChange={(e) => setMonto(e.target.value)} className="pl-7" required />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Categoría</Label>
          <Select value={categoria} onValueChange={(v) => setCategoria(v ?? '')}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Descripción <span className="text-gray-400 font-normal">(opcional)</span></Label>
          <Input placeholder="Ej: Supermercado Día" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        {wallets.length > 0 && (
          <div className="space-y-1">
            <Label>Billetera <span className="text-gray-400 font-normal">(opcional)</span></Label>
            <Select value={walletId} onValueChange={(v) => setWalletId(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Sin billetera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin billetera</SelectItem>
                {wallets.map(w => (
                  <SelectItem key={w.id} value={w.id}>
                    {WALLET_EMOJIS[w.tipo] ?? '🗂'} {w.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? 'Guardando...' : tipo === 'gasto' ? 'Registrar gasto' : 'Registrar ingreso'}
      </Button>
    </form>
  )
}
