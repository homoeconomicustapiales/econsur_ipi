'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart2, Activity, Calendar } from 'lucide-react';
import IpiSeriesAreaChart from '@/components/IpiSeriesAreaChart';
import IpiSectoresAreaChart from '@/components/IpiSectoresAreaChart';
import IpiVariacionesBarChart from '@/components/IpiVariacionesBarChart';
import IpiEvolucionSectoralChart from '@/components/IpiEvolucionSectoralChart';
import IpiVariacionRelativaHorizontalChart from '@/components/IpiVariacionRelativaHorizontalChart';
import {
  getUltimoValor,
  getMaximoHistorico,
  calcVariacionInteranual,
  calcVariacionMensual,
} from '@/utils/calculations';
import { formatIndice, formatVariacion, formatFechaLarga, colorVariacion } from '@/utils/formatters';
import type { IpiCuadro1, IpiCuadro2 } from '@/types/ipi';

// ──────────────────────────────────────────────────────────
// KPI Card
// ──────────────────────────────────────────────────────────
interface KpiCardProps {
  titulo: string;
  valor: string;
  subtitulo: string;
  variacion?: number | null;
  icono: React.ReactNode;
  delay?: number;
}

function KpiCard({ titulo, valor, subtitulo, variacion, icono, delay = 0 }: KpiCardProps) {
  const color = variacion != null ? colorVariacion(variacion) : '#94a3b8';
  const TrendIcon =
    variacion == null ? null : variacion > 0 ? TrendingUp : variacion < 0 ? TrendingDown : Minus;

  return (
    <div
      className={`animate-fade-in-delay-${delay + 1}`}
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'border-color 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#334155')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {titulo}
        </span>
        <span style={{ color: '#334155' }}>{icono}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>
        {valor}
      </div>
      {variacion != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {TrendIcon && <TrendIcon size={13} color={color} />}
          <span style={{ fontSize: 12, fontWeight: 700, color }}>{formatVariacion(variacion)}</span>
        </div>
      )}
      <span style={{ fontSize: 11, color: '#64748b' }}>{subtitulo}</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────
export default function HomePage() {
  const [cuadro1, setCuadro1] = useState<IpiCuadro1 | null>(null);
  const [cuadro2, setCuadro2] = useState<IpiCuadro2 | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/ipi_cuadro1.json').then((r) => r.json()),
      fetch('/data/ipi_cuadro2.json').then((r) => r.json()),
    ])
      .then(([c1, c2]) => {
        setCuadro1(c1);
        setCuadro2(c2);
      })
      .catch(() => setError('Error al cargar los datos. Ejecutá processor.py para generar los JSONs.'));
  }, []);

  // KPI calculations
  const kpis = React.useMemo(() => {
    if (!cuadro1) return null;
    const ng = cuadro1.nivelGeneral;
    const ultimo = getUltimoValor(ng);
    const maximo = getMaximoHistorico(ng);
    const varIA = calcVariacionInteranual(ng);
    const varM = calcVariacionMensual(cuadro1.desestacionalizada);
    const ultimaVarIA = getUltimoValor(varIA);
    const ultimaVarM = getUltimoValor(varM);
    const pctDelPico =
      maximo && ultimo && maximo.valor
        ? (((ultimo.valor ?? 0) - maximo.valor) / maximo.valor) * 100
        : null;

    return { ultimo, maximo, ultimaVarIA, ultimaVarM, pctDelPico };
  }, [cuadro1]);

  const periodoStr = cuadro1
    ? `Enero 2016 – ${formatFechaLarga(cuadro1.periodoFin)}`
    : 'Enero 2016 – Actualidad';

  if (error) {
    return (
      <main style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: 12, padding: '32px 40px', maxWidth: 480, textAlign: 'center' }}>
          <BarChart2 size={40} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: '#f1f5f9', fontSize: 18, marginBottom: 8 }}>Datos no disponibles</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>{error}</p>
          <div style={{ marginTop: 16, background: '#0f172a', borderRadius: 8, padding: '12px 16px', textAlign: 'left' }}>
            <code style={{ color: '#3b82f6', fontSize: 12 }}>
              cd my-ipi-dashboard/scripts<br />
              pip install -r requirements.txt<br />
              python processor.py
            </code>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9' }}>
      {/* ── HEADER ── */}
      <header
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #0f1f3d 100%)',
          borderBottom: '1px solid #1e3a5f',
          padding: '24px 0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div style={{ width: 4, height: 32, background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)', borderRadius: 2 }} />
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  Índice de Producción Industrial IPI Manufacturero
                </h1>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', marginLeft: 16, letterSpacing: '0.03em' }}>
                Análisis sectorial · Series históricas · Base 2004=100 · Fuente: INDEC Argentina
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '6px 12px' }}>
              <Calendar size={13} color="#64748b" />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{periodoStr}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── KPI CARDS ── */}
        {cuadro1 && kpis ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <KpiCard
              titulo="Último Valor (Nivel General)"
              valor={formatIndice(kpis.ultimo?.valor ?? null)}
              subtitulo={kpis.ultimo ? formatFechaLarga(kpis.ultimo.fecha) : ''}
              icono={<Activity size={16} />}
              delay={0}
            />
            <KpiCard
              titulo="Variación Interanual"
              valor={formatVariacion(kpis.ultimaVarIA?.valor ?? null)}
              subtitulo={`vs mismo mes año anterior`}
              variacion={kpis.ultimaVarIA?.valor ?? null}
              icono={<TrendingUp size={16} />}
              delay={1}
            />
            <KpiCard
              titulo="Variación Mensual Desest."
              valor={formatVariacion(kpis.ultimaVarM?.valor ?? null)}
              subtitulo="Sobre serie desestacionalizada"
              variacion={kpis.ultimaVarM?.valor ?? null}
              icono={<TrendingUp size={16} />}
              delay={2}
            />
            <KpiCard
              titulo="Máximo Histórico"
              valor={formatIndice(kpis.maximo?.valor ?? null)}
              subtitulo={kpis.maximo ? formatFechaLarga(kpis.maximo.fecha) : ''}
              variacion={kpis.pctDelPico}
              icono={<BarChart2 size={16} />}
              delay={3}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: 120, background: '#1e293b', borderRadius: 12, border: '1px solid #334155', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* ── GRÁFICO 1: Series Principales ── */}
        {cuadro1 ? (
          <IpiSeriesAreaChart data={cuadro1} />
        ) : (
          <SkeletonChart label="Series Principales · Cuadro 1" />
        )}

        {/* ── GRÁFICO 2: Sectores Manufactureros ── */}
        {cuadro2 ? (
          <IpiSectoresAreaChart data={cuadro2} />
        ) : (
          <SkeletonChart label="Sectores Manufactureros · Cuadro 2" />
        )}

        {/* ── GRÁFICO 3: Variaciones ── */}
        {cuadro2 ? (
          <IpiVariacionesBarChart data={cuadro2} />
        ) : (
          <SkeletonChart label="Variaciones Mensuales e Interanuales" />
        )}

        {/* ── GRÁFICO 4: Evolución Sectorial ── */}
        {cuadro2 ? (
          <IpiEvolucionSectoralChart data={cuadro2} />
        ) : (
          <SkeletonChart label="Evolución Sectorial (Base 100)" />
        )}

        {/* ── GRÁFICO 5: Variación Relativa ── */}
        {cuadro2 ? (
          <IpiVariacionRelativaHorizontalChart data={cuadro2} />
        ) : (
          <SkeletonChart label="Variación Relativa por Fechas" />
        )}

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid #1e293b', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 11, color: '#475569' }}>
            Fuente: INDEC · Instituto Nacional de Estadística y Censos de Argentina
          </p>
          <p style={{ fontSize: 11, color: '#334155' }}>
            Datos actualizados automáticamente · econsur_ipi
          </p>
        </footer>
      </div>
    </main>
  );
}

function SkeletonChart({ label }: { label: string }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', padding: '20px 24px', height: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ height: 20, width: 220, background: '#334155', borderRadius: 4, opacity: 0.5 }} />
      <div style={{ flex: 1, background: '#0f172a', borderRadius: 8, opacity: 0.3 }} />
      <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>Cargando {label}…</p>
    </div>
  );
}
