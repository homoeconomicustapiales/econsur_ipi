import type { DataPoint } from '@/utils/calculations';

export interface IpiCuadro1 {
  nivelGeneral: DataPoint[];
  desestacionalizada: DataPoint[];
  tendenciaCiclo: DataPoint[];
  periodoInicio: string;
  periodoFin: string;
}

export type IpiCuadro2 = Record<string, DataPoint[]>;
