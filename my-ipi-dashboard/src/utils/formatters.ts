/**
 * Formatea un número como índice con 1 decimal.
 */
export function formatIndice(valor: number | null): string {
  if (valor === null || isNaN(valor)) return '—';
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/**
 * Formatea variación porcentual con signo.
 */
export function formatVariacion(valor: number | null): string {
  if (valor === null || isNaN(valor)) return '—';
  const signo = valor > 0 ? '+' : '';
  return `${signo}${valor.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/**
 * Formatea fecha "YYYY-MM" a "Mes YYYY" en español.
 */
export function formatFechaLarga(fecha: string): string {
  const [year, month] = fecha.split('-').map(Number);
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return `${meses[month - 1]} ${year}`;
}

/**
 * Formatea fecha "YYYY-MM" a "MMM YY" abreviada.
 */
export function formatFechaCorta(fecha: string): string {
  const [year, month] = fecha.split('-').map(Number);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[month - 1]} ${String(year).slice(2)}`;
}

/**
 * Convierte "YYYY-MM" a objeto Date en UTC.
 */
export function parseFecha(fecha: string): Date {
  const [year, month] = fecha.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

/**
 * Obtiene fecha en formato "YYYY-MM" desde Date.
 */
export function toFechaStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Color del valor según positivo/negativo.
 */
export function colorVariacion(valor: number | null): string {
  if (valor === null) return '#9ca3af';
  if (valor > 0) return '#22c55e';
  if (valor < 0) return '#ef4444';
  return '#9ca3af';
}
