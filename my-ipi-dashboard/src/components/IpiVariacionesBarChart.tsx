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
import { formatFechaCorta, formatVariacion } from '@/utils/formatters';
import {
  calcVariacionMensual,
  calcVariacionInteranual,
  filterByDateRange,
} from '@/utils/calculations';
import AxisScaleSelector from './Shared/AxisScaleSelector';
import type { IpiCuadro2 } from '@/types/ipi';
import { SECTOR_NOMBRES_CORTOS } from '@/utils/constants';
import { Card } from '@tremor/react';

interface Props {
  data: IpiCuadro2;
}

const RANGOS = [
  { label: 'Último mes', meses: 1 },
  { label: '3 meses', meses: 3 },
  { label: '1 año', meses: 12 },
  { label: 'Todo', meses: 0 },
];

type TipoVar = 'mensual' | 'interanual';

export default function IpiVariacionesBarChart({ data }: Props) {
  const sectores = Object.keys(data);
  const todasFechas = data[sectores[0]].map((p) => p.fecha);

  const [rango, setRango] = useState('1 año');
  const [tipoVar, setTipoVar] = useState<TipoVar>('interanual');
  const [scaleMode, setScaleMode] = useState<'auto' | 'manual'>('auto');
  const [yMin, setYMin] = useState('');
  const [yMax, setYMax] = useState('');
  const [sectorActivo, setSectorActivo] = useState(sectores[0]);

  const chartData = useMemo(() => {
    const serie = data[sectorActivo];
    const variaciones = tipoVar === 'mensual' ? calcVariacionMensual(serie) : calcVariacionInteranual(serie);

    const rangoObj = RANGOS.find((r) => r.label === rango);
    let filtered = variaciones;
    if (rangoObj && rangoObj.meses > 0) {
      const desdeIdx = Math.max(0, variaciones.length - rangoObj.meses);
      filtered = variaciones.slice(desdeIdx);
    }

    return filtered
      .filter((p) => p.valor !== null)
      .map((p) => ({
        label: formatFechaCorta(p.fecha),
        valor: p.valor,
      }));
  }, [sectorActivo, tipoVar, rango, data]);

  const yDomain = useMemo(() => {
    if (scaleMode === 'manual' && yMin && yMax) return [parseFloat(yMin), parseFloat(yMax)] as [number, number];
    return ['auto', 'auto'] as ['auto', 'auto'];
  }, [scaleMode, yMin, yMax]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const v = payload[0].value;
    return (
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' }}>
        <p style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>{label}</p>
        <p style={{ color: v >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
          {tipoVar === 'mensual' ? 'Var. Mensual' : 'Var. Interanual'}: {formatVariacion(v)}
        </p>
      </div>
    );
  };

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 mb-0.5">
          Variaciones por Sector
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Variaciones mensuales e interanuales · IPI Manufacturero
        </p>

        <div className="flex flex-wrap gap-3 mb-3">
          {/* Rango */}
          <div className="flex bg-slate-100 rounded-md border border-slate-200 overflow-hidden">
            {RANGOS.map((r) => (
              <button key={r.label} onClick={() => setRango(r.label)}
                className={`px-2.5 py-1 text-xs font-semibold border-none cursor-pointer ${rango === r.label ? 'bg-blue-500 text-white' : 'bg-transparent text-slate-500'}`}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Tipo variación */}
          <div className="flex bg-slate-100 rounded-md border border-slate-200 overflow-hidden">
            {(['mensual', 'interanual'] as TipoVar[]).map((t) => (
              <button key={t} onClick={() => setTipoVar(t)}
                className={`px-3 py-1 text-xs font-semibold border-none cursor-pointer ${tipoVar === t ? 'bg-blue-500 text-white' : 'bg-transparent text-slate-500'}`}>
                {t === 'mensual' ? 'Mensual' : 'Interanual'}
              </button>
            ))}
          </div>

          <AxisScaleSelector value={scaleMode} yMin={yMin} yMax={yMax} onChange={setScaleMode} onYMinChange={setYMin} onYMaxChange={setYMax} />
        </div>

        {/* Selector de sector */}
        <div className="flex flex-wrap gap-2">
          {sectores.map((s) => (
            <button key={s} onClick={() => setSectorActivo(s)}
              style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${sectorActivo === s ? '#3b82f6' : '#e2e8f0'}`,
                background: sectorActivo === s ? '#eff6ff' : 'transparent',
                color: sectorActivo === s ? '#3b82f6' : '#94a3b8',
              }}>
              {SECTOR_NOMBRES_CORTOS[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={50} domain={yDomain} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />
          <Bar dataKey="valor" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={(entry.valor ?? 0) >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
