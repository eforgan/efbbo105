import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Quiz from '@/components/Quiz';
import TTSButton from '@/components/TTSButton';
import MermaidChart from '@/components/MermaidChart';
import { offshoreQuizzes } from '@/data/offshoreQuizzes';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export async function generateStaticParams() {
  const params: { locale: string, id: string }[] = [];
  routing.locales.forEach((locale) => {
    for (let i = 1; i <= 9; i++) {
      params.push({ locale, id: i.toString() });
    }
  });
  return params;
}

export default async function OffshoreModuloPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const filePath = path.join(process.cwd(), 'src', 'data', 'offshore', `modulo-${params.id}.md`);
  let markdownText = '';
  try {
    markdownText = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    markdownText = '# Error\n\nNo se pudo cargar el contenido del módulo.';
  }

  const moduleQuestions = offshoreQuizzes[params.id] || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-6 sm:px-12 transition-colors duration-300">
      <main className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 sm:p-12 shadow-xl rounded-2xl border border-transparent dark:border-slate-700 transition-colors duration-300">
        <Link href="/offshore" className="inline-flex mb-8 text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-semibold items-center gap-2 transition-colors bg-sky-50 dark:bg-sky-900/30 px-4 py-2 rounded-lg border border-sky-100 dark:border-sky-800/50">
          &larr; Volver al Curso Offshore
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Módulo OF{params.id}</h1>
          </div>
          <div className="hidden sm:block">
            <TTSButton textToRead={markdownText} />
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert prose-base sm:prose-lg max-w-none text-slate-800 dark:text-slate-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({node, ...props}) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img {...props} className="w-full h-auto object-contain rounded-lg shadow-sm my-10 border border-slate-200 dark:border-slate-700" />
              ),
              table: ({node, ...props}) => (
                <div className="w-full overflow-x-auto my-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <table className="w-full min-w-[700px] text-sm text-left border-collapse" {...props} />
                </div>
              ),
              th: ({node, ...props}) => (
                <th className="bg-slate-100 dark:bg-slate-800/50 p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 text-center" {...props} />
              ),
              td: ({node, children, ...props}: any) => {
                const text = String(children);
                let bgColor = '';
                if (text.includes('Inaceptable')) {
                  bgColor = 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold';
                } else if (text.includes('Tolerable')) {
                  bgColor = 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 font-bold';
                } else if (text.includes('Aceptable')) {
                  bgColor = 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold';
                }
                return <td className={`p-4 border-b border-slate-200 dark:border-slate-700 text-center align-middle ${bgColor}`} {...props}>{children}</td>
              },
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '')
                if (!inline && match && match[1] === 'mermaid') {
                  return <MermaidChart chart={String(children).replace(/\n$/, '')} />
                }
                return <code className={className} {...props}>{children}</code>
              }
            }}
          >
            {markdownText}
          </ReactMarkdown>
        </div>

        {moduleQuestions.length > 0 && (
          <div className="mt-16 pt-8 border-t border-sky-100">
            <Quiz
              questions={moduleQuestions}
              moduleId={params.id}
              basePath="/offshore/modulo"
              totalModules={9}
              track="offshore"
            />
          </div>
        )}

        {moduleQuestions.length === 0 && (
          <div className="mt-16 pt-8 border-t border-sky-100 text-center">
            <Link
              href="/offshore/evaluacion"
              className="inline-block px-6 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors"
            >
              Ir a la Tarjeta de Evaluación en Vuelo (PCR) →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
