import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('=================================');
  console.log('Verificando conexión a Supabase');
  console.log('=================================');
  console.log('URL:', supabaseUrl);
  console.log('');

  const tables = [
    'nomenclador_instrumentadores',
    'nomenclador_versiones',
    'procedimientos',
    'valores_nomenclador',
    'liquidaciones',
    'faltantes_liquidacion'
  ];

  console.log('Verificando tablas...\n');

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${table}: NO EXISTE`);
      console.log(`   Error: ${error.message}`);
    } else {
      console.log(`✅ ${table}: OK (${data?.length || 0} registros encontrados)`);
    }
  }

  console.log('\n=================================');
  console.log('Verificación completada');
  console.log('=================================');
}

checkDatabase();
