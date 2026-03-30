export interface DataPoint {
  fecha: string; // "YYYY-MM"
  valor: number | null;
}

export interface Serie {
  nombre: string;
  datos: DataPoint[];
}

/**
 * Calcula variación mensual porcentual entre puntos consecutivos.
 */
export function calcVariacionMensual(serie: DataPoint[]): DataPoint[] {
  return serie.map((punto, i) => {
    if (i === 0 || punto.valor === null) return { fecha: punto.fecha, valor: null };
    const anterior = serie[i - 1];
    if (!anterior.valor) return { fecha: punto.fecha, valor: null };
    const variacion = ((punto.valor - anterior.valor) / anterior.valor) * 100;
    return { fecha: punto.fecha, valor: Math.round(variacion * 100) / 100 };
  });
}

/**
 * Calcula variación interanual porcentual (vs mismo mes del año anterior).
 */
export function calcVariacionInteranual(serie: DataPoint[]): DataPoint[] {
  return serie.map((punto, i) => {
    if (i < 12 || punto.valor === null) return { fecha: punto.fecha, valor: null };
    const hace12 = serie[i - 12];
    if (!hace12.valor) return { fecha: punto.fecha, valor: null };
    const variacion = ((punto.valor - hace12.valor) / hace12.valor) * 100;
    return { fecha: punto.fecha, valor: Math.round(variacion * 100) / 100 };
  });
}

/**
 * Rebasea una serie a 100 en la fecha especificada (formato "YYYY-MM").
 */
export function rebaseASerie(serie: DataPoint[], fechaBase: string): DataPoint[] {
  const puntoBase = serie.find((p) => p.fecha === fechaBase);
  if (!puntoBase || !puntoBase.valor) return serie;
  const base = puntoBase.valor;
  return serie.map((p) => ({
    fecha: p.fecha,
    valor: p.valor !== null ? Math.round((p.valor / base) * 10000) / 100 : null,
  }));
}

/**
 * Calcula variación relativa entre dos valores.
 */
export function calcVariacionRelativa(valorInicial: number, valorFinal: number): number {
  if (!valorInicial) return 0;
  return Math.round(((valorFinal - valorInicial) / valorInicial) * 10000) / 100;
}

/**
 * Filtra una serie por rango de fechas.
 */
export function filterByDateRange(
  datos: DataPoint[],
  fechaInicio: string,
  fechaFin: string
): DataPoint[] {
  return datos.filter((p) => p.fecha >= fechaInicio && p.fecha <= fechaFin);
}

/**
 * Obtiene el valor de la serie para un mes específico.
 */
export function getValorEnFecha(serie: DataPoint[], fecha: string): number | null {
  return serie.find((p) => p.fecha === fecha)?.valor ?? null;
}

/**
 * Retorna el último punto con valor no nulo.
 */
export function getUltimoValor(serie: DataPoint[]): DataPoint | null {
  for (let i = serie.length - 1; i >= 0; i--) {
    if (serie[i].valor !== null) return serie[i];
  }
  return null;
}

/**
 * Retorna el máximo histórico de la serie.
 */
export function getMaximoHistorico(serie: DataPoint[]): DataPoint | null {
  let max: DataPoint | null = null;
  for (const p of serie) {
    if (p.valor !== null && (max === null || p.valor > (max.valor ?? -Infinity))) {
      max = p;
    }
  }
  return max;
}

/**
 * Genera labels de meses en formato "MMM YY" desde la fecha inicial.
 */
export function formatearFecha(fecha: string): string {
  const [year, month] = fecha.split('-').map(Number);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[month - 1]} ${String(year).slice(2)}`;
}

/**
 * Convierte datos de cuadro2 a variación relativa entre dos fechas para cada sector.
 */
export function calcVariacionRelativaPorSector(
  sectores: Record<string, DataPoint[]>,
  fechaInicio: string,
  fechaFin: string
): Array<{ sector: string; variacion: number }> {
  return Object.entries(sectores)
    .map(([nombre, datos]) => {
      const inicio = getValorEnFecha(datos, fechaInicio);
      const fin = getValorEnFecha(datos, fechaFin);
      if (inicio === null || fin === null || inicio === 0) return null;
      return { sector: nombre, variacion: calcVariacionRelativa(inicio, fin) };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.variacion ?? 0) - (a!.variacion ?? 0)) as Array<{
    sector: string;
    variacion: number;
  }>;
}
