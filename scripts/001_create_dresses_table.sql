-- Tabla principal de vestidos para inventario
CREATE TABLE IF NOT EXISTS public.dresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- Ej: fiesta, noche, graduación, boda
  color TEXT NOT NULL,
  size TEXT NOT NULL, -- Ej: XS, S, M, L, XL
  price_per_day DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  additional_images TEXT[], -- Array de URLs de imágenes adicionales
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reservaciones
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dress_id UUID NOT NULL REFERENCES public.dresses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  rental_start_date DATE NOT NULL,
  rental_end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_dresses_category ON public.dresses(category);
CREATE INDEX IF NOT EXISTS idx_dresses_color ON public.dresses(color);
CREATE INDEX IF NOT EXISTS idx_dresses_size ON public.dresses(size);
CREATE INDEX IF NOT EXISTS idx_dresses_available ON public.dresses(available);
CREATE INDEX IF NOT EXISTS idx_reservations_dress_id ON public.reservations(dress_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(rental_start_date, rental_end_date);

-- Políticas RLS (Row Level Security) - acceso público de lectura para vestidos
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;

-- Permitir a todos leer los vestidos disponibles
CREATE POLICY "Allow public to view dresses" 
  ON public.dresses 
  FOR SELECT 
  USING (true);

-- Para las reservaciones, permitir insertar a todos (clientes)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to create reservations" 
  ON public.reservations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public to view their reservations" 
  ON public.reservations 
  FOR SELECT 
  USING (true);
