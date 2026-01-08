-- Update colors with proper hex codes and ensure all standard colors exist
-- This script ensures the color palette is complete

-- First, update existing colors with correct hex codes
UPDATE dress_colors SET hex_code = '#DC2626', display_name = 'Rojo' WHERE name = 'Rojo';
UPDATE dress_colors SET hex_code = '#FACC15', display_name = 'Amarillo' WHERE name = 'Amarillo';
UPDATE dress_colors SET hex_code = '#1E40AF', display_name = 'Azul' WHERE name = 'Azul';
UPDATE dress_colors SET hex_code = '#FFFFFF', display_name = 'Blanco' WHERE name = 'Blanco';
UPDATE dress_colors SET hex_code = '#000000', display_name = 'Negro' WHERE name = 'Negro';
UPDATE dress_colors SET hex_code = '#F97316', display_name = 'Naranja' WHERE name = 'Naranja';
UPDATE dress_colors SET hex_code = '#16A34A', display_name = 'Verde' WHERE name = 'Verde';
UPDATE dress_colors SET hex_code = '#7C3AED', display_name = 'Morado' WHERE name = 'Morado';
UPDATE dress_colors SET hex_code = '#EC4899', display_name = 'Rosa' WHERE name = 'Rosa';
UPDATE dress_colors SET hex_code = '#B91C1C', display_name = 'Vino' WHERE name = 'Vino';
UPDATE dress_colors SET hex_code = '#D4AF37', display_name = 'Dorado' WHERE name = 'Dorado';
UPDATE dress_colors SET hex_code = '#9CA3AF', display_name = 'Plateado' WHERE name = 'Plateado';

-- Insert missing colors if they don't exist
INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Rojo', '#DC2626', 'Rojo'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Rojo');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Amarillo', '#FACC15', 'Amarillo'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Amarillo');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Azul', '#1E40AF', 'Azul'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Azul');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Blanco', '#FFFFFF', 'Blanco'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Blanco');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Negro', '#000000', 'Negro'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Negro');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Naranja', '#F97316', 'Naranja'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Naranja');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Verde', '#16A34A', 'Verde'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Verde');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Morado', '#7C3AED', 'Morado'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Morado');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Rosa', '#EC4899', 'Rosa'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Rosa');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Vino', '#B91C1C', 'Vino'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Vino');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Dorado', '#D4AF37', 'Dorado'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Dorado');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Plateado', '#9CA3AF', 'Plateado'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Plateado');

INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Multicolor', '#RAINBOW', 'Multicolor'
WHERE NOT EXISTS (SELECT 1 FROM dress_colors WHERE name = 'Multicolor');
