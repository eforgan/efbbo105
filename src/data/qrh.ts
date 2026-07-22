export type ItemType = 'action' | 'warning' | 'caution' | 'note';

export interface QRHItem {
  id: string;
  type: ItemType;
  task?: string;
  response?: string;
  text?: string;
}

export interface QRHChecklist {
  id: string;
  title: string;
  category: 'normal' | 'emergency';
  items: QRHItem[];
}

export const qrhDatabase: QRHChecklist[] = [
  // ==========================================
  // PROCEDIMIENTOS NORMALES
  // ==========================================
  {
    id: 'norm-exterior',
    title: 'Exterior Check (Preflight)',
    category: 'normal',
    items: [
      { id: 'ne-1', type: 'note', text: 'Verificar la ausencia de daños estructurales, fugas de fluidos, y elementos de sujeción faltantes o sueltos.' },
      { id: 'ne-2', type: 'action', task: 'Main Rotor Blades', response: 'Checked' },
      { id: 'ne-3', type: 'action', task: 'Main Rotor Head & Linkages', response: 'Checked / Secure' },
      { id: 'ne-4', type: 'action', task: 'Transmission & Cowlings', response: 'Secure / Latched' },
      { id: 'ne-5', type: 'action', task: 'Tailboom & Tail Rotor', response: 'Checked / Free to rotate' },
      { id: 'ne-6', type: 'action', task: 'Landing Gear / Skids', response: 'Condition checked' },
      { id: 'ne-7', type: 'action', task: 'Fuel levels and caps', response: 'Checked and secure' },
      { id: 'ne-8', type: 'action', task: 'Pitot static covers', response: 'Removed' },
      { id: 'ne-9', type: 'action', task: 'Tie-downs', response: 'Removed' },
    ]
  },
  {
    id: 'norm-interior',
    title: 'Interior Check',
    category: 'normal',
    items: [
      { id: 'ni-1', type: 'action', task: 'Cabin doors', response: 'Closed and locked' },
      { id: 'ni-2', type: 'action', task: 'Flight controls', response: 'Free movement and correct' },
      { id: 'ni-3', type: 'action', task: 'Switches and breakers', response: 'Set / IN' },
      { id: 'ni-4', type: 'action', task: 'Altimeter', response: 'Set to QNH / Elevation' },
      { id: 'ni-5', type: 'action', task: 'Instruments', response: 'Static readings checked' },
    ]
  },
  {
    id: 'norm-before-start',
    title: 'Before Starting Engines',
    category: 'normal',
    items: [
      { id: 'nbs-1', type: 'action', task: 'Battery Switch', response: 'ON' },
      { id: 'nbs-2', type: 'action', task: 'Inverters', response: 'ON' },
      { id: 'nbs-3', type: 'action', task: 'Warning / Caution Lights', response: 'Tested / Verified' },
      { id: 'nbs-4', type: 'action', task: 'Fuel Pumps (Main & Transfer)', response: 'ON / Check pressures' },
      { id: 'nbs-5', type: 'action', task: 'Rotor Brake', response: 'Released' },
      { id: 'nbs-6', type: 'action', task: 'Anti-collision light', response: 'ON' },
    ]
  },
  {
    id: 'norm-start',
    title: 'Engine Starting',
    category: 'normal',
    items: [
      { id: 'ns-1', type: 'note', text: 'Realizar el arranque del motor 1 primero, seguido del motor 2.' },
      { id: 'ns-2', type: 'action', task: 'Starter Switch', response: 'Press and hold' },
      { id: 'ns-3', type: 'action', task: 'Twist Grip', response: 'Open to IDLE at 15% N1' },
      { id: 'ns-4', type: 'caution', text: 'Monitorear estrechamente la Temperatura de Turbina (TOT). Abortar si excede los límites (típicamente 810°C máx en arranque).' },
      { id: 'ns-5', type: 'action', task: 'Engine Oil Pressure', response: 'Check within limits' },
      { id: 'ns-6', type: 'action', task: 'Starter Switch', response: 'Release at 60% N1' },
      { id: 'ns-7', type: 'action', task: 'Second Engine', response: 'Repeat procedure' },
    ]
  },
  {
    id: 'norm-before-to',
    title: 'Before Takeoff',
    category: 'normal',
    items: [
      { id: 'nbt-1', type: 'action', task: 'Twist Grips (Both)', response: 'Full OPEN (Flight)' },
      { id: 'nbt-2', type: 'action', task: 'Rotor RPM (NR)', response: 'Checked at 100%' },
      { id: 'nbt-3', type: 'action', task: 'Hydraulic Systems', response: 'Checked (SYS 1 & 2)' },
      { id: 'nbt-4', type: 'action', task: 'Flight Instruments', response: 'Checked and Set' },
      { id: 'nbt-5', type: 'action', task: 'Avionics / Radios', response: 'Set' },
      { id: 'nbt-6', type: 'action', task: 'Hover Power', response: 'Checked' },
    ]
  },
  {
    id: 'norm-shutdown',
    title: 'Engine Shutdown',
    category: 'normal',
    items: [
      { id: 'nsh-1', type: 'action', task: 'Cyclic / Collective', response: 'Centered / Full down' },
      { id: 'nsh-2', type: 'action', task: 'Twist Grips (Both)', response: 'Reduce to IDLE' },
      { id: 'nsh-3', type: 'note', text: 'Permitir que los motores se enfríen en IDLE durante al menos 2 minutos.' },
      { id: 'nsh-4', type: 'action', task: 'Twist Grips (Both)', response: 'OFF' },
      { id: 'nsh-5', type: 'action', task: 'Rotor Brake', response: 'Apply below 50% NR' },
      { id: 'nsh-6', type: 'action', task: 'All switches / Fuel pumps', response: 'OFF' },
      { id: 'nsh-7', type: 'action', task: 'Battery', response: 'OFF' },
    ]
  },

  // ==========================================
  // FALLAS Y EMERGENCIAS
  // ==========================================
  {
    id: 'em-oei-flight',
    title: 'Engine Failure in Flight (OEI)',
    category: 'emergency',
    items: [
      { id: 'eoei-1', type: 'warning', text: '¡NO APAGAR UN MOTOR SIN HABERLO IDENTIFICADO POSITIVAMENTE PRIMERO!' },
      { id: 'eoei-2', type: 'action', task: 'Collective lever', response: 'Adjust to maintain NR' },
      { id: 'eoei-3', type: 'action', task: 'Tail Rotor Pedals', response: 'Adjust to compensate torque' },
      { id: 'eoei-4', type: 'action', task: 'Airspeed', response: 'Establish Vy (65-75 KIAS)' },
      { id: 'eoei-5', type: 'action', task: 'Failed engine', response: 'Identify (TOT, N1, Torque)' },
      { id: 'eoei-6', type: 'action', task: 'Twist Grip (Affected)', response: 'IDLE (Check for recovery)' },
      { id: 'eoei-7', type: 'action', task: 'Twist Grip (Affected)', response: 'OFF (If no recovery)' },
      { id: 'eoei-8', type: 'action', task: 'Landing', response: 'Land as soon as practicable/possible' },
    ]
  },
  {
    id: 'em-engine-fire',
    title: 'Engine Fire in Flight',
    category: 'emergency',
    items: [
      { id: 'ef-1', type: 'warning', text: 'Fuego en el compartimento del motor puede causar daños estructurales catastróficos si no se extingue inmediatamente.' },
      { id: 'ef-2', type: 'action', task: 'Airspeed', response: 'Adjust to 65 KIAS' },
      { id: 'ef-3', type: 'action', task: 'Fire warning / Signs', response: 'Confirm visually' },
      { id: 'ef-4', type: 'action', task: 'Twist Grip (Affected)', response: 'OFF' },
      { id: 'ef-5', type: 'action', task: 'Fuel Valve (Affected)', response: 'CLOSED' },
      { id: 'ef-6', type: 'action', task: 'Fire Extinguisher Button', response: 'PRESS (if equipped)' },
      { id: 'ef-7', type: 'action', task: 'Landing', response: 'Land immediately (Autorotation if necessary)' },
    ]
  },
  {
    id: 'em-autorotation',
    title: 'Dual Engine Failure (Autorotation)',
    category: 'emergency',
    items: [
      { id: 'ea-1', type: 'warning', text: 'La pérdida de RPM del rotor principal por retraso en bajar el colectivo resultará en un accidente fatal. ¡BAJAR EL COLECTIVO INMEDIATAMENTE!' },
      { id: 'ea-2', type: 'action', task: 'Collective Pitch', response: 'Full DOWN immediately' },
      { id: 'ea-3', type: 'action', task: 'Airspeed', response: '75 KIAS (Best Glide)' },
      { id: 'ea-4', type: 'action', task: 'Rotor RPM (NR)', response: 'Maintain 85% to 104%' },
      { id: 'ea-5', type: 'action', task: 'Twist Grips (Both)', response: 'OFF' },
      { id: 'ea-6', type: 'action', task: 'At 100 ft AGL', response: 'Initiate flare to decelerate' },
      { id: 'ea-7', type: 'action', task: 'At 10-15 ft AGL', response: 'Level helicopter, pull collective to cushion' },
    ]
  },
  {
    id: 'em-tr-failure',
    title: 'Loss of Tail Rotor Effectiveness / Drive',
    category: 'emergency',
    items: [
      { id: 'tr-1', type: 'warning', text: 'Pérdida de control direccional: El fuselaje girará incontrolablemente hacia la derecha bajo potencia.' },
      { id: 'tr-2', type: 'action', task: 'Collective Pitch', response: 'Reduce immediately (Enter Autorotation)' },
      { id: 'tr-3', type: 'note', text: 'La autorrotación remueve el torque del rotor principal, deteniendo el giro del fuselaje.' },
      { id: 'tr-4', type: 'action', task: 'Airspeed', response: 'Maintain 75 KIAS' },
      { id: 'tr-5', type: 'action', task: 'Twist Grips', response: 'OFF before touchdown' },
      { id: 'tr-6', type: 'action', task: 'Landing', response: 'Autorotational landing' },
    ]
  },
  {
    id: 'em-hydraulic',
    title: 'Hydraulic System Failure (SYS 1 or SYS 2)',
    category: 'emergency',
    items: [
      { id: 'hyd-1', type: 'caution', text: 'El BO105 posee sistemas hidráulicos duales. La falla de uno no implica pérdida de control, pero se pierde redundancia.' },
      { id: 'hyd-2', type: 'action', task: 'Airspeed', response: 'Reduce to 100 KIAS or below' },
      { id: 'hyd-3', type: 'action', task: 'Maneuvers', response: 'Avoid abrupt control movements' },
      { id: 'hyd-4', type: 'action', task: 'Landing', response: 'Land as soon as practicable' },
    ]
  },
  {
    id: 'em-electrical',
    title: 'Total Electrical Failure',
    category: 'emergency',
    items: [
      { id: 'elec-1', type: 'warning', text: 'Pérdida de instrumentos de vuelo giroscópicos y sistemas de estabilización.' },
      { id: 'elec-2', type: 'action', task: 'Attitude', response: 'Fly visually (VMC)' },
      { id: 'elec-3', type: 'action', task: 'Battery and Gen Switches', response: 'Cycle to reset' },
      { id: 'elec-4', type: 'action', task: 'If power not restored', response: 'All electrical switches OFF' },
      { id: 'elec-5', type: 'action', task: 'Landing', response: 'Land as soon as practicable' },
    ]
  }
];
