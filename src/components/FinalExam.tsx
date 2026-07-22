'use client';
import { useState, useEffect } from 'react';
import { finalExamQuestions } from '@/data/finalExamQuestions';
import { Award, Clock, AlertCircle } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { generateCertificatePdf, generateCertificateId } from '@/lib/certificate';

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

export default function FinalExam() {
  const [questions] = useState<Question[]>(() => {
    const shuffled = [...finalExamQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 30);
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [pilotName, setPilotName] = useState('');
  const [licenseType, setLicenseType] = useState<string | undefined>(undefined);
  const [licenseNumber, setLicenseNumber] = useState<string | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [examStarted, setExamStarted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !db) return;
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('DummyKey')) return;
    getDoc(firestoreDoc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.name) setPilotName(data.name);
        if (data.licenseType) setLicenseType(data.licenseType);
        if (data.licenseNumber) setLicenseNumber(data.licenseNumber);
      }
    }).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!examStarted || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, submitted, timeLeft]);

  const { setExamScore } = useProgress();
  
  // Save score to context when submitted
  useEffect(() => {
    if (submitted) {
      const scoreVal = Object.keys(answers).reduce((acc, key) => {
        const k = parseInt(key);
        return acc + (answers[k] === questions[k].correctIndex ? 1 : 0);
      }, 0);
      
      const percentage = (scoreVal / questions.length) * 100;
      setExamScore(percentage);
    }
  }, [submitted, answers, questions, setExamScore]);

  const handleSelect = (qIndex: number, oIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const score = Object.keys(answers).reduce((acc, key) => {
    const k = parseInt(key);
    return acc + (answers[k] === questions[k].correctIndex ? 1 : 0);
  }, 0);

  const passingScore = Math.ceil(questions.length * 0.75);
  const passed = score >= passingScore;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const generateCertificate = async () => {
    if (!pilotName) {
      alert("Por favor, ingresa tu nombre completo para el certificado.");
      return;
    }

    const percentage = Math.round((score / questions.length) * 100);

    await generateCertificatePdf({
      pilotName,
      licenseType,
      licenseNumber,
      courseTitle: 'ENTRENAMIENTO TEÓRICO BO105 CBS4',
      achievementLine: `Aprobando el examen final con un puntaje de ${percentage}%`,
      dateStr: new Date().toLocaleDateString('es-AR'),
      certificateId: generateCertificateId('BO105'),
      fileNameBase: 'Certificado_BO105',
    });
  };

  if (questions.length === 0) return <div>Cargando examen...</div>;

  if (!examStarted) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-2xl mx-auto border border-slate-200 dark:border-slate-700 transition-colors">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6 text-center">Examen Final Simulador</h1>
        
        <div className="bg-sky-50 dark:bg-sky-900/30 p-6 rounded-xl border border-sky-100 dark:border-sky-800/50 mb-8">
          <ul className="space-y-4 text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-3">
              <AlertCircle className="text-sky-500" />
              <span>El examen consta de <strong>{questions.length} preguntas</strong> seleccionadas aleatoriamente.</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="text-sky-500" />
              <span>Tienes <strong>30 minutos</strong> para completarlo. El envío es automático si el tiempo se agota.</span>
            </li>
            <li className="flex items-center gap-3">
              <Award className="text-sky-500" />
              <span>Se requiere un <strong>75%</strong> ({passingScore} correctas) para aprobar y obtener el certificado.</span>
            </li>
          </ul>
        </div>

        <button 
          onClick={() => setExamStarted(true)}
          className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-lg"
        >
          Comenzar Examen
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-slate-200 dark:border-slate-700 transition-colors relative">
      
      {/* Sticky Header with Timer */}
      <div className="sticky top-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10 p-4 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-8 flex justify-between items-center transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Examen BO105 CBS4</h2>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-12">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
            <p className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-4">{qIndex + 1}. {q.question}</p>
            <div className="space-y-3">
              {q.options.map((opt, oIndex) => {
                const isSelected = answers[qIndex] === oIndex;
                const isCorrect = q.correctIndex === oIndex;
                const isWrong = isSelected && !isCorrect;
                
                let btnClass = "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ";
                if (!submitted) {
                  btnClass += isSelected 
                    ? "bg-sky-500 text-white border-sky-500 shadow-md scale-[1.01]" 
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500 text-slate-700 dark:text-slate-300 hover:shadow-sm";
                } else {
                  if (isCorrect) btnClass += "bg-emerald-500 text-white border-emerald-500 font-medium ";
                  else if (isWrong) btnClass += "bg-rose-500 text-white border-rose-500 ";
                  else btnClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 opacity-40 ";
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
          onClick={() => {
            if (Object.keys(answers).length < questions.length) {
              if (!confirm("Hay preguntas sin responder. ¿Seguro que quieres enviar el examen?")) return;
            }
            setSubmitted(true);
          }}
          className="mt-12 w-full py-4 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 shadow-md hover:shadow-lg transition-all text-lg"
        >
          Enviar Examen Final
        </button>
      ) : (
        <div className="mt-12 p-8 border border-slate-200 dark:border-slate-700 rounded-2xl transition-colors text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${passed ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-500 dark:bg-rose-900/30'}`}>
            {passed ? <Award size={48} /> : <AlertCircle size={48} />}
          </div>
          <h2 className={`text-3xl font-black mb-2 ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {passed ? '¡EXAMEN APROBADO!' : 'EXAMEN REPROBADO'}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Tu puntaje final es: <strong>{score} / {questions.length}</strong> ({(score / questions.length * 100).toFixed(0)}%)
          </p>

          {passed && (
            <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Generar Certificado</h3>
              <input 
                type="text" 
                placeholder="Ingresa tu nombre completo" 
                value={pilotName}
                onChange={(e) => setPilotName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 mb-4 focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button
                onClick={() => {
                  generateCertificate();
                  
                  // Notificar a Eforgan
                  fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      to: 'eforgan@gruppomodena.com',
                      subject: `Examen Final Aprobado - ${pilotName}`,
                      html: `<p>El cursante <strong>${pilotName}</strong> ha completado exitosamente el examen final del BO105 CBS4.</p><p>Puntaje obtenido: ${score} / ${questions.length}</p>`
                    })
                  }).catch(console.error);
                }}
                disabled={!pilotName.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Descargar Certificado PDF
              </button>
              {licenseType && licenseNumber && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Se incluirá en el certificado: Lic. {licenseType} N° {licenseNumber}
                </p>
              )}
            </div>
          )}

          {!passed && (
            <button
              onClick={() => window.location.reload()}
              className="py-3 px-8 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Reintentar Examen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
