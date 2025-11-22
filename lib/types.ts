export interface DetalleRow {
  fecha: string;
  hora?: string;
  paciente: string;
  codigo: string;
  procedimiento: string;
  cirujano: string;
  instrumentador: string;
  complejidad: string;
  valor: number;
  factor: number;
  plusHorario?: boolean; // true si se aplicó el plus del 20% por horario especial
  importe: number;
  obra_social?: string;
}

export interface ResumenRow {
  instrumentador: string;
  cantidad: number;
  total: number;
}

export interface FaltanteRow {
  codigo: string;
  procedimiento: string;
  ocurrencias: number;
}

export interface TotalesData {
  procedimientos: number;
  liquidado: number;
  faltantes: number;
}

export interface NomencladorRow {
  id: string;
  codigo: string;
  procedimiento: string;
  complejidad: string | null;
  valor: number;
  activo: boolean;
  updated_at: string;
}

export interface VersionHistoryRow {
  id: string;
  codigo: string;
  valor_anterior: number;
  valor_nuevo: number;
  usuario: string;
  motivo: string | null;
  changed_at: string;
}

// Nuevos tipos para el modelo de liquidación
export interface Procedimiento {
  id: string;
  codigo: string;
  procedimiento: string;
  complejidad: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValorNomenclador {
  id: string;
  complejidad: string;
  mes: number;
  anio: number;
  obra_social: string;
  modulo: string;
  valor: number;
  created_at: string;
  updated_at: string;
}

export interface Liquidacion {
  id: string;
  mes: number;
  anio: number;
  obra_social: string;
  modulo: string;
  total_procedimientos: number;
  total_liquidado: number;
  codigos_faltantes: number;
  created_at: string;
  created_by: string;
}

export interface FaltanteLiquidacion {
  id: string;
  liquidacion_id: string;
  codigo: string;
  procedimiento: string | null;
  ocurrencias: number;
  resuelto: boolean;
  complejidad_asignada: string | null;
  created_at: string;
}

// Tipo para filas procesadas del Excel crudo
export interface ProcessedRow {
  fecha: string;
  hora?: string;
  paciente: string;
  codigo: string;
  procedimiento: string;
  cirujano: string;
  instrumentador: string;
  orden_en_fila?: number; // 0 = primer procedimiento de la fila (100%), >0 = siguientes (50%)
  [key: string]: any; // Para otros campos que puedan venir del Excel
}

export interface Instrumentador {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  matricula_provincial: string | null;
  cuit: string | null;
  especialidad: string | null;
  grupo_personal: string | null;
  perfil: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
