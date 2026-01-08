-- New table for availability calendar system
-- Tabla para gestionar fechas bloqueadas por vestido
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dress_id UUID NOT NULL REFERENCES public.dresses(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT, -- Opcional: razón del bloqueo (ej: "Mantenimiento", "Reservado", etc)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Índices para mejorar el rendimiento de consultas por fechas
CREATE INDEX IF NOT EXISTS idx_blocked_dates_dress_id ON public.blocked_dates(dress_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_dates ON public.blocked_dates(start_date, end_date);

-- Políticas RLS para control de acceso
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Permitir a todos leer fechas bloqueadas (para mostrar en calendario público)
CREATE POLICY "Allow public to view blocked dates" 
  ON public.blocked_dates 
  FOR SELECT 
  USING (true);

-- Solo admins autenticados pueden insertar/actualizar/eliminar fechas bloqueadas
CREATE POLICY "Allow authenticated users to manage blocked dates" 
  ON public.blocked_dates 
  FOR ALL 
  USING (auth.role() = 'authenticated');
