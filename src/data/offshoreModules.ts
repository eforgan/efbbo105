export type OffshoreModuleMeta = {
  id: number;
  title: string;
  desc: string;
  required: boolean;
};

export const offshoreModules: OffshoreModuleMeta[] = [
  { id: 1, title: 'Marco Regulatorio y Límite Operativo Corto Alcance', desc: 'RAAC Parte 91/135, VFR Diurno exclusivo, corto alcance (< 8 km) y tiempo de exposición overwater < 5 min.', required: true },
  { id: 2, title: 'Performance y Limitaciones sobre Agua', desc: 'Planificación OGE sobre agua, curva H-V en helideck, MTOW 2.500 kg y alcance de autorrotación.', required: true },
  { id: 3, title: 'Equipamiento de Supervivencia e Indumentaria', desc: 'Traje seco Dry Suit, chaleco inflable manual, PLB 406 MHz, Air Pocket Plus y balsa de 6 pax en cabina.', required: true },
  { id: 4, title: 'Meteorología y Riesgos Visuales Costeros', desc: 'Vientos del oeste en Golfo San Matías, niebla de advección marina e ilusión de agua calma (Glassy Water).', required: true },
  { id: 5, title: 'Operaciones en Cubierta del Buque DLV Seminole', desc: 'Helideck octogonal (22.2 m), fondeo por 10 líneas, Green Deck y embarque Hot Loading (SIN IZAJE).', required: true },
  { id: 6, title: 'Procedimientos de Emergencia y Ditching Controlado', desc: 'Autorrotación a 65 KIAS, vuelco inminente de fuselaje (Capsize), frenado de palas y egreso subacuático HUET.', required: true },
  { id: 7, title: 'Capacitación y Roles del Médico Aeroevacuador', desc: 'Integración AMRM, seguridad en Helideck (sector 10:00-02:00), acondicionamiento de camilla y egreso.', required: true },
  { id: 8, title: 'Coordinación Buque-Helicóptero y Hot Loading', desc: 'Aproximación a cubierta, comunicaciones VHF, gestión de viento relativo en buque no DP y embarque en helideck.', required: true },
  { id: 9, title: 'SMS, Matriz OACI y Árbol de Decisión Go/No-Go', desc: 'Verificación de 6 condiciones estrictas, matriz OACI 5x5, modelo Bow-Tie y mitigación de frecuencia < 5 min.', required: true },
];

export const REQUIRED_OFFSHORE_MODULE_IDS = offshoreModules.filter(m => m.required).map(m => m.id);
