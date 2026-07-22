import FinalExam from '@/components/FinalExam';

export default function ExamenPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Evaluación Final</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Demuestra tus conocimientos sobre el BO105 CBS4 para obtener tu certificado.</p>
        </div>
        
        <FinalExam />
      </div>
    </div>
  );
}
