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
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    color: '#334155',
    padding: '5px 10px',
    fontSize: 12,
    cursor: 'pointer',
    outline: 'none',
  };

  const inputStyle: React.CSSProperties = {
    ...selectStyle,
    width: 72,
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500 font-medium">Escala Y:</span>
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
