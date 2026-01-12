-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Ensure RLS is correctly set up for the tables
ALTER TABLE nomenclador_instrumentadores FORCE ROW LEVEL SECURITY;
ALTER TABLE nomenclador_versiones FORCE ROW LEVEL SECURITY;
ALTER TABLE procedimientos FORCE ROW LEVEL SECURITY;
ALTER TABLE valores_nomenclador FORCE ROW LEVEL SECURITY;
ALTER TABLE liquidaciones FORCE ROW LEVEL SECURITY;
ALTER TABLE faltantes_liquidacion FORCE ROW LEVEL SECURITY;
