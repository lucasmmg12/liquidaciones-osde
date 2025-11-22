import { DetalleRow, ResumenRow, FaltanteRow, TotalesData } from './types';

export function getMockDetalle(): DetalleRow[] {
  return [
    {
      fecha: '15/11/2025',
      paciente: 'García, Juan',
      codigo: 'A',
      procedimiento: 'Colecistectomía',
      cirujano: 'Dr. Pérez',
      instrumentador: 'López, María',
      complejidad: 'Laparoscópica',
      valor: 30000,
      factor: 1.0,
      importe: 30000,
    },
    {
      fecha: '15/11/2025',
      paciente: 'García, Juan',
      codigo: 'B',
      procedimiento: 'Colangiografía',
      cirujano: 'Dr. Pérez',
      instrumentador: 'López, María',
      complejidad: '',
      valor: 18000,
      factor: 0.5,
      importe: 9000,
    },
    {
      fecha: '16/11/2025',
      paciente: 'Martínez, Ana',
      codigo: 'C',
      procedimiento: 'Nefrectomía',
      cirujano: 'Dra. Gómez',
      instrumentador: 'Fernández, Carlos',
      complejidad: 'Laparoscópica',
      valor: 40000,
      factor: 1.0,
      importe: 40000,
    },
    {
      fecha: '17/11/2025',
      paciente: 'Rodríguez, Luis',
      codigo: 'A',
      procedimiento: 'Colecistectomía',
      cirujano: 'Dr. Silva',
      instrumentador: 'López, María',
      complejidad: 'Laparoscópica',
      valor: 30000,
      factor: 1.0,
      importe: 30000,
    },
    {
      fecha: '18/11/2025',
      paciente: 'Sánchez, Pedro',
      codigo: 'B',
      procedimiento: 'Colangiografía',
      cirujano: 'Dr. Pérez',
      instrumentador: 'Ramírez, José',
      complejidad: '',
      valor: 18000,
      factor: 1.0,
      importe: 18000,
    },
    {
      fecha: '18/11/2025',
      paciente: 'Sánchez, Pedro',
      codigo: 'A',
      procedimiento: 'Colecistectomía',
      cirujano: 'Dr. Pérez',
      instrumentador: 'Ramírez, José',
      complejidad: 'Laparoscópica',
      valor: 30000,
      factor: 0.5,
      importe: 15000,
    },
    {
      fecha: '19/11/2025',
      paciente: 'González, María',
      codigo: 'C',
      procedimiento: 'Nefrectomía',
      cirujano: 'Dra. Gómez',
      instrumentador: 'Fernández, Carlos',
      complejidad: 'Laparoscópica',
      valor: 40000,
      factor: 1.0,
      importe: 40000,
    },
    {
      fecha: '20/11/2025',
      paciente: 'López, Carlos',
      codigo: 'A',
      procedimiento: 'Colecistectomía',
      cirujano: 'Dr. Silva',
      instrumentador: 'López, María',
      complejidad: 'Laparoscópica',
      valor: 30000,
      factor: 1.0,
      importe: 30000,
    },
  ];
}

export function getMockResumen(): ResumenRow[] {
  return [
    {
      instrumentador: 'López, María',
      cantidad: 4,
      total: 84000,
    },
    {
      instrumentador: 'Fernández, Carlos',
      cantidad: 2,
      total: 80000,
    },
    {
      instrumentador: 'Ramírez, José',
      cantidad: 2,
      total: 33000,
    },
  ];
}

export function getMockFaltantes(): FaltanteRow[] {
  return [
    {
      codigo: 'D123',
      procedimiento: 'Apendicectomía laparoscópica',
      ocurrencias: 3,
    },
    {
      codigo: 'E456',
      procedimiento: 'Hernioplastia inguinal',
      ocurrencias: 2,
    },
  ];
}

export function getMockTotales(): TotalesData {
  return {
    procedimientos: 8,
    liquidado: 212000,
    faltantes: 2,
  };
}
