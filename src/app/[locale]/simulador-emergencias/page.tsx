import CautionPanel from '@/components/CautionPanel';

export default function SimuladorEmergenciasPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Simulador de Emergencias</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Entrena tu memoria muscular teórica reaccionando ante las luces del Caution/Warning Panel del BO105.
          </p>
        </div>
        
        <section>
          <CautionPanel />
        </section>
      </div>
    </div>
  );
}
