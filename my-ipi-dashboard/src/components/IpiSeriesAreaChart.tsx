'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatFechaCorta, formatIndice } from '@/utils/formatters';
import { filterByDateRange } from '@/utils/calculations';
import type { IpiCuadro1 } from '@/types/ipi';

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
  const ultimaFecha = fechas[fechas.length - 1];

  const filteredFechas = useMemo(() => {
    const rango = RANGOS.find((r) => r.label === rangoActivo);
    if (!rango || rango.meses === 0) return fechas;
    const desdeIdx = Math.max(0, fechas.length - rango.meses);
    return fechas.slice(desdeIdx);
  }, [rangoActivo, fechas]);

  const chartData = useMemo(() => {
    const desde = filteredFechas[0];
    const hasta = filteredFechas[filteredFechas.length - 1];

    const ng = filterByDateRange(data.nivelGeneral, desde, hasta);
    const de = filterByDateRange(data.desestacionalizada, desde, hasta);
    const tc = filterByDateRange(data.tendenciaCiclo, desde, hasta);

    return ng.map((p, i) => ({
      fecha: p.fecha,
      label: formatFechaCorta(p.fecha),
      nivelGeneral: p.valor,
      desestacionalizada: de[i]?.valor ?? null,
      tendenciaCiclo: tc[i]?.valor ?? null,
    }));
  }, [filteredFechas, data]);

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
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
        }}
      >
        <p style={{ color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} style={{ color: entry.color, marginBottom: 2 }}>
            <span style={{ color: '#94a3b8' }}>
              {SERIES.find((s) => s.key === entry.dataKey)?.nombre}:
            </span>{' '}
            <strong>{formatIndice(entry.value)}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: 12,
        border: '1px solid #334155',
        padding: '20px 24px',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
            Series Principales · Cuadro 1
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            Índice Base 2004=100 · IPI Manufacturero
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Vista toggle */}
          <div
            style={{
              display: 'flex',
              background: '#0f172a',
              borderRadius: 6,
              border: '1px solid #334155',
              overflow: 'hidden',
            }}
          >
            {(['niveles', 'interanual', 'mensual'] as VistaMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setVistaMode(m)}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  background: vistaMode === m ? '#3b82f6' : 'transparent',
                  color: vistaMode === m ? '#fff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {m === 'niveles' ? 'Niveles' : m === 'interanual' ? 'Var. Interanual' : 'Var. Mensual'}
              </button>
            ))}
          </div>
          {/* Rango */}
          <div
            style={{
              display: 'flex',
              background: '#0f172a',
              borderRadius: 6,
              border: '1px solid #334155',
              overflow: 'hidden',
            }}
          >
            {RANGOS.map((r) => (
              <button
                key={r.label}
                onClick={() => setRangoActivo(r.label)}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  background: rangoActivo === r.label ? '#3b82f6' : 'transparent',
                  color: rangoActivo === r.label ? '#fff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                }}
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
              border: `1px solid ${seriesVisibles.has(s.key) ? s.color : '#334155'}`,
              background: seriesVisibles.has(s.key) ? `${s.color}22` : 'transparent',
              color: seriesVisibles.has(s.key) ? s.color : '#64748b',
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
                background: seriesVisibles.has(s.key) ? s.color : '#334155',
                display: 'inline-block',
              }}
            />
            {s.nombre}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
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
      </ResponsiveContainer>
    </div>
  );
}
