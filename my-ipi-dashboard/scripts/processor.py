#!/usr/bin/env python3
import json
import argparse
import sys
import pandas as pd
from pathlib import Path
from datetime import datetime

# --- CONFIGURACIÓN ACTUALIZADA ---
CUADRO1_CONFIG = {
    "hoja": "Cuadro 1",
    "fila_inicio": 9,           # Ajustado a 9 para saltar encabezados del INDEC
    "columna_fecha": 0,
    "series": {
        "nivelGeneral": 3,      # Columna D
        "desestacionalizada": 7, # Columna H
        "tendenciaCiclo": 10,   # Columna K
    },
}

CUADRO2_CONFIG = {
    "hoja": "Cuadro 2",
    "fila_inicio": 7,           # Ajustado a 7
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
    if pd.isna(valor) or valor is None: return None
    
    # Si ya es un objeto datetime de pandas/excel
    if isinstance(valor, (datetime, pd.Timestamp)): 
        return valor.strftime("%Y-%m")
    
    # Si viene como texto
    val_str = str(valor).strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%m/%Y", "%Y-%m"):
        try: 
            return datetime.strptime(val_str, fmt).strftime("%Y-%m")
        except: 
            continue
    return None

def procesar_hoja(df, config):
    resultado = {k: [] for k in config["series"]}
    fila_inicio = config["fila_inicio"]
    col_fecha = config["columna_fecha"]

    filas_con_exito = 0

    for i in range(fila_inicio, len(df)):
        fila = df.iloc[i]
        
        # Leemos la celda de fecha
        fecha_raw = fila.iloc[col_fecha]
        fecha = parse_fecha(fecha_raw)
        
        # Si no hay fecha válida, probablemente llegamos al final de la tabla
        if not fecha:
            continue 

        for nombre_serie, col_idx in config["series"].items():
            val = fila.iloc[col_idx]
            try:
                # Intentamos convertir a float, si falla (por texto o NaN) es None
                valor = round(float(val), 4) if pd.notna(val) else None
            except:
                valor = None
                
            resultado[nombre_serie].append({"fecha": fecha, "valor": valor})
        
        filas_con_exito += 1
    
    print(f"  -> Se procesaron {filas_con_exito} meses de datos.")
    return resultado

def main():
    parser = argparse.ArgumentParser()
    base_path = Path(__file__).parent.parent
    parser.add_argument("--input", default=base_path / "data" / "raw" / "ipi_man.xlsx")
    parser.add_argument("--output-dir", default=base_path / "data" / "processed")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)

    print(f"\n--- Iniciando Procesamiento: {input_path.name} ---")

    if not input_path.exists():
        print(f"Error: No se encontró el archivo en {input_path}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        with pd.ExcelFile(input_path, engine='openpyxl') as xls:
            
            # --- CUADRO 1 ---
            print(f"Leyendo {CUADRO1_CONFIG['hoja']}...")
            df1 = pd.read_excel(xls, sheet_name=CUADRO1_CONFIG["hoja"], header=None)
            c1_data = procesar_hoja(df1, CUADRO1_CONFIG)
            
            # Validar si se obtuvieron datos
            fechas = [p["fecha"] for s in c1_data.values() for p in s if p["valor"] is not None]
            
            if not fechas:
                print("¡ALERTA!: No se encontraron datos válidos en el Cuadro 1. Revisa las filas de inicio.")
            
            c1_final = {
                **c1_data,
                "periodoInicio": min(fechas) if fechas else "N/A",
                "periodoFin": max(fechas) if fechas else "N/A"
            }
            
            with open(output_dir / "ipi_cuadro1.json", "w", encoding="utf-8") as f:
                json.dump(c1_final, f, ensure_ascii=False, indent=2)

            # --- CUADRO 2 ---
            print(f"Leyendo {CUADRO2_CONFIG['hoja']}...")
            df2 = pd.read_excel(xls, sheet_name=CUADRO2_CONFIG["hoja"], header=None)
            c2_data = procesar_hoja(df2, CUADRO2_CONFIG)
            
            with open(output_dir / "ipi_cuadro2.json", "w", encoding="utf-8") as f:
                json.dump(c2_data, f, ensure_ascii=False, indent=2)

    except Exception as e:
        print(f"Error crítico durante el procesamiento: {e}")
        sys.exit(1)

    print("--- Proceso finalizado con éxito ---\n")

if __name__ == "__main__":
    main()
    
