import jsPDF from 'jspdf';
import { WBSummary, WBStation, PerformanceResult, RouteLeg } from '../types/efb';
import { BO105_SPECS } from './bo105-specs';

export function generateDispatchPDF(
  summary: WBSummary,
  stations: WBStation[],
  perf: PerformanceResult,
  legs: RouteLeg[],
  pilotName: string = 'Cap. Juan Pérez (PIC)',
  missionType: string = 'Neuquén Vaca Muerta (Vista Energy)',
  copilotName: string = '',
  doctorName: string = '',
  pilotSignatureDataUrl: string | null = null
) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleString('es-AR');

  // Header Box - Modena Air Service Brand
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MODENA AIR SERVICE - ELECTRONIC FLIGHT BAG (EFB)', 14, 13);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('HOJA DE DESPACHO OFICIAL, PESO & BALANCEO Y PERFORMANCE RAAC 135 HEMS', 14, 21);
  doc.text(`Fecha: ${dateStr}`, 135, 21);
  doc.text('MBB BÖLKOW BO105 CBS-4 STRETCHED', 14, 27);

  // Aircraft & Mission Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. INFORMACIÓN DE LA AERONAVE Y OPERACIÓN MODENA', 14, 40);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Aeronave: MBB Bölkow BO105 CBS-4 Stretched (+10 in)`, 14, 47);
  doc.text(`Operador: Modena Air Service`, 14, 53);
  doc.text(`Piloto al Mando (PIC): ${pilotName}`, 14, 59);
  doc.text(`Contrato / Operación: ${missionType}`, 110, 47);
  doc.text(`MTOW Máximo: 2,500 kg`, 110, 53);
  doc.text(`Planta Motriz: 2x Allison 250-C20B (420 SHP ea)`, 110, 59);
  doc.text(`Copiloto / HEMS Crew (SIC): ${copilotName || 'N/A'}`, 14, 65);
  doc.text(`Médico Aeroevacuador: ${doctorName || 'N/A'}`, 110, 65);

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(14, 70, 196, 70);

  // W&B Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('2. DESGLOSE DE PESO Y BALANCEO (LONGITUDINAL Y LATERAL)', 14, 78);

  let y = 86;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 243, 246);
  doc.rect(14, y - 4, 182, 7, 'F');
  doc.text('Estación / Carga HEMS', 16, y);
  doc.text('Brazo (mm)', 110, y);
  doc.text('Peso (kg)', 140, y);
  doc.text('Momento (kg·m)', 170, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  const bewMomentKgM = ((BO105_SPECS.bewKg * BO105_SPECS.bewArmMm) / 1000).toFixed(1);
  doc.text('Peso Básico Vacío (BEW)', 16, y);
  doc.text(BO105_SPECS.bewArmMm.toString(), 110, y);
  doc.text(BO105_SPECS.bewKg.toString(), 140, y);
  doc.text(bewMomentKgM, 170, y);

  stations.forEach(st => {
    y += 5.5;
    const moment = ((st.weightKg * st.armMm) / 1000).toFixed(1);
    doc.text(st.name.substring(0, 42), 16, y);
    doc.text(st.armMm.toString(), 110, y);
    doc.text(st.weightKg.toString(), 140, y);
    doc.text(moment, 170, y);
  });

  y += 7;
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.text(`PESO TOTAL DESPEGUE: ${summary.totalWeightKg} kg / 2,500 kg MTOW`, 14, y);
  doc.text(`CG LONGITUDINAL: ${summary.cgLocationMm.toFixed(1)} mm`, 120, y);
  y += 5;
  doc.text(`ESTADO DE PESO: ${summary.isWeightValid ? 'DENTRO DE LÍMITES' : 'EXCEDIDO'}`, 14, y);
  doc.text(`ESTADO CG: ${summary.isCgValid ? 'DENTRO DE ENVOLVENTE OK' : 'FUERA DE LÍMITES'}`, 120, y);

  y += 8;
  doc.line(14, y, 196, y);

  // Performance section
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('3. EVALUACIÓN DE PERFORMANCE Y MARGEN HOGE / OEI', 14, y);

  y += 7;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Altitud Densidad: ${perf.densityAltFt} ft (ISA Dev: ${perf.isaDevC > 0 ? '+' : ''}${perf.isaDevC.toFixed(1)}°C)`, 14, y);
  doc.text(`Máximo Peso HOGE: ${perf.hogeMaxWeightKg} kg`, 120, y);
  y += 5;
  doc.text(`Capacidad Estacionario HOGE: ${perf.canHoge ? 'CUMPLE (APTO HELIDECK/MAR/URBANO)' : 'NO CUMPLE'}`, 14, y);
  doc.text(`Régimen Ascenso OEI: ${perf.oeiClimbRateFpm} ft/min`, 120, y);
  y += 5;
  doc.text(`VNE Ajustada por Altitud: ${perf.adjustedVneKias} KIAS`, 14, y);
  doc.text(`Componente Viento Cruzado: ${perf.crosswindKt} kt (Máx 25kt)`, 120, y);

  y += 8;
  doc.line(14, y, 196, y);

  // Navigation & Overwater plan
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('4. PLAN DE NAVEGACIÓN Y EXPOSICIÓN TERRESTRE / FLUVIAL / OVERWATER', 14, y);

  y += 7;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  let totalDist = 0;
  let totalTime = 0;
  let overwaterTime = 0;

  legs.forEach((leg, idx) => {
    totalDist += leg.distanceNm;
    totalTime += leg.flightTimeMin;
    if (leg.isOverwater) overwaterTime += leg.flightTimeMin;
    doc.text(`Tramo ${idx + 1}: ${leg.from.name} -> ${leg.to.name} (${leg.distanceNm} NM / ${leg.flightTimeMin} min)`, 14, y);
    y += 5;
  });

  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.text(`Distancia Total: ${totalDist.toFixed(1)} NM | Tiempo Vuelo: ${totalTime.toFixed(1)} min`, 14, y);
  y += 5;
  doc.text(`Exposición Overwater: ${overwaterTime.toFixed(1)} min (Límite Mandatorio: < 5.0 min)`, 14, y);

  // Disclaimer
  y += 8;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(140, 90, 20);
  const disclaimer = doc.splitTextToSize(
    'Documento generado por herramienta de referencia y entrenamiento (EFB Modena). Los cálculos de peso, balanceo y performance son aproximaciones no verificadas contra el RFM oficial vigente. No reemplaza el Manual de Vuelo, el MOP Modena ni el juicio operativo del PIC.',
    182
  );
  doc.text(disclaimer, 14, y);
  y += disclaimer.length * 3.2;
  doc.setTextColor(0, 0, 0);

  // Footer / Signatures
  y += 6;
  doc.rect(14, y, 85, 22);
  doc.rect(110, y, 86, 22);
  if (pilotSignatureDataUrl) {
    try {
      doc.addImage(pilotSignatureDataUrl, 'PNG', 16, y + 1, 60, 14);
    } catch {
      // Malformed/unsupported image data — fall back to the blank signature box.
    }
  }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Firma y Aclaración Piloto al Mando (PIC)', 18, y + 18);
  doc.text('Firma y Aclaración Médico Aeroevacuador HEMS', 114, y + 18);

  doc.save(`Despacho_Modena_BO105_${Date.now()}.pdf`);
}

export interface EanaFlightPlanParams {
  callsign: string;
  flightRules: string;
  flightType: string;
  aircraftType: string;
  wakeTurbulence: string;
  equipment: string;
  transponder: string;
  depIcao: string;
  eobtTime: string;
  cruiseSpeed: string;
  cruiseLevel: string;
  routeText: string;
  destIcao: string;
  eetTime: string;
  altn1Icao: string;
  altn2Icao: string;
  otherInfo: string;
  enduranceHours: string;
  pobCount: number;
  radioCode: string; // Casilla 19 R/ — UHF/VHF/ELT carried (e.g. "V E")
  survivalCode: string; // Casilla 19 S/ — POLAR/DESERT/MARITIME/JUNGLE carried
  jacketsCode: string; // Casilla 19 J/ — LIGHT/FLUORESCEIN carried
  dinghyCount: number;
  dinghyCapacity: number;
  dinghyCovered: boolean;
  dinghyColor: string;
  remarksN: string; // Casilla 19 N/ — supplementary survival equipment remarks
  picName: string;
  picLicenseType: string;
  picLicenseNumber: string;
  picPhone: string;
  aircraftColor: string;
  pilotSignatureDataUrl?: string | null;
}

export function eanaFlightPlanFileName(callsign: string): string {
  return `Plan_de_Vuelo_EANA_1801_${callsign}_${Date.now()}.pdf`;
}

// Builds the FPL 1801 document without saving it, so callers can either trigger a
// browser download (save) or turn it into a Blob/File to hand off to navigator.share.
//
// Box layout fills the full A4 printable area (10mm margins on all sides, 10-287mm)
// instead of stopping at ~268mm — the freed 19mm goes into taller boxes and larger data
// fonts (labels ~8pt, data 10.5-14pt) so the printed sheet reads clearly at arm's length.
export function buildEanaFlightPlanDoc(params: EanaFlightPlanParams) {
  const doc = new jsPDF('portrait', 'mm', 'a4');

  // EANA Header Banner
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);

  doc.setFillColor(240, 240, 240);
  doc.rect(10, 10, 190, 23, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('REPUBLICA ARGENTINA - EMPRESA ARGENTINA DE NAVEGACION AEREA (EANA S.E.)', 15, 18);
  doc.setFontSize(11);
  doc.text('FORMULARIO REGLAMENTARIO DE PLAN DE VUELO (FPL 1801 OACI / ANAC)', 15, 25);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`FECHA EMISIÓN: ${new Date().toLocaleDateString('es-AR')} | OPERADOR: MODENA AIR SERVICE`, 15, 31);

  // Casilla 3 - Prioridad & Encabezado ATS
  doc.rect(10, 35, 190, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('3. PRIORIDAD / DESTINATARIOS AFTN / HORA DE DEPÓSITO / REMITENTE', 12, 39);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(`FF  ${params.depIcao}ZPZX ${params.destIcao}ZPZX`, 12, 47);
  doc.text(`${new Date().getUTCHours().toString().padStart(2, '0')}${new Date().getUTCMinutes().toString().padStart(2, '0')} UTC  ${params.callsign}`, 110, 47);

  // Casilla 7 & 8
  doc.rect(10, 52, 95, 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('7. IDENTIFICACIÓN AERONAVE', 12, 56);
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.text(params.callsign, 15, 65);

  doc.rect(105, 52, 95, 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('8. REGLAS DE VUELO / TIPO DE VUELO', 107, 56);
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.text(`${params.flightRules}    ${params.flightType}`, 120, 65);

  // Casilla 9 & 10
  doc.rect(10, 71, 95, 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('9. NÚMERO / TIPO AERONAVE / ESTELA', 12, 75);
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.text(`1  ${params.aircraftType} / ${params.wakeTurbulence}`, 15, 84);

  doc.rect(105, 71, 95, 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('10. EQUIPO NAVEGACIÓN & TRANSPONDER', 107, 75);
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.text(`${params.equipment} / ${params.transponder}`, 120, 84);

  // Casilla 13
  doc.rect(10, 90, 190, 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('13. AERÓDROMO DE SALIDA & HORA EOBT (UTC)', 12, 94);
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.text(`${params.depIcao}   ${params.eobtTime} UTC`, 15, 103);

  // Casilla 15
  doc.rect(10, 109, 190, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('15. VELOCIDAD DE CRUCERO / NIVEL / RUTA SOLICITADA', 12, 113);
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.text(`${params.cruiseSpeed}  ${params.cruiseLevel}`, 15, 121);
  doc.setFontSize(11);
  const splitRoute = doc.splitTextToSize(params.routeText, 182);
  doc.text(splitRoute, 15, 129);

  // Casilla 16
  doc.rect(10, 138, 190, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('16. AERÓDROMO DE DESTINO & EET / ALTERNATIVOS', 12, 142);
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.text(`DESTINO: ${params.destIcao}   EET: ${params.eetTime} M`, 15, 150);
  doc.text(`ALTN 1: ${params.altn1Icao}   ALTN 2: ${params.altn2Icao}`, 15, 157);

  // Casilla 18
  doc.rect(10, 160, 190, 29);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('18. OTROS DATOS (DATOS OACI / REMARKS)', 12, 164);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10.5);
  const splitOther = doc.splitTextToSize(params.otherInfo, 182);
  doc.text(splitOther, 15, 173);

  // Casilla 19 - Suplementaria (Búsqueda y Salvamento) — ICAO Doc 4444 Apéndice 2
  doc.rect(10, 191, 190, 60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('19. INFORMACIÓN SUPLEMENTARIA (INFORMACIÓN SAR & SUPERVIVENCIA)', 12, 195);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10.5);
  const dinghyCoverTxt = params.dinghyCovered ? 'C' : 'SIN C';
  doc.text(`E / ${params.enduranceHours}    P / ${params.pobCount}`, 15, 203);
  doc.text(`R / ${params.radioCode || 'NIL'} (RADIO EMERGENCIA UHF 243,0 / VHF 121,5 / ELT)`, 15, 210);
  doc.text(`S / ${params.survivalCode || 'NIL'} (EQUIPO SUPERVIVENCIA POLAR/DESIERTO/MARÍTIMO/SELVA)`, 15, 217);
  doc.text(`J / ${params.jacketsCode || 'NIL'} (CHALECOS LUZ/FLUORESCEÍNA)`, 15, 224);
  doc.text(`D / ${params.dinghyCount}  ${params.dinghyCapacity} PAX  ${dinghyCoverTxt}  ${params.dinghyColor}`, 15, 231);
  doc.text(`A / ${params.aircraftColor}`, 15, 238);
  doc.setFontSize(9.5);
  const splitRemarksN = doc.splitTextToSize(`N / ${params.remarksN || 'NIL'}`, 182);
  doc.text(splitRemarksN, 15, 245);

  // Signatures
  doc.rect(10, 255, 95, 32);
  doc.rect(105, 255, 95, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PILOTO AL MANDO (PIC) / FIRMA', 12, 259);
  doc.text('DESPACHANTE OACI / EANA ARO-AIS SALIDA', 107, 259);
  if (params.pilotSignatureDataUrl) {
    try {
      doc.addImage(params.pilotSignatureDataUrl, 'PNG', 12, 261, 60, 16);
    } catch {
      // Malformed/unsupported image data — fall back to the blank signature box.
    }
  }
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(params.picName, 12, 277);
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  const picContactLine = [
    params.picLicenseType && `LIC ${params.picLicenseType}`,
    params.picLicenseNumber && `N° ${params.picLicenseNumber}`,
    params.picPhone && `CEL ${params.picPhone}`
  ].filter(Boolean).join('   ');
  if (picContactLine) doc.text(picContactLine, 12, 282);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text('OFICINA DE NOTIFICACIÓN ARO-AIS', 107, 277);

  return doc;
}

// Saves the FPL 1801 document to the browser's downloads location (the user's chosen
// download folder on desktop, tablet or mobile).
export function generateEanaFlightPlanPDF(params: EanaFlightPlanParams) {
  const doc = buildEanaFlightPlanDoc(params);
  doc.save(eanaFlightPlanFileName(params.callsign));
}
