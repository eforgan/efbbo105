import InteractiveQRH from '@/components/InteractiveQRH';

export default function ChecklistsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-8 lg:px-12">
      <main className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 drop-shadow-sm">QRH Interactivo</h1>
          <p className="text-slate-600 mt-2 text-lg">
            Quick Reference Handbook. Seleccione la categoría a la izquierda y marque los ítems completados a la derecha.
          </p>
        </div>
        
        <InteractiveQRH />
        
        <p className="text-sm text-slate-400 text-center mt-8">
          * Para fines de entrenamiento únicamente. En vuelo real, consulte siempre el manual de vuelo (RFM) aprobado para su aeronave.
        </p>
      </main>
    </div>
  );
}
