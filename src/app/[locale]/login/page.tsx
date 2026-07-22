'use client';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const LICENSE_TYPES = [
    'Piloto Privado de Helicóptero (PPH)',
    'Piloto Comercial de Helicóptero (PCH)',
    'ATPL(H)',
    'Instructor de Vuelo (Helicóptero)',
    'Otra',
  ];

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [licenseTypeOther, setLicenseTypeOther] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loginAsGuest } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    try {
      if (!isConfigured || process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('DummyKey')) {
        loginAsGuest();
        router.push('/');
        return;
      }

      if (!auth || !db) throw new Error("Firebase Auth/DB is not initialized");

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const resolvedLicenseType = licenseType === 'Otra' ? licenseTypeOther : licenseType;

        // Save user profile
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email,
          licenseType: resolvedLicenseType,
          licenseNumber,
          createdAt: new Date().toISOString()
        });

        // Init empty progress
        await setDoc(doc(db, 'userProgress', userCredential.user.uid), {
          completedModules: []
        });

        // Trigger welcome and alert emails
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Confirmación de Inscripción - BO105 CBS4',
            html: `<p>Hola ${name},</p><p>Te has inscripto correctamente en el curso de adaptación teórica para el helicóptero BO105 CBS4.</p><p>Puedes iniciar tu cursada y llevar control de tu progreso.</p>`
          })
        }).catch(console.error);

        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'eforgan@gruppomodena.com',
            subject: 'Nuevo cursante registrado - BO105 CBS4',
            html: `<p>Un nuevo cursante se ha registrado:</p><ul><li>Nombre: ${name}</li><li>Email: ${email}</li></ul>`
          })
        }).catch(console.error);

        router.push('/');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico arriba para restablecer tu contraseña.');
      setResetMessage('');
      return;
    }
    try {
      setLoading(true);
      setError('');
      if (!auth) throw new Error("Firebase Auth is not initialized");
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.');
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al intentar recuperar la contraseña');
      setResetMessage('');
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400">
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
          {isLogin ? 'Ingreso de Pilotos' : 'Registro de Pilotos'}
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
          {isLogin ? 'Inicia sesión para continuar tu curso.' : 'Crea una cuenta para iniciar tu cursada.'}
        </p>

        {!isConfigured && (
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 p-4 rounded-lg flex gap-3 mb-6 items-start">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm">
              Firebase no está configurado. Añade las credenciales en el archivo <code>.env.local</code>.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
          <button 
            className={`flex-1 py-2 font-medium border-b-2 transition-colors ${isLogin ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            onClick={() => { setIsLogin(true); setError(''); setResetMessage(''); }}
          >
            Iniciar Sesión
          </button>
          <button 
            className={`flex-1 py-2 font-medium border-b-2 transition-colors ${!isLogin ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            onClick={() => { setIsLogin(false); setError(''); setResetMessage(''); }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nombre y Apellido
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                required
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Licencia de Piloto
              </label>
              <select
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                required
              >
                <option value="" disabled>Selecciona una opción</option>
                {LICENSE_TYPES.map((lt) => (
                  <option key={lt} value={lt}>{lt}</option>
                ))}
              </select>
            </div>
          )}

          {!isLogin && licenseType === 'Otra' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Especifica el tipo de licencia
              </label>
              <input
                type="text"
                value={licenseTypeOther}
                onChange={(e) => setLicenseTypeOther(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                required
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Número de Licencia
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              required
            />
          </div>

          {error && <p className="text-rose-500 text-sm bg-rose-50 dark:bg-rose-900/30 p-3 rounded-lg">{error}</p>}
          {resetMessage && <p className="text-emerald-600 text-sm bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg">{resetMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Procesando...' : (isLogin ? 'Ingresar al Curso' : 'Completar Registro')}
          </button>
        </form>

        {isLogin && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline disabled:opacity-50"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <button
            type="button"
            onClick={() => {
              loginAsGuest();
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-lg transition-colors"
          >
            Modo Invitado (Sin Firebase)
          </button>
        </div>
      </div>
    </div>
  );
}
