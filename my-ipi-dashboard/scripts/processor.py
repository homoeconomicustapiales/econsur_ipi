#!/usr/bin/env python3
import json
import argparse
import sys
import pandas as pd
from pathlib import Path
from datetime import datetime

# --- CONFIGURACIÓN DE COLUMNAS (Índices Base 0: A=0, B=1, C=2, D=3...) ---
CUADRO1_CONFIG = {
    "hoja": "Cuadro 1",
    "columna_fecha": 0,        # Columna A
    "series": {
        "nivelGeneral": 3,      # Columna D
        "desestacionalizada": 7, # Columna H
        "tendenciaCiclo": 10,   # Columna K
    },
}

CUADRO2_CONFIG = {
    "hoja": "Cuadro 2",
    "columna_fecha": 0,        # Columna A
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

def parse_fecha(valor):
    """Convierte celdas de fecha (u objetos) al formato YYYY-MM."""
    if pd.isna(valor) or valor is None:
        return None
    
    # Si es un objeto de fecha nativo de Excel/Pandas
    if isinstance(valor, (datetime, pd.Timestamp)): 
        return valor.strftime("%Y-%m")
    
    # Si es texto (ej: "2024-01-01" o "01/01/2024")
    val_str = str(valor).strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%m/%Y", "%Y-%m"):
        try: 
            return datetime.strptime(val_str, fmt).strftime("%Y-%m")
        except: 
            continue
            
    # Intento para formatos de texto en español (Ene-24, etc.)
    meses = {
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
    }
    val_lower = val_str.lower()
    for mes_nom, mes_num in meses.items():
        if mes_nom in val_lower:
            import re
            anio_match = re.search(r'(\d{2,4})', val_lower)
            if anio_match:
                anio = anio_match.group(1)
                if len(anio) == 2: anio = "20" + anio
                return f"{anio}-{mes_num}"
                
    return None

def procesar_hoja(df, config):
    """Escanea la hoja buscando el inicio de los datos y extrae las series."""
    resultado = {k: [] for k in config["series"]}
    col_fecha = config["columna_fecha"]
    encontro_datos = False
    conteo = 0

    for i in range(len(df)):
        fila = df.iloc[i]
        fecha = parse_fecha(fila.iloc[col_fecha])

        # Si no hemos encontrado el inicio, seguimos buscando una fecha válida
        if not encontro_datos:
            if fecha:
                encontro_datos = True
                print(f"  -> Datos detectados en fila {i+1}. Fecha inicio: {fecha}")
            else:
                continue

        # Si ya estábamos en la tabla y aparece una celda de fecha vacía, terminamos
        if not fecha:
            break

        # Extraer valores para cada serie configurada
        for nombre_serie, col_idx in config["series"].items():
            try:
                val = fila.iloc[col_idx]
                # Convierte a float. Si es NaN o texto no numérico, pone None
                valor = round(float(val), 4) if pd.notna(val) and not isinstance(val, str) else float(val)
            except:
                try:
                    valor = float(val) if pd.notna(val) else None
                except:
                    valor = None
            
            resultado[nombre_serie].append({"fecha": fecha, "valor": valor})
        
        conteo += 1
    
    print(f"  -> Éxito: {conteo} meses procesados.")
    return resultado

def main():
    parser = argparse.ArgumentParser()
    base_path = Path(__file__).parent.parent
    parser.add_argument("--input", default=base_path / "data" / "raw" / "ipi_man.xlsx")
    parser.add_argument("--output-dir", default=base_path / "data" / "processed")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)

    print(f"\n--- PROCESADOR IPI MANUFACTURERO ---")
    print(f"Archivo de entrada: {input_path}")

    if not input_path.exists():
        print(f"ERROR: No se encontró el archivo {input_path}")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        with pd.ExcelFile(input_path, engine='openpyxl') as xls:
            
            # PROCESAR CUADRO 1
            print(f"\nProcesando {CUADRO1_CONFIG['hoja']}...")
            df1 = pd.read_excel(xls, sheet_name=CUADRO1_CONFIG["hoja"], header=None)
            c1_data = procesar_hoja(df1, CUADRO1_CONFIG)
            
            # Obtener rango de fechas para el encabezado del JSON
            todas_fechas = [p["fecha"] for s in c1_data.values() for p in s if p["valor"] is not None]
            c1_final = {
                **c1_data,
                "periodoInicio": min(todas_fechas) if todas_fechas else "N/A",
                "periodoFin": max(todas_fechas) if todas_fechas else "N/A"
            }
            
            with open(output_dir / "ipi_cuadro1.json", "w", encoding="utf-8") as f:
                json.dump(c1_final, f, ensure_ascii=False, indent=2)
            print(f"Archivo generado: ipi_cuadro1.json")

            # PROCESAR CUADRO 2
            print(f"\nProcesando {CUADRO2_CONFIG['hoja']}...")
            df2 = pd.read_excel(xls, sheet_name=CUADRO2_CONFIG["hoja"], header=None)
            c2_data = procesar_hoja(df2, CUADRO2_CONFIG)
            
            with open(output_dir / "ipi_cuadro2.json", "w", encoding="utf-8") as f:
                json.dump(c2_data, f, ensure_ascii=False, indent=2)
            print(f"Archivo generado: ipi_cuadro2.json")

    except Exception as e:
        print(f"\nERROR CRÍTICO: {e}")
        sys.exit(1)

    print(f"\n--- PROCESO COMPLETADO CON ÉXITO ---")

if __name__ == "__main__":
    main()
    
    
