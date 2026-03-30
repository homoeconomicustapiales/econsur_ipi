export const SECTOR_COLORS: string[] = [
  '#1f2937', // IPI Manufacturero (gris oscuro)
  '#ef4444', // Alimentos y bebidas
  '#f97316', // Tabaco
  '#eab308', // Textiles
  '#22c55e', // Prendas/cuero/calzado
  '#06b6d4', // Madera/papel/edición
  '#3b82f6', // Petróleo/coque
  '#8b5cf6', // Químicos
  '#ec4899', // Caucho y plástico
  '#d97706', // Minerales no metálicos
  '#14b8a6', // Metálicas básicas
  '#f43f5e', // Productos de metal
  '#a78bfa', // Maquinaria y equipo
  '#fb923c', // Otros equipos
  '#34d399', // Vehículos automotores
  '#60a5fa', // Otro equipo de transporte
  '#fbbf24', // Muebles y otras industrias
];

export const SECTOR_NOMBRES_CORTOS: Record<string, string> = {
  ipiManufacturero: 'IPI Manuf.',
  alimentosBebidas: 'Alimentos',
  tabaco: 'Tabaco',
  textiles: 'Textiles',
  prendasCueroCalzado: 'Prendas',
  maderaPapel: 'Madera/Papel',
  petroleo: 'Petróleo',
  quimicos: 'Químicos',
  cauchoPlastico: 'Caucho',
  mineralesNoMetalicos: 'Minerales',
  metalicasBasicas: 'Metálicas',
  productosMetal: 'Prod. Metal',
  maquinariaEquipo: 'Maquinaria',
  otrosEquipos: 'Otros Eq.',
  vehiculosAutomotores: 'Vehículos',
  otroTransporte: 'Otro Transp.',
  muebles: 'Muebles',
};

export const SECTOR_NOMBRES_COMPLETOS: Record<string, string> = {
  ipiManufacturero: 'IPI Manufacturero',
  alimentosBebidas: 'Alimentos y bebidas',
  tabaco: 'Productos de tabaco',
  textiles: 'Productos textiles',
  prendasCueroCalzado: 'Prendas de vestir, cuero y calzado',
  maderaPapel: 'Madera, papel, edición e impresión',
  petroleo: 'Refinación del petróleo, coque y combustible nuclear',
  quimicos: 'Sustancias y productos químicos',
  cauchoPlastico: 'Productos de caucho y plástico',
  mineralesNoMetalicos: 'Productos minerales no metálicos',
  metalicasBasicas: 'Industrias metálicas básicas',
  productosMetal: 'Productos de metal',
  maquinariaEquipo: 'Maquinaria y equipo',
  otrosEquipos: 'Otros equipos, aparatos e instrumentos',
  vehiculosAutomotores: 'Vehículos automotores, carrocerías, remolques y autopartes',
  otroTransporte: 'Otro equipo de transporte',
  muebles: 'Muebles y colchones, y otras industrias manufactureras',
};

export const SECTOR_KEYS = Object.keys(SECTOR_NOMBRES_CORTOS);
