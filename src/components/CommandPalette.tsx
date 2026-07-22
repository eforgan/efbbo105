'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, Settings, CheckSquare, Activity, TrendingUp, AlertTriangle, Layers, Bell, Brain, Award } from 'lucide-react';

import { qrhDatabase } from '@/data/qrh';

type SearchResult = {
  id: string;
  title: string;
  type: string;
  href: string;
  icon: any;
};

const baseSearchData: SearchResult[] = [
  { id: '1', title: 'Índice del Curso', type: 'Página', href: '/', icon: BookOpen },
  { id: '2', title: 'Manual de Operación', type: 'Manual', href: '/manual', icon: Settings },
  { id: '3', title: 'Listas de Chequeo (QRH)', type: 'Herramienta', href: '/checklists', icon: CheckSquare },
  { id: '4', title: 'Peso y Balanceo', type: 'Herramienta', href: '/herramientas/peso-balanceo', icon: Activity },
  { id: '5', title: 'Performance', type: 'Herramienta', href: '/herramientas/performance', icon: TrendingUp },
  { id: '6', title: 'Curvas H-V', type: 'Herramienta', href: '/herramientas/curvas-hv', icon: AlertTriangle },
  { id: '7', title: 'Viento Cruzado', type: 'Herramienta', href: '/herramientas/viento-cruzado', icon: Search },
  { id: '8', title: 'Combustible y Alcance', type: 'Herramienta', href: '/herramientas/combustible', icon: Search },
  { id: '9', title: 'Sistemas Interactivos', type: 'Módulo', href: '/sistemas', icon: Layers },
  { id: '10', title: 'Simulador de Emergencias', type: 'Simulador', href: '/simulador-emergencias', icon: Bell },
  { id: '11', title: 'Flashcards (Memory Items)', type: 'Estudio', href: '/flashcards', icon: Brain },
  { id: '12', title: 'Examen Final', type: 'Examen', href: '/examen', icon: Award },
  { id: '13', title: 'Inspección 3D (Pre-Vuelo)', type: 'Herramienta', href: '/herramientas/inspeccion-3d', icon: Settings },
];

const searchData: SearchResult[] = [
  ...baseSearchData,
  ...qrhDatabase.map((checklist) => ({
    id: `qrh-${checklist.id}`,
    title: checklist.title,
    type: checklist.category === 'emergency' ? 'Emergencia (QRH)' : 'Procedimiento Normal',
    href: `/checklists#${checklist.id}`, // Anchor link to specific checklist
    icon: checklist.category === 'emergency' ? AlertTriangle : CheckSquare,
  })),
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredResults = query === '' 
    ? searchData 
    : searchData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.type.toLowerCase().includes(query.toLowerCase())
      );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter' && filteredResults.length > 0) {
      e.preventDefault();
      router.push(filteredResults[selectedIndex].href);
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="text-slate-400 mr-3" size={24} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-white placeholder-slate-400"
            placeholder="Buscar manuales, herramientas, simuladores..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">ESC</div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          ) : (
            filteredResults.map((result, index) => {
              const Icon = result.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={result.id}
                  onClick={() => {
                    router.push(result.href);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`mr-4 ${isSelected ? 'text-sky-500' : 'text-slate-400'}`} size={20} />
                  <div className="flex-1">
                    <div className={`font-bold ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {result.title}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isSelected ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {result.type}
                  </span>
                </div>
              );
            })
          )}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">↑</kbd>
              <kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">↓</kbd>
              para navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">↵</kbd>
              para seleccionar
            </span>
          </div>
          <div>BO105 CBS4</div>
        </div>
      </div>
    </div>
  );
}
