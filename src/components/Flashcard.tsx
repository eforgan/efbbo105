'use client';
import { useState, useEffect } from 'react';
import { flashcardsData, Flashcard } from '@/data/flashcards';
import { RefreshCw, CheckCircle, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function FlashcardsViewer() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [boxes, setBoxes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Load boxes from localStorage or Firebase
  useEffect(() => {
    const loadProgress = async () => {
      let loadedBoxes: Record<string, number> = {};
      
      const localBoxes = localStorage.getItem('bo105_flashcards');
      if (localBoxes) {
        loadedBoxes = JSON.parse(localBoxes);
      }
      
      if (user && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && db) {
        try {
          const docRef = doc(db, 'userFlashcards', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().boxes) {
            loadedBoxes = { ...loadedBoxes, ...docSnap.data().boxes };
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      setBoxes(loadedBoxes);
      
      // Select cards based on boxes
      // Leitner: Box 1 (needs most review), Box 5 (needs least)
      const weightedCards = flashcardsData.map(c => {
        const box = loadedBoxes[c.id] || 1;
        return { ...c, box, rand: Math.random() };
      }).sort((a, b) => {
        if (a.box !== b.box) return a.box - b.box;
        return a.rand - b.rand;
      });
      
      // Pick top 15 cards for the session
      setCards(weightedCards.slice(0, 15).map(c => ({ id: c.id, front: c.front, back: c.back, frontEn: c.frontEn, backEn: c.backEn, category: c.category })));
      setLoading(false);
    };
    
    loadProgress();
  }, [user]);

  const saveBoxes = async (newBoxes: Record<string, number>) => {
    setBoxes(newBoxes);
    localStorage.setItem('bo105_flashcards', JSON.stringify(newBoxes));
    
    if (user && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && db) {
      try {
        await setDoc(doc(db, 'userFlashcards', user.uid), {
          boxes: newBoxes,
          lastReview: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleNext = (rating: 'hard' | 'good' | 'easy') => {
    const currentCard = cards[currentIndex];
    const currentBox = boxes[currentCard.id] || 1;
    
    let newBox = currentBox;
    if (rating === 'hard') newBox = 1;
    if (rating === 'good') newBox = Math.min(5, currentBox + 1);
    if (rating === 'easy') newBox = Math.min(5, currentBox + 2);
    
    const newBoxes = { ...boxes, [currentCard.id]: newBox };
    saveBoxes(newBoxes);

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        setCompleted(true);
      }
    }, 300);
  };

  const restart = () => {
    const weightedCards = flashcardsData.map(c => {
      const box = boxes[c.id] || 1;
      return { ...c, box, rand: Math.random() };
    }).sort((a, b) => {
      if (a.box !== b.box) return a.box - b.box;
      return a.rand - b.rand;
    });
    
    setCards(weightedCards.slice(0, 15).map(c => ({ id: c.id, front: c.front, back: c.back, frontEn: c.frontEn, backEn: c.backEn, category: c.category })));
    setCurrentIndex(0);
    setCompleted(false);
    setIsFlipped(false);
  };

  if (loading || cards.length === 0) return <div className="p-8 text-center text-slate-500">Cargando flashcards...</div>;

  if (completed) {
    return (
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-slate-700 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-900/30 text-emerald-500 rounded-full mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">¡Repaso Completado!</h2>
        <p className="text-slate-400 mb-8">Has repasado todas las flashcards de esta sesión.</p>
        <button onClick={restart} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 mx-auto transition-colors">
          <RefreshCw size={20} /> Iniciar nueva sesión
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const currentBox = boxes[currentCard.id] || 1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center text-slate-500 mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="uppercase text-xs font-bold tracking-widest text-sky-500">{currentCard.category}</span>
          <span className="text-xs bg-slate-800 px-2 py-1 rounded-md ml-2 border border-slate-700 flex items-center gap-1">
            <BrainCircuit size={12} className="text-emerald-400" /> Nivel {currentBox}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono">{currentIndex + 1} / {cards.length}</span>
        </div>
      </div>

      {/* Card Container for 3D flip effect */}
      <div className="perspective-1000 relative w-full h-[400px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden shadow-xl">
            <h3 className="text-3xl font-bold text-white text-center">
              {currentCard.front}
            </h3>
            <p className="absolute bottom-6 text-slate-500 text-sm flex items-center gap-2">
              <RefreshCw size={14} /> Haz clic para voltear
            </p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-sky-900 border-2 border-sky-600 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden shadow-xl rotate-y-180">
            <p className="text-sky-200 uppercase text-xs font-bold tracking-widest mb-4">Respuesta</p>
            <h3 className="text-2xl font-bold text-white text-center">
              {currentCard.back}
            </h3>
          </div>

        </div>
      </div>

      {/* Controls */}
      {isFlipped && (
        <div className="flex justify-center gap-4 mt-8 animate-in fade-in slide-in-from-bottom-4">
          <button onClick={(e) => { e.stopPropagation(); handleNext('hard'); }} className="flex-1 bg-red-900/50 hover:bg-red-800 text-red-200 py-4 rounded-xl border border-red-700/50 transition-colors">
            Difícil<br/><span className="text-xs opacity-70">Repasar pronto</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleNext('good'); }} className="flex-1 bg-amber-900/50 hover:bg-amber-800 text-amber-200 py-4 rounded-xl border border-amber-700/50 transition-colors">
            Bueno<br/><span className="text-xs opacity-70">Lo sabía</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleNext('easy'); }} className="flex-1 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 py-4 rounded-xl border border-emerald-700/50 transition-colors">
            Fácil<br/><span className="text-xs opacity-70">No olvidar</span>
          </button>
        </div>
      )}
    </div>
  );
}
