'use server'

import { revalidatePath } from 'next/cache'
import { supabaseClient } from '@/lib/supabase'
import { adjustWalletSaldo } from './wallets'
import type { Transaction } from '@/lib/types'

export async function getTransactions(month?: string): Promise<Transaction[]> {
  let query = supabaseClient().from('transactions').select('*').order('fecha', { ascending: false })
  if (month) {
    const start = `${month}-01`
    const [year, m] = month.split('-').map(Number)
    const nextMonth = m === 12 ? `${year + 1}-01-01` : `${year}-${String(m + 1).padStart(2, '0')}-01`
    query = query.gte('fecha', start).lt('fecha', nextMonth)
  }
  const { data } = await query
  return data ?? []
}

export async function addTransaction(
  fecha: string,
  tipo: 'ingreso' | 'gasto',
  monto: number,
  categoria: string,
  descripcion: string,
  wallet_id?: string,
) {
  await supabaseClient().from('transactions').insert({
    fecha, tipo, monto, categoria,
    descripcion: descripcion || null,
    wallet_id: wallet_id || null,
  })
  if (wallet_id) await adjustWalletSaldo(wallet_id, tipo, monto)
  revalidatePath('/', 'layout')
}

export async function deleteTransaction(id: string) {
  await supabaseClient().from('transactions').delete().eq('id', id)
  revalidatePath('/', 'layout')
}
