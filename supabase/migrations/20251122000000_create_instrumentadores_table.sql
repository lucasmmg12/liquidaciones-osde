/*
  # Create Instrumentadores Table
  
  ## Summary
  Crea la tabla para gestionar la base de datos de instrumentadores con sus datos personales.
  
  ## New Tables
  
  ### `instrumentadores`
  Tabla de instrumentadores (personas)
  - `id` (uuid, primary key)
  - `nombre` (text, NOT NULL) - Nombre completo del instrumentador
  - `matricula_provincial` (text) - Matrícula provincial
  - `cuit` (text) - CUIT del instrumentador
  - `especialidad` (text) - Especialidad del instrumentador
  - `grupo_personal` (text) - Grupo de personal
  - `perfil` (text) - Perfil del instrumentador
  - `activo` (boolean, default true) - Si el instrumentador está activo
  - `created_at`, `updated_at` (timestamptz)
*/

-- Create instrumentadores table
CREATE TABLE IF NOT EXISTS instrumentadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  matricula_provincial text,
  cuit text,
  especialidad text,
  grupo_personal text,
  perfil text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index on nombre (para evitar duplicados exactos)
CREATE UNIQUE INDEX IF NOT EXISTS instrumentadores_nombre_idx 
  ON instrumentadores (UPPER(TRIM(nombre)));

-- Create index on activo for filtering
CREATE INDEX IF NOT EXISTS instrumentadores_activo_idx 
  ON instrumentadores (activo);

-- Enable RLS
ALTER TABLE instrumentadores ENABLE ROW LEVEL SECURITY;

-- Policies for instrumentadores (public access)
CREATE POLICY "Allow public read access to instrumentadores"
  ON instrumentadores
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to instrumentadores"
  ON instrumentadores
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to instrumentadores"
  ON instrumentadores
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from instrumentadores"
  ON instrumentadores
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_instrumentadores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER instrumentadores_updated_at_trigger
  BEFORE UPDATE ON instrumentadores
  FOR EACH ROW
  EXECUTE FUNCTION update_instrumentadores_updated_at();

