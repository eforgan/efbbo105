import os
import re
import fitz

pdf_dir = r"c:\Users\SERVER-MADERO\Desktop\Output\cursoadptacionbo105bolkow\bo105-course\RFM BO-105"
out_dir = r"c:\Users\SERVER-MADERO\Desktop\Output\cursoadptacionbo105bolkow\bo105-course\src\data"

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

files = os.listdir(pdf_dir)
files.sort()

sections = {
    1: {"name": "General", "pattern": r"^\d+_1-\d+-"},
    2: {"name": "Limitations", "pattern": r"^\d+_2-\d+-"},
    3: {"name": "Emergency and Malfunction Procedures", "pattern": r"^\d+_3-\d+-"},
    4: {"name": "Normal Procedures", "pattern": r"^\d+_4-\d+-"},
    5: {"name": "Performance Data", "pattern": r"^\d+_5-\d+-"},
    6: {"name": "Mass and Balance", "pattern": r"^\d+_6-\d+-"},
    7: {"name": "System Description", "pattern": r"^\d+_7-\d+-"}
}

for sec_num, sec_info in sections.items():
    print(f"Extracting Section {sec_num}: {sec_info['name']}")
    sec_files = [f for f in files if re.match(sec_info["pattern"], f)]
    
    content = f"# Módulo {sec_num}: {sec_info['name']}\n\n"
    
    for f in sec_files:
        try:
            doc = fitz.open(os.path.join(pdf_dir, f))
            for page in doc:
                text = page.get_text()
                # Basic cleanup
                text = re.sub(r'FLIGHT MANUAL.*?LBA APPROVED', '', text, flags=re.DOTALL)
                text = re.sub(r'Rev\. \d+', '', text)
                content += text + "\n\n"
        except Exception as e:
            print(f"Error reading {f}: {e}")
            
    with open(os.path.join(out_dir, f"modulo-{sec_num}.md"), "w", encoding="utf-8") as out:
        out.write(content)

print("Extraction complete.")
