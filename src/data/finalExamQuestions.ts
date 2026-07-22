export const finalExamQuestions = [
  {
    question: "¿Cuál es la altitud de densidad máxima operativa (Max Operating Altitude) para despegue y aterrizaje en el BO105 CBS4?",
    options: ["10,000 ft", "12,000 ft", "17,000 ft", "20,000 ft"],
    correctIndex: 2
  },
  {
    question: "¿A qué RPM del rotor principal (NR) suena la bocina de advertencia de bajas RPM?",
    options: ["Menos de 380 RPM", "Menos de 360 RPM", "Menos de 330 RPM", "Menos de 300 RPM"],
    correctIndex: 1
  },
  {
    question: "En caso de falla de un generador, ¿qué sistema asume la carga eléctrica total?",
    options: ["La batería de forma exclusiva", "El generador operativo restante asume automáticamente la carga", "El bus esencial se desconecta", "Se requiere el uso de la APU"],
    correctIndex: 1
  },
  {
    question: "¿Cuál es el límite de temperatura de los gases de escape (TOT) máximo continuo?",
    options: ["738°C", "810°C", "843°C", "927°C"],
    correctIndex: 1
  },
  {
    question: "¿Cuál es el peso máximo permitido en el compartimiento de carga (baggage compartment)?",
    options: ["100 kg", "200 kg", "250 kg", "300 kg"],
    correctIndex: 2
  },
  {
    question: "¿Qué voltaje se requiere como mínimo en la batería antes de intentar un arranque de motor?",
    options: ["12 V", "20 V", "24 V", "28 V"],
    correctIndex: 2
  },
  {
    question: "Durante un arranque, si la temperatura TOT se acerca al límite de aborto (hot start), ¿cuál es la primera acción?",
    options: ["Apagar el generador", "Cerrar inmediatamente la válvula de corte de combustible del motor", "Aumentar RPM", "Presionar el botón del extintor"],
    correctIndex: 1
  },
  {
    question: "¿Cuántas bombas de transferencia de combustible (Transfer Pumps) se encuentran en el tanque principal?",
    options: ["Ninguna", "Una", "Dos", "Tres"],
    correctIndex: 2
  },
  {
    question: "En vuelo nivelado, se enciende la luz de advertencia 'HYD 1'. ¿Qué procedimiento se debe seguir?",
    options: ["Apagar ambos sistemas para volar manual", "Aterrizar lo antes posible y reducir maniobras bruscas, usando el sistema 2", "Continuar el vuelo normalmente", "Realizar autorrotación inmediata"],
    correctIndex: 1
  },
  {
    question: "¿Cuál es la capacidad total utilizable de combustible del tanque principal (sin tanques auxiliares)?",
    options: ["400 Litros", "580 Litros", "730 Litros", "900 Litros"],
    correctIndex: 1
  },
  {
    question: "Si ocurre una falla total del sistema eléctrico en vuelo diurno (VFR), el motor:",
    options: ["Se apagará inmediatamente", "Continuará funcionando sin interrupciones", "Reducirá su potencia al 50%", "Comenzará a fallar intermitentemente"],
    correctIndex: 1
  },
  {
    question: "¿Cuál es la velocidad recomendada para máxima permanencia (Maximum Endurance)?",
    options: ["55 KIAS", "70 KIAS", "90 KIAS", "120 KIAS"],
    correctIndex: 0
  },
  {
    question: "¿Qué tipo de sistema de patines (landing gear) estándar tiene el BO105?",
    options: ["Ruedas retráctiles", "Patines de tubo de aluminio fijos", "Flotadores de emergencia estándar", "Esquíes para nieve fijos"],
    correctIndex: 1
  },
  {
    question: "En condiciones normales, ¿cuántos ocupantes (incluyendo tripulación) puede transportar el BO105 CBS4 típicamente?",
    options: ["2 a 3", "4 a 5", "5 a 6", "7 a 8"],
    correctIndex: 2
  },
  {
    question: "Si experimenta 'Mast Bumping' o contacto de las palas por movimientos bruscos en G negativo:",
    options: ["El rotor Hingeless del BO105 es menos susceptible, pero debe evitarse el vuelo de G negativo prolongado", "Es una situación imposible en el BO105", "Se debe aumentar el G negativo para recuperar", "Se debe acelerar a la Vne"],
    correctIndex: 0
  },
  {
    question: "Si se enciende la luz de advertencia de FILTRO DE COMBUSTIBLE (FUEL FILTER), indica:",
    options: ["Que el combustible está congelado", "Que el tanque está vacío", "Un diferencial de presión, posible obstrucción, se abrió la válvula de derivación (bypass)", "Que la bomba de transferencia falló"],
    correctIndex: 2
  },
  {
    question: "¿Cuál es la velocidad recomendada (Vy) para planear durante una autorrotación óptima?",
    options: ["50 KIAS", "75 KIAS", "100 KIAS", "120 KIAS"],
    correctIndex: 1
  },
  {
    question: "¿Cuál es la máxima inclinación permisible en el morro hacia arriba (Nose-up slope) para aterrizar?",
    options: ["5 grados", "10 grados", "15 grados", "20 grados"],
    correctIndex: 1
  },
  {
    question: "¿Cuál es el límite de RPM del rotor (NR) máximo permitido con potencia apagada (power-off)?",
    options: ["360 RPM", "384 RPM", "395 RPM", "410 RPM"],
    correctIndex: 2
  },
  {
    question: "¿Cómo se identifica un 'Compressor Stall' en vuelo?",
    options: ["Humo en la cabina y pérdida de sistemas eléctricos", "Ruidos fuertes tipo estallido, fluctuaciones de torque y TOT", "Aumento extremo e incontrolado de N1", "Vibración de alta frecuencia en los pedales"],
    correctIndex: 1
  },
  {
    question: "Al presionar el botón 'FIRE' (Fuego) en el panel superior, ¿qué sucede sistemáticamente?",
    options: ["Se apaga el motor automáticamente", "Cierra la válvula de combustible, el aire de sangrado y arma el extintor", "Dispara el extintor inmediatamente", "Abre las puertas de emergencia"],
    correctIndex: 1
  },
  {
    question: "El gobernador del motor (N2/NR Governor) del BO105 tiene como objetivo mantener las RPM del rotor a:",
    options: ["100% (Aprox. 384 RPM)", "105%", "90%", "85%"],
    correctIndex: 0
  },
  {
    question: "¿Cuál es el límite máximo de velocidad del viento (incluyendo ráfagas) para arrancar y parar los rotores?",
    options: ["20 nudos", "30 nudos", "40 nudos", "50 nudos"],
    correctIndex: 3
  },
  {
    question: "El límite lateral del Centro de Gravedad para un peso superior a 2400 kg es:",
    options: ["100 mm a la izquierda o derecha", "80 mm a la izquierda o derecha", "50 mm", "150 mm"],
    correctIndex: 1
  },
  {
    question: "En una autorrotación, el paso colectivo debe ser:",
    options: ["Mantenido al 50%", "Aumentado al máximo", "Bajado completamente (Full down) de inmediato para mantener RPM", "Subido y bajado cíclicamente"],
    correctIndex: 2
  },
  {
    question: "¿Qué acción de mantenimiento preventivo es clave en el mástil antes del primer vuelo del día?",
    options: ["Engrasar las palas", "Comprobar la ausencia de fisuras y el nivel de aceite de la transmisión principal", "Vaciar los filtros de aceite", "Lavar el motor con agua a presión"],
    correctIndex: 1
  },
  {
    question: "En operaciones con carga externa (Sling load), el peso máximo de despegue permitido (dependiendo del suplemento) puede llegar a:",
    options: ["2500 kg", "2600 kg", "2850 kg", "3000 kg"],
    correctIndex: 1
  },
  {
    question: "¿Cuál es la función del tubo Pitot?",
    options: ["Medir la temperatura del motor", "Suministrar presión dinámica para el indicador de velocidad (Airspeed Indicator)", "Medir la altura sobre el terreno", "Controlar la presión hidráulica"],
    correctIndex: 1
  },
  {
    question: "Si se pierde comunicación por radio en vuelo VFR, el transpondedor debe ajustarse al código:",
    options: ["7500", "7600", "7700", "1200"],
    correctIndex: 1
  },
  {
    question: "Para realizar un aterrizaje corrido (run-on landing) con falla del rotor de cola, la zona de aterrizaje debe ser:",
    options: ["Lo más corta posible", "Superficie de agua", "Una pista larga y dura, preferentemente libre de obstáculos", "Helipuerto elevado"],
    correctIndex: 2
  },
  {
    question: "El sistema de calefacción de la cabina utiliza:",
    options: ["Resistencias eléctricas alimentadas por la batería", "Aire de sangrado (Bleed Air) de los motores", "Gasolina en un calentador tipo Janitrol", "Fricción del rotor principal"],
    correctIndex: 1
  },
  {
    question: "¿Cuál es el tiempo de espera típico entre intentos de arranque consecutivos (Starter limitation)?",
    options: ["No hay límite de espera", "20 segundos de arranque, seguido de 30 segundos de descanso", "2 minutos de descanso entre intentos", "1 hora"],
    correctIndex: 1
  },
  {
    question: "El rotor de cola está diseñado para compensar el torque del rotor principal. Si aplicas potencia (subes el colectivo), ¿qué pedal debes presionar normalmente?",
    options: ["Pedal derecho", "Pedal izquierdo", "Ninguno", "Ambos alternadamente"],
    correctIndex: 1
  },
  {
    question: "El indicador de límite de carga cruzada (Cross Load) se monitorea principalmente durante:",
    options: ["Maniobras asimétricas extremas y de gran inclinación lateral en el rotor rígido", "Vuelo recto y nivelado", "Arranque de motores", "Autorrotaciones en línea recta"],
    correctIndex: 0
  },
  {
    question: "¿Cuál es el propósito de la comprobación de magnetos/sistemas de encendido (Igniter check)?",
    options: ["Asegurar que los excitadores y bujías funcionen correctamente antes de inyectar combustible", "Limpiar los motores", "Probar el extintor de incendios", "Probar las luces estroboscópicas"],
    correctIndex: 0
  }
];
