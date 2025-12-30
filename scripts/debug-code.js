const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugCodigo() {
    const codigoDebug = '34.51';
    console.log(`🔍 Debugging code: "${codigoDebug}"`);

    // 1. Buscar en procedimientos
    const { data: proc, error: errProc } = await supabase
        .from('procedimientos')
        .select('*')
        .ilike('codigo', `%${codigoDebug}%`);

    if (errProc) {
        console.error('Error searching proc:', errProc.message);
    } else {
        console.log('Procedimientos encontrados:', JSON.stringify(proc, null, 2));
        if (proc.length > 0) {
            const complejidad = proc[0].complejidad;
            console.log(`\n🔍 Searching values for complexity: "${complejidad}" in Aug 2025`);

            const { data: val, error: errVal } = await supabase
                .from('valores_nomenclador')
                .select('*')
                .eq('complejidad', complejidad)
                .eq('mes', 8)
                .eq('anio', 2025);

            if (errVal) {
                console.error('Error searching values:', errVal.message);
            } else {
                console.log('Valores encontrados:', JSON.stringify(val, null, 2));
            }
        }
    }
}

debugCodigo();
