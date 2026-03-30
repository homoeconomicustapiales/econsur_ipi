#!/usr/bin/env python3
import json
import argparse
import sys
import pandas as pd
from pathlib import Path
from datetime import datetime

# --- CONFIGURACIÓN ---
CUADRO1_CONFIG = {
    "hoja": "Cuadro 1",
    "fila_inicio": 8,
    "columna_fecha": 0,
    "series": {
        "nivelGeneral": 3,
        "desestacionalizada": 7,
        "tendenciaCiclo": 10,
    },
}

CUADRO2_CONFIG = {
    "hoja": "Cuadro 2",
    "fila_inicio": 6,
    "columna_fecha": 0,
    "series": {
        "ipiManufacturero": 3,
        "alimentosBebidas": 4,
        "tabaco": 18,
        "textiles": 21,
        "prendasCueroCalzado": 26,
        "maderaPapel": 30,
        "petroleo": 34,
        "quimicos": 40,
        "cauchoPlastico": 49,
        "mineralesNoMetalicos": 53,
        "metalicasBasicas": 60,
        "productosMetal": 64,
        "maquinariaEquipo": 68,
        "otrosEquipos": 73,
        "vehiculosAutomotores": 77,
        "otroTransporte": 81,
        "muebles": 84,
    },
}

def parse_fecha(valor):
    if pd.isna(valor): return None
    if isinstance(valor, datetime): return valor.strftime("%Y-%m")
    if isinstance(valor, str):
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%Y", "%Y-%m"):
            try: return datetime.strptime(valor.strip(), fmt).strftime("%Y-%m")
            except: continue
    return None

def procesar_hoja(df, config):
    """Extrae las series de un DataFrame cargado de Excel."""
    resultado = {k: [] for k in config["series"]}
    fila_inicio = config["fila_inicio"]
    col_fecha = config["columna_fecha"]

    # Iterar sobre las filas a partir del inicio configurado
    for i in range(fila_inicio, len(df)):
        fila = df.iloc[i]
        fecha = parse_fecha(fila.iloc[col_fecha])
        
        if not fecha: break # Fin de los datos

        for nombre_serie, col_idx in config["series"].items():
            val = fila.iloc[col_idx]
            # Limpieza: Convertir a float, manejar NaNs
            valor = round(float(val), 4) if pd.notna(val) else None
            resultado[nombre_serie].append({"fecha": fecha, "valor": valor})
    
    return resultado

def main():
    parser = argparse.ArgumentParser()
    # Rutas relativas basadas en la estructura que me pasaste
    base_path = Path(__file__).parent.parent
    parser.add_argument("--input", default=base_path / "data" / "raw" / "ipi_man.xlsx")
    parser.add_argument("--output-dir", default=base_path / "data" / "processed")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)

    print(f"--- Procesando IPI: {input_path.name} ---")

    if not input_path.exists():
        print(f"Error: No existe el archivo en {input_path}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Cargamos el Excel completo (todas las hojas) con Pandas y openpyxl
        with pd.ExcelFile(input_path, engine='openpyxl') as xls:
            
            # --- CUADRO 1 ---
            df1 = pd.read_excel(xls, sheet_name=CUADRO1_CONFIG["hoja"], header=None)
            c1_data = procesar_hoja(df1, CUADRO1_CONFIG)
            
            # Extraer periodo para el Cuadro 1
            fechas = [p["fecha"] for s in c1_data.values() for p in s if p["valor"] is not None]
            c1_final = {
                **c1_data,
                "periodoInicio": min(fechas) if fechas else "N/A",
                "periodoFin": max(fechas) if fechas else "N/A"
            }
            
            with open(output_dir / "ipi_cuadro1.json", "w", encoding="utf-8") as f:
                json.dump(c1_final, f, ensure_ascii=False, indent=2)
            print("✓ Cuadro 1 procesado.")

            # --- CUADRO 2 ---
            df2 = pd.read_excel(xls, sheet_name=CUADRO2_CONFIG["hoja"], header=None)
            c2_data = procesar_hoja(df2, CUADRO2_CONFIG)
            
            with open(output_dir / "ipi_cuadro2.json", "w", encoding="utf-8") as f:
                json.dump(c2_data, f, ensure_ascii=False, indent=2)
            print("✓ Cuadro 2 procesado.")

    except Exception as e:
        print(f"Error crítico: {e}")
        sys.exit(1)

    print("--- Proceso finalizado con éxito ---")

if __name__ == "__main__":
    main()
  
