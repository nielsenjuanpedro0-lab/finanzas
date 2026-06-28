export interface Profile {
  id: string
  sueldo_fijo: number
  otros_ingresos_estimados: number
  created_at: string
  updated_at: string
}

export interface FixedExpense {
  id: string
  nombre: string
  monto: number
  categoria: string
  activo: boolean
  created_at: string
}

export interface IncomeSource {
  id: string
  nombre: string
  tipo: 'freelance' | 'venta' | 'inversion' | 'otro'
  activo: boolean
}

export interface Transaction {
  id: string
  fecha: string
  tipo: 'ingreso' | 'gasto'
  monto: number
  categoria: string
  descripcion: string | null
  income_source_id: string | null
  wallet_id: string | null
  created_at: string
}

export interface Wallet {
  id: string
  nombre: string
  tipo: 'efectivo' | 'banco' | 'virtual' | 'inversion' | 'otro'
  saldo: number
  activo: boolean
  created_at: string
}

export interface Loan {
  id: string
  nombre: string
  monto_total: number
  monto_pendiente: number
  cuota_mensual: number
  tasa_anual: number
  fecha_inicio: string
  fecha_fin: string
  cuotas_total: number
  cuotas_pagadas: number
  activo: boolean
  created_at: string
}

export type FinancialPhase = 'supervivencia' | 'estabilizacion' | 'crecimiento' | 'riqueza'

export interface FinancialDiagnosis {
  disponible: number
  healthScore: number
  phase: FinancialPhase
  alerts: string[]
  recommendation: string
  budgetDistribution: BudgetDistribution
  totalIngresos: number
  totalGastos: number
  totalCuotas: number
  debtRatio: number
}

export interface BudgetDistribution {
  necesidades: { limite: number; actual: number; monto: number }
  estiloDeVida: { limite: number; actual: number; monto: number }
  emergencia: { limite: number; actual: number; monto: number }
  inversion: { limite: number; actual: number; monto: number }
  colchon: { limite: number; actual: number; monto: number }
}

export interface LoanMetrics {
  cuotaMensual: number
  totalAPagar: number
  costoInteres: number
  fechaCancelacion: string
  porcentajeSueldo: number
}
