import './globals.css';

export const metadata = {
  title: 'IPI Manufacturero · INDEC Argentina',
  description:
    'Dashboard interactivo del Índice de Producción Industrial Manufacturero de Argentina. Análisis sectorial con series históricas desde enero 2016. Fuente: INDEC.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50">{children}</body>
    </html>
  );
}
