'use client';

import React from 'react';
import { Copy, Check, FileText, Share2, ShieldAlert, Plane, Download, PenLine, Stethoscope } from 'lucide-react';
import { buildEanaFlightPlanDoc, eanaFlightPlanFileName, generateEanaFlightPlanPDF } from '../../lib/pdf-generator';
import { useEfbData } from '../../context/EfbDataContext';
import { calculateDistanceNm, calculateHeadingDeg, calculateVfrCruisingLevel } from '../../lib/calculations';
import { SignaturePad } from '../SignaturePad';

// Debe coincidir con el crucero fijo de "Planificación de Navegación" (CRUISE_SPEED_KT):
// la Casilla 15 (velocidad) y la Casilla 16 (EET) de este FPL se calculan sobre la misma
// ruta compartida, así que declarar velocidades distintas produciría un EET inconsistente.
const FPL_CRUISE_SPEED_KT = 100;
const FPL_CRUISE_SPEED_FIELD = `N${FPL_CRUISE_SPEED_KT.toString().padStart(4, '0')}`;

type FlightNature = 'general' | 'sanitario';

// Item 18 "Otros Datos" carries the STS/ indicator that flags a flight as medical for ATS
// (per EANA's own casilla 18 reference: STS/HOSP = "vuelo médico declarado por autoridades
// médicas"). Re-applied whenever the toggle changes, without touching the rest of the free text.
function withStsIndicator(text: string, nature: FlightNature): string {
  const stripped = text.replace(/\s*STS\/(HOSP|MEDEVAC)\b/gi, '').trim();
  return nature === 'sanitario' ? `STS/HOSP ${stripped}`.trim() : stripped;
}

function joinEquipmentCodes(codes: Array<[boolean, string]>): string {
  const active = codes.filter(([on]) => on).map(([, code]) => code);
  return active.length ? active.join(' ') : 'NIL';
}

// Casilla 19 N/ (Observaciones) per ICAO Doc 4444: "indíquese todo otro equipo de
// supervivencia a bordo". The BO105's offshore fit-out (traje antiexposición, chalecos,
// Air Pocket Plus, PLB) only applies when S/ Marítimo is carried — kept in sync with that
// checkbox the same way STS/HOSP is kept in sync with the sanitario toggle, without
// touching any other free text the despachante may have typed into N/.
const OFFSHORE_GEAR_NOTE = 'TRAJE ANTIEXPOSICION, CHALECOS SALVAVIDAS (4), AIR POCKET PLUS (4), PLB (3)';

function withOffshoreGearNote(text: string, maritime: boolean): string {
  const stripped = text.split(OFFSHORE_GEAR_NOTE).join('').replace(/^[\s,/]+|[\s,/]+$/g, '').trim();
  if (!maritime) return stripped;
  return stripped ? `${OFFSHORE_GEAR_NOTE} / ${stripped}` : OFFSHORE_GEAR_NOTE;
}

export const OaciFlightPlanModule: React.FC = () => {
  const { activeProfile, routePoints } = useEfbData();
  // Casilla 7 & 8
  const [callsign, setCallsign] = React.useState<string>('LQHEMS');
  const [flightRules, setFlightRules] = React.useState<string>('V');
  const [flightType, setFlightType] = React.useState<string>('N');
  // Naturaleza de la operación: no es una letra de Casilla 8 (esas son S/N/G/M/X), se declara
  // en Casilla 18 mediante STS/HOSP — "vuelo médico declarado por autoridades médicas" (EANA).
  const [flightNature, setFlightNature] = React.useState<FlightNature>('sanitario');

  // Casilla 9 & 10. Casilla 10 se transmite como un único par "NAV/SURV" (p.ej. "S/S"):
  // `equipment` es 10a (equipo COM/NAV/aproximación) y `transponder` es 10b (vigilancia),
  // combinados más abajo como `${equipment}/${transponder}` — por eso `equipment` nunca
  // debe traer su propia barra, o el plan sale con doble "/" (formato OACI inválido).
  const [aircraftType] = React.useState<string>('B105');
  const [wakeTurbulence] = React.useState<string>('L');
  const [equipment, setEquipment] = React.useState<string>('S');
  const [transponder, setTransponder] = React.useState<string>('S');

  // Casilla 13
  const [depIcao, setDepIcao] = React.useState<string>('SAZN');
  const [eobtTime, setEobtTime] = React.useState<string>('1200');

  // Casilla 15
  const [cruiseSpeed, setCruiseSpeed] = React.useState<string>(FPL_CRUISE_SPEED_FIELD);
  const [cruiseLevel, setCruiseLevel] = React.useState<string>('VFR');
  const [routeText, setRouteText] = React.useState<string>('DCT ANL DCT RDS');
  // Altitud de crucero planificada (referencia para la regla hemisférica VFR par/impar);
  // no es una casilla propia del FPL, alimenta el cálculo automático de Nivel de Vuelo (15b).
  const [plannedAltFt, setPlannedAltFt] = React.useState<number>(3500);

  // Casilla 16
  const [destIcao, setDestIcao] = React.useState<string>('ANL');
  const [eetTime, setEetTime] = React.useState<string>('0045');
  const [altn1Icao, setAltn1Icao] = React.useState<string>('SAZN');
  const [altn2Icao, setAltn2Icao] = React.useState<string>('SAOB');

  // Casilla 18
  const [otherInfo, setOtherInfo] = React.useState<string>(
    'PBN/A1 NAV/RNV1 REG/LQHEMS RMK/OPERACION HEMS URGENCIA MEDICA MODENA AIR SERVICE'
  );

  // Casilla 19 - Autonomía, Personas a Bordo
  const [enduranceHours, setEnduranceHours] = React.useState<string>('0230');
  const [pobCount, setPobCount] = React.useState<number>(4);
  const [aircraftColor] = React.useState<string>('BLANCO CON AZUL Y ROJO MODENA');
  const [pilotSignature, setPilotSignature] = React.useState<string | null>(null);

  // Casilla 19 - Equipo de emergencia y supervivencia (R/, S/, J/, D/)
  const [radioUhf, setRadioUhf] = React.useState<boolean>(false);
  const [radioVhf, setRadioVhf] = React.useState<boolean>(true);
  const [radioElt, setRadioElt] = React.useState<boolean>(true);
  const [survivalPolar, setSurvivalPolar] = React.useState<boolean>(false);
  const [survivalDesert, setSurvivalDesert] = React.useState<boolean>(false);
  const [survivalMaritime, setSurvivalMaritime] = React.useState<boolean>(false);
  const [survivalJungle, setSurvivalJungle] = React.useState<boolean>(false);
  const [jacketsLight, setJacketsLight] = React.useState<boolean>(true);
  const [jacketsFluorescein, setJacketsFluorescein] = React.useState<boolean>(true);
  const [dinghyCount, setDinghyCount] = React.useState<number>(1);
  const [dinghyCapacity, setDinghyCapacity] = React.useState<number>(6);
  const [dinghyCovered, setDinghyCovered] = React.useState<boolean>(true);
  const [dinghyColor, setDinghyColor] = React.useState<string>('NARANJA');
  const [remarksN, setRemarksN] = React.useState<string>('');

  // Casilla 19 C/ - Piloto al mando: nombre, licencia y celular (para contacto SAR)
  const [picName, setPicName] = React.useState<string>('Cap. Juan Pérez (PIC)');
  const [picLicenseType, setPicLicenseType] = React.useState<string>('');
  const [picLicenseNumber, setPicLicenseNumber] = React.useState<string>('');
  const [picPhone, setPicPhone] = React.useState<string>('');

  // Prefill PIC name, tipo/número de licencia y celular desde el roster de tripulantes
  // (Registro del Piloto), si está volando como PIC hoy — así no se retipean en cada plan.
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the roster store on mount/change, not a render loop */
    if (activeProfile && activeProfile.role === 'PIC') {
      if (activeProfile.fullName) setPicName(activeProfile.fullName);
      setPicLicenseType(activeProfile.licenseType ?? '');
      setPicLicenseNumber(activeProfile.licenseNumber ?? '');
      setPicPhone(activeProfile.phone ?? '');
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [activeProfile]);

  // Mantiene el indicador STS/HOSP de Casilla 18 sincronizado con la naturaleza declarada,
  // sin pisar el resto del texto libre que haya cargado el despachante.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived toggle sync, not a render loop
    setOtherInfo(prev => withStsIndicator(prev, flightNature));
  }, [flightNature]);

  // Mantiene la nota de equipo offshore (traje antiexposición, chalecos, Air Pocket Plus,
  // PLB) en Casilla 19 N/ sincronizada con S/ Marítimo, sin pisar otras observaciones cargadas.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived toggle sync, not a render loop
    setRemarksN(prev => withOffshoreGearNote(prev, survivalMaritime));
  }, [survivalMaritime]);

  // Prefill departure/destination/route/alternates/EET from the route planned in
  // "Planificación de Navegación", so this FPL matches the actual plan instead of the
  // hardcoded sample route.
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the shared route plan on mount/change, not a render loop */
    const main = routePoints.filter(p => !p.isAlternate);
    const alternates = routePoints.filter(p => p.isAlternate);
    if (main.length < 2) return;

    const first = main[0];
    const last = main[main.length - 1];
    const middle = main.slice(1, -1);

    setDepIcao(first.code);
    setDestIcao(last.code);
    setRouteText(middle.length > 0 ? middle.map(p => `DCT ${p.code}`).join(' ') : 'DCT');
    // Explicitly fall back (not just "leave whatever was there") so switching to a route
    // with fewer alternates doesn't leave a stale alternate from a previously loaded plan.
    setAltn1Icao(alternates[0]?.code ?? 'SAZN');
    setAltn2Icao(alternates[1]?.code ?? 'SAOB');

    const totalDistanceNm = main.slice(0, -1).reduce((sum, p, idx) => sum + calculateDistanceNm(p, main[idx + 1]), 0);
    const totalMin = (totalDistanceNm / FPL_CRUISE_SPEED_KT) * 60;
    const hh = Math.floor(totalMin / 60).toString().padStart(2, '0');
    const mm = Math.round(totalMin % 60).toString().padStart(2, '0');
    setEetTime(`${hh}${mm}`);
    // Keep Casilla 15's stated speed matched to the speed this EET was actually derived from.
    setCruiseSpeed(FPL_CRUISE_SPEED_FIELD);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [routePoints]);

  // Rumbo (derrota) directo entre el primer y último punto de la ruta planificada, base para
  // la regla hemisférica VFR (AIP Argentina GEN 3.3 / Reglamento de Vuelos N° 91).
  const overallTrackDeg = React.useMemo(() => {
    const main = routePoints.filter(p => !p.isAlternate);
    if (main.length < 2) return null;
    return calculateHeadingDeg(main[0], main[main.length - 1]);
  }, [routePoints]);

  // Track 000-179° -> nivel impar; 180-359° -> nivel par; +500 ft en vuelo VFR no controlado.
  // Obligatorio a partir de 3,000 ft; por debajo se puede volar sin nivel fijo ("VFR").
  const vfrLevel = React.useMemo(() => {
    if (flightRules !== 'V' || overallTrackDeg === null) return null;
    return calculateVfrCruisingLevel(overallTrackDeg, plannedAltFt);
  }, [flightRules, overallTrackDeg, plannedAltFt]);

  // Vuelca el nivel reglamentario calculado a la Casilla 15b — VFR es válido por reglamento
  // por debajo de 3,000 ft; por encima es obligatorio expresar la altitud par/impar +500 ft.
  React.useEffect(() => {
    if (!vfrLevel) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived regulatory value from route/altitude/rules, not a render loop
    setCruiseLevel(vfrLevel.isMandatory ? vfrLevel.formatted : 'VFR');
  }, [vfrLevel]);

  const [copied, setCopied] = React.useState<boolean>(false);
  const [shareResult, setShareResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [isSharing, setIsSharing] = React.useState<boolean>(false);

  // Load Preset by Base Contract
  const handleLoadPreset = (preset: 'vista' | 'utv' | 'same' | 'ypf') => {
    setSurvivalMaritime(preset === 'ypf');
    if (preset === 'vista') {
      setDepIcao('SAZN');
      setDestIcao('ANL');
      setRouteText('DCT ANL DCT RDS');
      setEetTime('0045');
      setAltn1Icao('SAZN');
      setAltn2Icao('SAOB');
      setOtherInfo(withStsIndicator('PBN/A1 NAV/RNV1 REG/LQHEMS RMK/CONTRATO VISTA VACA MUERTA HEMS MODENA', flightNature));
    } else if (preset === 'utv') {
      setDepIcao('SAAR');
      setDestIcao('HSP');
      setRouteText('DCT HSP DCT PRN');
      setEetTime('0030');
      setAltn1Icao('SAAR');
      setAltn2Icao('VIC');
      setOtherInfo(withStsIndicator('PBN/A1 NAV/RNV1 REG/LQHEMS RMK/OPERACION UTV ROSARIO SANATORIO PARQUE', flightNature));
    } else if (preset === 'same') {
      setDepIcao('SABE');
      setDestIcao('HBR');
      setRouteText('DCT HBR DCT HSAN');
      setEetTime('0025');
      setAltn1Icao('SADF');
      setAltn2Icao('SABE');
      setOtherInfo(withStsIndicator('PBN/A1 NAV/RNV1 REG/LQHEMS RMK/OPERACION SAME AEREO CÓDIGO ROJO URBANO', flightNature));
    } else if (preset === 'ypf') {
      setDepIcao('SA21');
      setDestIcao('SEMINOLE');
      setRouteText('DCT PC DCT SEMINOLE');
      setEetTime('0035');
      setAltn1Icao('SAVY');
      setAltn2Icao('SA21');
      setOtherInfo(withStsIndicator('PBN/A1 NAV/RNV1 REG/LQHEMS RMK/YPF VMOS OFFSHORE OVERWATER DLV SEMINOLE', flightNature));
    }
  };

  // Casilla 19 emergency/survival codes (R/, S/, J/) — ICAO Doc 4444 Apéndice 2: se listan las
  // letras de lo que SÍ se lleva a bordo (equivalente digital de "táchese lo que no aplica").
  const radioCode = joinEquipmentCodes([[radioUhf, 'U'], [radioVhf, 'V'], [radioElt, 'E']]);
  const survivalCode = joinEquipmentCodes([[survivalPolar, 'P'], [survivalDesert, 'D'], [survivalMaritime, 'M'], [survivalJungle, 'J']]);
  const jacketsCode = joinEquipmentCodes([[jacketsLight, 'L'], [jacketsFluorescein, 'F']]);

  const pdfParams = {
    callsign,
    flightRules,
    flightType,
    aircraftType,
    wakeTurbulence,
    equipment,
    transponder,
    depIcao,
    eobtTime,
    cruiseSpeed,
    cruiseLevel,
    routeText,
    destIcao,
    eetTime,
    altn1Icao,
    altn2Icao,
    otherInfo,
    enduranceHours,
    pobCount,
    radioCode,
    survivalCode,
    jacketsCode,
    dinghyCount,
    dinghyCapacity,
    dinghyCovered,
    dinghyColor,
    remarksN,
    picName,
    picLicenseType,
    picLicenseNumber,
    picPhone,
    aircraftColor,
    pilotSignatureDataUrl: pilotSignature
  };

  const handleDownloadPDF = () => {
    generateEanaFlightPlanPDF(pdfParams);
  };

  // Hands the generated PDF to whatever mail (or other) app the user has installed,
  // via the OS share sheet, instead of relaying it ourselves through an SMTP account.
  const handleShareEmail = async () => {
    setIsSharing(true);
    setShareResult(null);
    try {
      const doc = buildEanaFlightPlanDoc(pdfParams);
      const blob = doc.output('blob');
      const file = new File([blob], eanaFlightPlanFileName(callsign), { type: 'application/pdf' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Plan de Vuelo EANA 1801 - ${callsign}`,
          text: `Plan de vuelo reglamentario ${callsign} ${depIcao} -> ${destIcao} (${eobtTime} UTC)`
        });
        setShareResult({ success: true, message: 'Documento enviado al selector de aplicaciones del dispositivo.' });
      } else {
        // Desktop browsers (or ones without file-sharing support) can't attach a file to
        // a mailto: link, so fall back to a plain download the user can attach by hand.
        doc.save(eanaFlightPlanFileName(callsign));
        setShareResult({
          success: false,
          message: 'Este navegador no admite compartir archivos. Se descargó el PDF: adjuntalo manualmente en tu aplicación de correo.'
        });
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        setShareResult({ success: false, message: (err as Error).message });
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Generate Raw ATS Plain Text
  const rawOaciPlan = `(FPL-${callsign}-${flightRules}${flightType}
-1${aircraftType}/${wakeTurbulence}-${equipment}/${transponder}
-${depIcao}${eobtTime}
-${cruiseSpeed}${cruiseLevel} ${routeText}
-${destIcao}${eetTime} ${altn1Icao} ${altn2Icao}
-${otherInfo})

(SUPP/
-E/${enduranceHours} P/${pobCount}
-R/${radioCode}
-S/${survivalCode}
-J/${jacketsCode}
-D/${dinghyCount} ${dinghyCapacity} ${dinghyCovered ? 'C' : 'SIN C'} ${dinghyColor}
-A/${aircraftColor}
-N/${remarksN || 'NIL'}
-C/${picName}${picLicenseType ? ` LIC ${picLicenseType}` : ''}${picLicenseNumber ? ` N ${picLicenseNumber}` : ''}${picPhone ? ` CEL ${picPhone}` : ''})`;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawOaciPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner Header */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Plan de Vuelo Reglamentario EANA S.E. (Formulario 1801 OACI)
          </h2>
          <p className="text-xs text-slate-400">
            Formulario Oficial de Servicios de Tránsito Aéreo ARO-AIS EANA & Notificación Modena Air Service
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Descargar Formulario 1801 (PDF)
          </button>
          <button
            type="button"
            onClick={handleShareEmail}
            disabled={isSharing}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" /> {isSharing ? 'Preparando...' : 'Enviar por Email'}
          </button>
        </div>
      </div>

      {shareResult && (
        <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 font-mono ${
          shareResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
        }`}>
          {shareResult.success ? <Check className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
          <span>{shareResult.message}</span>
        </div>
      )}

      {/* Preset Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 glass-card p-3 rounded-xl border border-slate-800 font-mono text-xs">
        <span className="text-slate-400 font-bold">Presets por Base Modena Air Service:</span>
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => handleLoadPreset('vista')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition cursor-pointer"
          >
            Vista Neuquén
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('utv')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 transition cursor-pointer"
          >
            UTV Rosario
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('same')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 transition cursor-pointer"
          >
            SAME Aéreo
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('ypf')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded border border-slate-700 transition cursor-pointer"
          >
            YPF Offshore
          </button>
        </div>
      </div>

      {/* Main Interactive Form & EANA Grid Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Interactive Form Fields (6 Cols) */}
        <div className="lg:col-span-6 glass-card p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
          <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
            <Plane className="w-4 h-4 text-cyan-400" /> Edición de Casillas EANA 1801
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">7. Identificación</label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">8. Regla Vuelo</label>
              <select
                value={flightRules}
                onChange={(e) => setFlightRules(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              >
                <option value="V">V (VFR)</option>
                <option value="I">I (IFR)</option>
                <option value="Y">Y (IFR ➔ VFR)</option>
                <option value="Z">Z (VFR ➔ IFR)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">8. Tipo Vuelo</label>
              <select
                value={flightType}
                onChange={(e) => setFlightType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              >
                <option value="N">N (No Regular)</option>
                <option value="S">S (Regular)</option>
                <option value="G">G (General)</option>
                <option value="M">M (Militar)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Naturaleza (Casilla 18 STS/)</label>
              <div className="flex rounded overflow-hidden border border-slate-700">
                <button
                  type="button"
                  onClick={() => setFlightNature('general')}
                  className={`flex-1 px-2 py-1 text-[11px] font-bold cursor-pointer transition ${flightNature === 'general' ? 'bg-slate-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setFlightNature('sanitario')}
                  className={`flex-1 px-2 py-1 text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-1 ${flightNature === 'sanitario' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                >
                  <Stethoscope className="w-3 h-3" /> Sanitario
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">9. Tipo Aeronave</label>
              <input
                type="text"
                value={aircraftType}
                disabled
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">10. Equipo Nav</label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">10. Transponder</label>
              <input
                type="text"
                value={transponder}
                onChange={(e) => setTransponder(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">13. AD Salida</label>
              <input
                type="text"
                value={depIcao}
                onChange={(e) => setDepIcao(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">13. EOBT (UTC)</label>
              <input
                type="text"
                value={eobtTime}
                onChange={(e) => setEobtTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-emerald-400 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">15. Vel Crucero</label>
              <input
                type="text"
                value={cruiseSpeed}
                onChange={(e) => setCruiseSpeed(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Altitud Planificada (ft)</label>
              <input
                type="number"
                step={100}
                value={plannedAltFt}
                onChange={(e) => setPlannedAltFt(Number(e.target.value))}
                disabled={flightRules !== 'V'}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 disabled:opacity-40"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">15. Nivel de Vuelo (auto)</label>
              <input
                type="text"
                value={cruiseLevel}
                onChange={(e) => setCruiseLevel(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">16. Destino & EET</label>
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={destIcao}
                  onChange={(e) => setDestIcao(e.target.value.toUpperCase())}
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-400 font-bold"
                />
                <input
                  type="text"
                  value={eetTime}
                  onChange={(e) => setEetTime(e.target.value)}
                  placeholder="EET"
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-400"
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 -mt-2">
            {flightRules !== 'V'
              ? 'Regla hemisférica par/impar (+500 ft) aplica a vuelo VFR no controlado — con Regla de Vuelo I/Y/Z, cargá el nivel manualmente.'
              : overallTrackDeg === null
                ? 'Cargá al menos 2 puntos en "Planificación de Navegación" para calcular el rumbo y el nivel reglamentario.'
                : `Rumbo directo ${overallTrackDeg}° → nivel ${vfrLevel?.parity} (AIP GEN 3.3 / Regl. de Vuelos N° 91). ${
                    vfrLevel?.isMandatory
                      ? `Obligatorio sobre 3,000 ft: ${vfrLevel.formatted} (${vfrLevel.altitudeFt.toLocaleString('es-AR')} ft).`
                      : 'Por debajo de 3,000 ft no es obligatorio fijar nivel (Casilla 15 = VFR).'
                  }`}
          </p>

          <div>
            <label className="text-slate-400 block mb-1">15. Ruta Solicitada OACI</label>
            <input
              type="text"
              value={routeText}
              onChange={(e) => setRouteText(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">16. AD Alternativo 1</label>
              <input
                type="text"
                value={altn1Icao}
                onChange={(e) => setAltn1Icao(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">16. AD Alternativo 2</label>
              <input
                type="text"
                value={altn2Icao}
                onChange={(e) => setAltn2Icao(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">18. Otros Datos (PBN, NAV, REG, RMK)</label>
            <textarea
              rows={2}
              value={otherInfo}
              onChange={(e) => setOtherInfo(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
            <div>
              <label className="text-slate-400 block mb-1">19. Autonomía (E/)</label>
              <input
                type="text"
                value={enduranceHours}
                onChange={(e) => setEnduranceHours(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">19. Personas a Bordo (P/)</label>
              <input
                type="number"
                value={pobCount}
                onChange={(e) => setPobCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">19. Radio Emergencia (R/)</label>
              <div className="flex gap-2 bg-slate-900 border border-slate-700 rounded px-2 py-1.5">
                {([['UHF 243,0', radioUhf, setRadioUhf], ['VHF 121,5', radioVhf, setRadioVhf], ['ELT', radioElt, setRadioElt]] as const).map(([label, on, setOn]) => (
                  <label key={label} className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="cursor-pointer" /> {label}
                  </label>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 mt-1">ELT instalado transmite en 121,5 MHz.</p>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">19. Equipo Supervivencia (S/)</label>
              <div className="flex flex-wrap gap-2 bg-slate-900 border border-slate-700 rounded px-2 py-1.5">
                {([['Polar', survivalPolar, setSurvivalPolar], ['Desierto', survivalDesert, setSurvivalDesert], ['Marítimo', survivalMaritime, setSurvivalMaritime], ['Selva', survivalJungle, setSurvivalJungle]] as const).map(([label, on, setOn]) => (
                  <label key={label} className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="cursor-pointer" /> {label}
                  </label>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 mt-1">
                Marítimo agrega automáticamente a N/ el equipo offshore (traje antiexposición, chalecos, Air Pocket Plus, PLB).
              </p>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">19. Chalecos (J/)</label>
              <div className="flex gap-2 bg-slate-900 border border-slate-700 rounded px-2 py-1.5">
                {([['Luz', jacketsLight, setJacketsLight], ['Fluoresceína', jacketsFluorescein, setJacketsFluorescein]] as const).map(([label, on, setOn]) => (
                  <label key={label} className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="cursor-pointer" /> {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">19. Botes (D/) N°</label>
              <input type="number" value={dinghyCount} onChange={(e) => setDinghyCount(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">19. Capacidad (pax)</label>
              <input type="number" value={dinghyCapacity} onChange={(e) => setDinghyCapacity(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">19. Cubierta</label>
              <label className="flex items-center gap-1.5 h-[30px] text-[11px] text-slate-300 cursor-pointer">
                <input type="checkbox" checked={dinghyCovered} onChange={(e) => setDinghyCovered(e.target.checked)} className="cursor-pointer" /> Con cubierta
              </label>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">19. Color Botes</label>
              <input type="text" value={dinghyColor} onChange={(e) => setDinghyColor(e.target.value.toUpperCase())} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200" />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">19. Observaciones (N/)</label>
            <input
              type="text"
              value={remarksN}
              onChange={(e) => setRemarksN(e.target.value.toUpperCase())}
              placeholder="Otro equipo de supervivencia a bordo, si corresponde"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-800 pt-3">
            <div>
              <label className="text-slate-400 block mb-1">19. Piloto (C/)</label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Tipo Licencia</label>
              <input
                type="text"
                value={picLicenseType}
                onChange={(e) => setPicLicenseType(e.target.value.toUpperCase())}
                placeholder="PCH"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">N° Licencia</label>
              <input
                type="text"
                value={picLicenseNumber}
                onChange={(e) => setPicLicenseNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Celular</label>
              <input
                type="tel"
                value={picPhone}
                onChange={(e) => setPicPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 -mt-2">
            Nombre, licencia y celular del PIC se autocompletan desde el Registro de Tripulantes (Roster) cuando elegís
            quién &quot;Vuela Hoy&quot; con rol PIC — podés sobrescribirlos acá si hace falta.
          </p>
        </div>

        {/* EANA Official Form Preview & Email (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Official EANA Form Mockup Container */}
          <div className="bg-white text-slate-950 p-4 rounded-xl border border-slate-300 space-y-3 font-mono">
            {/* Header */}
            <div className="border border-slate-400 p-2 bg-slate-100 rounded text-center">
              <h4 className="font-bold text-xs">EANA S.E. - PLAN DE VUELO REGLAMENTARIO (FPL 1801 OACI)</h4>
              <p className="text-[9px] text-slate-600 uppercase">AERONAVE: {callsign} ({aircraftType}) • MODENA AIR SERVICE</p>
            </div>

            {/* Grid Boxes */}
            <div className="border border-slate-400 divide-y divide-slate-400 text-[10px]">
              {/* Box 3 */}
              <div className="p-1.5 bg-slate-50">
                <span className="font-bold text-[8px] text-slate-500 block">3. PRIORIDAD / DESTINATARIOS AFTN / HORA DEPÓSITO</span>
                <span className="font-bold text-cyan-900">FF {depIcao}ZPZX {destIcao}ZPZX -- {new Date().getUTCHours().toString().padStart(2, '0')}{new Date().getUTCMinutes().toString().padStart(2, '0')} UTC</span>
              </div>

              {/* Box 7 & 8 */}
              <div className="grid grid-cols-2 divide-x divide-slate-400">
                <div className="p-1.5">
                  <span className="font-bold text-[8px] text-slate-500 block">7. IDENTIFICACIÓN AERONAVE</span>
                  <span className="font-bold text-xs text-slate-900">{callsign}</span>
                </div>
                <div className="p-1.5">
                  <span className="font-bold text-[8px] text-slate-500 block">8. REGLAS / TIPO VUELO</span>
                  <span className="font-bold text-xs text-slate-900">{flightRules} &nbsp; {flightType}</span>
                  <span className={`ml-2 text-[8px] font-bold px-1.5 py-0.5 rounded ${flightNature === 'sanitario' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                    {flightNature === 'sanitario' ? 'SANITARIO (STS/HOSP)' : 'GENERAL'}
                  </span>
                </div>
              </div>

              {/* Box 9 & 10 */}
              <div className="grid grid-cols-2 divide-x divide-slate-400">
                <div className="p-1.5">
                  <span className="font-bold text-[8px] text-slate-500 block">9. TIPO / ESTELA TURBULENTA</span>
                  <span className="font-bold text-xs text-slate-900">1 {aircraftType} / {wakeTurbulence}</span>
                </div>
                <div className="p-1.5">
                  <span className="font-bold text-[8px] text-slate-500 block">10. EQUIPO NAV / TRANSPONDER</span>
                  <span className="font-bold text-xs text-slate-900">{equipment} / {transponder}</span>
                </div>
              </div>

              {/* Box 13 */}
              <div className="p-1.5">
                <span className="font-bold text-[8px] text-slate-500 block">13. AERÓDROMO DE SALIDA & HORA EOBT</span>
                <span className="font-bold text-xs text-emerald-800">{depIcao} &nbsp;&nbsp; {eobtTime} UTC</span>
              </div>

              {/* Box 15 */}
              <div className="p-1.5">
                <span className="font-bold text-[8px] text-slate-500 block">15. CRUCERO / NIVEL / RUTA OACI</span>
                <span className="font-bold block text-slate-900">{cruiseSpeed} &nbsp; {cruiseLevel}</span>
                <span className="font-bold text-cyan-800">{routeText}</span>
              </div>

              {/* Box 16 */}
              <div className="p-1.5">
                <span className="font-bold text-[8px] text-slate-500 block">16. DESTINO / EET / ALTERNATIVOS</span>
                <span className="font-bold text-amber-800">{destIcao} ({eetTime}m) &nbsp;&nbsp; ALTN1: {altn1Icao} &nbsp; ALTN2: {altn2Icao}</span>
              </div>

              {/* Box 18 */}
              <div className="p-1.5">
                <span className="font-bold text-[8px] text-slate-500 block">18. OTROS DATOS (REMARKS)</span>
                <span className="text-[9px] text-slate-800">{otherInfo}</span>
              </div>

              {/* Box 19 */}
              <div className="p-1.5 bg-slate-50">
                <span className="font-bold text-[8px] text-slate-500 block">19. SUPLEMENTARIA (SAR & SUPERVIVENCIA)</span>
                <span className="text-[9px] block">
                  E/{enduranceHours} P/{pobCount} R/{radioCode} S/{survivalCode} J/{jacketsCode} D/{dinghyCount} {dinghyCapacity} {dinghyCovered ? 'C' : 'SIN C'} {dinghyColor}
                </span>
                <span className="text-[9px] block">A/{aircraftColor} N/{remarksN || 'NIL'}</span>
                <span className="text-[9px] font-bold text-slate-700">
                  C/{picName}{picLicenseType ? ` LIC ${picLicenseType}` : ''}{picLicenseNumber ? ` N° ${picLicenseNumber}` : ''}{picPhone ? ` CEL ${picPhone}` : ''}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center pt-1 text-[10px]">
              <button
                type="button"
                onClick={handleCopyRaw}
                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded font-bold flex items-center gap-1 cursor-pointer transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar Texto OACI'}
              </button>
              <span className="text-slate-500">Reglamentario EANA Form. 1801</span>
            </div>
          </div>

          {/* PIC Signature & Export */}
          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
            <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
              <PenLine className="w-4 h-4 text-emerald-400" /> Firma del PIC & Exportación
            </h3>

            <div>
              <label className="text-[10px] text-slate-400 flex items-center gap-1.5 mb-1">
                <PenLine className="w-3.5 h-3.5" /> Conformidad PIC (Firma)
              </label>
              <SignaturePad onChange={setPilotSignature} />
              <p className="text-[10px] text-slate-500 mt-1">
                {pilotSignature ? 'Firma capturada — se incluye en el PDF.' : 'Sin firmar — el PDF se genera igual, con el recuadro en blanco.'}
              </p>
            </div>

            <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-2">
              Descargá el PDF firmado a una carpeta del dispositivo, o usá &quot;Enviar por Email&quot; para adjuntarlo
              directamente desde el selector de aplicaciones del sistema (Gmail, Outlook, Mail, WhatsApp, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
