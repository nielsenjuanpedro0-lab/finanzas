'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { upsertProfile } from '@/app/actions/profile'
import type { Profile } from '@/lib/types'

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [sueldo, setSueldo] = useState(profile?.sueldo_fijo?.toString() ?? '')
  const [otros, setOtros] = useState(profile?.otros_ingresos_estimados?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await upsertProfile(Number(sueldo), Number(otros))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sueldo">Sueldo fijo mensual neto</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <Input
              id="sueldo"
              type="number"
              placeholder="500.000"
              value={sueldo}
              onChange={(e) => setSueldo(e.target.value)}
              className="pl-7"
              required
            />
          </div>
          <p className="text-xs text-gray-400">Lo que te depositan cada mes de tu trabajo fijo</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="otros">Otros ingresos fijos mensuales</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <Input
              id="otros"
              type="number"
              placeholder="0"
              value={otros}
              onChange={(e) => setOtros(e.target.value)}
              className="pl-7"
            />
          </div>
          <p className="text-xs text-gray-400">Alquiler que cobrás, cuota fija de cliente, etc. Los ingresos variables los cargás en Movimientos.</p>
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
      </Button>
    </form>
  )
}
