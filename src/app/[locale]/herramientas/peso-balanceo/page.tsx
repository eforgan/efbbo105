import WeightBalanceComputer from '@/components/WeightBalanceComputer';

export default function PesoBalanceoPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6 sm:px-12">
      <main className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-xl rounded-2xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Computadora de Peso y Balanceo</h1>
        <p className="text-slate-600 mb-8">
          Utilice esta herramienta para calcular y verificar que el centro de gravedad (CG) del BO105 se encuentra dentro de los límites operacionales.
        </p>
        <WeightBalanceComputer />
      </main>
    </div>
  );
}
