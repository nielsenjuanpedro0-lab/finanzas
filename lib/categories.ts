export const GASTO_CATEGORIES = [
  'Alquiler',
  'Supermercado',
  'Transporte',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa',
  'Delivery',
  'Suscripciones',
  'Otros',
] as const

export const INGRESO_CATEGORIES = [
  'Sueldo fijo',
  'Freelance',
  'Inversiones',
  'Venta',
  'Otros',
] as const

export const NECESIDADES_CATEGORIES = ['Alquiler', 'Servicios', 'Salud', 'Transporte']
export const ESTILO_VIDA_CATEGORIES = ['Supermercado', 'Ropa', 'Entretenimiento', 'Delivery', 'Suscripciones', 'Educación', 'Otros']

export type GastoCategory = (typeof GASTO_CATEGORIES)[number]
export type IngresoCategory = (typeof INGRESO_CATEGORIES)[number]
