import CautionPanel from '@/components/CautionPanel';
import { offshoreEmergencyLights } from '@/data/offshoreScenarios';

export default function OffshoreSimuladorPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-8 lg:px-12 transition-colors duration-300">
      <main className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">Simulador de Emergencias Offshore</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Escenarios de emergencia sobre agua dentro del perfil offshore de corta distancia (&lt; 8 km de costa).
          </p>
        </div>

        <CautionPanel lights={offshoreEmergencyLights} title="Simulador de Emergencias Offshore" />

        <p className="text-sm text-slate-400 text-center mt-8">
          * Para fines de entrenamiento únicamente. Asume que la tripulación ya completó el HUET presencial; no reemplaza dicho entrenamiento, su recurrencia periódica, ni los procedimientos del AFM/Manual de Operaciones. Esta aeronave no cuenta con sistema de flotación de emergencia instalado.
        </p>
      </main>
    </div>
  );
}
