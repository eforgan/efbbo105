export type EmergencyLight = {
  id: string;
  label: string;
  color: 'red' | 'amber';
  correctAction: string;
  options: string[];
};

export const cautionPanelLights: EmergencyLight[] = [
  {
    id: 'fire',
    label: 'FIRE',
    color: 'red',
    correctAction: 'Cortar combustible, apagar motor afectado y proceder con autorrotación si aplica.',
    options: [
      'Ignorar y continuar el vuelo normalmente.',
      'Cortar combustible, apagar motor afectado y proceder con autorrotación si aplica.',
      'Aumentar la potencia al máximo para apagar el fuego con el viento.',
      'Activar bombas de combustible auxiliares.'
    ]
  },
  {
    id: 'eng1_fail',
    label: 'ENG 1 FAIL',
    color: 'red',
    correctAction: 'Ajustar colectivo para mantener RPM del rotor, verificar parámetros OEI.',
    options: [
      'Apagar el sistema eléctrico principal.',
      'Ajustar colectivo para mantener RPM del rotor, verificar parámetros OEI.',
      'Tirar de las palancas de freno del rotor inmediatamente.',
      'Reducir potencia del Motor 2 al mínimo.'
    ]
  },
  {
    id: 'xmsn_oil_press',
    label: 'XMSN OIL PRESS',
    color: 'red',
    correctAction: 'Aterrizar lo antes posible. Reducir potencia y evitar maniobras bruscas.',
    options: [
      'Aterrizar lo antes posible. Reducir potencia y evitar maniobras bruscas.',
      'Continuar vuelo hasta destino pero reducir velocidad a 60 nudos.',
      'Aumentar RPM para mejorar la lubricación por salpicadura.',
      'Cortar el generador 2.'
    ]
  },
  {
    id: 'hyd',
    label: 'HYD',
    color: 'amber',
    correctAction: 'Verificar presión en ambos sistemas. Reducir velocidad a 100 nudos. Evitar maniobras abruptas.',
    options: [
      'Aterrizar inmediatamente y apagar motores.',
      'Aumentar la velocidad por encima de 120 nudos para estabilizar.',
      'Verificar presión en ambos sistemas. Reducir velocidad a 100 nudos. Evitar maniobras abruptas.',
      'Tirar del interruptor del SAS/AP.'
    ]
  },
  {
    id: 'gen1',
    label: 'GEN 1',
    color: 'amber',
    correctAction: 'Verificar carga del GEN 2. Apagar equipos eléctricos no esenciales.',
    options: [
      'Apagar inmediatamente el GEN 2 para proteger el sistema.',
      'Reiniciar el motor 1 en vuelo.',
      'Verificar carga del GEN 2. Apagar equipos eléctricos no esenciales.',
      'Declarar emergencia MAYDAY y realizar autorrotación.'
    ]
  },
  {
    id: 'fuel_low',
    label: 'FUEL LOW',
    color: 'amber',
    correctAction: 'Verificar cantidad de combustible. Aterrizar dentro de los próximos 10 minutos.',
    options: [
      'Verificar cantidad de combustible. Aterrizar dentro de los próximos 10 minutos.',
      'Activar el sistema de inyección de agua/metanol.',
      'Cerrar la válvula de crossfeed (X-FEED) inmediatamente.',
      'Apagar bombas de refuerzo (booster pumps) para ahorrar energía.'
    ]
  }
];
