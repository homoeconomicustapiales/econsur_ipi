import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IPI Manufacturero · INDEC Argentina',
  description:
    'Dashboard interactivo del Índice de Producción Industrial Manufacturero de Argentina. Análisis sectorial con series históricas desde enero 2016. Fuente: INDEC.',
  keywords: 'IPI, producción industrial, manufacturero, INDEC, Argentina, estadísticas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
