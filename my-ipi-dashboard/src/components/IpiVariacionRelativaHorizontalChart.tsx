'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { formatVariacion } from '@/utils/formatters';
import { calcVariacionRelativaPorSector } from '@/utils/calculations';
import type { IpiCuadro2 } from '@/types/ipi';
import { SECTOR_NOMBRES_COMPLETOS } from '@/utils/constants';

interface Props {
  data: IpiCuadro2;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function formatFechaOpt(f: string): string {
  const [y, m] = f.split('-').map(Number);
  return `${MESES[m - 1]} ${y}`;
}

export default function IpiVariacionRelativaHorizontalChart({ data }: Props) {
  const sectores = Object.keys(data);
  const todasFechas = data[sectores[0]].map((p) => p.fecha);
  const primeraFecha = todasFechas[0];
  const ultimaFecha = todasFechas[todasFechas.length - 1];

  const [desde, setDesde] = useState(primeraFecha);
  const [hasta, setHasta] = useState(ultimaFecha);

  const selectStyle: React.CSSProperties = {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#f1f5f9',
    padding: '5px 10px',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
    minWidth: 110,
  };

  const chartData = useMemo(() => {
    return calcVariacionRelativaPorSector(data, desde, hasta).map((item) => ({
      sector: SECTOR_NOMBRES_COMPLETOS[item.sector] ?? item.sector,
      sectorKey: item.sector,
      variacion: item.variacion,
    }));
  }, [desde, hasta, data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const v = payload[0].value;
    const nombre = payload[0].payload.sector;
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', fontSize: 12, maxWidth: 240 }}>
        <p style={{ color: '#f1f5f9', marginBottom: 4, fontWeight: 600, fontSize: 11 }}>{nombre}</p>
        <p style={{ color: v >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: 14 }}>
          {formatVariacion(v)}
        </p>
        <p style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>
          {formatFechaOpt(desde)} → {formatFechaOpt(hasta)}
        </p>
      </div>
    );
  };

  const CustomAxisTick = ({ x, y, payload }: any) => {
    const label = payload.value.length > 28 ? payload.value.slice(0, 26) + '…' : payload.value;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-6} y={0} dy={4} textAnchor="end" fill="#94a3b8" fontSize={10}>
          {label}
        </text>
      </g>
    );
  };

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: '20px 24px' }}>
      <div className="mb-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
          Variación Relativa por Fechas
        </h2>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
          Comparativa de crecimiento sectorial en el período seleccionado
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Desde:</span>
            <select value={desde} onChange={(e) => setDesde(e.target.value)} style={selectStyle}>
              {todasFechas.map((f) => (
                <option key={f} value={f}>{formatFechaOpt(f)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Hasta:</span>
            <select value={hasta} onChange={(e) => setHasta(e.target.value)} style={selectStyle}>
              {todasFechas.map((f) => (
                <option key={f} value={f}>{formatFechaOpt(f)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setDesde(primeraFecha); setHasta(ultimaFecha); }}
            style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 6, color: '#94a3b8', padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.borderColor = '#3b82f6'; (e.target as HTMLButtonElement).style.color = '#3b82f6'; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.borderColor = '#334155'; (e.target as HTMLButtonElement).style.color = '#94a3b8'; }}
          >
            LIMPIAR
          </button>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span style={{ width: 12, height: 12, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: '#64748b' }}>Crecimiento (+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ width: 12, height: 12, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: '#64748b' }}>Decrecimiento (−)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 40, bottom: 5, left: 160 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="sector"
            tick={<CustomAxisTick />}
            axisLine={false}
            tickLine={false}
            width={155}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
          <Bar dataKey="variacion" radius={[0, 3, 3, 0]} barSize={18}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.variacion >= 0 ? '#22c55e' : '#ef4444'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
