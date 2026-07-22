import FlashcardsViewer from '@/components/Flashcard';

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Memory Items</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Repaso de limitaciones y procedimientos de memoria mediante repetición espaciada.
          </p>
        </div>
        
        <section className="pt-8">
          <FlashcardsViewer />
        </section>
      </div>
    </div>
  );
}
