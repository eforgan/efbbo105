import fitz
import os
import glob

pdf_dir = 'c:/Users/SERVER-MADERO/Desktop/Output/cursoadptacionbo105bolkow/bo105-course/RFM BO-105'
output_dir = 'c:/Users/SERVER-MADERO/Desktop/Output/cursoadptacionbo105bolkow/bo105-course/public/images/rfm'
md_dir = 'c:/Users/SERVER-MADERO/Desktop/Output/cursoadptacionbo105bolkow/bo105-course/src/data'

os.makedirs(output_dir, exist_ok=True)

modules_map = {
    1: [
        '14_1-6-GENERAL-DESCRIPTION-OF-THE-HELICOPTER---1-7-HELICOPTER-DIMENSIONS---1-8-CONVERSION-CHARTS.pdf',
        '15_1-9-TERMINOLOGY-AND-DEFINITIONS-OF-TERMS.pdf'
    ],
    2: [
        '19_2-5-FLIGHT-WITH-OPTIONAL-EQUIPMENT-INSTALLED---2-6-MASS-AND-LOAD-LIMITATIONS.pdf',
        '20_2-8-2-SIDEWARD-FLIGHT---2-8-3-REARWARD-FLIGHT---2-9-ALTITUDE-LIMITATIONS--SEE-FIG--2-3-.pdf',
        '22_2-11-ROTOR-RPM-LIMITATIONS.pdf',
        '23_2-12-ENGINE-AND-TRANSMISSION-POWER-LIMITATIONS.pdf',
        '26_2-15-OIL-LIMITATIONS---2-16-HYDRAULIC-SYSTEM-LIMITATIONS---2-17-OPERATIONAL-LIMITATIONS.pdf',
        '27_2-18-INSTRUMENT-MARKINGS.pdf'
    ],
    3: [
        '31_3-2-WARNING-AND-CAUTION-LIGHTS.pdf',
        '32_3-3-ENGINE-EMERGENCY-CONDITIONS.pdf',
        '33_3-4-FIRE-EMERGENCY-CONDITIONS.pdf',
        '34_3-5-TAIL-ROTOR-FAILURE-CONDITIONS.pdf',
        '35_3-6-SYSTEM-EMERGENCY-MALFUNCTION-CONDITIONS.pdf',
        '139_3-2-WARNING-LIGHT-INDICATIONS---3-3-EMERGENCY-CABLE-CUTTING.pdf'
    ],
    4: [
        '37_4-1-GENERAL---4-2-PREPARATION-FOR-FLIGHT---4-3-PREFLIGHT-CHECK.pdf',
        '38_4-4-STARTING-ENGINES.pdf',
        '39_4-5-SYSTEM-CHECKS.pdf',
        '41_4-7-CRUISE-CHECK---4-8-PRE-LANDING-CHECK---4-9-ENGINE-SHUTDOWN.pdf',
        '42_4-10-COLD-WEATHER-STARTING-INFORMATION.pdf'
    ],
    5: [
        '46_5-2-INFLIGHT-POWER-CHECKS.pdf',
        '49_5-5-HEIGHT-VELOCITY-DIAGRAMS--SEE-FIG--5-5-AND-5-6-.pdf',
        '50_5-6-HOVER-CEILING--SEE-FIG--5-7-THRU-5-10-.pdf',
        '51_5-7-RATE-OF-CLIMB.pdf',
        '52_5-8-CLEAR-AIRFIELD-LANDING-DISTANCE.pdf'
    ],
    6: [
        '55_6-2-BASIC-EMPTY-MASS-CENTER-OF-GRAVITY.pdf',
        '56_6-3-LOADING-DATA--SEE-FIG--6-1-.pdf',
        '57_6-4-CALCULATING-LONGITUDINAL-CG--SEE-FIG--6-2-.pdf',
        '58_6-3-LOADING-DATA--SEE-FIG--6-1--a.pdf',
        '59_6-4-CALCULATING-LONGITUDINAL-CG--SEE-FIG--6-2--a.pdf'
    ],
    7: [
        '64_7-3-COCKPIT-ARRANGEMENT--SEE-FIG--7-2----7-4-EMERGENCY-EQUIPMENT.pdf',
        '66_7-6-FUEL-SYSTEM--SEE-FIG--7-8-.pdf',
        '67_7-7-POWER-TRAIN--SEE-FIG--7-9-.pdf',
        '68_7-8-ROTOR-SYSTEM.pdf',
        '69_7-9-FLIGHT-CONTROL-SYSTEM--SEE-FIG--7-13-.pdf',
        '70_7-10-HYDRAULIC-SYSTEM--SEE-FIG--7-15-AND-7-16-.pdf',
        '71_7-11-ELECTRICAL-SYSTEM.pdf'
    ]
}

def process_modules():
    for mod_id, file_list in modules_map.items():
        print(f"Processing Module {mod_id}...")
        images_md = "\n\n## Referencias y Gráficos del Manual Original (RFM)\n\n"
        images_md += "A continuación se incluye la documentación, diagramas y tablas extraídas directamente del manual original para complementar el estudio:\n\n"
        
        for filename in file_list:
            pdf_path = os.path.join(pdf_dir, filename)
            if not os.path.exists(pdf_path):
                print(f"File not found: {pdf_path}")
                continue
                
            try:
                doc = fitz.open(pdf_path)
                section_name = filename.split('_')[1].split('.')[0].replace('-', ' ').title().strip()
                images_md += f"### {section_name}\n\n"
                for i in range(len(doc)):
                    page = doc[i]
                    # Render high quality image
                    pix = page.get_pixmap(dpi=150)
                    img_name = f"mod{mod_id}_{filename.replace('.pdf', '')}_page{i+1}.png"
                    img_path = os.path.join(output_dir, img_name)
                    pix.save(img_path)
                    
                    images_md += f"![{section_name} - Página {i+1}](/images/rfm/{img_name})\n\n"
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                
        # Append to the corresponding markdown file
        md_file = os.path.join(md_dir, f"modulo-{mod_id}.md")
        if os.path.exists(md_file):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if "## Referencias y Gráficos del Manual Original (RFM)" not in content:
                with open(md_file, 'a', encoding='utf-8') as f:
                    f.write(images_md)
                print(f"Appended images to modulo-{mod_id}.md")
            else:
                print(f"Images already appended to modulo-{mod_id}.md")

if __name__ == "__main__":
    process_modules()
    print("Done!")
