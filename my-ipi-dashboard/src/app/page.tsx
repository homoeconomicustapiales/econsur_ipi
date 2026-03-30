'use client';

import { TrendingUp, TrendingDown, Minus, BarChart2, Activity } from 'lucide-react';
import IpiSeriesAreaChart from '@/components/IpiSeriesAreaChart';
import IpiSectoresAreaChart from '@/components/IpiSectoresAreaChart';
import IpiVariacionesBarChart from '@/components/IpiVariacionesBarChart';
import IpiEvolucionSectoralChart from '@/components/IpiEvolucionSectoralChart';
import IpiVariacionRelativaHorizontalChart from '@/components/IpiVariacionRelativaHorizontalChart';
import {
  getUltimoValor,
  getMaximoHistorico,
  calcVariacionInteranual,
  calcVariacionMensual,
} from '@/utils/calculations';
import { formatIndice, formatVariacion, formatFechaLarga, colorVariacion } from '@/utils/formatters';
import { Title, Text } from '@tremor/react';
import type { IpiCuadro1, IpiCuadro2 } from '@/types/ipi';
import ipiCuadro1Raw from '../../data/processed/ipi_cuadro1.json';
import ipiCuadro2Raw from '../../data/processed/ipi_cuadro2.json';

interface KpiCardProps {
  titulo: string;
  valor: string;
  subtitulo: string;
  variacion?: number | null;
  icono: React.ReactNode;
}

function KpiCard({ titulo, valor, subtitulo, variacion, icono }: KpiCardProps) {
  const color = colorVariacion(variacion ?? null);
  const TrendIcon =
    variacion == null ? null : variacion > 0 ? TrendingUp : variacion < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:border-blue-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {titulo}
        </span>
        <span className="text-slate-300">{icono}</span>
      </div>
      <div className="text-2xl font-bold text-slate-800 leading-none font-mono">{valor}</div>
      {variacion != null && (
        <div className="flex items-center gap-1">
          {TrendIcon && <TrendIcon size={13} color={color} />}
          <span className="text-xs font-bold" style={{ color }}>{formatVariacion(variacion)}</span>
        </div>
      )}
      <span className="text-xs text-slate-400">{subtitulo}</span>
    </div>
  );
}

export default function HomePage() {
  const cuadro1 = ipiCuadro1Raw as unknown as IpiCuadro1;
  const cuadro2 = ipiCuadro2Raw as unknown as IpiCuadro2;

  const ng = cuadro1.nivelGeneral;
  const ultimo = getUltimoValor(ng);
  const maximo = getMaximoHistorico(ng);
  const varIA = calcVariacionInteranual(ng);
  const varM = calcVariacionMensual(cuadro1.desestacionalizada);
  const ultimaVarIA = getUltimoValor(varIA);
  const ultimaVarM = getUltimoValor(varM);
  const pctDelPico =
    maximo && ultimo && maximo.valor
      ? (((ultimo.valor ?? 0) - maximo.valor) / maximo.valor) * 100
      : null;

  return (
    <main className="p-4 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <Title className="text-slate-800 text-2xl font-bold">
            Índice de Producción Industrial Manufacturero
          </Title>
          <Text className="text-slate-500 mt-1">
            Análisis sectorial · Base 2004=100 · Fuente: INDEC Argentina
          </Text>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            titulo="Último Valor (Nivel General)"
            valor={formatIndice(ultimo?.valor ?? null)}
            subtitulo={ultimo ? formatFechaLarga(ultimo.fecha) : ''}
            icono={<Activity size={16} />}
          />
          <KpiCard
            titulo="Variación Interanual"
            valor={formatVariacion(ultimaVarIA?.valor ?? null)}
            subtitulo="vs. mismo mes del año anterior"
            variacion={ultimaVarIA?.valor ?? null}
            icono={<TrendingUp size={16} />}
          />
          <KpiCard
            titulo="Variación Mensual Desest."
            valor={formatVariacion(ultimaVarM?.valor ?? null)}
            subtitulo="Sobre serie desestacionalizada"
            variacion={ultimaVarM?.valor ?? null}
            icono={<TrendingUp size={16} />}
          />
          <KpiCard
            titulo="Máximo Histórico"
            valor={formatIndice(maximo?.valor ?? null)}
            subtitulo={maximo ? formatFechaLarga(maximo.fecha) : ''}
            variacion={pctDelPico}
            icono={<BarChart2 size={16} />}
          />
        </div>

        {/* Gráfico 1: Series Principales */}
        <IpiSeriesAreaChart data={cuadro1} />

        {/* Gráfico 2: Sectores Manufactureros */}
        <IpiSectoresAreaChart data={cuadro2} />

        {/* Gráfico 3: Variaciones por Sector */}
        <IpiVariacionesBarChart data={cuadro2} />

        {/* Gráfico 4: Evolución Sectorial */}
        <IpiEvolucionSectoralChart data={cuadro2} />

        {/* Gráfico 5: Variación Relativa */}
        <IpiVariacionRelativaHorizontalChart data={cuadro2} />

        <div className="flex flex-wrap justify-between items-center pt-1 pb-4 gap-2">
          <Text className="text-xs text-slate-400 uppercase tracking-wider">
            Fuente: INDEC — Instituto Nacional de Estadística y Censos
          </Text>
          <Text className="text-xs text-blue-500 font-medium">
            🤖 Datos actualizados vía GitHub Actions
          </Text>
        </div>
      </div>
    </main>
  );
}
