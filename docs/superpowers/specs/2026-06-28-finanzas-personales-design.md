# Finanzas Personales — Design Spec
**Date:** 2026-06-28  
**Status:** Approved

---

## Overview

Panel de control de finanzas personales para un único usuario. Permite registrar ingresos, gastos, préstamos y gastos fijos. Calcula distribución recomendada del dinero según metodología financiera profesional y adapta consejos dinámicamente según la situación real del usuario.

**Deploy:** Vercel  
**Stack:** Next.js 15 App Router + Supabase (PostgreSQL) + Tailwind CSS + shadcn/ui  
**Auth:** Middleware Vercel con password en env var `DASHBOARD_PASSWORD` — sin Supabase Auth  
**Moneda:** ARS únicamente  
**Diseño:** Blanco puro, minimalista, sidebar fija izquierda

---

## Architecture

### Protección de acceso
`middleware.ts` intercepta todas las rutas. Sin cookie válida → redirige a `/login`. Password hasheado comparado contra `DASHBOARD_PASSWORD` env var. Cookie con expiración de 30 días.

### Estructura de rutas
```
/              → Dashboard (resumen del mes + asesor)
/movimientos   → Historial + formulario carga rápida
/prestamos     → Gestión de préstamos activos
/configuracion → Sueldo, gastos fijos, fuentes de ingreso
/reportes      → Gráficos mensuales y evolución
/login         → Pantalla de acceso con password
```

### UI
- Sidebar fija izquierda: íconos + labels, colapsa en mobile (bottom nav)
- Tipografía: Inter
- Colores: blanco `#FFFFFF`, grises `#F9FAFB / #E5E7EB / #6B7280`, acento neutro `#111827`
- Semáforo financiero: verde `#10B981`, amarillo `#F59E0B`, rojo `#EF4444`
- Sin sombras pesadas, sin gradientes, bordes `1px solid #E5E7EB`

---

## Data Model (Supabase)

### `profiles`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid PK | |
| sueldo_fijo | numeric | Sueldo mensual neto |
| otros_ingresos_estimados | numeric | Estimado mensual ingresos extra |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `fixed_expenses`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid PK | |
| nombre | text | Ej: "Alquiler" |
| monto | numeric | Monto mensual |
| categoria | text | Ver categorías |
| activo | boolean | Para desactivar sin borrar |
| created_at | timestamptz | |

### `income_sources`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid PK | |
| nombre | text | Ej: "Freelance diseño" |
| tipo | text | freelance \| venta \| inversion \| otro |
| activo | boolean | |

### `transactions`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid PK | |
| fecha | date | Fecha del movimiento |
| tipo | text | ingreso \| gasto |
| monto | numeric | Siempre positivo |
| categoria | text | Ver categorías |
| descripcion | text | Nota opcional |
| income_source_id | uuid FK nullable | Si es ingreso externo |
| created_at | timestamptz | |

### `loans`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid PK | |
| nombre | text | Ej: "Préstamo personal Banco X" |
| monto_total | numeric | Capital original |
| monto_pendiente | numeric | Deuda restante |
| cuota_mensual | numeric | Calculada automático |
| tasa_anual | numeric | TNA en porcentaje |
| fecha_inicio | date | |
| fecha_fin | date | Calculada automático |
| cuotas_total | integer | |
| cuotas_pagadas | integer | |
| activo | boolean | |
| created_at | timestamptz | |

### Categorías predefinidas

**Gastos:** `Alquiler` · `Supermercado` · `Transporte` · `Servicios` · `Salud` · `Educación` · `Entretenimiento` · `Ropa` · `Delivery` · `Suscripciones` · `Otros`

**Ingresos:** `Sueldo fijo` · `Freelance` · `Inversiones` · `Venta` · `Otros`

---

## Finance Methodology

### Distribución recomendada (adaptada para Argentina)
| Categoría | % |
|---|---|
| Necesidades fijas (alquiler, servicios, salud) | ≤ 50% |
| Estilo de vida (comida, ropa, entretenimiento) | ≤ 20% |
| Fondo de emergencia | 10% |
| Inversión | 10% |
| Colchón / imprevistos | 10% |

### Prioridades (Kiyosaki + Clason + regla 50/20/30)
1. Cancelar deudas de alto interés antes de invertir
2. Fondo emergencia = 3 meses de gastos fijos (meta obligatoria)
3. Recién cuando fondo OK → invertir
4. Págate primero: asignar ahorro/inversión el día de cobro

### Motor de diagnóstico
```
sueldo_fijo + otros_ingresos_estimados
- sum(fixed_expenses activos)
- sum(cuota_mensual loans activos)
- sum(transactions tipo=gasto del mes)
= disponible_real_hoy
```

### Fases de vida financiera (detección automática)
| Fase | Condición | Color |
|---|---|---|
| Supervivencia | deudas/cuotas > 40% sueldo | 🔴 |
| Estabilización | sin fondo emergencia completo | 🟡 |
| Crecimiento | fondo OK, deudas < 15% | 🟢 |
| Riqueza | múltiples ingresos, inversión activa | 🔵 |

### Score de salud financiera (0–100)
- Cumple distribución recomendada: +40pts
- Fondo emergencia completo: +20pts
- Deudas < 15% sueldo: +20pts
- Sin categoría fuera de límite: +20pts

### Recomendaciones dinámicas
Texto generado en servidor según situación real:
- Deudas > 30% → pausar inversión, cancelar agresivamente
- Sin fondo emergencia → prioridad absoluta antes de cualquier otra meta
- Gasto estilo de vida > 20% → alerta con monto exacto de reducción
- Buen mes → siguiente paso según fase actual

---

## Loans Calculator

**Fórmula francesa (cuota fija):**
```
cuota = capital × (tasa_mensual × (1 + tasa_mensual)^n) / ((1 + tasa_mensual)^n - 1)
tasa_mensual = tasa_anual / 12 / 100
```

**Métricas mostradas por préstamo:**
- Cuota mensual calculada
- Total a pagar (capital + intereses)
- Costo del interés (diferencia)
- Fecha estimada de cancelación
- % del sueldo que representa la cuota
- Progreso visual (cuotas pagadas / total)

**Regla de deuda:**
| % sueldo en cuotas | Estado | Acción |
|---|---|---|
| < 15% | Verde | Podés invertir normalmente |
| 15–30% | Amarillo | Reducí gastos variables |
| > 30% | Rojo | Pausá inversión, cancelá primero |

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│ [Sidebar]  │  Bienvenido — Junio 2026               │
│            │  ┌──────────┐ ┌──────────┐ ┌────────┐ │
│ Dashboard  │  │Disponible│ │ Salud    │ │ Fase   │ │
│ Movimientos│  │ $XXX.XXX │ │ 72/100 🟢│ │Crec. 🟢│ │
│ Préstamos  │  └──────────┘ └──────────┘ └────────┘ │
│ Reportes   │                                        │
│ Config     │  Plan del mes          Alertas         │
│            │  ┌────────────────┐   ┌──────────────┐│
│            │  │ Necesidades 50%│   │⚠ Delivery    ││
│            │  │ Estilo vida 20%│   │  +15% limite ││
│            │  │ Ahorro 10%     │   └──────────────┘│
│            │  │ Inversión 10%  │                   │
│            │  └────────────────┘   Recomendación   │
│            │                       ┌──────────────┐│
│            │                       │Tu próximo paso││
│            │                       │es completar  ││
│            │                       │fondo emergenc││
│            │                       └──────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## Pages Detail

### `/movimientos`
- Lista cronológica con filtros (mes, categoría, tipo)
- Formulario inline de carga rápida: fecha, tipo, monto, categoría, descripción
- Totales del período seleccionado (ingresos vs gastos)

### `/prestamos`
- Card por préstamo con barra de progreso
- Formulario para agregar nuevo (nombre, capital, tasa, cuotas)
- Resumen total: suma de cuotas mensuales, % del sueldo
- Alerta semáforo si supera umbrales

### `/configuracion`
- Sueldo fijo mensual neto
- Fuentes de ingreso extra (lista editable)
- Gastos fijos (lista editable con toggle activo/inactivo)
- Primer setup obligatorio antes de acceder al resto

### `/reportes`
- Gráfico de barras: ingresos vs gastos por mes (últimos 6 meses)
- Gráfico de torta: distribución de gastos por categoría del mes
- Evolución del score de salud financiera
- Comparativa mes actual vs mes anterior

---

## Non-Goals
- Multi-usuario
- Multi-moneda
- Integración bancaria automática
- Notificaciones push / email
- App mobile nativa
