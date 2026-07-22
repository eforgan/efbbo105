'use client';
import dynamic from 'next/dynamic';

const Helicopter3DViewer = dynamic(() => import('@/components/Helicopter3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sky-400 font-mono animate-pulse">Cargando Modelo 3D...</p>
      </div>
    </div>
  ),
});
export default function Inspeccion3DPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-8 transition-colors duration-300 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Inspección Pre-Vuelo 3D</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg max-w-3xl">
            Realiza el Walkaround virtual del BO105. Interactúa con el modelo 3D para repasar los puntos clave de la inspección requerida por el Módulo 1 y 7.
          </p>
        </div>
        
        <div className="flex-1 w-full min-h-[600px]">
          <Helicopter3DViewer />
        </div>
      </div>
    </div>
  );
}
