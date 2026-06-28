'use server'

import { revalidatePath } from 'next/cache'
import { supabaseClient } from '@/lib/supabase'
import type { Wallet } from '@/lib/types'

export async function getWallets(): Promise<Wallet[]> {
  const { data } = await supabaseClient().from('wallets').select('*').order('created_at')
  return data ?? []
}

export async function addWallet(nombre: string, tipo: string, saldo: number) {
  await supabaseClient().from('wallets').insert({ nombre, tipo, saldo })
  revalidatePath('/', 'layout')
}

export async function updateWalletSaldo(id: string, saldo: number) {
  await supabaseClient().from('wallets').update({ saldo }).eq('id', id)
  revalidatePath('/', 'layout')
}

export async function deleteWallet(id: string) {
  await supabaseClient().from('wallets').delete().eq('id', id)
  revalidatePath('/', 'layout')
}

export async function adjustWalletSaldo(wallet_id: string, tipo: 'ingreso' | 'gasto', monto: number) {
  const { data } = await supabaseClient().from('wallets').select('saldo').eq('id', wallet_id).single()
  if (!data) return
  const newSaldo = tipo === 'ingreso' ? data.saldo + monto : data.saldo - monto
  await supabaseClient().from('wallets').update({ saldo: Math.max(0, newSaldo) }).eq('id', wallet_id)
}
