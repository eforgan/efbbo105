'use client';
import dynamic from 'next/dynamic';

const PowerCurveComputer = dynamic(() => import('@/components/PowerCurveComputer'), { ssr: false, loading: () => <p className="text-center p-8">Cargando calculadora de potencia...</p> });
const HoverCeilingComputer = dynamic(() => import('@/components/HoverCeilingComputer'), { ssr: false, loading: () => <p className="text-center p-8">Cargando curvas de hover...</p> });

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6 sm:px-12">
      <main className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-xl rounded-2xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Performance y Curvas de Vuelo</h1>
        <p className="text-slate-600 mb-8">
          Simuladores interactivos para determinar la potencia requerida y los techos de vuelo estacionario en función de la velocidad, altitud, peso y temperatura. 
        </p>
        
        <PowerCurveComputer />
        
        <HoverCeilingComputer />
      </main>
    </div>
  );
}
