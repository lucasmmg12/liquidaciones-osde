/*
  # Create Nomenclador Tables

  ## Summary
  Creates the database schema for the Nomenclador module, including the main nomenclator table 
  and a version history table to track all value changes over time.

  ## New Tables
  
  ### `nomenclador_instrumentadores`
  Main table storing current nomenclator codes and procedures:
  - `id` (uuid, primary key) - Unique identifier
  - `codigo` (text, unique, indexed) - Procedure code (normalized: UPPER/TRIM)
  - `procedimiento` (text) - Procedure description
  - `complejidad` (text, nullable) - Complexity level
  - `valor` (numeric) - Current monetary value
  - `activo` (boolean, default true) - Active status flag
  - `updated_at` (timestamptz) - Last modification timestamp

  ### `nomenclador_versiones`
  History table tracking all value changes:
  - `id` (uuid, primary key) - Unique identifier
  - `codigo` (text, indexed) - Related procedure code
  - `valor_anterior` (numeric) - Previous value
  - `valor_nuevo` (numeric) - New value
  - `usuario` (text, default 'admin') - User who made the change
  - `motivo` (text, nullable) - Reason for the change
  - `changed_at` (timestamptz, default now()) - Timestamp of change

  ## Security
  - Enable RLS on both tables
  - Allow public read access for nomenclador_instrumentadores
  - Allow public write access for nomenclador_instrumentadores (no auth required)
  - Allow public read/write access for nomenclador_versiones

  ## Indexes
  - Unique index on codigo (UPPER trimmed) in nomenclador_instrumentadores
  - Index on codigo in nomenclador_versiones for history lookups

  ## Notes
  - The system does not require authentication
  - All operations are logged in the version history
  - Initial seed data will be added separately
*/

-- Create nomenclador_instrumentadores table
CREATE TABLE IF NOT EXISTS nomenclador_instrumentadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  procedimiento text NOT NULL,
  complejidad text,
  valor numeric NOT NULL,
  activo boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Create unique index on codigo (normalized)
CREATE UNIQUE INDEX IF NOT EXISTS nomenclador_codigo_idx 
  ON nomenclador_instrumentadores (UPPER(TRIM(codigo)));

-- Create nomenclador_versiones table
CREATE TABLE IF NOT EXISTS nomenclador_versiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  valor_anterior numeric NOT NULL,
  valor_nuevo numeric NOT NULL,
  usuario text DEFAULT 'admin',
  motivo text,
  changed_at timestamptz DEFAULT now()
);

-- Create index on codigo for history lookups
CREATE INDEX IF NOT EXISTS nomenclador_versiones_codigo_idx 
  ON nomenclador_versiones (codigo);

-- Enable RLS
ALTER TABLE nomenclador_instrumentadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomenclador_versiones ENABLE ROW LEVEL SECURITY;

-- Policies for nomenclador_instrumentadores (public access, no auth required)
CREATE POLICY "Allow public read access to nomenclador"
  ON nomenclador_instrumentadores
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to nomenclador"
  ON nomenclador_instrumentadores
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to nomenclador"
  ON nomenclador_instrumentadores
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from nomenclador"
  ON nomenclador_instrumentadores
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for nomenclador_versiones (public access, no auth required)
CREATE POLICY "Allow public read access to version history"
  ON nomenclador_versiones
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to version history"
  ON nomenclador_versiones
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Insert seed data
INSERT INTO nomenclador_instrumentadores (codigo, procedimiento, complejidad, valor, activo)
VALUES 
  ('A', 'Colecistectomía', 'Laparoscópica', 30000, true),
  ('B', 'Colangiografía', NULL, 18000, true),
  ('C', 'Nefrectomía', 'Laparoscópica', 40000, true)
ON CONFLICT (UPPER(TRIM(codigo))) DO NOTHING;