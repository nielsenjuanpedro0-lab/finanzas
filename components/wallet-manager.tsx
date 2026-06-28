'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addWallet, updateWalletSaldo, deleteWallet } from '@/app/actions/wallets'
import { formatARS } from '@/lib/finance-engine'
import type { Wallet } from '@/lib/types'
import { Trash2, Pencil, Check } from 'lucide-react'

const TIPOS = [
  { value: 'efectivo', label: '💵 Efectivo' },
  { value: 'banco', label: '🏦 Banco' },
  { value: 'virtual', label: '📱 Billetera virtual' },
  { value: 'inversion', label: '📈 Inversión' },
  { value: 'otro', label: '🗂 Otro' },
]

function WalletCard({ wallet }: { wallet: Wallet }) {
  const [editing, setEditing] = useState(false)
  const [saldo, setSaldo] = useState(wallet.saldo.toString())
  const [saving, setSaving] = useState(false)

  const tipo = TIPOS.find(t => t.value === wallet.tipo)

  async function handleSave() {
    setSaving(true)
    await updateWalletSaldo(wallet.id, Number(saldo))
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xl">{tipo?.label.split(' ')[0]}</span>
        <div>
          <p className="text-sm font-medium text-gray-900">{wallet.nombre}</p>
          <p className="text-xs text-gray-400">{tipo?.label.split(' ').slice(1).join(' ')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <span className="text-sm text-gray-500">$</span>
            <Input
              type="number"
              value={saldo}
              onChange={e => setSaldo(e.target.value)}
              className="w-32 h-8 text-sm"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-emerald-500 hover:text-emerald-600"
            >
              <Check size={16} />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-gray-900">${formatARS(wallet.saldo)}</span>
            <button onClick={() => setEditing(true)} className="text-gray-300 hover:text-gray-500 ml-1">
              <Pencil size={13} />
            </button>
          </>
        )}
        <button onClick={() => deleteWallet(wallet.id)} className="text-gray-200 hover:text-red-400 transition-colors ml-1">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export function WalletManager({ wallets }: { wallets: Wallet[] }) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('')
  const [saldo, setSaldo] = useState('')
  const [adding, setAdding] = useState(false)

  const total = wallets.reduce((s, w) => s + w.saldo, 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!tipo) return
    setAdding(true)
    await addWallet(nombre, tipo, Number(saldo))
    setNombre('')
    setTipo('')
    setSaldo('')
    setAdding(false)
  }

  return (
    <div className="space-y-4">
      {wallets.length > 0 && (
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Total en billeteras</span>
          <span className="text-lg font-semibold text-gray-900">${formatARS(total)}</span>
        </div>
      )}

      <div className="space-y-2">
        {wallets.length === 0 && (
          <p className="text-sm text-gray-400">Sin billeteras aún. Agregá tu primera.</p>
        )}
        {wallets.map(w => <WalletCard key={w.id} wallet={w} />)}
      </div>

      <form onSubmit={handleAdd} className="space-y-3 pt-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agregar billetera</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input placeholder="Ej: Mercado Pago" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <Select value={tipo} onValueChange={v => setTipo(v ?? '')}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              {TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Saldo actual (ARS)" value={saldo} onChange={e => setSaldo(e.target.value)} />
        </div>
        <Button type="submit" variant="outline" size="sm" disabled={adding}>
          {adding ? 'Agregando...' : '+ Agregar billetera'}
        </Button>
      </form>
    </div>
  )
}
