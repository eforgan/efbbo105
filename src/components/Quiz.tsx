'use client';
import { useState, useEffect } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { useRouter } from 'next/navigation';

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

const QUESTIONS_PER_ATTEMPT = 5;

function pickRandomQuestions(pool: Question[], count: number): Question[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function Quiz({ questions, moduleId, basePath = '/modulo', totalModules = 7, track = 'base', onComplete }: { questions: Question[], moduleId: string, basePath?: string, totalModules?: number, track?: 'base' | 'offshore', onComplete?: (id: number) => void }) {
  const [mounted, setMounted] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const { completeModule, completeOffshoreModule } = useProgress();
  const router = useRouter();
  const markComplete = onComplete ?? (track === 'offshore' ? completeOffshoreModule : completeModule);

  const handleSelect = (qIndex: number, oIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const score = Object.keys(answers).reduce((acc, key) => {
    const k = parseInt(key);
    return acc + (answers[k] === activeQuestions[k].correctIndex ? 1 : 0);
  }, 0);

  const passed = score >= Math.ceil(activeQuestions.length * 0.8);

  useEffect(() => {
    if (submitted && passed) {
      markComplete(parseInt(moduleId));
    }
  }, [submitted, passed, markComplete, moduleId]);

  useEffect(() => {
    setActiveQuestions(pickRandomQuestions(questions, QUESTIONS_PER_ATTEMPT));
    setMounted(true);
  }, [questions]);

  if (!mounted) {
    return (
      <div className="mt-12 p-8 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Cargando cuestionario...</h2>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const handleNextModule = () => {
    const nextId = parseInt(moduleId) + 1;
    if (nextId <= totalModules) {
      router.push(`${basePath}/${nextId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="mt-12 p-8 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 transition-colors">Cuestionario - Módulo {moduleId}</h2>
      <div className="space-y-8">
        {activeQuestions.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4">
            <p className="font-semibold text-lg text-slate-700 dark:text-slate-200 transition-colors">{qIndex + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oIndex) => {
                const isSelected = answers[qIndex] === oIndex;
                const isCorrect = q.correctIndex === oIndex;
                const isWrong = isSelected && !isCorrect;
                
                let btnClass = "w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ";
                if (!submitted) {
                  btnClass += isSelected 
                    ? "bg-blue-500 text-white border-blue-500" 
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200";
                } else {
                  if (isCorrect) btnClass += "bg-green-500 text-white border-green-500 ";
                  else if (isWrong) btnClass += "bg-red-500 text-white border-red-500 ";
                  else btnClass += "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 opacity-50 ";
                }
                
                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(qIndex, oIndex)}
                    className={btnClass}
                    disabled={submitted}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {!submitted ? (
        <button 
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < activeQuestions.length}
          className="mt-8 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Enviar Respuestas
        </button>
      ) : (
        <div className="mt-8 space-y-4">
          <div className={`p-6 rounded-lg text-white font-bold text-center text-xl ${passed ? 'bg-green-600' : 'bg-red-600'}`}>
            {passed ? `¡Aprobado! Puntaje: ${score}/${activeQuestions.length}` : `Reprobado. Puntaje: ${score}/${activeQuestions.length} (Mínimo ${Math.ceil(activeQuestions.length * 0.8)})`}
          </div>
          {passed ? (
            <button
              onClick={handleNextModule}
              className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {parseInt(moduleId) < totalModules ? 'Siguiente Módulo \u2192' : 'Finalizar Curso \u2192'}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/')}
                className="w-full sm:w-1/2 py-4 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
              >
                Volver al Menú
              </button>
              <button
                onClick={() => {
                  setActiveQuestions(pickRandomQuestions(questions, QUESTIONS_PER_ATTEMPT));
                  setAnswers({});
                  setSubmitted(false);
                }}
                className="w-full sm:w-1/2 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
              >
                Reiniciar Módulo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
