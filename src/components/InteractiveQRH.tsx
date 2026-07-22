"use client";

import { useState, useEffect } from 'react';
import { qrhDatabase } from '@/data/qrh';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import { useTranslations } from 'next-intl';

export default function InteractiveQRH() {
  const [activeCategory, setActiveCategory] = useState<'normal' | 'emergency'>('normal');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isCopilotActive, setIsCopilotActive] = useState(false);
  const t = useTranslations('QRH');
  
  // Timing metrics
  const [startTime, setStartTime] = useState<number | null>(null);
  const { recordEmergencyMetric } = useProgress();

  const filteredLists = qrhDatabase.filter(list => list.category === activeCategory);
  const activeList = qrhDatabase.find(list => list.id === selectedListId);

  // Auto-select first list when changing categories
  if (!activeList || activeList.category !== activeCategory) {
    if (filteredLists.length > 0) {
      setSelectedListId(filteredLists[0].id);
      setStartTime(Date.now());
      setCheckedItems({});
    }
  }

  // Effect to reset timer when manually selecting a different list
  useEffect(() => {
    setStartTime(Date.now());
    setCheckedItems({});
    setIsCopilotActive(false);
    window.speechSynthesis?.cancel();
  }, [selectedListId]);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // We can change this to en-US if bilingual later
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleItem = (id: string) => {
    const isNowChecked = !checkedItems[id];
    setCheckedItems(prev => ({ ...prev, [id]: isNowChecked }));

    if (isCopilotActive && isNowChecked && activeList) {
      // Find the next unchecked action item after this one
      const actionItems = activeList.items.filter(i => i.type === 'action');
      const currentIndex = actionItems.findIndex(i => i.id === id);
      const nextItem = actionItems.slice(currentIndex + 1).find(i => !checkedItems[i.id] && i.id !== id);
      
      if (nextItem) {
        speak(`${nextItem.task}... ${nextItem.response}`);
      } else {
        speak("Lista completada.");
        setIsCopilotActive(false);
      }
    }
  };

  const startCopilot = () => {
    if (!activeList) return;
    const isStarting = !isCopilotActive;
    setIsCopilotActive(isStarting);
    
    if (isStarting) {
      const actionItems = activeList.items.filter(i => i.type === 'action');
      const nextItem = actionItems.find(i => !checkedItems[i.id]);
      if (nextItem) {
        speak(`Iniciando lista ${activeList.title}. ${nextItem.task}... ${nextItem.response}`);
      } else {
        speak("La lista ya está completada.");
        setIsCopilotActive(false);
      }
    } else {
      window.speechSynthesis.cancel();
    }
  };

  const resetCurrentList = () => {
    if (!activeList) return;
    const newChecked = { ...checkedItems };
    activeList.items.forEach(item => {
      if (item.type === 'action') {
        newChecked[item.id] = false;
      }
    });
    setCheckedItems(newChecked);
    setIsCopilotActive(false);
    window.speechSynthesis.cancel();
  };

  const getActionProgress = () => {
    if (!activeList) return 0;
    const actionItems = activeList.items.filter(i => i.type === 'action');
    if (actionItems.length === 0) return 100;
    const completed = actionItems.filter(i => checkedItems[i.id]).length;
    return Math.round((completed / actionItems.length) * 100);
  };

  const progress = getActionProgress();
  const isComplete = progress === 100;

  // Record metrics when completed
  useEffect(() => {
    if (isComplete && activeList && activeCategory === 'emergency' && startTime) {
      const timeSpentMs = Date.now() - startTime;
      recordEmergencyMetric({
        id: activeList.id,
        timeSpentMs,
        success: true,
        timestamp: Date.now()
      });
    }
  }, [isComplete, activeList, activeCategory, startTime, recordEmergencyMetric]);

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[800px] border border-slate-200 rounded-2xl overflow-hidden shadow-2xl bg-white">
      {/* Sidebar de navegación QRH */}
      <div className="w-full md:w-80 bg-slate-100 flex flex-col border-r border-slate-200">
        <div className="flex bg-slate-800 text-white p-2">
          <button
            onClick={() => setActiveCategory('normal')}
            className={`flex-1 py-3 px-2 text-sm font-bold text-center transition-colors rounded ${activeCategory === 'normal' ? 'bg-green-600 shadow-inner' : 'hover:bg-slate-700'}`}
          >
            {t('normal')}
          </button>
          <button
            onClick={() => setActiveCategory('emergency')}
            className={`flex-1 py-3 px-2 text-sm font-bold text-center transition-colors rounded ${activeCategory === 'emergency' ? 'bg-red-600 shadow-inner' : 'hover:bg-slate-700'}`}
          >
            {t('emergency')}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredLists.map(list => {
            // Calcular completitud individual en el menu
            const listActions = list.items.filter(i => i.type === 'action');
            const listCompleted = listActions.every(i => checkedItems[i.id]);

            return (
              <button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  selectedListId === list.id 
                    ? (activeCategory === 'normal' ? 'bg-green-100 border-green-500 border text-green-900' : 'bg-red-100 border-red-500 border text-red-900') 
                    : 'bg-white border border-slate-200 hover:border-sky-300 text-slate-700 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{list.title}</span>
                  {listCompleted && listActions.length > 0 && <CheckCircle size={16} className={activeCategory === 'normal' ? 'text-green-600' : 'text-red-600'} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel principal de la lista */}
      <div className="flex-1 bg-white flex flex-col">
        {activeList ? (
          <>
            <div className={`p-6 border-b-4 ${activeCategory === 'normal' ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className={`text-2xl font-bold ${activeCategory === 'normal' ? 'text-green-900' : 'text-red-900'}`}>
                    {activeList.title}
                  </h2>
                  <p className="text-sm opacity-75 mt-1 font-mono uppercase tracking-wider text-slate-600">
                    {activeCategory === 'normal' ? t('normal_proc') : t('emergency_proc')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={startCopilot}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                      isCopilotActive 
                        ? 'bg-sky-100 text-sky-700 border border-sky-300 animate-pulse' 
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {isCopilotActive ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    {isCopilotActive ? t('mute_copilot') : t('virtual_copilot')}
                  </button>
                  <button
                    onClick={resetCurrentList}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-sm border border-slate-300 transition-colors"
                  >
                    {t('reset_list')}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 transition-all duration-500 ease-out ${
                    isComplete 
                      ? (activeCategory === 'normal' ? 'bg-green-500' : 'bg-red-500') 
                      : 'bg-sky-500'
                  }`} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {activeList.items.map((item) => {
                if (item.type === 'warning') {
                  return (
                    <div key={item.id} className="bg-red-100 border-l-8 border-red-600 p-4 rounded-r shadow-sm my-6 flex gap-4 items-center">
                      <ShieldAlert className="text-red-600 shrink-0" size={32} />
                      <div>
                        <strong className="block text-red-800 font-black tracking-widest uppercase mb-1">Warning</strong>
                        <p className="text-red-900 font-bold leading-snug">{item.text}</p>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'caution') {
                  return (
                    <div key={item.id} className="bg-yellow-50 border-l-8 border-yellow-500 p-4 rounded-r shadow-sm my-6 flex gap-4 items-center">
                      <AlertTriangle className="text-yellow-600 shrink-0" size={32} />
                      <div>
                        <strong className="block text-yellow-800 font-black tracking-widest uppercase mb-1">Caution</strong>
                        <p className="text-yellow-900 font-bold leading-snug">{item.text}</p>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'note') {
                  return (
                    <div key={item.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg my-6 flex gap-4 items-start">
                      <Info className="text-sky-600 shrink-0 mt-0.5" size={24} />
                      <div>
                        <strong className="block text-slate-700 font-bold uppercase mb-1 text-sm">Note</strong>
                        <p className="text-slate-600 italic leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  );
                }

                // Action Items
                const isChecked = !!checkedItems[item.id];
                return (
                  <label 
                    key={item.id} 
                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 group ${
                      isChecked 
                        ? 'bg-slate-50 border-transparent opacity-60' 
                        : 'bg-white border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-md'
                    }`}
                  >
                    <div className="shrink-0 mr-6">
                      <input 
                        type="checkbox" 
                        className={`w-8 h-8 rounded-lg border-2 transition-colors cursor-pointer ${
                          activeCategory === 'normal' 
                            ? 'text-green-600 focus:ring-green-500 border-slate-300' 
                            : 'text-red-600 focus:ring-red-500 border-slate-300'
                        }`}
                        checked={isChecked}
                        onChange={() => toggleItem(item.id)}
                      />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className={`text-lg font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.task}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="border-b-2 border-dotted border-slate-300 flex-1 min-w-[2rem] hidden sm:block"></div>
                        <div className={`text-lg font-black tracking-wide uppercase ${
                          isChecked ? 'text-slate-400' : (activeCategory === 'normal' ? 'text-green-700' : 'text-red-700')
                        }`}>
                          {item.response}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            {t('select_list')}
          </div>
        )}
      </div>
    </div>
  );
}
