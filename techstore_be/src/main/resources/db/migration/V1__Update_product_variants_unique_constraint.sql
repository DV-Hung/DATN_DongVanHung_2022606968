-- Drop existing unique constraint that only has product_id and color
ALTER TABLE product_variants DROP INDEX UKcyrrw8lth5g0288ca3du1sq95;

-- Add new unique constraint that includes product_id, color, and rom
ALTER TABLE product_variants ADD CONSTRAINT UK_product_id_color_rom UNIQUE (product_id, color, rom);
