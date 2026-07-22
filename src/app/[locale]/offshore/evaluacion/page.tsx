import Link from 'next/link';
import PCRChecklist from '@/components/PCRChecklist';

export default function OffshoreEvaluacionPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-8 lg:px-12 transition-colors duration-300">
      <main className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">Evaluación PCR en Vuelo</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            El syllabus completo de maniobras se describe en el{' '}
            <Link href="/offshore/modulo/7" className="text-sky-600 dark:text-sky-400 underline">
              Módulo OF7
            </Link>
            . Esta tarjeta es para uso del instructor durante el vuelo práctico real.
          </p>
        </div>

        <PCRChecklist />

        <p className="text-sm text-slate-400 text-center mt-8">
          * Para fines de entrenamiento y registro únicamente. No reemplaza los formularios oficiales de verificación de competencia (PCR) exigidos por el explotador y la ANAC.
        </p>
      </main>
    </div>
  );
}
