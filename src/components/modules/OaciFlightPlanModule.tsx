'use client';

import React from 'react';
import { Send, Copy, Check, FileText, Mail, ShieldAlert, Plane, Download } from 'lucide-react';
import { generateEanaFlightPlanPDF } from '../../lib/pdf-generator';
import { useEfbData } from '../../context/EfbDataContext';
import { calculateDistanceNm } from '../../lib/calculations';

const FPL_CRUISE_SPEED_KT = 100;

export const OaciFlightPlanModule: React.FC = () => {
  const { activeProfile, routePoints } = useEfbData();
  // Casilla 7 & 8
  const [callsign, setCallsign] = React.useState<string>('LQHEMS');
  const [flightRules, setFlightRules] = React.useState<string>('V');
  const [flightType, setFlightType] = React.useState<string>('N');

  // Casilla 9 & 10
  const [aircraftType] = React.useState<string>('B105');
  const [wakeTurbulence] = React.useState<string>('L');
  const [equipment, setEquipment] = React.useState<string>('S/C');
  const [transponder, setTransponder] = React.useState<string>('S');

  // Casilla 13
  const [depIcao, setDepIcao] = React.useState<string>('SAZN');
  const [eobtTime, setEobtTime] = React.useState<string>('1200');

  // Casilla 15
  const [cruiseSpeed, setCruiseSpeed] = React.useState<string>('N0110');
  const [cruiseLevel, setCruiseLevel] = React.useState<string>('VFR');
  const [routeText, setRouteText] = React.useState<string>('DCT ANL DCT RDS');

  // Casilla 16
  const [destIcao, setDestIcao] = React.useState<string>('ANL');
  const [eetTime, setEetTime] = React.useState<string>('0045');
  const [altn1Icao, setAltn1Icao] = React.useState<string>('SAZN');
  const [altn2Icao, setAltn2Icao] = React.useState<string>('SAOB');

  // Casilla 18
  const [otherInfo, setOtherInfo] = React.useState<string>(
    'PBN/A1 NAV/RNV1 REG/LQHEMS RMK/OPERACION HEMS URGENCIA MEDICA MODENA AIR SERVICE'
  );

  // Casilla 19
  const [enduranceHours, setEnduranceHours] = React.useState<string>('0230');
  const [pobCount, setPobCount] = React.useState<number>(4);
  const [picName, setPicName] = React.useState<string>('Cap. Juan Pérez (PIC)');
  const [aircraftColor] = React.useState<string>('BLANCO CON AZUL Y ROJO MODENA');

  // Prefill PIC name from the active crew roster profile, if it's flying as PIC today.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the roster store on mount/change, not a render loop
    if (activeProfile && activeProfile.role === 'PIC' && activeProfile.fullName) setPicName(activeProfile.fullName);
  }, [activeProfile]);

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
    if (alternates[0]) setAltn1Icao(alternates[0].code);
    if (alternates[1]) setAltn2Icao(alternates[1].code);

    const totalDistanceNm = main.slice(0, -1).reduce((sum, p, idx) => sum + calculateDistanceNm(p, main[idx + 1]), 0);
    const totalMin = (totalDistanceNm / FPL_CRUISE_SPEED_KT) * 60;
    const hh = Math.floor(totalMin / 60).toString().padStart(2, '0');
    const mm = Math.round(totalMin % 60).toString().padStart(2, '0');
    setEetTime(`${hh}${mm}`);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [routePoints]);

  // Email destination & Sending state
  const [recipientEmail, setRecipientEmail] = React.useState<string>('aro-ais@eana.com.ar');
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [sendResult, setSendResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  // Load Preset by Base Contract
  const handleLoadPreset = (preset: 'vista' | 'utv' | 'same' | 'ypf') => {
    if (preset === 'vista') {
      setDepIcao('SAZN');
      setDestIcao('ANL');
      setRouteText('DCT ANL DCT RDS');
      setEetTime('0045');
      setAltn1Icao('SAZN');
      setAltn2Icao('SAOB');
      setOtherInfo('PBN/A1 NAV/RNV1 REG/LQHEMS RMK/CONTRATO VISTA VACA MUERTA HEMS MODENA');
    } else if (preset === 'utv') {
      setDepIcao('SAAR');
      setDestIcao('HSP');
      setRouteText('DCT HSP DCT PRN');
      setEetTime('0030');
      setAltn1Icao('SAAR');
      setAltn2Icao('VIC');
      setOtherInfo('PBN/A1 NAV/RNV1 REG/LQHEMS RMK/OPERACION UTV ROSARIO SANATORIO PARQUE');
    } else if (preset === 'same') {
      setDepIcao('SABE');
      setDestIcao('HBR');
      setRouteText('DCT HBR DCT HSAN');
      setEetTime('0025');
      setAltn1Icao('SADF');
      setAltn2Icao('SABE');
      setOtherInfo('PBN/A1 NAV/RNV1 REG/LQHEMS RMK/OPERACION SAME AEREO CÓDIGO ROJO URBANO');
    } else if (preset === 'ypf') {
      setDepIcao('SA21');
      setDestIcao('SEMINOLE');
      setRouteText('DCT PC DCT SEMINOLE');
      setEetTime('0035');
      setAltn1Icao('SAVY');
      setAltn2Icao('SA21');
      setOtherInfo('PBN/A1 NAV/RNV1 REG/LQHEMS RMK/YPF VMOS OFFSHORE OVERWATER DLV SEMINOLE');
    }
  };

  const handleDownloadPDF = () => {
    generateEanaFlightPlanPDF({
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
      picName,
      aircraftColor
    });
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
-R/V/S
-J/L/F
-D/1 6 C/NARANJA
-A/${aircraftColor}
-C/${picName})`;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawOaciPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendResult(null);

    const emailSubject = `[PLAN DE VUELO EANA FORMULARIO 1801] - ${callsign} - ${depIcao} -> ${destIcao} (${eobtTime} UTC)`;
    
    // Official Regulatory EANA Form 1801 HTML Grid Template
    const emailHtml = `
      <div style="font-family: 'Courier New', Courier, monospace; background-color: #ffffff; color: #000000; padding: 20px; border: 2px solid #000000; max-w: 800px; margin: auto;">
        <!-- Header Banner EANA -->
        <table style="width: 100%; border: 1px solid #000000; border-collapse: collapse; margin-bottom: 10px; background-color: #f1f5f9;">
          <tr>
            <td style="padding: 10px; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold; border-bottom: 1px solid #000000;">
              REPUBLICA ARGENTINA - EMPRESA ARGENTINA DE NAVEGACION AEREA (EANA S.E.)<br/>
              <span style="font-size: 11px; font-weight: normal; color: #475569;">SERVICIOS DE TRÁNSITO AÉREO • FORMULARIO REGLAMENTARIO DE PLAN DE VUELO 1801 (OACI / ANAC)</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; font-family: Arial, sans-serif; font-size: 10px; color: #334155;">
              <strong>OPERADOR:</strong> MODENA AIR SERVICE | <strong>EMISIÓN:</strong> ${new Date().toLocaleString('es-AR')}
            </td>
          </tr>
        </table>

        <!-- Regulatory Box 3: Priority & AFTN Header -->
        <table style="width: 100%; border: 1px solid #000000; border-collapse: collapse; margin-bottom: 8px;">
          <tr style="background-color: #e2e8f0; font-family: Arial; font-size: 9px; font-weight: bold;">
            <td style="padding: 4px;">3. PRIORIDAD / DESTINATARIOS AFTN / HORA DEPÓSITO / REMITENTE</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-size: 12px; font-weight: bold;">
              FF  ${depIcao}ZPZX ${destIcao}ZPZX<br/>
              ${new Date().getUTCHours().toString().padStart(2, '0')}${new Date().getUTCMinutes().toString().padStart(2, '0')} UTC  ${callsign}
            </td>
          </tr>
        </table>

        <!-- Regulatory Box 7, 8, 9, 10 Grid -->
        <table style="width: 100%; border: 1px solid #000000; border-collapse: collapse; margin-bottom: 8px;">
          <tr>
            <td style="width: 50%; border: 1px solid #000000; padding: 6px; vertical-align: top;">
              <span style="font-family: Arial; font-size: 8px; font-weight: bold; color: #475569;">7. IDENTIFICACIÓN AERONAVE</span><br/>
              <strong style="font-size: 14px;">${callsign}</strong>
            </td>
            <td style="width: 50%; border: 1px solid #000000; padding: 6px; vertical-align: top;">
              <span style="font-family: Arial; font-size: 8px; font-weight: bold; color: #475569;">8. REGLAS DE VUELO / TIPO DE VUELO</span><br/>
              <strong style="font-size: 14px;">${flightRules} &nbsp;&nbsp;&nbsp;&nbsp; ${flightType}</strong>
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000000; padding: 6px; vertical-align: top;">
              <span style="font-family: Arial; font-size: 8px; font-weight: bold; color: #475569;">9. NÚMERO / TIPO AERONAVE / ESTELA</span><br/>
              <strong style="font-size: 13px;">1 &nbsp; ${aircraftType} / ${wakeTurbulence}</strong>
            </td>
            <td style="border: 1px solid #000000; padding: 6px; vertical-align: top;">
              <span style="font-family: Arial; font-size: 8px; font-weight: bold; color: #475569;">10. EQUIPO NAVEGACIÓN & TRANSPONDER</span><br/>
              <strong style="font-size: 13px;">${equipment} / ${transponder}</strong>
            </td>
          </tr>
        </table>

        <!-- Regulatory Box 13: Salida -->
        <table style="width: 100%; border: 1px solid #000000; border-collapse: collapse; margin-bottom: 8px;">
          <tr style="background-color: #e2e8f0; font-family: Arial; font-size: 9px; font-weight: bold;">
            <td style="padding: 4px;">13. AERÓDROMO DE SALIDA & HORA EOBT (UTC)</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-size: 13px; font-weight: bold;">
              ${depIcao} &nbsp;&nbsp;&nbsp;&nbsp; ${eobtTime} UTC
            </td>
          </tr>
        </table>

        <!-- Regulatory Box 15: Vel, Nivel, Ruta -->
        <table style="width: 100%; border: 1px solid #000000; border-collapse: collapse; margin-bottom: 8px;">
          <tr style="background-color: #e2e8f0; font-family: Arial; font-size: 9px; font-weight: bold;">
            <td style="padding: 4px;">15. VELOCIDAD DE CRUCERO / NIVEL / RUTA SOLICITADA OACI</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-size: 12px;">
              <strong>CRUCERO & NIVEL:</strong> ${cruiseSpeed} &nbsp;&nbsp; ${cruiseLevel}<br/>
              <strong>RUTA:</strong> ${routeText}
            </td>
          </tr>
        </table>

        <!-- Regulatory Box 16: Destino & Alternativos -->
        <table style="width: 100%; border: 1px solid #000000; border-collapse: collapse; margin-bottom: 8px;">
          <tr style="background-color: #e2e8f0; font-family: Arial; font-size: 9px; font-weight: bold;">
            <td style="padding: 4px;">16. AERÓDROMO DE DESTINO & EET / ALTERNATIVOS 1 Y 2</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-size: 12px;">
              <strong>DESTINO:</strong> ${destIcao} &nbsp;&nbsp; <strong>EET:</strong> ${eetTime} M &nbsp;&nbsp;&nbsp;&nbsp;
              <strong>ALTN 1:</strong> ${altn1Icao} &nbsp;&nbsp; <strong>ALTN 2:</strong> ${altn2Icao}
            </td>
          </tr>
        </table>

        <!-- Regulatory Box 18: Otros Datos -->
        <table style="width: 100%; border: 1px solid #000000; border-collapse: collapse; margin-bottom: 8px;">
          <tr style="background-color: #e2e8f0; font-family: Arial; font-size: 9px; font-weight: bold;">
            <td style="padding: 4px;">18. OTROS DATOS (DATOS OACI / REMARKS)</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-size: 11px;">
              ${otherInfo}
            </td>
          </tr>
        </table>

        <!-- Regulatory Box 19: Suplementaria SAR -->
        <table style="width: 100%; border: 1px solid #000000; border-collapse: collapse; margin-bottom: 12px;">
          <tr style="background-color: #e2e8f0; font-family: Arial; font-size: 9px; font-weight: bold;">
            <td style="padding: 4px;">19. INFORMACIÓN SUPLEMENTARIA (EQUIPO DE SUPERVIVENCIA & SALVAMENTO)</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-size: 11px; line-height: 1.5;">
              <strong>E/</strong> ${enduranceHours} &nbsp;&nbsp;&nbsp;&nbsp; <strong>P/</strong> ${pobCount}<br/>
              <strong>R/</strong> V / S (RADIO VHF / UHF)<br/>
              <strong>J/</strong> L / F (CHALECOS CON LUZ Y FLUORESCENTE)<br/>
              <strong>D/</strong> 1 BALSA 6 PAX C/NARANJA<br/>
              <strong>A/</strong> ${aircraftColor}<br/>
              <strong>C/</strong> ${picName}
            </td>
          </tr>
        </table>

        <!-- Raw ATS String Box -->
        <div style="background-color: #0f172a; color: #38bdf8; padding: 12px; border-radius: 4px; font-size: 11px;">
          <strong style="color: #ffffff;">CADENA ATS OACI CRUDA:</strong><br/>
          ${rawOaciPlan.replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: emailSubject,
          text: rawOaciPlan,
          html: emailHtml
        })
      });

      const data = await res.json();
      if (data.success) {
        setSendResult({ success: true, message: `Plan de vuelo transmitido con éxito a ${recipientEmail}` });
      } else {
        setSendResult({ success: false, message: data.error || 'Error al transmitir plan de vuelo EANA' });
      }
    } catch (err: unknown) {
      setSendResult({ success: false, message: (err as Error).message });
    } finally {
      setIsSending(false);
    }
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
        </div>
      </div>

      {/* Preset Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 glass-card p-3 rounded-xl border border-slate-800 font-mono text-xs">
        <span className="text-slate-400 font-bold">Presets por Base Modena Air Service:</span>
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => handleLoadPreset('vista')}
            className="px-3 py-1 bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 rounded border border-slate-700 transition cursor-pointer"
          >
            Vista Neuquén
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('utv')}
            className="px-3 py-1 bg-slate-800 hover:bg-emerald-500/20 text-emerald-300 rounded border border-slate-700 transition cursor-pointer"
          >
            UTV Rosario
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('same')}
            className="px-3 py-1 bg-slate-800 hover:bg-amber-500/20 text-amber-300 rounded border border-slate-700 transition cursor-pointer"
          >
            SAME Aéreo
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('ypf')}
            className="px-3 py-1 bg-slate-800 hover:bg-rose-500/20 text-rose-300 rounded border border-slate-700 transition cursor-pointer"
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
                <option value="N">N (No Regular HEMS)</option>
                <option value="S">S (Regular)</option>
                <option value="G">G (General)</option>
                <option value="M">M (Militar)</option>
              </select>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <label className="text-slate-400 block mb-1">15. Nivel de Vuelo</label>
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

          <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-3">
            <div>
              <label className="text-slate-400 block mb-1">19. Autonomía</label>
              <input
                type="text"
                value={enduranceHours}
                onChange={(e) => setEnduranceHours(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">19. Personas (POB)</label>
              <input
                type="number"
                value={pobCount}
                onChange={(e) => setPobCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">19. Piloto (PIC)</label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              />
            </div>
          </div>
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
                <span className="text-[9px] block">E/{enduranceHours} P/{pobCount} R/V/S J/L/F D/1 6 C/NARANJA</span>
                <span className="text-[9px] font-bold text-slate-700">A/{aircraftColor} C/{picName}</span>
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

          {/* Email Transmission Form */}
          <form onSubmit={handleSendEmail} className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
            <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" /> Transmitir Formulario Reglamentario por Correo
            </h3>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Destinatario (ARO-AIS EANA / Notificación):</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
                placeholder="aro-ais@eana.com.ar"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs"
              />
            </div>

            {sendResult && (
              <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                sendResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                {sendResult.success ? <Check className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
                <span>{sendResult.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {isSending ? 'Transmitiendo a EANA...' : 'Enviar Formulario 1801 por Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
