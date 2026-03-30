'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@tremor/react';
import DateRangeFilter from './Shared/DateRangeFilter';
import AxisScaleSelector from './Shared/AxisScaleSelector';
import { formatFechaCorta, formatIndice } from '@/utils/formatters';
import { filterByDateRange } from '@/utils/calculations';
import type { IpiCuadro2 } from '@/types/ipi';
import { SECTOR_COLORS, SECTOR_NOMBRES_CORTOS } from '@/utils/constants';

interface Props {
  data: IpiCuadro2;
}

export default function IpiSectoresAreaChart({ data }: Props) {
  const sectores = Object.keys(data);
  const todasFechas = data[sectores[0]].map((p) => p.fecha);
  const primeraFecha = todasFechas[0];
  const ultimaFecha = todasFechas[todasFechas.length - 1];

  const [desde, setDesde] = useState(primeraFecha);
  const [hasta, setHasta] = useState(ultimaFecha);
  const [scaleMode, setScaleMode] = useState<'auto' | 'manual'>('auto');
  const [yMin, setYMin] = useState('');
  const [yMax, setYMax] = useState('');
  const [seriesVisibles, setSeriesVisibles] = useState<Set<string>>(new Set(sectores));

  const chartData = useMemo(() => {
    const filtered: Record<string, Array<{ fecha: string; valor: number | null }>> = {};
    sectores.forEach((s) => {
      filtered[s] = filterByDateRange(data[s], desde, hasta);
    });
    const len = filtered[sectores[0]]?.length ?? 0;
    return Array.from({ length: len }, (_, i) => {
      const row: Record<string, any> = {
        fecha: filtered[sectores[0]][i].fecha,
        label: formatFechaCorta(filtered[sectores[0]][i].fecha),
      };
      sectores.forEach((s) => {
        row[s] = filtered[s][i]?.valor ?? null;
      });
      return row;
    });
  }, [desde, hasta, data, sectores]);

  const yDomain = useMemo(() => {
    if (scaleMode === 'manual' && yMin && yMax) {
      return [parseFloat(yMin), parseFloat(yMax)] as [number, number];
    }
    return ['auto', 'auto'] as ['auto', 'auto'];
  }, [scaleMode, yMin, yMax]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const visible = payload.filter((p: any) => p.value !== null).slice(0, 8);
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 11,
          maxWidth: 220,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
        }}
      >
        <p style={{ color: '#64748b', marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {visible.map((entry: any) => (
          <div key={entry.dataKey} style={{ color: entry.stroke, marginBottom: 2 }}>
            <span style={{ color: '#64748b' }}>
              {SECTOR_NOMBRES_CORTOS[entry.dataKey] ?? entry.dataKey}:
            </span>{' '}
            <strong>{formatIndice(entry.value)}</strong>
          </div>
        ))}
        {payload.length > 8 && (
          <p style={{ color: '#94a3b8', marginTop: 4 }}>+{payload.length - 8} más…</p>
        )}
      </div>
    );
  };

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 mb-0.5">Sectores Manufactureros · Cuadro 2</h2>
        <p className="text-xs text-slate-500 mb-3">17 sectores · Índice Base 2004=100</p>
        <div className="flex flex-wrap gap-3">
          <DateRangeFilter
            fechas={todasFechas}
            desde={desde}
            hasta={hasta}
            onDesdeChange={setDesde}
            onHastaChange={setHasta}
            onLimpiar={() => {
              setDesde(primeraFecha);
              setHasta(ultimaFecha);
            }}
          />
          <AxisScaleSelector
            value={scaleMode}
            yMin={yMin}
            yMax={yMax}
            onChange={setScaleMode}
            onYMinChange={setYMin}
            onYMaxChange={setYMax}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {sectores.map((s, i) => {
          const color = SECTOR_COLORS[i % SECTOR_COLORS.length];
          const visible = seriesVisibles.has(s);
          return (
            <button
              key={s}
              onClick={() => {
                setSeriesVisibles((prev) => {
                  const next = new Set(prev);
                  if (next.has(s)) {
                    if (next.size > 1) next.delete(s);
                  } else {
                    next.add(s);
                  }
                  return next;
                });
              }}
              style={{
                padding: '2px 8px',
                borderRadius: 20,
                border: `1px solid ${visible ? color : '#e2e8f0'}`,
                background: visible ? `${color}22` : 'transparent',
                color: visible ? color : '#94a3b8',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: visible ? color : '#cbd5e1',
                  display: 'inline-block',
                }}
              />
              {SECTOR_NOMBRES_CORTOS[s] ?? s}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            {sectores.map((s, i) => {
              const color = SECTOR_COLORS[i % SECTOR_COLORS.length];
              return (
                <linearGradient key={s} id={`grad2-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={50} domain={yDomain} tickFormatter={(v) => formatIndice(v)} />
          <Tooltip content={<CustomTooltip />} />
          {sectores.filter((s) => seriesVisibles.has(s)).map((s) => {
            const color = SECTOR_COLORS[sectores.indexOf(s) % SECTOR_COLORS.length];
            return (
              <Area key={s} type="monotone" dataKey={s} stroke={color} strokeWidth={2} fill={`url(#grad2-${sectores.indexOf(s)})`} dot={false} activeDot={{ r: 3, fill: color }} connectNulls />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
