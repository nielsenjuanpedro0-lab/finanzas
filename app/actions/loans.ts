'use server'

import { revalidatePath } from 'next/cache'
import { supabaseClient } from '@/lib/supabase'
import type { Loan } from '@/lib/types'
import { calculateLoanPayment } from '@/lib/finance-engine'

export async function getLoans(): Promise<Loan[]> {
  const { data } = await supabaseClient().from('loans').select('*').order('created_at')
  return data ?? []
}

export async function addLoan(
  nombre: string,
  monto_total: number,
  tasa_anual: number,
  cuotas_total: number,
  fecha_inicio: string
) {
  const cuota_mensual = calculateLoanPayment(monto_total, tasa_anual, cuotas_total)
  const fechaFin = new Date(fecha_inicio)
  fechaFin.setMonth(fechaFin.getMonth() + cuotas_total)

  await supabaseClient().from('loans').insert({
    nombre,
    monto_total,
    monto_pendiente: monto_total,
    cuota_mensual: Math.round(cuota_mensual),
    tasa_anual,
    fecha_inicio,
    fecha_fin: fechaFin.toISOString().split('T')[0],
    cuotas_total,
    cuotas_pagadas: 0,
  })
  revalidatePath('/', 'layout')
}

export async function registrarCuotaPagada(id: string, cuotas_pagadas: number, cuotas_total: number, cuota_mensual: number, monto_pendiente: number) {
  const nuevasPagadas = cuotas_pagadas + 1
  const nuevoPendiente = Math.max(0, monto_pendiente - cuota_mensual)
  const activo = nuevasPagadas < cuotas_total

  await supabaseClient().from('loans').update({
    cuotas_pagadas: nuevasPagadas,
    monto_pendiente: nuevoPendiente,
    activo,
  }).eq('id', id)
  revalidatePath('/', 'layout')
}

export async function deleteLoan(id: string) {
  await supabaseClient().from('loans').delete().eq('id', id)
  revalidatePath('/', 'layout')
}
