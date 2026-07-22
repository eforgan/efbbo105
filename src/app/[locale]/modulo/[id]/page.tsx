import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Quiz from '@/components/Quiz';
import TTSButton from '@/components/TTSButton';
import { quizzes } from '@/data/quizzes';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export async function generateStaticParams() {
  const params: { locale: string, id: string }[] = [];
  routing.locales.forEach((locale) => {
    for (let i = 1; i <= 7; i++) {
      params.push({ locale, id: i.toString() });
    }
  });
  return params;
}

export default async function ModuloPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const filePath = path.join(process.cwd(), 'src', 'data', `modulo-${params.id}.md`);
  let markdownText = '';
  try {
    markdownText = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    markdownText = '# Error\n\nNo se pudo cargar el contenido del módulo.';
  }

  const moduleQuestions = quizzes[params.id] || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-12 px-6 sm:px-12 transition-colors duration-300">
      <main className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 sm:p-12 shadow-xl rounded-2xl border border-transparent dark:border-slate-700 transition-colors duration-300">
        <Link href="/" className="inline-flex mb-8 text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-semibold items-center gap-2 transition-colors bg-sky-50 dark:bg-sky-900/30 px-4 py-2 rounded-lg border border-sky-100 dark:border-sky-800/50">
          &larr; Volver al Índice
        </Link>
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Módulo {params.id}</h1>
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
                <div className="my-12">
                  <hr className="mb-12 border-slate-300 border-2 rounded" />
                  <img {...props} className="w-full h-auto object-contain rounded-lg shadow-sm" />
                </div>
              )
            }}
          >
            {markdownText}
          </ReactMarkdown>
        </div>

        {moduleQuestions.length > 0 && (
          <div className="mt-16 pt-8 border-t border-sky-100">
            <Quiz questions={moduleQuestions} moduleId={params.id} />
          </div>
        )}
      </main>
    </div>
  );
}
