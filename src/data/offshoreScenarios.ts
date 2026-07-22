import { EmergencyLight } from './emergencies';

export const offshoreEmergencyLights: EmergencyLight[] = [
  {
    id: 'ditching_decision',
    label: 'FALLO CRÍTICO SOBRE AGUA',
    color: 'red',
    correctAction: 'Declarar emergencia (MAYDAY), verificar chalecos salvavidas colocados y asegurados, y ejecutar un amaraje controlado orientado al viento/oleaje en vez de forzar un intento de alcanzar la costa.',
    options: [
      'Intentar alcanzar la costa a máxima velocidad sin importar la distancia restante.',
      'Declarar emergencia (MAYDAY), verificar chalecos salvavidas colocados y asegurados, y ejecutar un amaraje controlado orientado al viento/oleaje en vez de forzar un intento de alcanzar la costa.',
      'Aumentar la altura para ganar tiempo de decisión.',
      'Apagar el ELT para evitar interferencias.'
    ]
  },
  {
    id: 'eng_fail_over_water',
    label: 'ENG FAIL sobre agua (< 8 km de costa)',
    color: 'red',
    correctAction: 'Ajustar colectivo para mantener RPM del rotor y parámetros OEI, evaluar de inmediato si la distancia de planeo permite alcanzar la costa o si corresponde planificar un amaraje.',
    options: [
      'Ajustar colectivo para mantener RPM del rotor y parámetros OEI, evaluar de inmediato si la distancia de planeo permite alcanzar la costa o si corresponde planificar un amaraje.',
      'Cortar el combustible del motor operativo también, por precaución.',
      'Ignorar el radioaltímetro y continuar el rumbo original.',
      'Aumentar la velocidad por encima de Vne para llegar antes.'
    ]
  },
  {
    id: 'radalt_fail_low_level',
    label: 'RAD ALT FAIL en vuelo bajo sobre agua',
    color: 'amber',
    correctAction: 'Aumentar disciplina de referencias visuales secundarias (oleaje, estelas, embarcaciones) o de instrumentos, y ganar altura si la referencia de altura real es incierta sobre superficie sin marcas.',
    options: [
      'Aumentar disciplina de referencias visuales secundarias (oleaje, estelas, embarcaciones) o de instrumentos, y ganar altura si la referencia de altura real es incierta sobre superficie sin marcas.',
      'Descender de inmediato para confirmar la altura visualmente al ras del agua.',
      'Ignorar la falla, el radioaltímetro no es relevante sobre agua.',
      'Iniciar autorrotación preventiva.'
    ]
  },
  {
    id: 'life_vest_not_secured',
    label: 'Chaleco salvavidas no asegurado antes del tramo sobre agua',
    color: 'amber',
    correctAction: 'No iniciar o interrumpir el tramo sobre agua hasta confirmar que todos los ocupantes tienen el chaleco colocado y asegurado.',
    options: [
      'Continuar el vuelo, se puede colocar el chaleco después si ocurre una emergencia.',
      'No iniciar o interrumpir el tramo sobre agua hasta confirmar que todos los ocupantes tienen el chaleco colocado y asegurado.',
      'Delegar la verificación exclusivamente al personal médico.',
      'Reducir la altitud como medida compensatoria.'
    ]
  },
  {
    id: 'vest_inflated_in_cabin',
    label: 'Chaleco inflado dentro de la cabina tras amaraje',
    color: 'red',
    correctAction: 'No inflar el chaleco dentro de la cabina: debe permanecer sin inflar hasta que el tripulante esté fuera de la aeronave, para no quedar atrapado contra la estructura o el marco de la salida.',
    options: [
      'Inflarlo de inmediato al tocar el agua para ganar flotabilidad cuanto antes.',
      'No inflar el chaleco dentro de la cabina: debe permanecer sin inflar hasta que el tripulante esté fuera de la aeronave, para no quedar atrapado contra la estructura o el marco de la salida.',
      'Desinflarlo y quitárselo antes de egresar.',
      'Esperar la activación automática de los flotadores de la aeronave.'
    ]
  },
  {
    id: 'medic_incapacitated_raft',
    label: 'Médico aeroevacuador incapacitado tras el amaraje',
    color: 'amber',
    correctAction: 'El tripulante de respaldo designado en el briefing asume la extracción e inflado de la balsa salvavidas; la tarea no debe quedar sin responsable asignado.',
    options: [
      'Esperar a que el médico se recupere antes de desplegar la balsa.',
      'El tripulante de respaldo designado en el briefing asume la extracción e inflado de la balsa salvavidas; la tarea no debe quedar sin responsable asignado.',
      'Abandonar la balsa y nadar directamente hacia la costa.',
      'Solicitar por radio instrucciones antes de actuar.'
    ]
  },
  {
    id: 'sea_fog_bank_approach',
    label: 'Banco de niebla de advección en la línea de costa',
    color: 'amber',
    correctAction: 'Evaluar condiciones de aborto de la aproximación, mantener referencia visual continua y considerar desviar a una zona de aterrizaje alternativa fuera del banco de niebla.',
    options: [
      'Continuar la aproximación planeada sin cambios, la niebla marina se disipa sola.',
      'Evaluar condiciones de aborto de la aproximación, mantener referencia visual continua y considerar desviar a una zona de aterrizaje alternativa fuera del banco de niebla.',
      'Aumentar la velocidad para atravesar la niebla más rápido.',
      'Apagar las luces de navegación para mejorar la visibilidad propia.'
    ]
  }
];
