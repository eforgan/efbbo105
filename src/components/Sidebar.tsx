'use client';

import React from 'react';
import Image from 'next/image';
import {
  Scale,
  Gauge,
  AlertOctagon,
  MapPin,
  Fuel,
  HeartPulse,
  CheckSquare,
  ShieldAlert,
  CloudSun,
  Moon,
  Flame,
  FileText,
  Compass,
  BookOpen,
  Book,
  FileCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  HelpCircle,
  UserCircle,
  Route
} from 'lucide-react';

export type TabType =
  | 'home'
  | 'wb'
  | 'perf'
  | 'hvcurve'
  | 'route'
  | 'fuel'
  | 'hems'
  | 'checklists'
  | 'risk'
  | 'weather'
  | 'nvg'
  | 'oei'
  | 'fplan'
  | 'windsim'
  | 'library'
  | 'logbook'
  | 'dispatch'
  | 'manual'
  | 'profile'
  | 'navplan';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

interface NavGroup {
  groupName: string;
  items: {
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const [isCollapsedDesktop, setIsCollapsedDesktop] = React.useState<boolean>(false);

  const navGroups: NavGroup[] = [
    {
      groupName: 'INICIO',
      items: [
        { id: 'home', label: 'Inicio', icon: Home },
        { id: 'profile', label: 'Roster Tripulantes', icon: UserCircle, badge: 'Cloud' },
      ],
    },
    {
      groupName: 'CÁLCULO & RENDIMIENTO',
      items: [
        { id: 'wb', label: 'Peso & Balanceo', icon: Scale },
        { id: 'perf', label: 'Performance HOGE/HIGE', icon: Gauge },
        { id: 'hvcurve', label: 'Curva H-V Dead Man', icon: AlertOctagon },
        { id: 'oei', label: 'Emergencia OEI Monomotor', icon: Flame, badge: 'Régimen' },
      ],
    },
    {
      groupName: 'NAVEGACIÓN & METEOROLOGÍA',
      items: [
        { id: 'navplan', label: 'Planificación de Navegación', icon: Route, badge: 'ANAC' },
        { id: 'route', label: 'Rutas Modena HEMS', icon: MapPin },
        { id: 'fuel', label: 'Combustible & Autonomía', icon: Fuel },
        { id: 'weather', label: 'METAR / TAF & Viento', icon: CloudSun },
        { id: 'nvg', label: 'Visión Nocturna & NVG', icon: Moon, badge: 'ANAC' },
        { id: 'windsim', label: 'Simulador Helipuerto', icon: Compass },
      ],
    },
    {
      groupName: 'OPERACIÓN HEMS & SEGURIDAD',
      items: [
        { id: 'hems', label: 'Oxígeno HEMS', icon: HeartPulse },
        { id: 'checklists', label: 'Listas QRH & Voz', icon: CheckSquare, badge: 'TTS Copilot' },
        { id: 'risk', label: 'Matriz Riesgo SMS OACI', icon: ShieldAlert },
      ],
    },
    {
      groupName: 'DESPACHO & DOCUMENTACIÓN',
      items: [
        { id: 'fplan', label: 'Plan de Vuelo OACI EANA', icon: FileText, badge: 'FPL 1801' },
        { id: 'library', label: 'Biblioteca ANAC & RFM', icon: BookOpen },
        { id: 'logbook', label: 'Bitácora Digital', icon: Book },
        { id: 'dispatch', label: 'Despacho PDF Oficial', icon: FileCheck },
        { id: 'manual', label: 'Manual de Operación', icon: HelpCircle },
      ],
    },
  ];

  const handleSelect = (id: TabType) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-slate-900/95 border-r border-slate-800 transition-all duration-300 flex flex-col font-mono text-xs ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsedDesktop ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
              <Image src="/mas_logo.jpg" alt="Modena Air Service" width={120} height={42} className="h-6 w-auto" />
            </div>
            {(!isCollapsedDesktop || isOpenMobile) && (
              <div>
                <span className="text-[10px] text-cyan-400 block truncate">BO105 CBS-4</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsedDesktop(!isCollapsedDesktop)}
            className="hidden lg:flex p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition cursor-pointer"
            title={isCollapsedDesktop ? 'Expandir Menú' : 'Colapsar Menú'}
          >
            {isCollapsedDesktop ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-none">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {(!isCollapsedDesktop || isOpenMobile) && (
                <span className="text-[10px] font-bold text-slate-500 tracking-wider px-2 block uppercase">
                  {group.groupName}
                </span>
              )}

              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 font-bold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                        {(!isCollapsedDesktop || isOpenMobile) && (
                          <span className="truncate text-xs">{item.label}</span>
                        )}
                      </div>

                      {item.badge && (!isCollapsedDesktop || isOpenMobile) && (
                        <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
          {(!isCollapsedDesktop || isOpenMobile) ? (
            <span>MODENA HEMS • REV 2026</span>
          ) : (
            <span>EFB</span>
          )}
        </div>
      </aside>
    </>
  );
};
