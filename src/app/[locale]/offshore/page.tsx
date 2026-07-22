'use client';

import { CheckCircle2, Circle, Waves } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useProgress } from '@/context/ProgressContext';
import OffshoreCertificate from '@/components/OffshoreCertificate';
import { offshoreModules } from '@/data/offshoreModules';

export default function OffshoreHome() {
  const { completedOffshoreModules } = useProgress();

  const modulos = offshoreModules;

  const progressPercentage = Math.round((completedOffshoreModules.length / modulos.length) * 100);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-12 transition-colors duration-300">
      <main className="max-w-6xl mx-auto">
        <div className="bg-slate-900 text-white pt-6 pb-8 px-4 sm:px-8 lg:px-12 rounded-b-[2rem] shadow-xl mb-6">
          <div className="flex flex-col items-center text-center gap-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-300 font-semibold tracking-wide text-[10px]">
              <Waves size={12} /> OPERACIONES OFFSHORE HEMS
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              BO105 CBS4 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                Corta Distancia (&lt; 8 km de Costa)
              </span>
            </h1>
            <p className="text-base text-slate-300 max-w-lg mt-1">
              Curso de especialización teórico y práctico en vuelo para operaciones HEMS costeras.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 shadow-md rounded-2xl mb-8 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase transition-colors">Progreso del Curso</span>
                <span className="text-sm font-bold text-sky-600">{progressPercentage}% Completado</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 transition-colors">
                <div
                  className="bg-sky-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-400 dark:border-sky-500 rounded text-sky-900 dark:text-sky-200 text-sm transition-colors">
              <strong>ADVERTENCIA:</strong> Este curso complementa el Curso de Adaptación BO105 CBS4 y tiene fines de orientación teórica. El límite operativo de 8 km es una definición pedagógica de trabajo; para la operación real, guíese por el Manual de Operaciones del explotador y la normativa ANAC/RAAC vigente. Asume que la tripulación ya completó el entrenamiento presencial de egreso subacuático (HUET) y no reemplaza dicho entrenamiento ni su recurrencia periódica. Esta aeronave no está equipada con sistema de flotación de emergencia fijo al fuselaje; el equipo estándar es traje anti-exposición, chaleco salvavidas inflable, radiobaliza personal (PLB) y una balsa salvavidas inflable para 6 personas.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modulos.map((mod) => {
              const isCompleted = completedOffshoreModules.includes(mod.id);
              return (
                <Link key={mod.id} href={`/offshore/modulo/${mod.id}`}>
                  <div className={`p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border h-full group ${isCompleted ? 'bg-sky-50/50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide transition-colors">
                        Módulo OF{mod.id}
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

          <div className="mt-6">
            <OffshoreCertificate />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/offshore/simulador">
              <div className="p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/20 h-full">
                <h2 className="text-xl font-bold mb-2 text-rose-800 dark:text-rose-300">Simulador de Emergencias Offshore</h2>
                <p className="text-slate-600 dark:text-slate-400">Practique escenarios de ditching y fallos sobre agua.</p>
              </div>
            </Link>
            <Link href="/offshore/evaluacion">
              <div className="p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 h-full">
                <h2 className="text-xl font-bold mb-2 text-emerald-800 dark:text-emerald-300">Evaluación PCR en Vuelo</h2>
                <p className="text-slate-600 dark:text-slate-400">Tarjeta de evaluación de maniobras para el instructor.</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
