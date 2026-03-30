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
import { formatFechaCorta, formatIndice } from '@/utils/formatters';
import { rebaseASerie } from '@/utils/calculations';
import type { IpiCuadro2 } from '@/types/ipi';
import { SECTOR_COLORS, SECTOR_NOMBRES_CORTOS } from '@/utils/constants';

interface Props {
  data: IpiCuadro2;
}

export default function IpiEvolucionSectoralChart({ data }: Props) {
  const sectores = Object.keys(data);
  const todasFechas = data[sectores[0]].map((p) => p.fecha);
  const [fechaBase, setFechaBase] = useState('2016-01');
  const [seriesVisibles, setSeriesVisibles] = useState<Set<string>>(new Set(sectores));

  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const formatFechaOpt = (f: string) => {
    const [y, m] = f.split('-').map(Number);
    return `${MESES[m - 1]} ${y}`;
  };

  const chartData = useMemo(() => {
    const rebased: Record<string, Array<{ fecha: string; valor: number | null }>> = {};
    sectores.forEach((s) => {
      rebased[s] = rebaseASerie(data[s], fechaBase);
    });
    return todasFechas.map((fecha, i) => {
      const row: Record<string, any> = { fecha, label: formatFechaCorta(fecha) };
      sectores.forEach((s) => { row[s] = rebased[s][i]?.valor ?? null; });
      return row;
    });
  }, [fechaBase, data, sectores, todasFechas]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const visible = payload.filter((p: any) => p.value !== null).slice(0, 6);
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', fontSize: 11, maxWidth: 210 }}>
        <p style={{ color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {visible.map((entry: any) => (
          <div key={entry.dataKey} style={{ color: entry.stroke, marginBottom: 2 }}>
            <span style={{ color: '#94a3b8' }}>{SECTOR_NOMBRES_CORTOS[entry.dataKey] ?? entry.dataKey}:</span>{' '}
            <strong>{formatIndice(entry.value)}</strong>
          </div>
        ))}
        {payload.length > 6 && <p style={{ color: '#64748b', marginTop: 4 }}>+{payload.length - 6} más…</p>}
      </div>
    );
  };

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: '20px 24px' }}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
            Evolución Sectorial (Base 100)
          </h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Evolución relativa normalizada por sector</p>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Fecha base:</span>
          <select
            value={fechaBase}
            onChange={(e) => setFechaBase(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#f1f5f9', padding: '5px 10px', fontSize: 12, cursor: 'pointer', outline: 'none' }}
          >
            {todasFechas.map((f) => (
              <option key={f} value={f}>{formatFechaOpt(f)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {sectores.map((s, i) => {
          const color = SECTOR_COLORS[i % SECTOR_COLORS.length];
          const visible = seriesVisibles.has(s);
          return (
            <button key={s}
              onClick={() => setSeriesVisibles((prev) => { const next = new Set(prev); if (next.has(s)) { if (next.size > 1) next.delete(s); } else next.add(s); return next; })}
              style={{ padding: '2px 8px', borderRadius: 20, border: `1px solid ${visible ? color : '#334155'}`, background: visible ? `${color}22` : 'transparent', color: visible ? color : '#64748b', fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: visible ? color : '#334155', display: 'inline-block' }} />
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
                <linearGradient key={s} id={`grad4-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => formatIndice(v)} />
          <Tooltip content={<CustomTooltip />} />
          {sectores.filter((s) => seriesVisibles.has(s)).map((s, i) => {
            const idx = sectores.indexOf(s);
            const color = SECTOR_COLORS[idx % SECTOR_COLORS.length];
            return (
              <Area key={s} type="monotone" dataKey={s} stroke={color} strokeWidth={2} fill={`url(#grad4-${idx})`} dot={false} activeDot={{ r: 3, fill: color }} connectNulls />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
