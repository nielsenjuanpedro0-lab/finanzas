create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  sueldo_fijo numeric not null default 0,
  otros_ingresos_estimados numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  monto numeric not null,
  categoria text not null,
  activo boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists income_sources (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('freelance', 'venta', 'inversion', 'otro')),
  activo boolean not null default true
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  monto numeric not null,
  categoria text not null,
  descripcion text,
  income_source_id uuid references income_sources(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  monto_total numeric not null,
  monto_pendiente numeric not null,
  cuota_mensual numeric not null,
  tasa_anual numeric not null default 0,
  fecha_inicio date not null,
  fecha_fin date not null,
  cuotas_total integer not null,
  cuotas_pagadas integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz default now()
);
