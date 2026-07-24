'use client';

import React from 'react';
import Image from 'next/image';
import { Header } from '../components/Header';
import { Sidebar, TabType } from '../components/Sidebar';
import { DisplayMode } from '../types/efb';
import { EfbDataProvider, useEfbData } from '../context/EfbDataContext';
import { WeightAndBalanceModule } from '../components/modules/WeightAndBalance';
import { PerformanceCalcModule } from '../components/modules/PerformanceCalc';
import { HVCurveModule } from '../components/modules/HVCurveModule';
import { FlightPlannerModule } from '../components/modules/FlightPlanner';
import { FuelRangeModule } from '../components/modules/FuelRangeModule';
import { HemsMedicalModule } from '../components/modules/HemsMedical';
import { ChecklistsModule } from '../components/modules/Checklists';
import { RiskAssessmentModule } from '../components/modules/RiskAssessment';
import { WeatherDecoderModule } from '../components/modules/WeatherDecoderModule';
import { AstronomyNvgModule } from '../components/modules/AstronomyNvgModule';
import { OeiEmergencyPerfModule } from '../components/modules/OeiEmergencyPerfModule';
import { OaciFlightPlanModule } from '../components/modules/OaciFlightPlanModule';
import { HelideckLandingSimModule } from '../components/modules/HelideckLandingSimModule';
import { AviationLibraryModule } from '../components/modules/AviationLibraryModule';
import { FlightLogbookModule } from '../components/modules/FlightLogbookModule';
import { FlightDispatchPDFModule } from '../components/modules/FlightDispatchPDF';
import { HomeModule } from '../components/modules/HomeModule';
import { OperationManualModule } from '../components/modules/OperationManualModule';
import { ProfileModule } from '../components/modules/ProfileModule';
import { NavigationPlanningModule } from '../components/modules/NavigationPlanningModule';
import { ShieldAlert } from 'lucide-react';

export default function EFBHomePage() {
  return (
    <EfbDataProvider>
      <EFBHomeContent />
    </EfbDataProvider>
  );
}

function EFBHomeContent() {
  const [mode, setMode] = React.useState<DisplayMode>('glass');
  const { mission, setMission } = useEfbData();
  const [activeTab, setActiveTab] = React.useState<TabType>('home');
  const [isOpenMobile, setIsOpenMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    document.body.className = `antialiased min-h-screen theme-${mode}`;
  }, [mode]);

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-300 ${
      mode === 'daylight' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Sidebar Navigation Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          mode={mode}
          setMode={setMode}
          mission={mission}
          setMission={setMission}
          onToggleMobileSidebar={() => setIsOpenMobile(true)}
        />

        {/* Reference Data Disclaimer Banner */}
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-3 sm:px-4 py-1.5 flex items-center gap-2 text-[10px] sm:text-xs text-amber-300 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>
            Herramienta de referencia y entrenamiento. Los cálculos de performance, H-V y OEI son aproximaciones propias
            no verificadas contra el RFM oficial vigente. No reemplaza el Manual de Vuelo, el MOP Modena ni el juicio
            operativo del PIC.
          </span>
        </div>

        {/* Main Active Module */}
        <main className="flex-1 p-2 sm:p-4 pb-12">
          {activeTab === 'home' && <HomeModule onNavigate={setActiveTab} />}
          {activeTab === 'manual' && <OperationManualModule />}
          {activeTab === 'profile' && <ProfileModule />}
          {activeTab === 'wb' && <WeightAndBalanceModule />}
          {activeTab === 'perf' && <PerformanceCalcModule />}
          {activeTab === 'hvcurve' && <HVCurveModule />}
          {activeTab === 'navplan' && <NavigationPlanningModule />}
          {activeTab === 'route' && <FlightPlannerModule mission={mission} />}
          {activeTab === 'fuel' && <FuelRangeModule />}
          {activeTab === 'hems' && <HemsMedicalModule />}
          {activeTab === 'checklists' && <ChecklistsModule />}
          {activeTab === 'risk' && <RiskAssessmentModule />}
          {activeTab === 'weather' && <WeatherDecoderModule />}
          {activeTab === 'nvg' && <AstronomyNvgModule />}
          {activeTab === 'oei' && <OeiEmergencyPerfModule />}
          {activeTab === 'fplan' && <OaciFlightPlanModule />}
          {activeTab === 'windsim' && <HelideckLandingSimModule />}
          {activeTab === 'library' && <AviationLibraryModule />}
          {activeTab === 'logbook' && <FlightLogbookModule />}
          {activeTab === 'dispatch' && <FlightDispatchPDFModule />}
        </main>

        {/* Cockpit Footer */}
        <footer className="border-t border-slate-800 py-3 px-4 text-center font-mono text-xs text-slate-500 flex flex-wrap justify-between items-center w-full gap-1">
          <div className="flex items-center gap-2">
            <div className="bg-white rounded p-1 shrink-0 flex items-center">
              <Image src="/mas_logo.jpg" alt="Modena Air Service" width={120} height={42} className="h-4 w-auto" />
            </div>
            <span>MODENA AIR SERVICE • ELECTRONIC FLIGHT BAG • MBB BÖLKOW BO105 CBS-4</span>
          </div>
          <span>REVISIÓN ANAC RAAC 91/135 • CONTRATOS VISTA / UTV / SAME / YPF</span>
          <span>Desarrollado por eforgan</span>
        </footer>
      </div>
    </div>
  );
}
