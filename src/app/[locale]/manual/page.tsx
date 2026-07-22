import fs from 'fs';
import path from 'path';
import Link from 'next/link';

const SECTION_TITLES: Record<string, string> = {
  '1': 'Sección 1: Generalidades',
  '2': 'Sección 2: Limitaciones',
  '3': 'Sección 3: Procedimientos de Emergencia',
  '4': 'Sección 4: Procedimientos Normales',
  '5': 'Sección 5: Rendimiento (Performance)',
  '6': 'Sección 6: Peso y Balanceo',
  '7': 'Sección 7: Descripción de Sistemas'
};

export default async function ManualPage() {
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'rfm');
  const groups: Record<string, string[]> = {};
  
  try {
    const allFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    
    // Sort all files
    allFiles.sort((a, b) => {
      const matchA = a.match(/mod(\d+)_(\d+)_.*?_page(\d+)/);
      const matchB = b.match(/mod(\d+)_(\d+)_.*?_page(\d+)/);
      if (matchA && matchB) {
        const modA = parseInt(matchA[1], 10);
        const modB = parseInt(matchB[1], 10);
        if (modA !== modB) return modA - modB;
        
        const chapA = parseInt(matchA[2], 10);
        const chapB = parseInt(matchB[2], 10);
        if (chapA !== chapB) return chapA - chapB;
        
        const pageA = parseInt(matchA[3], 10);
        const pageB = parseInt(matchB[3], 10);
        return pageA - pageB;
      }
      return a.localeCompare(b);
    });

    // Group files by module
    allFiles.forEach(f => {
      const match = f.match(/mod(\d+)/);
      if (match) {
        const mod = match[1];
        if (!groups[mod]) groups[mod] = [];
        groups[mod].push(f);
      }
    });

  } catch (error) {
    console.error('Failed to load RFM images', error);
  }

  const sortedMods = Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6 sm:px-12">
      <main className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-xl rounded-2xl">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8 border-b pb-6 text-center">
          Manual de Operación (RFM) Completo
        </h1>
        
        <div className="bg-slate-100 p-6 rounded-xl mb-12 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Índice del Manual</h2>
          <ul className="space-y-2">
            {sortedMods.map(mod => (
              <li key={mod}>
                <a 
                  href={`#seccion-${mod}`} 
                  className="text-sky-700 hover:text-sky-900 font-medium hover:underline flex justify-between"
                >
                  <span>{SECTION_TITLES[mod] || `Sección ${mod}`}</span>
                  <span className="text-slate-500 text-sm">{groups[mod].length} páginas</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-16">
          {sortedMods.map(mod => (
            <div key={mod} id={`seccion-${mod}`} className="scroll-mt-8 text-center pt-8 border-t-4 border-slate-800">
              <h2 className="text-3xl font-bold text-slate-800 mb-8 bg-slate-100 py-4 px-6 inline-block rounded-full shadow-sm">
                {SECTION_TITLES[mod] || `Sección ${mod}`}
              </h2>
              <div className="space-y-12">
                {groups[mod].map((file, index) => (
                  <div key={file} className="my-12 relative">
                    <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-center opacity-50">
                      <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-sm rotate-180" style={{ writingMode: 'vertical-rl' }}>Pág. {index + 1}</span>
                    </div>
                    {index > 0 && <hr className="mb-12 border-slate-300 border-2 rounded" />}
                    <img 
                      src={`/images/rfm/${file}`} 
                      alt={`Manual Sección ${mod} - Página ${index + 1}`} 
                      className="w-full h-auto object-contain rounded-lg shadow-sm border border-slate-200" 
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {sortedMods.length === 0 && (
            <p className="text-red-500">No se encontraron imágenes del manual.</p>
          )}
        </div>
        
        {/* Fixed back to top button */}
        <div className="fixed bottom-8 right-8 z-50">
          <a href="#" className="bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-full shadow-lg transition-colors flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </a>
        </div>
      </main>
    </div>
  );
}
