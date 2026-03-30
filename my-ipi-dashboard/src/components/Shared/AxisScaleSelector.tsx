'use client';

import React from 'react';

interface AxisScaleSelectorProps {
  value: 'auto' | 'manual';
  yMin: string;
  yMax: string;
  onChange: (mode: 'auto' | 'manual') => void;
  onYMinChange: (v: string) => void;
  onYMaxChange: (v: string) => void;
}

export default function AxisScaleSelector({
  value,
  yMin,
  yMax,
  onChange,
  onYMinChange,
  onYMaxChange,
}: AxisScaleSelectorProps) {
  const selectStyle: React.CSSProperties = {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#f1f5f9',
    padding: '5px 10px',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
  };

  const inputStyle: React.CSSProperties = {
    ...selectStyle,
    width: 72,
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Escala Y:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'auto' | 'manual')}
        style={selectStyle}
      >
        <option value="auto">Automática</option>
        <option value="manual">Manual</option>
      </select>
      {value === 'manual' && (
        <>
          <input
            type="number"
            placeholder="Mín"
            value={yMin}
            onChange={(e) => onYMinChange(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Máx"
            value={yMax}
            onChange={(e) => onYMaxChange(e.target.value)}
            style={inputStyle}
          />
        </>
      )}
    </div>
  );
}
