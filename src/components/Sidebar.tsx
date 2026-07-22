"use client";

import { Link, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import { 
  BookOpen, 
  Settings, 
  Activity, 
  TrendingUp, 
  CheckSquare, 
  AlertTriangle,
  Menu,
  X,
  Scale,
  Compass,
  Flame,
  Sun,
  Moon,
  Award,
  Layers,
  Bell,
  Brain,
  User,
  ShieldAlert,
  Wind,
  LogIn,
  LogOut,
  Box,
  Waves,
  ClipboardCheck
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

const ADMIN_EMAILS = ['eforgan@gruppomodena.com', 'admin@bo105.com', 'piloto@test.com'];

export default function Sidebar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Piloto';

  // Wait for mount to avoid hydration mismatch
  if (typeof window !== 'undefined' && !mounted) {
    setMounted(true);
  }
  
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  const navItems = [
    { name: t('dashboard'), href: '/dashboard', icon: User },
    { name: t('course_modules'), href: '/', icon: BookOpen },
    { name: 'Manual de Operación', href: '/manual', icon: Settings },
    { name: t('checklists'), href: '/checklists', icon: CheckSquare },
    { name: 'Peso y Balanceo', href: '/herramientas/peso-balanceo', icon: Activity },
    { name: 'Performance', href: '/herramientas/performance', icon: TrendingUp },
    { name: 'Curvas HV', href: '/herramientas/curvas-hv', icon: AlertTriangle },
    { name: 'Sistemas Interactivos', href: '/sistemas', icon: Layers },
    { name: t('emergency_simulator'), href: '/simulador-emergencias', icon: Bell },
    { name: 'Flashcards', href: '/flashcards', icon: Brain },
    { name: t('final_exam'), href: '/examen', icon: Award },
    { name: 'Panel Admin', href: '/admin', icon: ShieldAlert, adminOnly: true },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center justify-center p-6 border-b border-slate-800 space-y-4">
            <div className="bg-white p-[10px] rounded inline-block shadow-sm">
              <Image src="/mas_logo.jpg" alt="MAS Logo" width={150} height={48} className="h-12 w-auto object-contain block" priority />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wider">BO105 CBS4</h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-sky-600 text-white font-medium' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-sky-200' : 'text-slate-400'} />
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Curso Offshore HEMS</p>
              <Link href="/offshore" className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors group">
                <Waves className="mr-3 text-sky-400 group-hover:text-sky-300 transition-colors" size={20} />
                <span className="font-medium">Módulos Offshore (&lt; 8 km)</span>
              </Link>
              <Link href="/offshore/simulador" className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors group">
                <Bell className="mr-3 text-rose-400 group-hover:text-rose-300 transition-colors" size={20} />
                <span className="font-medium">Simulador Ditching/Offshore</span>
              </Link>
              <Link href="/offshore/evaluacion" className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors group">
                <ClipboardCheck className="mr-3 text-emerald-400 group-hover:text-emerald-300 transition-colors" size={20} />
                <span className="font-medium">Evaluación PCR en Vuelo</span>
              </Link>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Herramientas de Vuelo</p>
              <Link href="/herramientas/inspeccion-3d" className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors group">
                <Box className="mr-3 text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
                <span className="font-medium">Inspección 3D</span>
              </Link>
              <Link href="/herramientas/peso-balanceo" className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors group">
                <Scale className="mr-3 text-sky-400 group-hover:text-sky-300 transition-colors" size={20} />
                <span className="font-medium">Peso y Balanceo</span>
              </Link>
              <Link href="/herramientas/performance" className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors group">
                <Activity className="mr-3 text-emerald-400 group-hover:text-emerald-300 transition-colors" size={20} />
                <span className="font-medium">Calculadora de Performance</span>
              </Link>
              <Link href="/herramientas/curvas-hv" className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors group">
                <Compass className="mr-3 text-rose-400 group-hover:text-rose-300 transition-colors" size={20} />
                <span className="font-medium">Curvas H-V</span>
              </Link>
              <Link href="/herramientas/viento-cruzado" className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors group">
                <Wind className="mr-3 text-sky-400 group-hover:text-sky-300 transition-colors" size={20} />
                <span className="font-medium">Viento Cruzado</span>
              </Link>
              <Link href="/herramientas/combustible" className="flex items-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors group">
                <Flame className="mr-3 text-orange-400 group-hover:text-orange-300 transition-colors" size={20} />
                <span className="font-medium">Combustible y Alcance</span>
              </Link>
            </div>
          </nav>
          
          <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center flex flex-col items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 w-full px-2 py-2 rounded-lg bg-slate-800/60">
                  <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-slate-200 truncate">{displayName}</p>
                    {user.email && <p className="text-[10px] text-slate-500 truncate">{user.email}</p>}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-lg bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 transition-colors flex items-center justify-center gap-2 w-full font-medium"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center justify-center gap-2 w-full font-medium"
              >
                <LogIn size={16} />
                Iniciar Sesión
              </Link>
            )}
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center gap-2 w-full"
            >
              {mounted && theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span className="font-medium text-sm">{mounted && theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>
            <div className="mt-2 text-[10px] text-slate-600">
              Curso de Adaptación<br/>
              Eforgans Projects &copy; 2026
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
