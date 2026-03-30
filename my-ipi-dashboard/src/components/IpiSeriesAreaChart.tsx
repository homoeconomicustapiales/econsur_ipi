'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { formatFechaCorta, formatIndice, formatVariacion } from '@/utils/formatters';
import { calcVariacionInteranual, calcVariacionMensual, filterByDateRange } from '@/utils/calculations';
import type { IpiCuadro1 } from '@/types/ipi';
import { Card } from '@tremor/react';

interface Props {
  data: IpiCuadro1;
}

const SERIES = [
  { key: 'nivelGeneral', nombre: 'Nivel General', color: '#3b82f6' },
  { key: 'desestacionalizada', nombre: 'Desestacionalizada', color: '#10b981' },
  { key: 'tendenciaCiclo', nombre: 'Tendencia-Ciclo', color: '#f59e0b' },
] as const;

const RANGOS = [
  { label: '2a', meses: 24 },
  { label: '5a', meses: 60 },
  { label: '10a', meses: 120 },
  { label: 'Todo', meses: 0 },
];

type VistaMode = 'niveles' | 'interanual' | 'mensual';

export default function IpiSeriesAreaChart({ data }: Props) {
  const [rangoActivo, setRangoActivo] = useState('Todo');
  const [vistaMode, setVistaMode] = useState<VistaMode>('niveles');
  const [seriesVisibles, setSeriesVisibles] = useState<Set<string>>(
    new Set(SERIES.map((s) => s.key))
  );

  const fechas = data.nivelGeneral.map((p) => p.fecha);

  const filteredFechas = useMemo(() => {
    const rango = RANGOS.find((r) => r.label === rangoActivo);
    if (!rango || rango.meses === 0) return fechas;
    const desdeIdx = Math.max(0, fechas.length - rango.meses);
    return fechas.slice(desdeIdx);
  }, [rangoActivo, fechas]);

  const chartData = useMemo(() => {
    const desde = filteredFechas[0];
    const hasta = filteredFechas[filteredFechas.length - 1];

    const seriesTransform =
      vistaMode === 'mensual'
        ? calcVariacionMensual
        : vistaMode === 'interanual'
        ? calcVariacionInteranual
        : null;

    // Para variaciones, primero se calcula sobre la serie completa y luego se filtra,
    // así el primer punto del rango conserva la comparación contra el período previo.
    const ngBase = seriesTransform ? seriesTransform(data.nivelGeneral) : data.nivelGeneral;
    const deBase = seriesTransform ? seriesTransform(data.desestacionalizada) : data.desestacionalizada;
    const tcBase = seriesTransform ? seriesTransform(data.tendenciaCiclo) : data.tendenciaCiclo;

    const ngData = filterByDateRange(ngBase, desde, hasta);
    const deData = filterByDateRange(deBase, desde, hasta);
    const tcData = filterByDateRange(tcBase, desde, hasta);

    return ngData.map((p, i) => ({
      fecha: p.fecha,
      label: formatFechaCorta(p.fecha),
      nivelGeneral: p.valor,
      desestacionalizada: deData[i]?.valor ?? null,
      tendenciaCiclo: tcData[i]?.valor ?? null,
    }));
  }, [filteredFechas, data, vistaMode]);

  const yDomain = useMemo(() => {
    const visibleKeys = SERIES.filter((s) => seriesVisibles.has(s.key)).map((s) => s.key as keyof typeof chartData[number]);
    const values: number[] = [];

    chartData.forEach((row) => {
      visibleKeys.forEach((key) => {
        const value = row[key];
        if (typeof value === 'number' && !Number.isNaN(value)) {
          values.push(value);
        }
      });
    });

    if (!values.length) return ['auto', 'auto'] as ['auto', 'auto'];

    let min = Math.min(...values);
    let max = Math.max(...values);

    if (vistaMode !== 'niveles') {
      min = Math.min(min, 0);
      max = Math.max(max, 0);
    }

    if (min === max) {
      const pad = Math.abs(min) * 0.1 || 1;
      return [min - pad, max + pad] as [number, number];
    }

    const pad = (max - min) * (vistaMode === 'niveles' ? 0.08 : 0.12);
    return [min - pad, max + pad] as [number, number];
  }, [chartData, seriesVisibles, vistaMode]);

  const toggleSerie = (key: string) => {
    setSeriesVisibles((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
        }}
      >
        <p style={{ color: '#64748b', marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} style={{ color: entry.color, marginBottom: 2 }}>
            <span style={{ color: '#64748b' }}>
              {SERIES.find((s) => s.key === entry.dataKey)?.nombre}:
            </span>{' '}
            <strong>{vistaMode === 'niveles' ? formatIndice(entry.value) : formatVariacion(entry.value)}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-0.5">
            Series Principales · Cuadro 1
          </h2>
          <p className="text-xs text-slate-500">
            Índice Base 2004=100 · IPI Manufacturero
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Vista toggle */}
          <div className="flex bg-slate-100 rounded-md border border-slate-200 overflow-hidden">
            {(['niveles', 'interanual', 'mensual'] as VistaMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setVistaMode(m)}
                className={`px-2.5 py-1 text-xs font-semibold border-none cursor-pointer capitalize ${
                  vistaMode === m ? 'bg-blue-500 text-white' : 'bg-transparent text-slate-500'
                }`}
              >
                {m === 'niveles' ? 'Niveles' : m === 'interanual' ? 'Var. Interanual' : 'Var. Mensual'}
              </button>
            ))}
          </div>
          {/* Rango */}
          <div className="flex bg-slate-100 rounded-md border border-slate-200 overflow-hidden">
            {RANGOS.map((r) => (
              <button
                key={r.label}
                onClick={() => setRangoActivo(r.label)}
                className={`px-2.5 py-1 text-xs font-semibold border-none cursor-pointer ${
                  rangoActivo === r.label ? 'bg-blue-500 text-white' : 'bg-transparent text-slate-500'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Series toggles */}
      <div className="flex flex-wrap gap-3 mb-4">
        {SERIES.map((s) => (
          <button
            key={s.key}
            onClick={() => toggleSerie(s.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 20,
                border: `1px solid ${seriesVisibles.has(s.key) ? s.color : '#e2e8f0'}`,
              background: seriesVisibles.has(s.key) ? `${s.color}22` : 'transparent',
                color: seriesVisibles.has(s.key) ? s.color : '#94a3b8',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                  background: seriesVisibles.has(s.key) ? s.color : '#cbd5e1',
                display: 'inline-block',
              }}
            />
            {s.nombre}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        {vistaMode === 'niveles' ? (
          <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              {SERIES.map((s) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
              domain={yDomain}
              tickFormatter={(v) => formatIndice(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            {SERIES.filter((s) => seriesVisibles.has(s.key)).map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2.5}
                fill={`url(#grad-${s.key})`}
                dot={false}
                activeDot={{ r: 4, fill: s.color }}
                connectNulls
              />
            ))}
          </AreaChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={72}
              domain={yDomain}
              tickFormatter={(v) =>
                typeof v === 'number'
                  ? `${v.toLocaleString('es-AR', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}%`
                  : ''
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#334155" strokeWidth={1.2} />
            {SERIES.filter((s) => seriesVisibles.has(s.key)).map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={s.color}
                fillOpacity={0.85}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}
