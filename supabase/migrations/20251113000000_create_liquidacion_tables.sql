/*
  # Create Liquidación Tables - Nuevo Modelo

  ## Summary
  Crea el esquema de base de datos para el nuevo modelo de liquidación:
  - Procedimientos (código → complejidad)
  - Valores (complejidad + mes + año + obra social + módulo → valor)
  - Liquidaciones (tracking de corridas)
  - Faltantes de liquidación

  ## New Tables
  
  ### `procedimientos`
  Tabla de procedimientos: código → complejidad
  - `id` (uuid, primary key)
  - `codigo` (text, unique, indexed) - Código del procedimiento
  - `procedimiento` (text) - Descripción del procedimiento
  - `complejidad` (text, nullable) - Nivel de complejidad
  - `activo` (boolean, default true)
  - `created_at`, `updated_at` (timestamptz)

  ### `valores_nomenclador`
  Tabla de valores: complejidad + mes + año + obra_social + módulo → valor
  - `id` (uuid, primary key)
  - `complejidad` (text, NOT NULL)
  - `mes` (integer, 1-12)
  - `anio` (integer)
  - `obra_social` (text, default 'OSDE')
  - `modulo` (text, default 'instrumentadores')
  - `valor` (numeric, NOT NULL)
  - `created_at`, `updated_at` (timestamptz)
  - UNIQUE(complejidad, mes, anio, obra_social, modulo)

  ### `liquidaciones`
  Tabla de tracking de corridas de liquidación
  - `id` (uuid, primary key)
  - `mes` (integer)
  - `anio` (integer)
  - `obra_social` (text, default 'OSDE')
  - `modulo` (text, default 'instrumentadores')
  - `total_procedimientos` (integer)
  - `total_liquidado` (numeric)
  - `codigos_faltantes` (integer)
  - `created_at` (timestamptz)
  - `created_by` (text, default 'admin')

  ### `faltantes_liquidacion`
  Tabla de faltantes por corrida
  - `id` (uuid, primary key)
  - `liquidacion_id` (uuid, FK a liquidaciones)
  - `codigo` (text)
  - `procedimiento` (text, nullable)
  - `ocurrencias` (integer, default 1)
  - `resuelto` (boolean, default false)
  - `complejidad_asignada` (text, nullable)
  - `created_at` (timestamptz)
*/

-- Create procedimientos table
CREATE TABLE IF NOT EXISTS procedimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  procedimiento text NOT NULL,
  complejidad text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index on codigo (normalized)
CREATE UNIQUE INDEX IF NOT EXISTS procedimientos_codigo_idx 
  ON procedimientos (UPPER(TRIM(codigo)));

-- Create valores_nomenclador table
CREATE TABLE IF NOT EXISTS valores_nomenclador (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complejidad text NOT NULL,
  mes integer NOT NULL CHECK (mes >= 1 AND mes <= 12),
  anio integer NOT NULL,
  obra_social text NOT NULL DEFAULT 'OSDE',
  modulo text NOT NULL DEFAULT 'instrumentadores',
  valor numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(complejidad, mes, anio, obra_social, modulo)
);

-- Create index on valores_nomenclador for lookups
CREATE INDEX IF NOT EXISTS valores_nomenclador_lookup_idx 
  ON valores_nomenclador (complejidad, mes, anio, obra_social, modulo);

-- Create liquidaciones table
CREATE TABLE IF NOT EXISTS liquidaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes integer NOT NULL CHECK (mes >= 1 AND mes <= 12),
  anio integer NOT NULL,
  obra_social text NOT NULL DEFAULT 'OSDE',
  modulo text NOT NULL DEFAULT 'instrumentadores',
  total_procedimientos integer DEFAULT 0,
  total_liquidado numeric DEFAULT 0,
  codigos_faltantes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'admin'
);

-- Create index on liquidaciones
CREATE INDEX IF NOT EXISTS liquidaciones_periodo_idx 
  ON liquidaciones (mes, anio, obra_social, modulo);

-- Create faltantes_liquidacion table
CREATE TABLE IF NOT EXISTS faltantes_liquidacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  liquidacion_id uuid REFERENCES liquidaciones(id) ON DELETE CASCADE,
  codigo text NOT NULL,
  procedimiento text,
  ocurrencias integer DEFAULT 1,
  resuelto boolean DEFAULT false,
  complejidad_asignada text,
  created_at timestamptz DEFAULT now()
);

-- Create index on faltantes_liquidacion
CREATE INDEX IF NOT EXISTS faltantes_liquidacion_id_idx 
  ON faltantes_liquidacion (liquidacion_id);

-- Enable RLS
ALTER TABLE procedimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE valores_nomenclador ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE faltantes_liquidacion ENABLE ROW LEVEL SECURITY;

-- Policies for procedimientos (public access)
CREATE POLICY "Allow public read access to procedimientos"
  ON procedimientos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to procedimientos"
  ON procedimientos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to procedimientos"
  ON procedimientos
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from procedimientos"
  ON procedimientos
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for valores_nomenclador (public access)
CREATE POLICY "Allow public read access to valores_nomenclador"
  ON valores_nomenclador
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to valores_nomenclador"
  ON valores_nomenclador
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to valores_nomenclador"
  ON valores_nomenclador
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from valores_nomenclador"
  ON valores_nomenclador
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for liquidaciones (public access)
CREATE POLICY "Allow public read access to liquidaciones"
  ON liquidaciones
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to liquidaciones"
  ON liquidaciones
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to liquidaciones"
  ON liquidaciones
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for faltantes_liquidacion (public access)
CREATE POLICY "Allow public read access to faltantes_liquidacion"
  ON faltantes_liquidacion
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to faltantes_liquidacion"
  ON faltantes_liquidacion
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to faltantes_liquidacion"
  ON faltantes_liquidacion
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Migrate data from old nomenclador_instrumentadores to new structure
-- Insert procedimientos
INSERT INTO procedimientos (codigo, procedimiento, complejidad, activo)
SELECT codigo, procedimiento, complejidad, activo
FROM nomenclador_instrumentadores
ON CONFLICT (UPPER(TRIM(codigo))) DO NOTHING;

-- Insert valores_nomenclador (usando mes/año actual como default)
-- Nota: Esto es una migración básica, los valores deberán ajustarse manualmente
INSERT INTO valores_nomenclador (complejidad, mes, anio, obra_social, modulo, valor)
SELECT 
  COALESCE(complejidad, 'SIN_COMPLEJIDAD'),
  EXTRACT(MONTH FROM CURRENT_DATE)::integer,
  EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  'OSDE',
  'instrumentadores',
  valor
FROM nomenclador_instrumentadores
WHERE activo = true
ON CONFLICT (complejidad, mes, anio, obra_social, modulo) DO NOTHING;

