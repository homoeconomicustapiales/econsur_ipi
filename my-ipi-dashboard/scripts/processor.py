#!/usr/bin/env python3
import json
import argparse
import sys
import pandas as pd
from pathlib import Path
from datetime import datetime
from dateutil.relativedelta import relativedelta

# --- CONFIGURACIÓN ESTRICTA ---
# Usamos índices base 0 (Fila Excel - 1)
# Cuadro 1: Fila 9 -> índice 8
# Cuadro 2: Fila 7 -> índice 6
CONFIG = {
    "cuadro1": {
        "hoja": "Cuadro 1",
        "fila_inicio": 8,
        "series": {
            "nivelGeneral": 3,      # Columna D
            "desestacionalizada": 7, # Columna H
            "tendenciaCiclo": 10    # Columna K
        }
    },
    "cuadro2": {
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
            "muebles": 84                  # CG
        }
    }
}

def procesar(df, conf):
    resultado = {k: [] for k in conf["series"]}
    # GENERACIÓN CRONOLÓGICA FORZADA
    fecha_cursor = datetime(2016, 1, 1)
    
    # Empezamos exactamente en la fila indicada
    for i in range(conf["fila_inicio"], len(df)):
        fila = df.iloc[i]
        
        # Validamos si la celda tiene un número para seguir procesando
        val_test = fila.iloc[list(conf["series"].values())[0]]
        try:
            if pd.isna(val_test): break
            float(val_test)
        except: break

        fecha_str = fecha_cursor.strftime("%Y-%m")

        for nombre, col_idx in conf["series"].items():
            try:
                val = fila.iloc[col_idx]
                valor = round(float(val), 4) if pd.notna(val) else None
            except:
                valor = None
            resultado[nombre].append({"fecha": fecha_str, "valor": valor})
        
        fecha_cursor += relativedelta(months=1)
    
    return resultado, len(resultado[list(conf["series"].keys())[0]])

def main():
    parser = argparse.ArgumentParser()
    base_path = Path(__file__).parent.parent
    parser.add_argument("--input", default=base_path / "data" / "raw" / "ipi_man.xlsx")
    parser.add_argument("--output-dir", default=base_path / "data" / "processed")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"--- Procesando IPI (Desde Ene-2016) ---")

    try:
        with pd.ExcelFile(input_path, engine='openpyxl') as xls:
            # Cuadro 1
            df1 = pd.read_excel(xls, sheet_name=CONFIG["cuadro1"]["hoja"], header=None)
            data1, n1 = procesar(df1, CONFIG["cuadro1"])
            
            res1 = {**data1, "periodoInicio": "2016-01", 
                    "periodoFin": data1["nivelGeneral"][-1]["fecha"] if n1 > 0 else "N/A"}
            
            with open(output_dir / "ipi_cuadro1.json", "w", encoding="utf-8") as f:
                json.dump(res1, f, indent=2)
            print(f"Cuadro 1: {n1} meses.")

            # Cuadro 2
            df2 = pd.read_excel(xls, sheet_name=CONFIG["cuadro2"]["hoja"], header=None)
            data2, n2 = procesar(df2, CONFIG["cuadro2"])
            
            with open(output_dir / "ipi_cuadro2.json", "w", encoding="utf-8") as f:
                json.dump(data2, f, indent=2)
            print(f"Cuadro 2: {n2} meses.")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
    
    
