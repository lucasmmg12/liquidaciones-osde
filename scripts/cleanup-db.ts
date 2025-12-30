import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no configurados');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupProcedimientos() {
    console.log('🚀 Iniciando limpieza de procedimientos...');

    // 1. Obtener todos los procedimientos
    const { data, error } = await supabase
        .from('procedimientos')
        .select('id, codigo, procedimiento');

    if (error) {
        console.error('❌ Error cargando procedimientos:', error.message);
        return;
    }

    console.log(`📊 Se encontraron ${data?.length} procedimientos.`);

    if (!data || data.length === 0) return;

    // 2. Actualizar cada uno (forzar activo=true y recortar espacios)
    let actualizados = 0;
    let errores = 0;

    for (const p of data) {
        const { error: updateError } = await supabase
            .from('procedimientos')
            .update({
                codigo: String(p.codigo).trim().toUpperCase(),
                activo: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', p.id);

        if (updateError) {
            console.error(`❌ Error actualizando ${p.codigo}:`, updateError.message);
            errores++;
        } else {
            actualizados++;
            if (actualizados % 50 === 0) {
                console.log(`✅ ${actualizados} procesados...`);
            }
        }
    }

    console.log('=================================');
    console.log(`✨ Limpieza completada:`);
    console.log(`✅ Actualizados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log('=================================');
}

cleanupProcedimientos();
