import { ChecklistCategory } from '../types/efb';

export const MODENA_CHECKLISTS: ChecklistCategory[] = [
  // 1. NORMAL PROCEDURES
  {
    id: 'normal-preflight',
    title: '1. Inspección Pre-Vuelo & Cabina HEMS (Normal)',
    categoryType: 'normal',
    items: [
      { id: 'np1', title: 'Documentación Vuelo & Licencias', detail: 'RAAC 135, Bitácora, Certificado Matrícula LQ-HEMS', isMandatory: true, completed: false, response: 'ABORDO & VIGENTE' },
      { id: 'np2', title: 'Inspección Estructural Cabeza Rotor Rígido', detail: 'Palas titanio/fibra vidrio sin fisuras, amortiguadores elastoméricos OK', isMandatory: true, completed: false, response: 'VERIFICADO' },
      { id: 'np3', title: 'Verificación Nivel Aceite Transmisión & Motores', detail: 'Transmisión principal y 2x Allison 250-C20B en nivel verde', isMandatory: true, completed: false, response: 'EN NIVEL' },
      { id: 'np4', title: 'Anclaje Longitudinal de Camilla HEMS', detail: 'Verificación traba 4 puntos y riel de desplazamiento cabina (+10 in)', isMandatory: true, completed: false, response: 'BLOQUEADO' },
      { id: 'np5', title: 'Batería Principal & Inversor 28V DC', detail: 'Voltaje mínimo 24.0 VDC (Nominal 28.5 VDC en generadores)', isMandatory: true, completed: false, response: '24.5 VDC OK' },
    ]
  },
  {
    id: 'normal-engine-start',
    title: '2. Arranque Bimotor Allison 250-C20B (Normal)',
    categoryType: 'normal',
    items: [
      { id: 'es1', title: 'Área Rotor Libres', detail: 'Confirmar con HEMS Crew visual 360° limpia', isMandatory: true, completed: false, response: 'ÁREA LIBRE' },
      { id: 'es2', title: 'Bombas Combustible Boost Pumps 1 & 2', detail: 'Encendidas, luces de baja presión apagadas', isMandatory: true, completed: false, response: 'ON / PRESIÓN OK' },
      { id: 'es3', title: 'Starter Motor N°1 Enganchado', detail: 'Monitorear TOT < 927°C (transitorio max 10s). N1 > 58% IDLE', isMandatory: true, completed: false, response: 'ENGANCHADO & ESTABLE' },
      { id: 'es4', title: 'Starter Motor N°2 Enganchado', detail: 'Monitorear TOT < 927°C, acoplamiento N2 / NR 100%', isMandatory: true, completed: false, response: 'ENGANCHADO & ESTABLE' },
      { id: 'es5', title: 'Generadores 1 & 2 & Avionica', detail: 'Voltímetro 28.5 VDC, indicadores de torque dual acoplados', isMandatory: true, completed: false, response: 'CONECTADOS' },
    ]
  },

  // 2. MODENA BASE-SPECIFIC PROCEDURES
  {
    id: 'base-vista-neuquen',
    title: '3. Protocolo Operativo Vaca Muerta / Contrato Vista (SAZN / Añelo)',
    categoryType: 'modena',
    items: [
      { id: 'vn1', title: 'Evaluación Viento Patagónico & Polvo', detail: 'Viento en Añelo / Rincón de los Sauces. Alineación de proa', isMandatory: true, completed: false, response: 'VERIFICADO' },
      { id: 'vn2', title: 'Filtro Anti-Polvo / Partículas Motor', detail: 'Particle Separators Allison activos para evitar erosión en compresión', isMandatory: true, completed: false, response: 'ACTIVO (AUTO)' },
      { id: 'vn3', title: 'Comunicación Control YPF / Vista Dispatch', detail: 'Frecuencia VHF Operativa & Tracker Satelital activo', isMandatory: true, completed: false, response: 'EN CONTACTO' },
      { id: 'vn4', title: 'Cálculo Performance Hover Altitude (> 1,350 ft)', detail: 'Verificar gráfico HIGE/HOGE para temperatura ambiente local', isMandatory: true, completed: false, response: 'DENTRO DE LÍMITES' },
    ]
  },
  {
    id: 'base-utv-rosario',
    title: '4. Operación HEMS UTV Rosario (Río Paraná / Sanatorio Parque)',
    categoryType: 'modena',
    items: [
      { id: 'ur1', title: 'Mínimos VFR Fluvial & Advección Niebla', detail: 'Visibilidad > 5 km sobre corredor río Paraná, altímetro radar activo', isMandatory: true, completed: false, response: 'VERIFICADO VFR' },
      { id: 'ur2', title: 'Aproximación Helipuerto Sanatorio Parque (HSP)', detail: 'Coordinación final con guardia médica y policía de tránsito', isMandatory: true, completed: false, response: 'PISO VERDE' },
      { id: 'ur3', title: 'Aterrizaje en Barcaza / Cubierta Fluvial', detail: 'Confirmar amarre de embarcación y rumbo relativo de viento', isMandatory: true, completed: false, response: 'CUBIERTA ESTABLE' },
      { id: 'ur4', title: 'Transferencia Rápida UTV Hot Loading', detail: 'Médico embarca paciente con rotores en 100% NR por sector frontal', isMandatory: true, completed: false, response: 'COMPLETADO' },
    ]
  },
  {
    id: 'base-same-ba',
    title: '5. Operaciones SAME AÉREO Buenos Aires (HBR / Autopistas)',
    categoryType: 'modena',
    items: [
      { id: 'sb1', title: 'Despacho Radial SAME 107 / Base HBR', detail: 'Confirmación código de emergencia y helipuerto receptor (Santojanni/Argerich)', isMandatory: true, completed: false, response: 'CÓDIGO CONFIRMADO' },
      { id: 'sb2', title: 'Reconocimiento de Cables & Obstáculos Urbanos', detail: 'Barrido visual 360° de antenas, cables y árboles antes del descenso', isMandatory: true, completed: false, response: 'ÁREA INSPECCIONADA' },
      { id: 'sb3', title: 'Aterrizaje en Autopista / Vía Pública', detail: 'Corte total de tránsito por Policía/SAME antes de tocar suelo', isMandatory: true, completed: false, response: 'ZONA ASEGURADA' },
      { id: 'sb4', title: 'Cierre de Puertas & Coordinación Aeroparque SABE', detail: 'Notificar salida VFR controlada a Torre SABE en 121.9 MHz', isMandatory: true, completed: false, response: 'NOTIFICADO' },
    ]
  },
  {
    id: 'base-ypf-vmos',
    title: '6. Operación HEMS Offshore YPF VMOS (DLV Seminole / Mar)',
    categoryType: 'modena',
    items: [
      { id: 'yo1', title: 'Equipamiento PPE Individual & Balsa', detail: 'Traje estanco Dry Suit, EBS Air Pocket Plus, PLB 406MHz y balsa 6 pax', isMandatory: true, completed: false, response: 'EQUIPADO 100%' },
      { id: 'yo2', title: 'Tiempo de Exposición Overwater (< 5.0 min)', detail: 'Cronómetro activo desde cruce de línea costera', isMandatory: true, completed: false, response: '< 5 MIN OK' },
      { id: 'yo3', title: 'Autorización HLO Helideck DLV Seminole', detail: 'HLO confirma GREEN DECK y viento relativo estable en VHF Ch 16', isMandatory: true, completed: false, response: 'GREEN DECK' },
      { id: 'yo4', title: 'Aproximación & Posado en Patines', detail: 'Freno rotor OFF, colectivo tope inferior, posado firme en red', isMandatory: true, completed: false, response: 'POSADO FIRME' },
    ]
  },

  // 3. EMERGENCY PROCEDURES (QRH)
  {
    id: 'em-engine-fire',
    title: '7. Fuego en Motor (Engine Fire) - QRH',
    categoryType: 'emergency',
    items: [
      { id: 'ef1', title: 'Identificar Motor Afectado', detail: 'Verificar indicador de aviso ENG FIRE 1 o 2 y caída de torque', isMandatory: true, completed: false, response: 'MOTOR 1/2 IDENTIFICADO' },
      { id: 'ef2', title: 'Palanca de Combustible (Fuel Trim Lever)', detail: 'Cerrar completamente la palanca del motor afectado (SHUTOFF)', isMandatory: true, completed: false, response: 'CERRADA / SHUTOFF' },
      { id: 'ef3', title: 'Válvula de Incendio (Fuel Shutoff Valve)', detail: 'Cerrar la válvula de corte de combustible del motor afectado', isMandatory: true, completed: false, response: 'CERRADA' },
      { id: 'ef4', title: 'Sistema Extintor de Incendio', detail: 'Activar botella extintora del motor afectado (BOTTLE DISCHARGE)', isMandatory: true, completed: false, response: 'DISPARADO' },
      { id: 'ef5', title: 'Aterrizaje Inmediato / OEI Flight', detail: 'Ajustar motor operativo a potencia OEI y aterrizar lo antes posible', isMandatory: true, completed: false, response: 'LAND IMMEDIATELY' },
    ]
  },
  {
    id: 'em-oei-flight',
    title: '8. Falla de Motor en Vuelo (OEI Single Engine) - QRH',
    categoryType: 'emergency',
    items: [
      { id: 'oe1', title: 'Ajustar Velocidad de Mejor Ascenso OEI', detail: 'Mantener Vy OEI = 65 KIAS', isMandatory: true, completed: false, response: '65 KIAS' },
      { id: 'oe2', title: 'Monitorear Torque Motor Operativo', detail: 'No exceder 100% Torque OEI (Max 15 min a 420 SHP)', isMandatory: true, completed: false, response: 'TORQUE EN VERDE' },
      { id: 'oe3', title: 'Reducir Carga Eléctrica', detail: 'Desconectar equipos no esenciales (Bomba de calor/Aire)', isMandatory: true, completed: false, response: 'DESCONECTADOS' },
      { id: 'oe4', title: 'Evaluar Punto de Aterrizaje Apto', detail: 'Proceder al aeropuerto o helipuerto más cercano disponible', isMandatory: true, completed: false, response: 'RUTA SELECCIONADA' },
    ]
  },
  {
    id: 'em-tail-rotor-failure',
    title: '9. Falla / Pérdida de Control de Rotor de Cola - QRH',
    categoryType: 'emergency',
    items: [
      { id: 'tr1', title: 'Mantener Velocidad de Vuelo Hacia Adelante', detail: 'Ajustar 70 - 90 KIAS para estabilidad direccional por deriva vertical', isMandatory: true, completed: false, response: '80 KIAS ESTABLE' },
      { id: 'tr2', title: 'Ajustar Potencia de Motores', detail: 'Usar colectivo sutilmente para controlar guñada por torque', isMandatory: true, completed: false, response: 'CONTROLADO' },
      { id: 'tr3', title: 'Seleccionar Pista Larga / Terreno Abierto', detail: 'Ejecutar aterrizaje corrido con velocidad hacia adelante (Running Landing)', isMandatory: true, completed: false, response: 'PISTA ALINEADA' },
      { id: 'tr4', title: 'Corte de Motores al Tocar Suelo', detail: 'Cortar palancas de combustible inmediatamente al contacto de patines', isMandatory: true, completed: false, response: 'CORTADOS AL CONTACTO' },
    ]
  },
  {
    id: 'em-hydraulic-failure',
    title: '10. Falla de Sistema Hidráulico (HYDR PRESS) - QRH',
    categoryType: 'emergency',
    items: [
      { id: 'hf1', title: 'Interruptor Hidráulico (Hydraulic Switch)', detail: 'Cambiar a OFF si la presión cae por debajo de 30 bar', isMandatory: true, completed: false, response: 'OFF' },
      { id: 'hf2', title: 'Limitar Velocidad de Vuelo', detail: 'Reducir velocidad a 60 - 80 KIAS para minimizar fuerzas en mandos', isMandatory: true, completed: false, response: '70 KIAS' },
      { id: 'hf3', title: 'Aproximación Suave Sin Maniobras Bruscas', detail: 'Evitar virajes de gran inclinación y vuelo estacionario prolongado', isMandatory: true, completed: false, response: 'APROXIMACIÓN SUAVE' },
    ]
  }
];
