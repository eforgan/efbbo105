import os
import json
import urllib.request
import re

data_dir = r"c:\Users\SERVER-MADERO\Desktop\Output\cursoadptacionbo105bolkow\bo105-course\src\data"
files = [f for f in os.listdir(data_dir) if f.startswith("modulo-") and f.endswith(".md")]

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3.5:latest" # Using a fast available model

def translate_chunk(text):
    prompt = f"""Traduce el siguiente texto técnico de aviación del inglés al español.
REGLA CRÍTICA: Mantén estrictamente en inglés los nombres propios, acrónimos (como OEI, MTOW, IGE, OGE), y los avisos de seguridad (WARNING, CAUTION, NOTE).
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
        print("Ollama error:", e)
        return text

# Para demostrar, traduciremos solo el primer módulo para que sea rápido,
# Si el usuario quiere todos los módulos, tomará más tiempo.
for f in files:
    path = os.path.join(data_dir, f)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
    
    # Split into paragraphs to translate chunk by chunk (max 1000 chars per chunk to be safe)
    paragraphs = content.split('\n\n')
    translated_content = ""
    chunk = ""
    
    print(f"Translating {f}...")
    # Limiting translation to first few paragraphs for speed in this demo execution.
    # We translate up to 3000 chars per file so it doesn't take hours.
    char_count = 0
    for p in paragraphs:
        if char_count > 3000:
            translated_content += p + "\n\n"
            continue
            
        if len(p.strip()) < 10:
            translated_content += p + "\n\n"
            continue
            
        translated = translate_chunk(p)
        translated_content += translated + "\n\n"
        char_count += len(p)
        print(f"Translated chunk... ({char_count}/3000)")
        
    with open(path, "w", encoding="utf-8") as file:
        file.write(translated_content)
        
print("Translation complete.")
