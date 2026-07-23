import jsPDF from 'jspdf';
import { WBSummary, WBStation, PerformanceResult, RouteLeg } from '../types/efb';

export function generateDispatchPDF(
  summary: WBSummary,
  stations: WBStation[],
  perf: PerformanceResult,
  legs: RouteLeg[],
  pilotName: string = 'Cap. Juan Pérez (PIC)',
  missionType: string = 'Neuquén Vaca Muerta (Contrato Vista)',
  copilotName: string = '',
  doctorName: string = ''
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
  doc.text('MBB BÖLKOW BO105 CBS-4 STRETCHED (LQ-HEMS)', 14, 27);

  // Aircraft & Mission Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. INFORMACIÓN DE LA AERONAVE Y OPERACIÓN MODENA', 14, 40);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Aeronave: MBB Bölkow BO105 CBS-4 Stretched (+10 in)`, 14, 47);
  doc.text(`Matrícula: LQ-HEMS (Modena Air Service)`, 14, 53);
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
  doc.text('Peso Básico Vacío (BEW)', 16, y);
  doc.text('3250', 110, y);
  doc.text('1460', 140, y);
  doc.text('4745.0', 170, y);

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
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Firma y Aclaración Piloto al Mando (PIC)', 18, y + 18);
  doc.text('Firma y Aclaración Médico Aeroevacuador HEMS', 114, y + 18);

  doc.save(`Despacho_Modena_BO105_${Date.now()}.pdf`);
}

export function generateEanaFlightPlanPDF(params: {
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
  picName: string;
  aircraftColor: string;
}) {
  const doc = new jsPDF('portrait', 'mm', 'a4');

  // EANA Header Banner
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);

  doc.setFillColor(240, 240, 240);
  doc.rect(10, 10, 190, 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('REPUBLICA ARGENTINA - EMPRESA ARGENTINA DE NAVEGACION AEREA (EANA S.E.)', 15, 17);
  doc.setFontSize(10);
  doc.text('FORMULARIO REGLAMENTARIO DE PLAN DE VUELO (FPL 1801 OACI / ANAC)', 15, 24);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`FECHA EMISIÓN: ${new Date().toLocaleDateString('es-AR')} | OPERADOR: MODENA AIR SERVICE (LQ-HEMS)`, 15, 29);

  // Casilla 3 - Prioridad & Encabezado ATS
  doc.rect(10, 34, 190, 14);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('3. PRIORIDAD / DESTINATARIOS AFTN / HORA DE DEPÓSITO / REMITENTE', 12, 38);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(`FF  ${params.depIcao}ZPZX ${params.destIcao}ZPZX`, 12, 44);
  doc.text(`${new Date().getUTCHours().toString().padStart(2, '0')}${new Date().getUTCMinutes().toString().padStart(2, '0')} UTC  ${params.callsign}`, 110, 44);

  // Casilla 7 & 8
  doc.rect(10, 50, 95, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('7. IDENTIFICACIÓN AERONAVE', 12, 54);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(params.callsign, 15, 62);

  doc.rect(105, 50, 95, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('8. REGLAS DE VUELO / TIPO DE VUELO', 107, 54);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(`${params.flightRules}    ${params.flightType}`, 120, 62);

  // Casilla 9 & 10
  doc.rect(10, 68, 95, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('9. NÚMERO / TIPO AERONAVE / ESTELA', 12, 72);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(`1  ${params.aircraftType} / ${params.wakeTurbulence}`, 15, 80);

  doc.rect(105, 68, 95, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('10. EQUIPO NAVEGACIÓN & TRANSPONDER', 107, 72);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(`${params.equipment} / ${params.transponder}`, 120, 80);

  // Casilla 13
  doc.rect(10, 86, 190, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('13. AERÓDROMO DE SALIDA & HORA EOBT (UTC)', 12, 90);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(`${params.depIcao}   ${params.eobtTime} UTC`, 15, 98);

  // Casilla 15
  doc.rect(10, 104, 190, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('15. VELOCIDAD DE CRUCERO / NIVEL / RUTA SOLICITADA', 12, 108);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text(`${params.cruiseSpeed}  ${params.cruiseLevel}`, 15, 115);
  doc.text(params.routeText, 15, 123);

  // Casilla 16
  doc.rect(10, 130, 190, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('16. AERÓDROMO DE DESTINO & EET / ALTERNATIVOS', 12, 134);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text(`DESTINO: ${params.destIcao}   EET: ${params.eetTime} M`, 15, 142);
  doc.text(`ALTN 1: ${params.altn1Icao}   ALTN 2: ${params.altn2Icao}`, 110, 142);

  // Casilla 18
  doc.rect(10, 150, 190, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('18. OTROS DATOS (DATOS OACI / REMARKS)', 12, 154);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  const splitOther = doc.splitTextToSize(params.otherInfo, 182);
  doc.text(splitOther, 15, 162);

  // Casilla 19 - Suplementaria (Búsqueda y Salvamento)
  doc.rect(10, 178, 190, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('19. INFORMACIÓN SUPLEMENTARIA (INFORMACIÓN SAR & SUPERVIVENCIA)', 12, 182);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(`E / ${params.enduranceHours}    P / ${params.pobCount}`, 15, 189);
  doc.text(`R / V / S (RADIO ULTRA HIGH / VERY HIGH / SALVAMENTO)`, 15, 196);
  doc.text(`J / L / F (CHALECOS LUZ / FLUOR / FRECUENCIA)`, 15, 203);
  doc.text(`D / 1  6 PAX  C/NARANJA (BALSA 6 PAX CON CUBIERTA)`, 15, 210);
  doc.text(`A / ${params.aircraftColor}`, 15, 217);

  // Signatures
  doc.rect(10, 226, 95, 30);
  doc.rect(105, 226, 95, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PILOTO AL MANDO (PIC) / FIRMA', 12, 230);
  doc.text('DESPACHANTE OACI / EANA ARO-AIS SALIDA', 107, 230);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(params.picName, 12, 252);
  doc.text('OFICINA DE NOTIFICACIÓN ARO-AIS', 107, 252);

  doc.save(`Plan_de_Vuelo_EANA_1801_${params.callsign}_${Date.now()}.pdf`);
}
