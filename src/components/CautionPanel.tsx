'use client';
import { useState, useEffect } from 'react';
import { cautionPanelLights, EmergencyLight } from '@/data/emergencies';
import { AlertTriangle, Clock } from 'lucide-react';

export default function CautionPanel({
  lights = cautionPanelLights,
  title = 'Simulador de Emergencias',
}: {
  lights?: EmergencyLight[];
  title?: string;
} = {}) {
  const [activeLight, setActiveLight] = useState<EmergencyLight | null>(null);
  const [timer, setTimer] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'running' | 'success' | 'failed'>('idle');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'running' && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (gameState === 'running' && timer === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGameState('failed');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFeedback(`¡Tiempo agotado! La acción correcta era: ${activeLight?.correctAction}`);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScore(s => ({ ...s, total: s.total + 1 }));
    }
    return () => clearInterval(interval);
  }, [gameState, timer, activeLight]);

  const startSimulation = () => {
    const randomLight = lights[Math.floor(Math.random() * lights.length)];
    setActiveLight(randomLight);
    // Shuffle options
    randomLight.options.sort(() => 0.5 - Math.random());
    setTimer(15); // 15 seconds to react
    setGameState('running');
    setFeedback('');
  };

  const startRandomChallenge = () => {
    setGameState('waiting');
    setFeedback('Volando con normalidad... Mantente alerta.');
    const waitTime = Math.floor(Math.random() * 10000) + 5000; // 5-15 seconds
    
    setTimeout(() => {
      // Play a loud alarm sound using Audio Context or Speech
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance("¡Precaución! ¡Luz en el panel!");
        u.lang = 'es-ES';
        window.speechSynthesis.speak(u);
      }
      startSimulation();
    }, waitTime);
  };

  const handleAnswer = (answer: string) => {
    if (gameState !== 'running' || !activeLight) return;

    if (answer === activeLight.correctAction) {
      setGameState('success');
      setFeedback('¡Correcto! Has respondido a la emergencia adecuadamente.');
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
    } else {
      setGameState('failed');
      setFeedback(`Incorrecto. La acción correcta era: ${activeLight.correctAction}`);
      setScore(s => ({ ...s, total: s.total + 1 }));
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto border border-slate-700">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-amber-500" /> {title}
          </h2>
          <p className="text-slate-400 mt-1">Reacciona ante el Caution/Warning Panel</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono text-white font-bold">
            {score.correct} / {score.total}
          </div>
          <div className="text-slate-500 text-sm">Aciertos</div>
        </div>
      </div>

      {/* Caution Panel Master UI */}
      <div className="bg-black p-4 rounded-xl border-4 border-slate-700 grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {lights.map((light) => {
          const isActive = gameState === 'running' && activeLight?.id === light.id;
          const isRed = light.color === 'red';
          let bgColor = 'bg-slate-800 border-slate-700 text-slate-600';
          let shadow = '';
          
          if (isActive) {
            if (isRed) {
              bgColor = 'bg-red-500 border-red-400 text-white animate-pulse';
              shadow = 'shadow-[0_0_20px_rgba(239,68,68,0.8)]';
            } else {
              bgColor = 'bg-amber-500 border-amber-400 text-black font-bold animate-pulse';
              shadow = 'shadow-[0_0_20px_rgba(245,158,11,0.8)]';
            }
          }

          return (
            <div key={light.id} className={`flex items-center justify-center h-16 rounded border-2 ${bgColor} ${shadow} transition-all duration-300`}>
              <span className="font-mono text-lg tracking-wider">{light.label}</span>
            </div>
          );
        })}
      </div>

      {/* Game Area */}
      <div className="min-h-[250px] bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-center">
        {gameState === 'idle' && (
          <div className="text-center">
            <AlertTriangle size={64} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-300 mb-6 text-lg">Haz clic en &quot;Iniciar Simulación&quot; para practicar inmediatamente, o usa el modo &quot;Desafío Aleatorio&quot; para poner a prueba tus reflejos ante alarmas sorpresa.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={startSimulation} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg shadow-lg">
                Iniciar Simulación
              </button>
              <button onClick={startRandomChallenge} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg shadow-lg animate-pulse">
                Desafío Aleatorio
              </button>
            </div>
          </div>
        )}

        {gameState === 'waiting' && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-2xl font-bold text-white mb-2">Vuelo Normal</h3>
            <p className="text-slate-300 text-lg max-w-xl mx-auto">{feedback}</p>
          </div>
        )}

        {gameState === 'running' && activeLight && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Emergencia: <span className={activeLight.color === 'red' ? 'text-red-500' : 'text-amber-500'}>{activeLight.label}</span></h3>
              <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${timer <= 5 ? 'text-red-500 animate-bounce' : 'text-amber-400'}`}>
                <Clock size={24} /> {timer}s
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {activeLight.options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleAnswer(opt)}
                  className="text-left bg-slate-700 hover:bg-slate-600 border border-slate-600 p-4 rounded-lg text-slate-200 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {(gameState === 'success' || gameState === 'failed') && (
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${gameState === 'success' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
              <AlertTriangle size={40} />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${gameState === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {gameState === 'success' ? '¡Procedimiento Correcto!' : '¡Procedimiento Incorrecto!'}
            </h3>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">{feedback}</p>
            <button onClick={startSimulation} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg shadow-lg">
              Siguiente Emergencia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
