export const quizzes: Record<string, {
  question: string;
  options: string[];
  correctIndex: number;
}[]> = {
  "1": [
    {
      question: "¿Cuál es el peso máximo de despegue (MTOW) del BO105 CBS4?",
      options: ["2300 kg", "2500 kg", "2600 kg", "2800 kg"],
      correctIndex: 1
    },
    {
      question: "¿Qué tipo de rotor principal utiliza el BO105 CBS4?",
      options: ["Articulado", "Semi-rígido", "Hingeless (Sin articulaciones)", "Teetering"],
      correctIndex: 2
    },
    {
      question: "¿Cuántos motores posee el helicóptero?",
      options: ["1", "2", "3", "Ninguna de las anteriores"],
      correctIndex: 1
    },
    {
      question: "¿Qué tipo de motores equipan al BO105 CBS4?",
      options: ["Pratt & Whitney PT6T", "Rolls-Royce 250-C20B", "Turbomeca Arrius", "Lycoming LTS101"],
      correctIndex: 1
    },
    {
      question: "¿Para qué tipo de operación está diseñado principalmente el diseño CBS4?",
      options: ["Operaciones monomotor exclusivas", "Vuelo de alta velocidad", "Servicios médicos de emergencia (EMS) por su cabina alargada", "Transporte de carga pesada"],
      correctIndex: 2
    }
  ],
  "2": [
    {
      question: "¿Cuál es la Vne (Velocidad Nunca Exceder) básica al nivel del mar (GW ≤ 2500 kg)?",
      options: ["130 KIAS", "135 KIAS", "145 KIAS", "150 KIAS"],
      correctIndex: 1
    },
    {
      question: "¿Cuál es la Vne máxima autorizada para autorrotación?",
      options: ["90 KIAS", "100 KIAS", "110 KIAS", "135 KIAS"],
      correctIndex: 0
    },
    {
      question: "Límite de Torque: ¿Cuál es el límite máximo continuo para ambos motores operando?",
      options: ["2x 30%", "2x 42%", "2x 50%", "2x 100%"],
      correctIndex: 1
    },
    {
      question: "¿Cuál es la Vne para vuelo con una puerta trasera removida?",
      options: ["100 KIAS", "135 KIAS", "60 KIAS", "Prohibido"],
      correctIndex: 0
    },
    {
      question: "¿Cuál es el límite de inclinación (slope landing) máximo permitido?",
      options: ["5 grados", "10 grados", "15 grados", "20 grados"],
      correctIndex: 1
    }
  ],
  "3": [
    {
      question: "Falla de Motor en Vuelo: ¿Cuál es la primera acción de memoria recomendada?",
      options: ["Cortar el combustible", "Ajustar el colectivo para mantener RPM del rotor", "Declarar emergencia", "Apagar sistema eléctrico"],
      correctIndex: 1
    },
    {
      question: "Fuego en el motor en tierra: ¿Qué acción se debe tomar inmediatamente después de cortar el combustible?",
      options: ["Abandonar la aeronave", "Presionar el botón de extintor (Fire Extinguisher) si está equipado", "Desconectar la batería", "Aumentar RPM"],
      correctIndex: 1
    },
    {
      question: "Falla de Rotor de Cola en vuelo estacionario (Hover): ¿Qué acción se recomienda?",
      options: ["Realizar autorrotación inmediata", "Reducir potencia y realizar un aterrizaje inmediato minimizando el giro", "Aumentar potencia para subir", "Apagar los motores"],
      correctIndex: 1
    },
    {
      question: "Advertencia 'XMSN OIL TEMP': ¿Qué indica y qué acción requiere?",
      options: ["Presión de aceite baja; aterrizar inmediatamente", "Temperatura alta de transmisión; reducir potencia y aterrizar lo antes posible", "Nivel de aceite bajo; ignorar", "Falla del generador; resetear"],
      correctIndex: 1
    },
    {
      question: "Falla de ambos motores en vuelo de crucero: La velocidad óptima de autorrotación es...",
      options: ["60 KIAS", "75 KIAS", "90 KIAS", "110 KIAS"],
      correctIndex: 1
    }
  ],
  "4": [
    {
      question: "Durante la inspección exterior (Preflight), ¿qué se verifica en las palas del rotor principal?",
      options: ["Pintura decorativa", "Ausencia de daños, delaminación y estado de los dampers", "Que estén sueltas", "Nivel de combustible"],
      correctIndex: 1
    },
    {
      question: "Antes del arranque de motor: ¿En qué posición debe estar el control de rotor (Collective)?",
      options: ["Abajo del todo (Full down) con fricción aplicada", "A la mitad", "Arriba del todo", "Desconectado"],
      correctIndex: 0
    },
    {
      question: "¿A qué porcentaje de N1 se introduce el combustible durante el arranque?",
      options: ["5%", "10%", "15%", "20%"],
      correctIndex: 2
    },
    {
      question: "Chequeo de Sistemas: ¿Qué sistemas hidráulicos se deben verificar antes del despegue?",
      options: ["Sólo el Sistema 1", "Sólo el Sistema 2", "Ambos sistemas (SYS 1 y SYS 2) alternadamente", "No tiene sistema hidráulico"],
      correctIndex: 2
    },
    {
      question: "Apagado de motor (Shutdown): ¿Cuánto tiempo se recomienda enfriar el motor a ralentí (idle) antes de cortarlo?",
      options: ["10 segundos", "30 segundos", "2 minutos", "No es necesario enfriar"],
      correctIndex: 2
    }
  ],
  "5": [
    {
      question: "¿Qué efecto tiene el aumento de la altitud de densidad sobre el rendimiento de Hover?",
      options: ["Aumenta el rendimiento", "Disminuye el rendimiento", "No tiene efecto", "Aumenta la Vne"],
      correctIndex: 1
    },
    {
      question: "¿Qué gráfico se utiliza para determinar las áreas seguras de vuelo en caso de falla de motor?",
      options: ["Gráfico de Consumo", "Diagrama H-V (Height-Velocity)", "Tabla de Carga", "Gráfico de Viento"],
      correctIndex: 1
    },
    {
      question: "¿Cuál es la velocidad de mejor régimen de ascenso (Vy)?",
      options: ["50 KIAS", "65 KIAS", "90 KIAS", "110 KIAS"],
      correctIndex: 1
    },
    {
      question: "¿Qué significa IGE en tablas de performance?",
      options: ["In Ground Effect (En Efecto Suelo)", "Instrument Glide Elevation", "Internal Gas Exhaust", "Initial Ground Engine"],
      correctIndex: 0
    },
    {
      question: "Si la temperatura exterior (OAT) aumenta, ¿cómo afecta el peso máximo permitido para Hover OGE?",
      options: ["Permite mayor peso", "El peso máximo se reduce", "El peso máximo permanece igual", "Afecta solo al tanque auxiliar"],
      correctIndex: 1
    }
  ],
  "6": [
    {
      question: "¿Dónde se encuentra la estación de referencia (Datum) para el cálculo de Centro de Gravedad?",
      options: ["En el morro del helicóptero", "En el mástil del rotor principal", "En la cola", "3.0 metros delante del plano de simetría de las patas del patín"],
      correctIndex: 3
    },
    {
      question: "Si el helicóptero está fuera del límite longitudinal delantero, ¿cuál será el efecto en el control?",
      options: ["El bastón cíclico no tendrá suficiente recorrido hacia atrás", "El cíclico no tendrá suficiente recorrido hacia adelante", "El colectivo será muy pesado", "El pedal derecho será inefectivo"],
      correctIndex: 0
    },
    {
      question: "¿Qué ocurre con el CG a medida que se consume el combustible en vuelo?",
      options: ["El CG se desplaza ligeramente", "El CG cambia drásticamente fuera de límites", "El CG no se mueve en absoluto", "Depende de la altitud"],
      correctIndex: 0
    },
    {
      question: "¿Cómo se calcula el momento de un objeto?",
      options: ["Brazo dividido por Peso", "Peso multiplicado por Brazo", "Peso más Brazo", "Raíz cuadrada del Peso"],
      correctIndex: 1
    },
    {
      question: "¿Es legal volar con un pasajero extra si se excede el peso máximo (MTOW)?",
      options: ["Sí, si el viaje es corto", "Sí, si se vuela bajo", "No, nunca está permitido", "Sí, en invierno"],
      correctIndex: 2
    }
  ],
  "7": [
    {
      question: "¿De qué material está construida principalmente la cabeza del rotor (mástil y estrella) del BO105?",
      options: ["Titanio", "Aluminio", "Fibra de carbono", "Acero forjado o Titanio macizo dependiendo de la variante, con palas de materiales compuestos"],
      correctIndex: 3
    },
    {
      question: "¿Cuántos sistemas hidráulicos independientes tiene el BO105 para los controles de vuelo?",
      options: ["Uno", "Dos sistemas paralelos e independientes", "Tres", "Ninguno, es control mecánico"],
      correctIndex: 1
    },
    {
      question: "Sistema Eléctrico: ¿Cuál es el voltaje nominal del sistema de DC (corriente continua)?",
      options: ["12V", "24V / 28V", "115V", "220V"],
      correctIndex: 1
    },
    {
      question: "Sistema de Combustible: ¿De cuántas celdas principales consta normalmente el tanque interconectado?",
      options: ["Una", "Dos (Principal e Inferior/Supply)", "Cuatro", "Seis"],
      correctIndex: 1
    },
    {
      question: "¿Qué función cumple el sistema SAS (Stability Augmentation System) si está instalado?",
      options: ["Refrigerar los motores", "Aumentar la estabilidad de la aeronave amortiguando perturbaciones", "Controlar la mezcla de combustible", "Aumentar la velocidad de crucero"],
      correctIndex: 1
    }
  ]
};
