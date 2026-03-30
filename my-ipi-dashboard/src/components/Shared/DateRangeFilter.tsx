'use client';

import React from 'react';

interface DateRangeFilterProps {
  fechas: string[];
  desde: string;
  hasta: string;
  onDesdeChange: (v: string) => void;
  onHastaChange: (v: string) => void;
  onLimpiar: () => void;
  label?: string;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatOption(fecha: string): string {
  const [y, m] = fecha.split('-').map(Number);
  return `${MESES[m - 1]} ${y}`;
}

export default function DateRangeFilter({
  fechas,
  desde,
  hasta,
  onDesdeChange,
  onHastaChange,
  onLimpiar,
  label = 'Período',
}: DateRangeFilterProps) {
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500 font-medium">{label}:</span>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400">Desde:</span>
        <select value={desde} onChange={(e) => onDesdeChange(e.target.value)} style={selectStyle}>
          {fechas.map((f) => (
            <option key={f} value={f}>
              {formatOption(f)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400">Hasta:</span>
        <select value={hasta} onChange={(e) => onHastaChange(e.target.value)} style={selectStyle}>
          {fechas.map((f) => (
            <option key={f} value={f}>
              {formatOption(f)}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onLimpiar}
        className="bg-transparent border border-slate-200 rounded-md text-slate-400 px-3 py-1 text-xs cursor-pointer font-semibold tracking-wide hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        LIMPIAR
      </button>
    </div>
  );
}
