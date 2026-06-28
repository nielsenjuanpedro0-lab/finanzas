import type { Profile, FixedExpense, Transaction, Loan, FinancialDiagnosis, FinancialPhase, BudgetDistribution, LoanMetrics } from './types'
import { NECESIDADES_CATEGORIES, ESTILO_VIDA_CATEGORIES } from './categories'

export function calculateLoanPayment(capital: number, tasaAnual: number, cuotas: number): number {
  if (tasaAnual === 0) return capital / cuotas
  const tasaMensual = tasaAnual / 12 / 100
  return capital * (tasaMensual * Math.pow(1 + tasaMensual, cuotas)) / (Math.pow(1 + tasaMensual, cuotas) - 1)
}

export function getLoanMetrics(loan: Loan, sueldoFijo: number): LoanMetrics {
  const cuotaMensual = loan.cuota_mensual
  const cuotasRestantes = loan.cuotas_total - loan.cuotas_pagadas
  const totalAPagar = loan.monto_pendiente + (cuotaMensual * cuotasRestantes - loan.monto_pendiente)
  const costoInteres = cuotaMensual * loan.cuotas_total - loan.monto_total
  const mesesRestantes = cuotasRestantes
  const fechaCancelacion = new Date()
  fechaCancelacion.setMonth(fechaCancelacion.getMonth() + mesesRestantes)
  const porcentajeSueldo = sueldoFijo > 0 ? (cuotaMensual / sueldoFijo) * 100 : 0

  return {
    cuotaMensual,
    totalAPagar: cuotaMensual * loan.cuotas_total,
    costoInteres,
    fechaCancelacion: fechaCancelacion.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
    porcentajeSueldo,
  }
}

export function getFinancialPhase(debtRatio: number, hasEmergencyFund: boolean, hasMultipleIncomes: boolean): FinancialPhase {
  if (debtRatio > 0.4) return 'supervivencia'
  if (!hasEmergencyFund) return 'estabilizacion'
  if (debtRatio < 0.15 && hasEmergencyFund) {
    if (hasMultipleIncomes) return 'riqueza'
    return 'crecimiento'
  }
  return 'estabilizacion'
}

export function calculateHealthScore(
  budgetDistribution: BudgetDistribution,
  hasEmergencyFund: boolean,
  debtRatio: number,
  anyCategoryOverLimit: boolean
): number {
  let score = 0
  const necOk = budgetDistribution.necesidades.actual <= budgetDistribution.necesidades.limite
  const estiloOk = budgetDistribution.estiloDeVida.actual <= budgetDistribution.estiloDeVida.limite
  if (necOk && estiloOk) score += 40
  else if (necOk || estiloOk) score += 20
  if (hasEmergencyFund) score += 20
  if (debtRatio < 0.15) score += 20
  if (!anyCategoryOverLimit) score += 20
  return score
}

export function generateRecommendation(
  phase: FinancialPhase,
  debtRatio: number,
  hasEmergencyFund: boolean,
  budgetDistribution: BudgetDistribution,
  disponible: number,
  sueldoFijo: number
): string {
  if (debtRatio > 0.3) {
    return `Tus cuotas superan el 30% de tu sueldo. Pausá inversiones y enfocate en cancelar deuda. Cada peso extra que puedas poner a capital te ahorra intereses compuestos.`
  }
  if (!hasEmergencyFund) {
    const meta = sueldoFijo * 3
    return `Prioridad #1: construir tu fondo de emergencia de $${formatARS(meta)} (3 meses de gastos fijos). Transferilo a una cuenta separada el día que cobrás.`
  }
  if (budgetDistribution.estiloDeVida.actual > budgetDistribution.estiloDeVida.limite) {
    const exceso = budgetDistribution.estiloDeVida.monto - (sueldoFijo * 0.2)
    return `Tus gastos de estilo de vida superan el 20% recomendado en $${formatARS(exceso)}. Revisá delivery y suscripciones primero — son los más fáciles de reducir.`
  }
  if (phase === 'crecimiento') {
    return `Estás en buena posición financiera. Tu próximo paso es invertir el 10% de tu sueldo ($${formatARS(sueldoFijo * 0.1)}/mes). FCI en pesos o CEDEARs son buenas opciones para arrancar.`
  }
  if (phase === 'riqueza') {
    return `Excelente gestión financiera. Diversificá: CEDEARs para cobertura en dólares, FCI de renta variable para crecimiento. Revisá que tu fondo de emergencia siga cubriendo 3 meses.`
  }
  return `Seguís tu presupuesto correctamente. Mantené el hábito de registrar cada movimiento — la consciencia es la base de toda buena finanza personal.`
}

export function generateAlerts(
  budgetDistribution: BudgetDistribution,
  debtRatio: number,
  transactions: Transaction[],
  sueldoFijo: number
): string[] {
  const alerts: string[] = []

  if (budgetDistribution.necesidades.actual > budgetDistribution.necesidades.limite) {
    alerts.push(`Necesidades básicas al ${Math.round(budgetDistribution.necesidades.actual)}% (límite 50%)`)
  }
  if (budgetDistribution.estiloDeVida.actual > budgetDistribution.estiloDeVida.limite) {
    alerts.push(`Estilo de vida al ${Math.round(budgetDistribution.estiloDeVida.actual)}% (límite 20%)`)
  }
  if (debtRatio > 0.3) {
    alerts.push(`Cuotas representan el ${Math.round(debtRatio * 100)}% del sueldo (límite 30%)`)
  }

  const deliveryGastos = transactions.filter(t => t.tipo === 'gasto' && t.categoria === 'Delivery').reduce((s, t) => s + t.monto, 0)
  const deliveryLimit = sueldoFijo * 0.05
  if (deliveryGastos > deliveryLimit) {
    alerts.push(`Delivery: $${formatARS(deliveryGastos)} este mes (recomendado máx. $${formatARS(deliveryLimit)})`)
  }

  return alerts
}

export function computeDiagnosis(
  profile: Profile,
  fixedExpenses: FixedExpense[],
  transactions: Transaction[],
  loans: Loan[],
  currentMonth: string
): FinancialDiagnosis {
  const ingresoTotal = profile.sueldo_fijo + profile.otros_ingresos_estimados
  const activeLoansCuotas = loans.filter(l => l.activo).reduce((s, l) => s + l.cuota_mensual, 0)
  const activeFixedExpenses = fixedExpenses.filter(e => e.activo).reduce((s, e) => s + e.monto, 0)

  const monthTransactions = transactions.filter(t => t.fecha.startsWith(currentMonth))
  const totalGastosVariables = monthTransactions.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
  const totalIngresosMes = monthTransactions.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)

  const totalGastos = activeFixedExpenses + activeLoansCuotas + totalGastosVariables
  const disponible = ingresoTotal - totalGastos

  const necesidadesMonto = fixedExpenses.filter(e => e.activo && NECESIDADES_CATEGORIES.includes(e.categoria)).reduce((s, e) => s + e.monto, 0)
    + transactions.filter(t => t.tipo === 'gasto' && t.fecha.startsWith(currentMonth) && NECESIDADES_CATEGORIES.includes(t.categoria)).reduce((s, t) => s + t.monto, 0)

  const estiloMonto = fixedExpenses.filter(e => e.activo && ESTILO_VIDA_CATEGORIES.includes(e.categoria)).reduce((s, e) => s + e.monto, 0)
    + transactions.filter(t => t.tipo === 'gasto' && t.fecha.startsWith(currentMonth) && ESTILO_VIDA_CATEGORIES.includes(t.categoria)).reduce((s, t) => s + t.monto, 0)

  const necesidadesActual = ingresoTotal > 0 ? (necesidadesMonto / ingresoTotal) * 100 : 0
  const estiloActual = ingresoTotal > 0 ? (estiloMonto / ingresoTotal) * 100 : 0

  const budgetDistribution: BudgetDistribution = {
    necesidades: { limite: 50, actual: necesidadesActual, monto: necesidadesMonto },
    estiloDeVida: { limite: 20, actual: estiloActual, monto: estiloMonto },
    emergencia: { limite: 10, actual: 0, monto: ingresoTotal * 0.1 },
    inversion: { limite: 10, actual: 0, monto: ingresoTotal * 0.1 },
    colchon: { limite: 10, actual: 0, monto: ingresoTotal * 0.1 },
  }

  const debtRatio = ingresoTotal > 0 ? activeLoansCuotas / ingresoTotal : 0
  const hasEmergencyFund = false // futuro: trackear ahorro explícito
  const hasMultipleIncomes = profile.otros_ingresos_estimados > 0

  const phase = getFinancialPhase(debtRatio, hasEmergencyFund, hasMultipleIncomes)
  const anyCategoryOverLimit = necesidadesActual > 50 || estiloActual > 20
  const healthScore = calculateHealthScore(budgetDistribution, hasEmergencyFund, debtRatio, anyCategoryOverLimit)
  const alerts = generateAlerts(budgetDistribution, debtRatio, monthTransactions, profile.sueldo_fijo)
  const recommendation = generateRecommendation(phase, debtRatio, hasEmergencyFund, budgetDistribution, disponible, profile.sueldo_fijo)

  return {
    disponible,
    healthScore,
    phase,
    alerts,
    recommendation,
    budgetDistribution,
    totalIngresos: ingresoTotal + totalIngresosMes,
    totalGastos,
    totalCuotas: activeLoansCuotas,
    debtRatio,
  }
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}
