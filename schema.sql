-- PASCAL TI - DRESS RENTAL PLATFORM SCHEMA
-- Version: 1.0 (English Architecture)
-- Usage: Copy this entire script and run it in the Supabase SQL Editor.

-- ==========================================
-- 1. TABLES & STRUCTURE (DDL)
-- ==========================================

-- TABLE: dress_categories
CREATE TABLE public.dress_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL, -- e.g., 'gala'
  display_name text, -- e.g., 'Gala / Night'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX ON public.dress_categories (name);

-- TABLE: dress_sizes
CREATE TABLE public.dress_sizes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX ON public.dress_sizes (name);

-- TABLE: dress_colors
CREATE TABLE public.dress_colors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  hex_code text NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX ON public.dress_colors (name);

-- TABLE: dresses
CREATE TABLE public.dresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL, -- References dress_categories(name) logically
  color text NOT NULL,    -- References dress_colors(name) logically
  size text NOT NULL,     -- References dress_sizes(name) logically
  price_per_day numeric NOT NULL,
  image_url text NOT NULL,
  additional_images text[] DEFAULT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE: reservations
CREATE TABLE public.reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dress_id uuid NOT NULL REFERENCES public.dresses(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  rental_start_date date NOT NULL,
  rental_end_date date NOT NULL,
  status text DEFAULT 'pending'::text, -- 'pending', 'confirmed', 'cancelled'
  total_price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE: blocked_dates (For maintenance or external bookings)
CREATE TABLE public.blocked_dates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dress_id uuid NOT NULL REFERENCES public.dresses(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 2. SECURITY POLICIES (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.dress_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dress_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- 2.1 PUBLIC READ ACCESS (Allow everyone to see the catalog)
CREATE POLICY "Public Read Categories" ON public.dress_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Sizes" ON public.dress_sizes FOR SELECT USING (true);
CREATE POLICY "Public Read Colors" ON public.dress_colors FOR SELECT USING (true);
CREATE POLICY "Public Read Dresses" ON public.dresses FOR SELECT USING (true);
CREATE POLICY "Public Read Reservations" ON public.reservations FOR SELECT USING (true); -- Needed for availability check
CREATE POLICY "Public Read BlockedDates" ON public.blocked_dates FOR SELECT USING (true);

-- 2.2 ADMIN/AUTH WRITE ACCESS (Only logged in users can modify)
-- Note: Assuming generic authenticated access for simplicity. 
-- For stricter control, check for admin role in profiles.

CREATE POLICY "Auth Insert Reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (true);
-- Add other write policies as needed (Update/Delete for Admins only)

-- ==========================================
-- 2.3 ADMIN MANAGEMENT POLICIES (Enable Inline Edit)
-- ==========================================

-- Permitir a usuarios logueados (Admins) EDITAR, CREAR y BORRAR Vestidos
CREATE POLICY "Admin Manage Dresses" ON public.dresses
  FOR ALL -- Abarca INSERT, UPDATE, DELETE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir lo mismo para Categorías, Tallas y Colores (Por si quieres editar catálogos)
CREATE POLICY "Admin Manage Categories" ON public.dress_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Manage Sizes" ON public.dress_sizes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Manage Colors" ON public.dress_colors
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 3. SEED DATA (Initial Content)
-- ==========================================

-- Insert Sizes
INSERT INTO public.dress_sizes (name, display_order) VALUES 
('XS', 1), ('S', 2), ('M', 3), ('L', 4), ('XL', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert Categories
INSERT INTO public.dress_categories (name, display_name) VALUES 
('gala', 'Gala / Evening'),
('cocktail', 'Cocktail'),
('casual', 'Casual / Day'),
('wedding', 'Wedding Guest')
ON CONFLICT (name) DO NOTHING;

-- Insert Colors
INSERT INTO public.dress_colors (name, hex_code, display_name) VALUES 
('black', '#000000', 'Black'),
('red', '#EF4444', 'Red'),
('blue', '#3B82F6', 'Royal Blue'),
('gold', '#EAB308', 'Gold'),
('emerald', '#10B981', 'Emerald'),
('white', '#FFFFFF', 'White'),
('pink', '#EC4899', 'Pink'),
('other', '#cbd5e1', 'Pattern/Other')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- IMPORTANT MANUAL STEP:
-- SQL cannot create Storage Buckets. 
-- Please go to Storage > Create Bucket > named 'dresses' > Public: YES
-- ==========================================
