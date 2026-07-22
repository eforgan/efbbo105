'use client';
import { useTTS } from '@/hooks/useTTS';
import { Volume2, Square } from 'lucide-react';

export default function TTSButton({ textToRead }: { textToRead: string }) {
  const { isSpeaking, speak, stop, isSupported } = useTTS();

  if (!isSupported) return null;

  return (
    <button
      onClick={() => isSpeaking ? stop() : speak(textToRead)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isSpeaking 
          ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-800/40' 
          : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/40'
      }`}
      aria-label={isSpeaking ? "Detener lectura" : "Leer en voz alta"}
    >
      {isSpeaking ? <Square size={18} fill="currentColor" /> : <Volume2 size={18} />}
      {isSpeaking ? "Detener" : "Leer Módulo"}
    </button>
  );
}
