import os
import re

data_dir = r"c:\Users\SERVER-MADERO\Desktop\Output\cursoadptacionbo105bolkow\bo105-course\src\data"
files = [f for f in os.listdir(data_dir) if f.startswith("modulo-") and f.endswith(".md")]

for f in files:
    path = os.path.join(data_dir, f)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
    
    # Remove dotted lines (4 or more dots)
    content = re.sub(r'\.{4,}', ' ', content)
    
    # Remove excessive blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    with open(path, "w", encoding="utf-8") as file:
        file.write(content)
        
print("Cleaned up dots in all modules.")
