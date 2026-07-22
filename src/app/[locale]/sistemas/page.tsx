import FuelSystem from '@/components/systems/FuelSystem';
import HydraulicSystem from '@/components/systems/HydraulicSystem';
import ElectricalSystem from '@/components/systems/ElectricalSystem';

export default function SistemasInteractivosPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-16">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Sistemas Interactivos</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Explora de forma visual el comportamiento de los sistemas bajo condiciones normales y de falla.
          </p>
        </div>

        <section>
          <ElectricalSystem />
        </section>
        
        <section>
          <FuelSystem />
        </section>

        <section>
          <HydraulicSystem />
        </section>
      </div>
    </div>
  );
}
