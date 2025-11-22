import { supabase } from './supabase';
import { Instrumentador } from './types';

/**
 * Servicio para gestionar instrumentadores
 */

/**
 * Obtener todos los instrumentadores
 */
export async function getAllInstrumentadores(incluirInactivos: boolean = false): Promise<Instrumentador[]> {
  let query = supabase
    .from('instrumentadores')
    .select('*')
    .order('nombre', { ascending: true });

  if (!incluirInactivos) {
    query = query.eq('activo', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching instrumentadores:', error);
    throw new Error('Error al obtener instrumentadores: ' + error.message);
  }

  return data || [];
}

/**
 * Obtener un instrumentador por ID
 */
export async function getInstrumentadorById(id: string): Promise<Instrumentador | null> {
  const { data, error } = await supabase
    .from('instrumentadores')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching instrumentador:', error);
    return null;
  }

  return data;
}

/**
 * Crear un nuevo instrumentador
 */
export async function createInstrumentador(
  instrumentador: Omit<Instrumentador, 'id' | 'created_at' | 'updated_at'>
): Promise<Instrumentador> {
  const { data, error } = await supabase
    .from('instrumentadores')
    .insert([{
      nombre: instrumentador.nombre,
      matricula_provincial: instrumentador.matricula_provincial || null,
      cuit: instrumentador.cuit || null,
      especialidad: instrumentador.especialidad || null,
      grupo_personal: instrumentador.grupo_personal || null,
      perfil: instrumentador.perfil || null,
      activo: instrumentador.activo
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating instrumentador:', error);
    throw new Error('Error al crear instrumentador: ' + error.message);
  }

  return data;
}

/**
 * Actualizar un instrumentador existente
 */
export async function updateInstrumentador(
  id: string,
  updates: Partial<Omit<Instrumentador, 'id' | 'created_at' | 'updated_at'>>
): Promise<Instrumentador> {
  const { data, error } = await supabase
    .from('instrumentadores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating instrumentador:', error);
    throw new Error('Error al actualizar instrumentador: ' + error.message);
  }

  return data;
}

/**
 * Eliminar un instrumentador (borrado lógico)
 */
export async function deleteInstrumentador(id: string): Promise<void> {
  const { error } = await supabase
    .from('instrumentadores')
    .update({ activo: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting instrumentador:', error);
    throw new Error('Error al eliminar instrumentador: ' + error.message);
  }
}

/**
 * Eliminar un instrumentador permanentemente
 */
export async function deleteInstrumentadorPermanente(id: string): Promise<void> {
  const { error } = await supabase
    .from('instrumentadores')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting instrumentador permanently:', error);
    throw new Error('Error al eliminar instrumentador permanentemente: ' + error.message);
  }
}

/**
 * Importar múltiples instrumentadores desde un array
 */
export async function importInstrumentadores(
  instrumentadores: Omit<Instrumentador, 'id' | 'created_at' | 'updated_at'>[]
): Promise<{ success: number; errors: string[] }> {
  const results = {
    success: 0,
    errors: [] as string[]
  };

  for (const instrumentador of instrumentadores) {
    try {
      // Verificar si ya existe un instrumentador con el mismo nombre
      const { data: existing } = await supabase
        .from('instrumentadores')
        .select('id')
        .eq('nombre', instrumentador.nombre.trim())
        .maybeSingle();

      if (existing) {
        // Actualizar el existente
        await updateInstrumentador(existing.id, instrumentador);
        results.success++;
      } else {
        // Crear nuevo
        await createInstrumentador(instrumentador);
        results.success++;
      }
    } catch (error) {
      console.error(`Error importing instrumentador ${instrumentador.nombre}:`, error);
      results.errors.push(
        `${instrumentador.nombre}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  return results;
}

/**
 * Buscar instrumentadores por nombre
 */
export async function searchInstrumentadores(query: string): Promise<Instrumentador[]> {
  const { data, error } = await supabase
    .from('instrumentadores')
    .select('*')
    .ilike('nombre', `%${query}%`)
    .eq('activo', true)
    .order('nombre', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Error searching instrumentadores:', error);
    throw new Error('Error al buscar instrumentadores: ' + error.message);
  }

  return data || [];
}

/**
 * Obtener la matrícula de un instrumentador por nombre
 */
export async function getMatriculaByNombre(nombre: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('instrumentadores')
    .select('matricula_provincial')
    .ilike('nombre', nombre)
    .eq('activo', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching matricula:', error);
    return null;
  }

  return data?.matricula_provincial || null;
}

