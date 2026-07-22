'use client';
import dynamic from 'next/dynamic';
const HVCurveComputer = dynamic(() => import('@/components/HVCurveComputer'), { ssr: false, loading: () => <p className="text-center p-8">Cargando curva...</p> });
export default function HVCurvePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6 sm:px-12">
      <main className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-xl rounded-2xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Curvas Height-Velocity (HV)</h1>
        <p className="text-slate-600 mb-8">
          Las curvas HV delimitan las áreas operacionales de precaución o prohibidas desde las cuales no es posible realizar un aterrizaje seguro en autorrotación tras una falla de motor.
        </p>
        <HVCurveComputer />
      </main>
    </div>
  );
}
