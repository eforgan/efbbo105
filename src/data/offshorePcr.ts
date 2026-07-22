export type PCRManeuver = {
  id: string;
  maneuver: string;
  standard: string;
};

export const offshorePcrManeuvers: PCRManeuver[] = [
  {
    id: 'hover_over_water',
    maneuver: 'Hover sobre agua',
    standard: 'Deriva ≤ 2 m sobre referencia fija, potencia consciente de la ausencia de efecto suelo (IGE).'
  },
  {
    id: 'coastal_approach',
    maneuver: 'Aproximación costera sobre agua',
    standard: 'Aproximación estabilizada, referencia visual continua, corrección de deriva por brisa marina/terrestre.'
  },
  {
    id: 'beach_takeoff',
    maneuver: 'Despegue desde playa/muelle hacia mar abierto',
    standard: 'Evaluación de curva H-V ajustada, mínima exposición en la zona evitada sobre agua.'
  },
  {
    id: 'simulated_autorotation_beach',
    maneuver: 'Autorrotación simulada hacia zona de playa',
    standard: 'Reconocimiento temprano de la zona, NR y actitud correctos, recuperación de potencia a altura de seguridad.'
  },
  {
    id: 'instrument_reference_water',
    maneuver: 'Referencia a instrumentos sobre agua sin marcas',
    standard: 'Mantiene actitud, altura y rumbo con disciplina instrumental ante superficie sin referencias.'
  },
  {
    id: 'simulated_ditching',
    maneuver: 'Ejercicio de amaraje simulado (sin contacto con el agua)',
    standard: 'Secuencia completa verbalizada y ejecutada hasta el punto de decisión final, incluyendo la ausencia de flotadores de fuselaje, la advertencia de no inflar el chaleco hasta estar fuera, y la extracción/inflado de la balsa (6 pax) por el médico aeroevacuador o su respaldo designado.'
  },
  {
    id: 'sar_comms',
    maneuver: 'Comunicación con base / organismo SAR marítimo',
    standard: 'Coordinación radial correcta y oportuna con la embarcación y el organismo SAR interviniente.'
  },
  {
    id: 'crm_medical_crew',
    maneuver: 'CRM con tripulación médica',
    standard: 'Prioriza el control de la aeronave y gestiona correctamente la comunicación con el personal médico.'
  },
  {
    id: 'vessel_approach_coordination',
    maneuver: 'Aproximación y coordinación con embarcación / cubierta simulada',
    standard: 'Coordinación radial con el HLO/responsable de cubierta, verificación de estado de cubierta (green deck) y viento relativo, aproximación estabilizada por el sector despejado con punto de decisión definido.'
  },
  {
    id: 'simulated_waveoff',
    maneuver: 'Aproximación abortada (wave-off) a cubierta',
    standard: 'Reconocimiento oportuno de una condición de aborto (pérdida de referencia, movimiento de cubierta, viento relativo inestable) y ejecución inmediata y controlada del wave-off.'
  }
];
