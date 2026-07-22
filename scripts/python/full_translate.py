import os
import json
import urllib.request
import re
import sys
import time

data_dir = r"c:\Users\SERVER-MADERO\Desktop\Output\cursoadptacionbo105bolkow\bo105-course\src\data"
files = [f for f in os.listdir(data_dir) if f.startswith("modulo-") and f.endswith(".md")]
files.sort()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3.5:latest" 

def translate_chunk(text):
    if len(text.strip()) < 5:
        return text
    
    prompt = f"""Actúa como un traductor experto en manuales de vuelo aeronáuticos. 
Traduce el siguiente fragmento del 'Rotorcraft Flight Manual' del BO105 CBS4 del inglés al español.
REGLA CRÍTICA: Mantén estrictamente en inglés los nombres propios, acrónimos (como OEI, MTOW, IGE, OGE, TOT, N1, N2, NR), y los avisos de seguridad (WARNING, CAUTION, NOTE). No resumas el texto, traduce todo el contenido respetando el formato de Markdown (encabezados, listas).
Solo devuelve la traducción, sin comentarios adicionales.

TEXTO:
{text}
"""
    data = json.dumps({"model": MODEL, "prompt": prompt, "stream": False}).encode("utf-8")
    req = urllib.request.Request(OLLAMA_URL, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result.get("response", text)
    except Exception as e:
        print(f"Ollama error: {e}")
        time.sleep(2) # Backoff
        return text

print("Comenzando traducción exhaustiva de todos los módulos...")
print(f"Modelo: {MODEL}")

for f in files:
    path = os.path.join(data_dir, f)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
    
    # Limpieza previa
    content = re.sub(r'\.{4,}', ' ', content)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Dividir por párrafos/secciones dobles
    chunks = content.split('\n\n')
    translated_content = ""
    
    print(f"\n[{f}] Iniciando traducción (Total fragmentos: {len(chunks)})")
    
    for i, chunk in enumerate(chunks):
        if not chunk.strip():
            translated_content += "\n\n"
            continue
            
        sys.stdout.write(f"\rTraduciendo fragmento {i+1}/{len(chunks)}...")
        sys.stdout.flush()
        
        translated = translate_chunk(chunk)
        translated_content += translated.strip() + "\n\n"
        
    print(f"\n[{f}] Traducción completada. Guardando...")
    with open(path, "w", encoding="utf-8") as file:
        file.write(translated_content)
        
print("\n¡Proceso de traducción MASIVO finalizado con éxito!")
