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
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { formatVariacion } from '@/utils/formatters';
import { calcVariacionRelativaPorSector } from '@/utils/calculations';
import type { IpiCuadro2 } from '@/types/ipi';
import { SECTOR_NOMBRES_COMPLETOS } from '@/utils/constants';
import { Card } from '@tremor/react';

interface Props {
  data: IpiCuadro2;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function formatFechaOpt(f: string): string {
  const [y, m] = f.split('-').map(Number);
  return `${MESES[m - 1]} ${y}`;
}

function formatVariacionEntera(valor: number): string {
  const redondeado = Math.round(valor);
  const signo = redondeado > 0 ? '+' : '';
  return `${signo}${redondeado}%`;
}

export default function IpiVariacionRelativaHorizontalChart({ data }: Props) {
  const sectores = Object.keys(data);
  const todasFechas = data[sectores[0]].map((p) => p.fecha);
  const primeraFecha = todasFechas[0];
  const ultimaFecha = todasFechas[todasFechas.length - 1];

  const [desde, setDesde] = useState(primeraFecha);
  const [hasta, setHasta] = useState(ultimaFecha);

  const selectStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    color: '#334155',
    padding: '5px 10px',
    fontSize: 12,
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
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 12, maxWidth: 240, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' }}>
        <p style={{ color: '#1e293b', marginBottom: 4, fontWeight: 600, fontSize: 11 }}>{nombre}</p>
        <p style={{ color: v >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: 14 }}>
          {formatVariacion(v)}
        </p>
        <p style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>
          {formatFechaOpt(desde)} → {formatFechaOpt(hasta)}
        </p>
      </div>
    );
  };

  const CustomAxisTick = ({ x, y, payload }: any) => {
    const label = payload.value.length > 28 ? payload.value.slice(0, 26) + '…' : payload.value;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-6} y={0} dy={4} textAnchor="end" fill="#64748b" fontSize={10}>
          {label}
        </text>
      </g>
    );
  };

  const CustomBarLabel = ({ x, y, width, height, value }: any) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return null;

    const isPositive = value >= 0;
    const labelX = isPositive ? x + width + 6 : x - 6;

    return (
      <text
        x={labelX}
        y={y + height / 2}
        dy={4}
        textAnchor={isPositive ? 'start' : 'end'}
        fill={isPositive ? '#16a34a' : '#dc2626'}
        fontSize={11}
        fontWeight={700}
      >
        {formatVariacionEntera(value)}
      </text>
    );
  };

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 mb-0.5">
          Variación Relativa por Fechas
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Comparativa de crecimiento sectorial en el período seleccionado
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Desde:</span>
            <select value={desde} onChange={(e) => setDesde(e.target.value)} style={selectStyle}>
              {todasFechas.map((f) => (
                <option key={f} value={f}>{formatFechaOpt(f)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Hasta:</span>
            <select value={hasta} onChange={(e) => setHasta(e.target.value)} style={selectStyle}>
              {todasFechas.map((f) => (
                <option key={f} value={f}>{formatFechaOpt(f)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setDesde(primeraFecha); setHasta(ultimaFecha); }}
            className="bg-transparent border border-slate-200 rounded-md text-slate-500 px-3 py-1 text-xs cursor-pointer font-semibold hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            LIMPIAR
          </button>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span style={{ width: 12, height: 12, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} />
          <span className="text-xs text-slate-500">Crecimiento (+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ width: 12, height: 12, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} />
          <span className="text-xs text-slate-500">Decrecimiento (−)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 40, bottom: 5, left: 160 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
           tick={{ fill: '#94a3b8', fontSize: 11 }}
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
            <LabelList dataKey="variacion" content={<CustomBarLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
