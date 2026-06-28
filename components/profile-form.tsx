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
          <Label htmlFor="sueldo">Sueldo fijo mensual neto (ARS)</Label>
          <Input
            id="sueldo"
            type="number"
            placeholder="500000"
            value={sueldo}
            onChange={(e) => setSueldo(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otros">Otros ingresos estimados (ARS)</Label>
          <Input
            id="otros"
            type="number"
            placeholder="0"
            value={otros}
            onChange={(e) => setOtros(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
      </Button>
    </form>
  )
}
