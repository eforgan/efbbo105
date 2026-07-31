// Directorio de contactos aeronáuticos para despacho y operación HEMS.
//
// - OFFICIAL_CONTACTS: oficinas oficiales ANAC / EANA / Prefectura Naval, con fuente citada
//   (AIP Argentina GEN 3.1 vía ais.anac.gob.ar, y argentina.gob.ar/prefecturanaval).
// - USEFUL_PHONE_NUMBERS: números de emergencia nacionales de uso corriente.
// - YPF_AEROPLANTAS: puntos de venta de combustible de aviación (Jet A-1) de YPF a nivel
//   nacional, relevado de listados públicos de aeroplantas (no es una fuente ANAC primaria:
//   verificar disponibilidad y horario contra NOTAM/AIP antes de planificar una escala de
//   reabastecimiento).
import { OfficialContact, UsefulPhoneNumber, YpfAeroplanta } from '../types/efb';

export const OFFICIAL_CONTACTS: OfficialContact[] = [
  {
    id: 'aro-ais',
    name: 'ARO-AIS — Oficina de Planes de Vuelo (Depósito FPL)',
    category: 'ais-aro',
    phone: '+54 (11) 4580-0261',
    hours: '24 horas',
    notes: 'Depósito de planes de vuelo OACI. Ante falla del sistema, enviar el FPL 1801 por este canal.',
    source: 'ANAC / EANA — ais.anac.gob.ar',
  },
  {
    id: 'notam-nof',
    name: 'Oficina NOTAM Internacional (NOF) — EANA S.E.',
    category: 'notam',
    phone: '+54 (11) 4480-0011 / 19',
    phoneAlt: 'Fax +54 (11) 4480-2260 / 4480-0291',
    hours: '24 horas',
    notes: 'Aeropuerto Internacional Ezeiza / Ministro Pistarini. AFS: SAEZYNYX.',
    source: 'AIP Argentina GEN 3.1 — ais.anac.gob.ar',
  },
  {
    id: 'dia-anac',
    name: 'Departamento Información Aeronáutica — ANAC',
    category: 'anac',
    email: 'dianac@anac.gob.ar',
    phone: '+54 (11) 4714-5444',
    hours: 'Lunes a viernes 08:00–16:00',
    notes: 'Balcarce 290, C1064AAF, CABA. AFS: SABAYRYX.',
    source: 'AIP Argentina GEN 3.1 — ais.anac.gob.ar',
  },
  {
    id: 'prefectura-sar',
    name: 'Prefectura Naval Argentina — Emergencias Náuticas / SAR Marítimo',
    category: 'maritimo',
    phone: '106',
    phoneAlt: 'Conmutador +54 (11) 4318-7400 · Gratuito 0800-888-7730 · VHF Canal 16',
    hours: '24 horas',
    notes: 'Autoridad marítima y componente del sistema nacional de Búsqueda y Rescate (SAR).',
    source: 'argentina.gob.ar/prefecturanaval/emergencias',
  },
];

// Oficinas de Pronóstico del SMN (Servicio Meteorológico Nacional) — tabla "Teléfonos
// Oficinas de Pronóstico" de AIP Argentina GEN 3.5-1. Para las bases sin línea directa
// publicada, se indica el conmutador central del SMN + el interno de esa oficina.
const SMN_SWITCHBOARD = '+54 (11) 5167-6767';

export const METEOROLOGICAL_STATIONS: OfficialContact[] = [
  {
    id: 'smn-central',
    name: 'SMN — Casa Central (Servicio Meteorológico Nacional)',
    category: 'meteorologia',
    phone: SMN_SWITCHBOARD,
    phoneAlt: 'Fax +54 (11) 5167-6709',
    email: 'smn@smn.gob.ar',
    notes: 'Dorrego 4019, C1425GBE, CABA. AFS: SABMYMYX.',
    source: 'AIP Argentina GEN 3.5-1 — ais.anac.gob.ar',
  },
  { id: 'oma-sabe', name: 'OMA Aeroparque (SABE)', category: 'meteorologia', phone: '+54 (11) 4514-1612', phoneAlt: `${SMN_SWITCHBOARD} interno 61168`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oma-saco', name: 'OMA Córdoba (SACO)', category: 'meteorologia', phone: '+54 (351) 475-3882', phoneAlt: `${SMN_SWITCHBOARD} interno 36427`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oma-savc', name: 'OMA Comodoro Rivadavia (SAVC)', category: 'meteorologia', phone: '+54 (297) 454-8018', phoneAlt: `${SMN_SWITCHBOARD} interno 50334`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oma-saez', name: 'OMA Ezeiza (SAEZ)', category: 'meteorologia', phone: '+54 (11) 4480-2465', phoneAlt: `${SMN_SWITCHBOARD} interno 57465`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oma-sazm', name: 'OMA Mar del Plata (SAZM)', category: 'meteorologia', phone: '+54 (223) 478-3810', phoneAlt: `${SMN_SWITCHBOARD} interno 53505`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oma-same', name: 'OMA Mendoza (SAME)', category: 'meteorologia', phone: '+54 (261) 448-7468', phoneAlt: `${SMN_SWITCHBOARD} interno 65327`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oim-sazn', name: 'OIM Neuquén (SAZN)', category: 'meteorologia', phone: '+54 (299) 444-0104', phoneAlt: `${SMN_SWITCHBOARD} interno 68107`, notes: 'Base Modena — Vista Neuquén.', source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oim-sadp', name: 'OIM El Palomar (SADP)', category: 'meteorologia', phone: `${SMN_SWITCHBOARD} interno 21413`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oim-satr', name: 'OIM Reconquista (SATR)', category: 'meteorologia', phone: `${SMN_SWITCHBOARD} interno 23174`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oma-sare', name: 'OMA Resistencia (SARE)', category: 'meteorologia', phone: '+54 (362) 443-6278', phoneAlt: `${SMN_SWITCHBOARD} interno 32149`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oma-sawg', name: 'OMA Río Gallegos (SAWG)', category: 'meteorologia', phone: `${SMN_SWITCHBOARD} interno 43509`, source: 'AIP Argentina GEN 3.5-1' },
  { id: 'oma-sadf', name: 'OMA San Fernando (SADF)', category: 'meteorologia', phone: '+54 (11) 4519-9376', phoneAlt: `${SMN_SWITCHBOARD} interno 67116`, notes: 'Alternado — SAME AÉREO Buenos Aires.', source: 'AIP Argentina GEN 3.5-1' },
];

export const USEFUL_PHONE_NUMBERS: UsefulPhoneNumber[] = [
  { id: 'emergencias-911', label: 'Emergencias (Policía / Bomberos / Ambulancia)', phone: '911', category: 'policia', notes: 'Línea unificada, disponible en la mayoría de las jurisdicciones.' },
  { id: 'same-107', label: 'SAME — Emergencias Médicas', phone: '107', category: 'emergencia-medica' },
  { id: 'bomberos-100', label: 'Bomberos', phone: '100', category: 'bomberos' },
  { id: 'policia-101', label: 'Policía', phone: '101', category: 'policia' },
  { id: 'prefectura-106', label: 'Prefectura Naval — Emergencias Náuticas / SAR', phone: '106', category: 'maritimo' },
  { id: 'gendarmeria', label: 'Gendarmería Nacional (conmutador)', phone: '+54 (11) 4310-2500', category: 'seguridad-fronteriza', notes: 'Apoyo en rutas y zonas de frontera / áreas remotas.' },
];

// icao coincide con los designadores ya usados en los presets de misión de Modena
// (bo105-specs.ts / OaciFlightPlanModule) — se marca en la UI como "usado en rutas Modena".
export const YPF_AEROPLANTAS: YpfAeroplanta[] = [
  { icao: 'SABE', iata: 'AEP', name: 'Aeroparque Jorge Newbery', province: 'Buenos Aires', phone: '+54 (11) 4514-1513' },
  { icao: 'SAZB', iata: 'BHI', name: 'Bahía Blanca', province: 'Buenos Aires', phone: '+54 (291) 4860300' },
  { icao: 'SAZS', iata: 'BRC', name: 'Bariloche', province: 'Río Negro', phone: '+54 (294) 4405030' },
  { icao: 'SADO', iata: 'CPO', name: 'Campo de Mayo', province: 'Buenos Aires', phone: '+54 (11) 4580-0261' },
  { icao: 'SANC', iata: 'CTC', name: 'Catamarca', province: 'Catamarca', phone: '+54 (383) 4453686' },
  { icao: 'SAVC', iata: 'CRD', name: 'Comodoro Rivadavia', province: 'Chubut', phone: '+54 (2970) 4549439' },
  { icao: 'SAAC', iata: 'COC', name: 'Concordia', province: 'Entre Ríos', phone: '+54 (345) 4252319' },
  { icao: 'SACO', iata: 'COR', name: 'Córdoba', province: 'Córdoba', phone: '+54 (351) 4751404' },
  { icao: 'SARC', iata: 'CNQ', name: 'Corrientes', province: 'Corrientes', phone: '+54 (379) 4458844' },
  { icao: 'SAZY', iata: 'CPC', name: 'Chapelco', province: 'Neuquén', phone: '+54 (297) 2428398' },
  { icao: 'SAWC', iata: 'FTE', name: 'El Calafate', province: 'Santa Cruz', phone: '+54 (290) 2493702' },
  { icao: 'SADP', iata: 'EPA', name: 'El Palomar', province: 'Buenos Aires', phone: '+54 (11) 60064271' },
  { icao: 'SAME', iata: 'MDZ', name: 'Mendoza', province: 'Mendoza', phone: '+54 (261) 4487486' },
  { icao: 'SAVE', iata: 'EQS', name: 'Esquel', province: 'Chubut', phone: '+54 (294) 5451354' },
  { icao: 'SAEZ', iata: 'EZE', name: 'Ezeiza', province: 'Buenos Aires', phone: '+54 (11) 44802330' },
  { icao: 'SARF', iata: 'FMA', name: 'Formosa', province: 'Formosa', phone: '+54 (370) 4454448' },
  { icao: 'SAZG', iata: 'GPO', name: 'General Pico', province: 'La Pampa', phone: '+54 (230) 2427501' },
  { icao: 'SARI', iata: 'IGR', name: 'Iguazú', province: 'Misiones', phone: '+54 (3757) 420595' },
  { icao: 'SASJ', iata: 'JUJ', name: 'Jujuy', province: 'Jujuy', phone: '+54 (388) 4911102' },
  { icao: 'SANL', iata: 'IRJ', name: 'La Rioja', province: 'La Rioja', phone: '+54 (380) 4439211' },
  { icao: 'SAMM', iata: 'LGS', name: 'Malargüe', province: 'Mendoza', phone: '+54 (260) 4471265' },
  { icao: 'SAZM', iata: 'MDQ', name: 'Mar del Plata', province: 'Buenos Aires', phone: '+54 (223) 5015359' },
  { icao: 'SADM', iata: 'MOR', name: 'Morón', province: 'Buenos Aires', phone: '+54 (11) 46279402' },
  { icao: 'SAZN', iata: 'NQN', name: 'Neuquén', province: 'Neuquén', phone: '+54 (299) 4440104' },
  { icao: 'SAAP', iata: 'PRA', name: 'Paraná', province: 'Entre Ríos', phone: '+54 (343) 4261914' },
  { icao: 'SARP', iata: 'PSS', name: 'Posadas', province: 'Misiones', phone: '+54 (376) 4451903' },
  { icao: 'SAVY', iata: 'PMY', name: 'Puerto Madryn', province: 'Chubut', phone: '+54 (280) 4475938' },
  { icao: 'SATR', iata: 'RCQ', name: 'Reconquista', province: 'Santa Fe', phone: '+54 (11) 60067345' },
  { icao: 'SARE', iata: 'RES', name: 'Resistencia', province: 'Chaco', phone: '+54 (362) 4487758' },
  { icao: 'SAOC', iata: 'RCU', name: 'Río Cuarto', province: 'Córdoba', phone: '+54 (358) 4970883' },
  { icao: 'SAWG', iata: 'RGL', name: 'Río Gallegos', province: 'Santa Cruz', phone: '+54 (11) 23048723' },
  { icao: 'SAWE', iata: 'RGA', name: 'Río Grande', province: 'Tierra del Fuego', phone: '+54 (296) 4431340' },
  { icao: 'SAAR', iata: 'ROS', name: 'Rosario', province: 'Santa Fe', phone: '+54 (341) 155038804' },
  { icao: 'SASA', iata: 'SLA', name: 'Salta', province: 'Salta', phone: '+54 (387) 155993682' },
  { icao: 'SADF', iata: 'FDO', name: 'San Fernando', province: 'Buenos Aires', phone: '+54 (11) 4580-0261' },
  { icao: 'SANU', iata: 'JUA', name: 'San Juan', province: 'San Juan', phone: '+54 (264) 4250400' },
  { icao: 'SAOU', iata: 'UIS', name: 'San Luis', province: 'San Luis', phone: '+54 (266) 4423047' },
  { icao: 'SAMR', iata: 'AFA', name: 'San Rafael', province: 'Mendoza', phone: '+54 (260) 4430703' },
  { icao: 'SAZR', iata: 'RSA', name: 'Santa Rosa', province: 'La Pampa', phone: '+54 (295) 4433814' },
  { icao: 'SANE', iata: 'SDE', name: 'Santiago del Estero', province: 'Santiago del Estero', phone: '+54 (385) 4340710' },
  { icao: 'SAAV', iata: 'SFN', name: 'Sauce Viejo', province: 'Santa Fe', phone: '+54 (342) 4995065' },
  { icao: 'SAVT', iata: 'TRE', name: 'Trelew', province: 'Chubut', phone: '+54 (280) 4421009' },
  { icao: 'SANT', iata: 'TUC', name: 'Tucumán', province: 'Tucumán', phone: '+54 (381) 4260756' },
  { icao: 'SAWH', iata: 'USH', name: 'Ushuaia', province: 'Tierra del Fuego', phone: '+54 (2901) 434390' },
  { icao: 'SAVV', iata: 'VDM', name: 'Viedma', province: 'Río Negro', phone: '+54 (292) 0424416' },
  { icao: 'SAOR', iata: 'RYD', name: 'Villa Reynolds', province: 'San Luis', phone: '+54 (265) 715643973' },
];

// ICAO usados en los presets de misión de Modena (OaciFlightPlanModule / bo105-specs) que
// además tienen aeroplanta YPF confirmada — combustible Jet A-1 disponible en base/alternado.
export const MISSION_ICAO_CODES = new Set(['SAZN', 'SAAR', 'SABE', 'SADF', 'SAVY']);
