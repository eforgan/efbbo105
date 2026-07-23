'use client';

import React from 'react';
import { ChecklistCategory } from '../../types/efb';
import { MODENA_CHECKLISTS } from '../../data/modenaChecklists';
import { CheckSquare, AlertTriangle, ShieldCheck, RotateCcw, Volume2, VolumeX, Search } from 'lucide-react';

export const ChecklistsModule: React.FC = () => {
  const [categories, setCategories] = React.useState<ChecklistCategory[]>(MODENA_CHECKLISTS);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'normal' | 'modena' | 'emergency'>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [isCopilotActive, setIsCopilotActive] = React.useState<boolean>(false);

  const toggleItem = (catId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const updatedItems = cat.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item);
      return { ...cat, items: updatedItems };
    }));

    if (isCopilotActive && 'speechSynthesis' in window) {
      const cat = categories.find(c => c.id === catId);
      const item = cat?.items.find(i => i.id === itemId);
      if (item && item.response) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(`${item.title}... ${item.response}`);
        u.lang = 'es-ES';
        window.speechSynthesis.speak(u);
      }
    }
  };

  const resetCategory = (catId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => ({ ...item, completed: false }))
      };
    }));
  };

  const resetAll = () => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => ({ ...item, completed: false }))
    })));
  };

  const toggleCopilot = () => {
    const nextState = !isCopilotActive;
    setIsCopilotActive(nextState);
    if (!nextState && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const filteredCategories = categories.filter(cat => {
    if (activeFilter !== 'all' && cat.categoryType !== activeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = cat.title.toLowerCase().includes(q);
      const matchItems = cat.items.some(i => i.title.toLowerCase().includes(q) || (i.detail && i.detail.toLowerCase().includes(q)));
      return matchTitle || matchItems;
    }
    return true;
  });

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = categories.reduce((sum, c) => sum + c.items.filter(i => i.completed).length, 0);
  const isAllComplete = completedItems === totalItems;

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Go / No-Go Banner Status */}
      <div className={`p-4 rounded-xl border font-mono flex flex-wrap items-center justify-between gap-4 ${
        isAllComplete ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          {isAllComplete ? <ShieldCheck className="w-8 h-8 text-emerald-400" /> : <CheckSquare className="w-8 h-8 text-cyan-400" />}
          <div>
            <h2 className="text-base font-bold">LISTAS DE CHEQUEO INTERACTIVAS & QRH MODENA AIR SERVICE</h2>
            <p className="text-xs text-slate-400">
              Procedimientos Normales, Operaciones por Base (Vista, UTV, SAME, YPF) & Emergencias QRH
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleCopilot}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition cursor-pointer ${
              isCopilotActive
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isCopilotActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isCopilotActive ? 'Copiloto de Voz ACTIVO' : 'Activar Copiloto de Voz'}
          </button>

          <button
            onClick={resetAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-mono text-xs rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Todo
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-3 rounded-xl border border-slate-800 font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-400 mr-2">Categoría:</span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({categories.length})
          </button>
          <button
            onClick={() => setActiveFilter('normal')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeFilter === 'normal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Normales
          </button>
          <button
            onClick={() => setActiveFilter('modena')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeFilter === 'modena' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bases HEMS Modena
          </button>
          <button
            onClick={() => setActiveFilter('emergency')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeFilter === 'emergency' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Emergencias QRH
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar procedimiento..."
            className="bg-slate-900 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-700 outline-none w-48 focus:w-64 transition-all"
          />
        </div>
      </div>

      {/* Checklists Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {filteredCategories.map((cat) => {
          const catCompleted = cat.items.filter(i => i.completed).length;
          const isFinished = catCompleted === cat.items.length;
          const isEmergency = cat.categoryType === 'emergency';

          return (
            <div key={cat.id} className={`glass-card p-4 rounded-xl border space-y-3 ${
              isEmergency ? 'border-rose-900/60 bg-rose-950/10' : 'border-slate-800'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  {isEmergency ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                  ) : (
                    <CheckSquare className={`w-4 h-4 ${isFinished ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  )}
                  {cat.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    isFinished
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isEmergency
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {catCompleted} / {cat.items.length}
                  </span>
                  <button
                    onClick={() => resetCategory(cat.id)}
                    className="p-1 text-slate-500 hover:text-slate-300 transition"
                    title="Reiniciar lista"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {cat.items.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => toggleItem(cat.id, item.id)}
                    className={`p-2.5 rounded-lg border flex items-start justify-between space-x-3 cursor-pointer transition ${
                      item.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold leading-tight">{item.title}</p>
                        {item.detail && <p className="text-[10px] text-slate-400 leading-normal">{item.detail}</p>}
                      </div>
                    </div>

                    {item.response && (
                      <span className={`text-[10px] px-2 py-1 rounded font-bold shrink-0 ${
                        item.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                      }`}>
                        {item.response}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
