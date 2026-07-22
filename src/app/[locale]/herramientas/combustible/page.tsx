import FuelComputer from '@/components/FuelComputer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CombustiblePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-8 lg:px-12">
      <main className="max-w-5xl mx-auto space-y-6">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sky-600 hover:text-sky-800 font-medium mb-6 transition-colors">
            <ArrowLeft className="mr-2" size={20} />
            Volver al Inicio
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900 drop-shadow-sm">Computadora de Combustible</h1>
          <p className="text-slate-600 mt-2 text-lg">
            Calcula el flujo horario, la autonomía y el alcance ajustando los parámetros ambientales y de configuración del BO105.
          </p>
        </div>
        
        <FuelComputer />

        <div className="bg-sky-50 border border-sky-200 p-6 rounded-xl text-sky-800 mt-8">
          <h3 className="font-bold mb-2">Notas del Modelo:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>El modelo de consumo asume operación con dos motores (AEO) Allison 250-C20B en buenas condiciones.</li>
            <li>La autonomía y alcance calculados restan automáticamente una reserva VFR obligatoria de 30 kg (aprox. 15-20 min de vuelo a potencia de crucero).</li>
            <li>La velocidad de menor consumo (Endurance Speed) teórica para este modelo ronda los 65 KIAS. Notarás que el flujo aumenta si te desvías de este valor (tanto a menor como a mayor velocidad).</li>
            <li>El alcance asume viento en calma (Nil Wind). Para cálculo real, la distancia sobre el terreno (Ground Range) variará según el viento de frente o de cola.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
