#!/usr/bin/env python3
import json
import argparse
import sys
import pandas as pd
from pathlib import Path
from datetime import datetime
from dateutil.relativedelta import relativedelta

# --- CONFIGURACIÓN DE COLUMNAS ---
# Basado en tu estructura: Columna D es índice 3
CUADRO1_CONFIG = {
    "hoja": "Cuadro 1",
    "columna_test": 3,  # Usamos Nivel General para saber si hay datos
    "series": {
        "nivelGeneral": 3,
        "desestacionalizada": 7,
        "tendenciaCiclo": 10,
    },
}

CUADRO2_CONFIG = {
    "hoja": "Cuadro 2",
    "columna_test": 3,  # Usamos IPI Manufacturero para saber si hay datos
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

def procesar_hoja(df, config):
    """
    Busca el bloque de datos y genera fechas desde Enero 2016.
    """
    resultado = {k: [] for k in config["series"]}
    fecha_actual = datetime(2016, 1, 1) # Inicio forzado
    encontro_bloque_datos = False
    conteo = 0

    for i in range(len(df)):
        fila = df.iloc[i]
        val_test = fila.iloc[config["columna_test"]]

        # Intentamos convertir el valor de prueba a float
        try:
            # Si el valor es nulo o no es un número real, lo ignoramos
            if pd.isna(val_test) or isinstance(val_test, str):
                if not encontro_bloque_datos:
                    continue # Seguimos buscando el inicio
                else:
                    # Si ya veníamos leyendo y encontramos algo no numérico,
                    # revisamos si es un salto pequeño o el fin de la tabla
                    if conteo > 10: # Si ya leímos mucho, es el fin
                        break
                    else:
                        continue
            
            valor_num = float(val_test)
            # El INDEC suele tener años como 2016, 2017 en las primeras filas.
            # Los números del IPI suelen ser cercanos a 100. 
            # Si el número es exactamente el año, lo saltamos.
            if not encontro_bloque_datos and (valor_num > 2000 and valor_num < 2030):
                continue

            encontro_bloque_datos = True
        except (ValueError, TypeError):
            if not encontro_bloque_datos:
                continue
            else:
                break

        # Si llegamos aquí, tenemos un dato válido y estamos en el bloque
        fecha_str = fecha_actual.strftime("%Y-%m")

        for nombre_serie, col_idx in config["series"].items():
            try:
                val = fila.iloc[col_idx]
                # Limpieza de datos: manejar errores de texto en celdas numéricas
                valor = round(float(val), 4) if pd.notna(val) else None
            except:
                valor = None
            
            resultado[nombre_serie].append({"fecha": fecha_str, "valor": valor})
        
        fecha_actual += relativedelta(months=1)
        conteo += 1
    
    print(f"  -> Bloque detectado. Procesados {conteo} meses desde 2016-01.")
    return resultado

def main():
    parser = argparse.ArgumentParser()
    base_path = Path(__file__).parent.parent
    parser.add_argument("--input", default=base_path / "data" / "raw" / "ipi_man.xlsx")
    parser.add_argument("--output-dir", default=base_path / "data" / "processed")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)

    print(f"\n--- PROCESADOR IPI (FIX: START JAN 2016) ---")

    if not input_path.exists():
        print(f"ERROR: No existe {input_path}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Usamos openpyxl para leer el archivo Excel
        with pd.ExcelFile(input_path, engine='openpyxl') as xls:
            
            # --- CUADRO 1 ---
            print(f"\nAnalizando {CUADRO1_CONFIG['hoja']}...")
            df1 = pd.read_excel(xls, sheet_name=CUADRO1_CONFIG["hoja"], header=None)
            c1_data = procesar_hoja(df1, CUADRO1_CONFIG)
            
            fechas = [p["fecha"] for s in c1_data.values() for p in s if p["valor"] is not None]
            c1_final = {
                **c1_data,
                "periodoInicio": "2016-01",
                "periodoFin": max(fechas) if fechas else "N/A"
            }
            
            with open(output_dir / "ipi_cuadro1.json", "w", encoding="utf-8") as f:
                json.dump(c1_final, f, ensure_ascii=False, indent=2)

            # --- CUADRO 2 ---
            print(f"\nAnalizando {CUADRO2_CONFIG['hoja']}...")
            df2 = pd.read_excel(xls, sheet_name=CUADRO2_CONFIG["hoja"], header=None)
            c2_data = procesar_hoja(df2, CUADRO2_CONFIG)
            
            with open(output_dir / "ipi_cuadro2.json", "w", encoding="utf-8") as f:
                json.dump(c2_data, f, ensure_ascii=False, indent=2)

    except Exception as e:
        print(f"ERROR CRÍTICO: {e}")
        sys.exit(1)

    print(f"\n--- PROCESO FINALIZADO ---")

if __name__ == "__main__":
    main()
    
