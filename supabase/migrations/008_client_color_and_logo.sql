-- Add color and logo_path columns to clients table
ALTER TABLE clients ADD COLUMN color TEXT DEFAULT '#3B82F6';
ALTER TABLE clients ADD COLUMN logo_path TEXT;
