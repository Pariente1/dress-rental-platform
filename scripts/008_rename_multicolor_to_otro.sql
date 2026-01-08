-- Rename 'Multicolor' to 'Otro' in dress_colors table
UPDATE dress_colors 
SET name = 'Otro', 
    display_name = 'Otro',
    hex_code = 'conic-gradient'
WHERE LOWER(name) = 'multicolor' OR LOWER(name) = 'estampado';

-- Insert 'Otro' if it doesn't exist
INSERT INTO dress_colors (name, hex_code, display_name)
SELECT 'Otro', 'conic-gradient', 'Otro'
WHERE NOT EXISTS (
  SELECT 1 FROM dress_colors WHERE LOWER(name) = 'otro'
);

-- Update any dresses that have 'Multicolor' or 'Estampado' color to 'Otro'
UPDATE dresses 
SET color = 'Otro'
WHERE LOWER(color) = 'multicolor' OR LOWER(color) = 'estampado';
