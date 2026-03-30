#!/usr/bin/env python3
import json
import argparse
import sys
import pandas as pd
from pathlib import Path
from datetime import datetime
from dateutil.relativedelta import relativedelta

# --- CONFIGURACIÓN ESTRICTA ---
# fila_inicio: Es el índice de Pandas (Fila Excel - 1)
# Cuadro 1: Fila 9 -> índice 8
# Cuadro 2: Fila 7 -> índice 6
CUADRO1_CONFIG = {
    "hoja": "Cuadro 1",
    "fila_inicio": 8, 
    "series": {
        "nivelGeneral": 3,      # Columna D
        "desestacionalizada": 7, # Columna H
        "tendenciaCiclo": 10,   # Columna K
    },
}

CUADRO2_CONFIG = {
    "hoja": "Cuadro 2",
    "fila_inicio": 6,
    "series": {
        "ipiManufacturero": 3,         # D
        "alimentosBebidas": 4,         # E
        "tabaco": 18,                  # S
        "textiles": 21,                # V
        "prendasCueroCalzado": 26,     # AA
        "maderaPapel": 30,             # AE
        "petroleo": 34,                # AI
        "quimicos": 40,                # AO
        "cauchoPlastico": 49,          # AX
        "mineralesNoMetalicos": 53,    # BB
        "metalicasBasicas": 60,        # BI
        "productosMetal": 64,          # BM
        "maquinariaEquipo": 68,        # BQ
        "otrosEquipos": 73,            # BV
        "vehiculosAutomotores": 77,    # BZ
        "otroTransporte": 81,          # CD
        "muebles": 84,                 # CG
    },
}

def procesar_hoja(df, config):
    """
    Ignora las fechas del Excel. Genera cronología desde Enero 2016 
    empezando en la fila exacta definida.
    """
    resultado = {k: [] for k in config["series"]}
    fecha_cursor = datetime(2016, 1, 1) # Inicio obligatorio
    fila_actual = config["fila_inicio"]
    conteo = 0

    # Iteramos desde la fila de inicio hasta el final del dataframe
    for i in range(fila_actual, len(df)):
        fila = df.iloc[i]
        
        # Verificamos si la celda de la primera serie tiene un número
        # Si está vacía o no es un número, asumimos que terminó la tabla
        val_test = fila.iloc[list(config["series"].values())[0]]
        
        try:
            if pd.isna(val_test):
                break
            float(val_test) # Validamos que sea numérico
        except (ValueError, TypeError):
            break

        fecha_str = fecha_cursor.strftime("%Y-%m")

        # Extraemos los datos de las columnas configuradas
        for nombre_serie, col_idx in config["series"].items():
            try:
                val = fila.iloc[col_idx]
                valor = round(float(val), 4) if pd.notna(val) else None
            except:
                valor = None
            
            resultado[nombre_serie].append({"fecha": fecha_str, "valor": valor})
        
        # Incrementamos un mes y pasamos a la siguiente fila
        fecha_cursor += relativedelta(months=1)
        conteo += 1
    
    return resultado, conteo

def main():
    parser = argparse.ArgumentParser()
    base_path = Path(__file__).parent.parent
    parser.add_argument("--input", default=base_path / "data" / "raw" / "ipi_man.xlsx")
    parser.add_argument("--output-dir", default=base_path / "data" / "processed")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)

    print(f"\n--- PROCESAMIENTO IPI (INICIO ENE-2016) ---")

    if not input_path.exists():
        print(f"ERROR: No se encuentra {input_path}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        with pd.ExcelFile(input_path, engine='openpyxl') as xls:
            
            # --- CUADRO 1 ---
            print(f"Procesando {CUADRO1_CONFIG['hoja']} (desde fila 9)...")
            df1 = pd.read_excel(xls, sheet_name=CUADRO1_CONFIG["hoja"], header=None)
            data1, n1 = procesar_hoja(df1, CUADRO1_CONFIG)
            
            c1_final = {
                **data1,
                "periodoInicio": "2016-01",
                "periodoFin": (datetime(2016,1,1) + relativedelta(months=n1-1)).strftime("%Y-%m") if n1 > 0 else "N/A"
            }
            
            with open(output_dir / "ipi_cuadro1.json", "w", encoding="utf-8") as f:
                json.dump(c1_final, f, ensure_ascii=False, indent=2)
            print(f"  -> OK: {n1} meses generados.")

            # --- CUADRO 2 ---
            print(f"Procesando {CUADRO2_CONFIG['hoja']} (desde fila 7)...")
            df2 = pd.read_excel(xls, sheet_name=CUADRO2_CONFIG["hoja"], header=None)
            data2, n2 = procesar_hoja(df2, CUADRO2_CONFIG)
            
            with open(output_dir / "ipi_cuadro2.json", "w", encoding="utf-8") as f:
                json.dump(data2, f, ensure_ascii=False, indent=2)
            print(f"  -> OK: {n2} meses generados.")

    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    print(f"--- PROCESO FINALIZADO ---")

if __name__ == "__main__":
    main()
    
