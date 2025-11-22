-- Tabla para configuración de números de liquidación por mes/año
CREATE TABLE IF NOT EXISTS liquidaciones_config (
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  anio INTEGER NOT NULL CHECK (anio >= 2024),
  numero_liquidacion INTEGER NOT NULL,
  obra_social VARCHAR(50) DEFAULT 'OSDE' NOT NULL,
  modulo VARCHAR(50) DEFAULT 'instrumentadores' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (mes, anio, obra_social, modulo)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_liquidaciones_config_lookup 
ON liquidaciones_config(mes, anio, obra_social, modulo);

-- Insertar valor inicial de referencia (Agosto 2025 = 401)
INSERT INTO liquidaciones_config (mes, anio, numero_liquidacion, obra_social, modulo)
VALUES (8, 2025, 401, 'OSDE', 'instrumentadores')
ON CONFLICT (mes, anio, obra_social, modulo) DO NOTHING;

-- Comentario para documentación
COMMENT ON TABLE liquidaciones_config IS 
'Almacena el número de liquidación para cada período (mes/año). 
Agosto 2025 = 401, Septiembre 2025 = 402, etc.';

