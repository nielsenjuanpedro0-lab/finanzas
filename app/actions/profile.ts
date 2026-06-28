'use server'

import { revalidatePath } from 'next/cache'
import { supabaseClient } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export async function getProfile(): Promise<Profile | null> {
  const { data } = await supabaseClient().from('profiles').select('*').single()
  return data
}

export async function upsertProfile(sueldo_fijo: number, otros_ingresos_estimados: number) {
  const { data: existing } = await supabaseClient().from('profiles').select('id').single()
  if (existing) {
    await supabaseClient().from('profiles').update({ sueldo_fijo, otros_ingresos_estimados, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await supabaseClient().from('profiles').insert({ sueldo_fijo, otros_ingresos_estimados })
  }
  revalidatePath('/', 'layout')
}
