'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2, Circle, Info, Target, Users, Layers } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useProgress } from '@/context/ProgressContext';
import Image from 'next/image';

export default function Home() {
  const { completedModules } = useProgress();
  const t = useTranslations('Home');

  const modulos = [
    { id: 1, title: 'Generalidades', desc: 'Descripción general, dimensiones y terminología.' },
    { id: 2, title: 'Limitaciones', desc: 'Límites de velocidad, motor, peso y operación.' },
    { id: 3, title: 'Procedimientos de Emergencia', desc: 'Fallos de motor, fuego, autorrotación y fallos de sistemas.' },
    { id: 4, title: 'Procedimientos Normales', desc: 'Inspección pre-vuelo, arranque, despegue y apagado.' },
    { id: 5, title: 'Performance', desc: 'Rendimiento en Hover IGE/OGE, diagramas H-V y ascenso.' },
    { id: 6, title: 'Peso y Balanceo', desc: 'Cálculos de CG, carga y estación de referencia.' },
    { id: 7, title: 'Sistemas', desc: 'Rotor, transmisión, sistemas hidráulico, eléctrico y de combustible.' },
  ];

  const progressPercentage = Math.round((completedModules.length / modulos.length) * 100);

  return (

    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-12 relative transition-colors duration-300">
      {/* Helicopter Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.15] mix-blend-multiply"
        style={{
          backgroundImage: "url('/images/bo105_3view.png')",
          backgroundPosition: 'center top 10%',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      <main className="max-w-6xl mx-auto relative z-10">
        
        {/* Hero Section */}
        <div className="bg-slate-900 text-white pt-6 pb-8 px-4 sm:px-8 lg:px-12 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
          <div className="absolute inset-0 opacity-10 bg-[url('/images/rfm/mod1_15_1-9-TERMINOLOGY-AND-DEFINITIONS-OF-TERMS_page1.png')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            
            <div className="flex justify-center mb-4">
              <div className="bg-white p-[10px] rounded-xl inline-block shadow-lg">
                <Image src="/mas_logo.jpg" alt="MAS Logo" width={150} height={48} className="h-12 w-auto object-contain block" priority />
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center gap-2 max-w-2xl mx-auto">
              <div className="inline-block px-2 py-0.5 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-300 font-semibold tracking-wide text-[10px]">
                {t('title_badge')}
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {t('title_main')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                  {t('title_sub')}
                </span>
              </h1>
              <p className="text-base text-slate-300 max-w-lg mt-1">
                {t('title_desc')}
              </p>
            </div>
            
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-12">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 md:p-10 shadow-lg rounded-3xl border border-slate-200/60 dark:border-slate-700/60 relative overflow-hidden transition-colors duration-300">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-[100px] z-0"></div>
            
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-8 flex items-center gap-3 relative z-10 transition-colors">
              <span className="bg-sky-100 text-sky-600 p-2.5 rounded-xl"><Info className="w-6 h-6" /></span>
              {t('intro_title')}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-slate-600 dark:text-slate-300 leading-relaxed relative z-10 transition-colors">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 text-lg flex items-center gap-2 transition-colors">
                  <Target className="w-5 h-5 text-emerald-500" /> {t('intro_obj_title')}
                </h3>
                <p className="text-sm">
                  <span dangerouslySetInnerHTML={{ __html: t.raw('intro_obj_desc') || t('intro_obj_desc') }} />
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 text-lg flex items-center gap-2 transition-colors">
                  <Users className="w-5 h-5 text-indigo-500" /> {t('intro_target_title')}
                </h3>
                <p className="text-sm">
                  <span dangerouslySetInnerHTML={{ __html: t.raw('intro_target_desc') || t('intro_target_desc') }} />
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 text-lg flex items-center gap-2 transition-colors">
                  <Layers className="w-5 h-5 text-amber-500" /> {t('intro_structure_title')}
                </h3>
                <p className="text-sm">
                  <span dangerouslySetInnerHTML={{ __html: t.raw('intro_structure_desc') || t('intro_structure_desc') }} />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 shadow-md rounded-2xl mb-8 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase transition-colors">{t('progress_title')}</span>
                <span className="text-sm font-bold text-sky-600">{t('progress_completed', { progress: progressPercentage })}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 transition-colors">
                <div 
                  className="bg-sky-500 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-400 dark:border-sky-500 rounded text-sky-900 dark:text-sky-200 text-sm transition-colors">
              <strong>{t('warning')}</strong> {t('warning_text')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modulos.map((mod) => {
              const isCompleted = completedModules.includes(mod.id);
              return (
                <Link key={mod.id} href={`/modulo/${mod.id}`}>
                  <div className={`p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border h-full group ${isCompleted ? 'bg-sky-50/50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide transition-colors">
                        {t('module', { id: mod.id })}
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400 transition-colors" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 transition-colors" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                      {mod.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 transition-colors">
                      {mod.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
