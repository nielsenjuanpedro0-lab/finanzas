'use server'

import { revalidatePath } from 'next/cache'
import { supabaseClient } from '@/lib/supabase'
import type { FixedExpense } from '@/lib/types'

export async function getFixedExpenses(): Promise<FixedExpense[]> {
  const { data } = await supabaseClient().from('fixed_expenses').select('*').order('created_at')
  return data ?? []
}

export async function addFixedExpense(nombre: string, monto: number, categoria: string) {
  await supabaseClient().from('fixed_expenses').insert({ nombre, monto, categoria })
  revalidatePath('/', 'layout')
}

export async function toggleFixedExpense(id: string, activo: boolean) {
  await supabaseClient().from('fixed_expenses').update({ activo }).eq('id', id)
  revalidatePath('/', 'layout')
}

export async function deleteFixedExpense(id: string) {
  await supabaseClient().from('fixed_expenses').delete().eq('id', id)
  revalidatePath('/', 'layout')
}
