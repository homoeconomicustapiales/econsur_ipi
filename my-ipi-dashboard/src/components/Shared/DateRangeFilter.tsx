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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}:</span>
      <div className="flex items-center gap-1">
        <span style={{ fontSize: 12, color: '#64748b' }}>Desde:</span>
        <select value={desde} onChange={(e) => onDesdeChange(e.target.value)} style={selectStyle}>
          {fechas.map((f) => (
            <option key={f} value={f}>
              {formatOption(f)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <span style={{ fontSize: 12, color: '#64748b' }}>Hasta:</span>
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
        style={{
          background: 'transparent',
          border: '1px solid #334155',
          borderRadius: 6,
          color: '#94a3b8',
          padding: '5px 12px',
          fontSize: 12,
          cursor: 'pointer',
          fontWeight: 600,
          letterSpacing: '0.05em',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.borderColor = '#3b82f6';
          (e.target as HTMLButtonElement).style.color = '#3b82f6';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.borderColor = '#334155';
          (e.target as HTMLButtonElement).style.color = '#94a3b8';
        }}
      >
        LIMPIAR
      </button>
    </div>
  );
}
