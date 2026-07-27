'use client';

import React from 'react';
import Image from 'next/image';
import { TabType } from '../Sidebar';
import { useEfbData } from '../../context/EfbDataContext';
import {
  Scale, Gauge, AlertOctagon, Flame, MapPin, Fuel, CloudSun, Moon, Compass,
  HeartPulse, CheckSquare, ShieldCheck, FileText, BookOpen, Book, FileCheck, HelpCircle,
  UserCircle, ArrowRight, Route
} from 'lucide-react';

interface HomeModuleProps {
  onNavigate: (tab: TabType) => void;
}

interface FeatureCardData {
  id: TabType;
  icon: React.ElementType;
  title: string;
  description: string;
}

const GROUPS: { groupName: string; items: FeatureCardData[] }[] = [
  {
    groupName: 'Cálculo & Rendimiento',
    items: [
      { id: 'wb', icon: Scale, title: 'Peso & Balanceo', description: 'Cálculo interactivo de CG longitudinal y lateral por estación de carga, con envolvente gráfica y tabla de momentos.' },
      { id: 'perf', icon: Gauge, title: 'Performance HOGE/HIGE', description: 'Techo estacionario dentro y fuera de efecto suelo según altitud densidad, temperatura y peso.' },
      { id: 'hvcurve', icon: AlertOctagon, title: 'Curva H-V Dead Man', description: 'Diagrama altura-velocidad para falla simple y doble de motor, con zona de evitación interactiva.' },
      { id: 'oei', icon: Flame, title: 'Emergencia OEI Monomotor', description: 'Techo y régimen de ascenso con un solo motor operativo, y perfil de drift-down.' },
    ],
  },
  {
    groupName: 'Navegación & Meteorología',
    items: [
      { id: 'navplan', icon: Route, title: 'Planificación de Navegación', description: 'Preparación de vuelo por tramos contra el listado de aeródromos, aeropuertos y helipuertos de Argentina, con rumbos, distancias, combustible y meteorología de ruta.' },
      { id: 'route', icon: MapPin, title: 'Rutas Modena HEMS', description: 'Planificación de tramos por misión (Vista, UTV, SAME, YPF) con distancia, rumbo, tiempo y combustible.' },
      { id: 'fuel', icon: Fuel, title: 'Combustible & Autonomía', description: 'Autonomía, reserva VFR, punto bingo y curva de agotamiento de combustible JET A-1.' },
      { id: 'weather', icon: CloudSun, title: 'METAR / TAF & Viento', description: 'Meteorología en vivo (NOAA) de las bases operativas, componentes de viento y estado del mar offshore.' },
      { id: 'nvg', icon: Moon, title: 'Visión Nocturna & NVG', description: 'Orto/ocaso, crepúsculo civil y fase lunar para evaluar aptitud de operación con NVG.' },
      { id: 'windsim', icon: Compass, title: 'Simulador Helipuerto', description: 'Vector de viento relativo y componente cruzado/cola para el patrón de aproximación al helideck.' },
    ],
  },
  {
    groupName: 'Operación HEMS & Seguridad',
    items: [
      { id: 'hems', icon: HeartPulse, title: 'Oxígeno HEMS', description: 'Autonomía de oxígeno médico y checklist de seguridad de cabina HEMS (camilla, LOX, energía).' },
      { id: 'checklists', icon: CheckSquare, title: 'Listas QRH & Voz', description: 'Checklists normales, por base y de emergencia, con copiloto de voz (texto a voz).' },
      { id: 'risk', icon: ShieldCheck, title: 'Matriz Riesgo SMS OACI', description: 'Evaluación dinámica de amenazas operativas según la matriz 5x5 de severidad y probabilidad OACI.' },
    ],
  },
  {
    groupName: 'Despacho & Documentación',
    items: [
      { id: 'fplan', icon: FileText, title: 'Plan de Vuelo OACI EANA', description: 'Formulario reglamentario FPL 1801, con envío por correo a ARO-AIS y descarga en PDF.' },
      { id: 'library', icon: BookOpen, title: 'Biblioteca ANAC & RFM', description: 'Documentación oficial: RFM BO105 CBS-4, RAAC 91/135 y manuales operativos Modena.' },
      { id: 'logbook', icon: Book, title: 'Bitácora Digital', description: 'Registro de vuelos por misión, horas, combustible y aterrizajes, exportable a CSV.' },
      { id: 'dispatch', icon: FileCheck, title: 'Despacho PDF Oficial', description: 'Hoja de despacho con los datos reales de W&B, performance y ruta configurados en la app.' },
    ],
  },
];

export const HomeModule: React.FC<HomeModuleProps> = ({ onNavigate }) => {
  const { profiles } = useEfbData();

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Hero */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 font-mono space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white rounded-lg p-2 shrink-0 flex items-center justify-center">
            <Image src="/mas_logo.jpg" alt="Modena Air Service" width={240} height={84} className="h-12 w-auto" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Electronic Flight Bag — BO105 CBS-4 HEMS</h1>
            <p className="text-xs text-slate-400 mt-1">
              Herramienta digital de referencia de Modena Air Service para operaciones HEMS con el helicóptero
              MBB Bölkow BO105 CBS-4 Stretched: cálculo de peso y balanceo, performance, planificación
              de rutas, meteorología, checklists, gestión de riesgo y documentación de despacho.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('manual')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition"
          >
            <HelpCircle className="w-4 h-4" /> Ver Manual de Operación <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition"
          >
            <UserCircle className="w-4 h-4" /> {profiles.length > 0 ? 'Ver Roster de Tripulantes' : 'Registrar Tripulante'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Module overview */}
      <div className="space-y-5">
        {GROUPS.map(group => (
          <div key={group.groupName} className="space-y-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">{group.groupName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="text-left glass-card p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60 transition cursor-pointer space-y-1.5 font-mono"
                  >
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xs font-bold text-slate-100">{item.title}</h3>
                    <p className="text-[10px] text-slate-400 leading-snug">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 text-center">
        MODENA AIR SERVICE • ELECTRONIC FLIGHT BAG • MBB BÖLKOW BO105 CBS-4 • REV 2026
      </div>
    </div>
  );
};
