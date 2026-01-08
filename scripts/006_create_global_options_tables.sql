-- Tabla de colores disponibles globalmente
CREATE TABLE IF NOT EXISTS public.dress_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  hex_code TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tallas disponibles globalmente
CREATE TABLE IF NOT EXISTS public.dress_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de categorías/etiquetas disponibles globalmente
CREATE TABLE IF NOT EXISTS public.dress_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_dress_colors_name ON public.dress_colors(name);
CREATE INDEX IF NOT EXISTS idx_dress_sizes_display_order ON public.dress_sizes(display_order);
CREATE INDEX IF NOT EXISTS idx_dress_categories_name ON public.dress_categories(name);

-- Habilitar RLS
ALTER TABLE public.dress_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_categories ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Allow public to view colors" ON public.dress_colors FOR SELECT USING (true);
CREATE POLICY "Allow public to view sizes" ON public.dress_sizes FOR SELECT USING (true);
CREATE POLICY "Allow public to view categories" ON public.dress_categories FOR SELECT USING (true);

-- Insertar datos iniciales de colores
INSERT INTO public.dress_colors (name, hex_code, display_name) VALUES
('Rojo', '#DC2626', 'Rojo'),
('Verde', '#16A34A', 'Verde'),
('Azul', '#1E40AF', 'Azul'),
('Blanco', '#FFFFFF', 'Blanco'),
('Negro', '#000000', 'Negro'),
('Naranja', '#EA580C', 'Naranja'),
('Morado', '#7C3AED', 'Morado'),
('Rosa', '#EC4899', 'Rosa'),
('Amarillo', '#FBBF24', 'Amarillo'),
('Vino', '#722F37', 'Vino'),
('Dorado', '#D4AF37', 'Dorado'),
('Plataedo', '#A8A9AD', 'Plataedo'),
('Multicolor', '#FF0000', 'Multicolor')
ON CONFLICT (name) DO NOTHING;

-- Insertar datos iniciales de tallas
INSERT INTO public.dress_sizes (name, display_order) VALUES
('XS', 1),
('S', 2),
('M', 3),
('L', 4),
('XL', 5),
('XXL', 6)
ON CONFLICT (name) DO NOTHING;

-- Insertar datos iniciales de categorías
INSERT INTO public.dress_categories (name, display_name) VALUES
('Cóctel', 'Cóctel'),
('Gala', 'Gala'),
('Formal', 'Formal'),
('Fiesta', 'Fiesta'),
('Boda', 'Boda'),
('Graduación', 'Graduación'),
('Noche', 'Noche'),
('Coctel', 'Cóctel')
ON CONFLICT (name) DO NOTHING;
