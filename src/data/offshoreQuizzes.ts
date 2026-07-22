export const offshoreQuizzes: Record<string, {
  question: string;
  options: string[];
  correctIndex: number;
}[]> = {
  "1": [
    {
      question: "Según el protocolo operativo de este curso, ¿cuál es el límite de distancia a la costa para operaciones HEMS sin flotadores?",
      options: ["50 kilómetros de costa", "15 millas náuticas", "8 kilómetros (aprox. 4.3 NM) de costa", "La distancia de planeo exacta sin límite de km"],
      correctIndex: 2
    },
    {
      question: "¿Cuál es el tiempo máximo de exposición acumulado sobre agua permitido para el perfil completo de ida y vuelta?",
      options: ["Inferior a 5 minutos totales", "15 minutos", "30 minutos", "Sin límite si el vuelo es diurno"],
      correctIndex: 0
    },
    {
      question: "¿En qué condiciones meteorológicas y de visibilidad está autorizada esta operación HEMS?",
      options: ["VFR diurno y nocturno", "IFR con radar meteorológico activo", "VFR especial nocturno", "Estrictamente VFR Diurno exclusivo"],
      correctIndex: 3
    },
    {
      question: "¿Este curso reemplaza el entrenamiento presencial de egreso subacuático (HUET)?",
      options: ["Sí, completamente", "No, es un curso teórico complementario; el HUET presencial con proveedor certificado sigue siendo obligatorio", "Solo si el alumno aprueba con más del 90%", "Únicamente para vuelos nocturnos"],
      correctIndex: 1
    },
    {
      question: "¿Cuál es el método exclusivo autorizado para la transferencia del paciente a bordo del buque DLV Seminole?",
      options: ["Izaje con torno de rescate a 50 ft AGL", "Transferencia por canasta suspendida desde la grúa del buque", "Aterrizaje en el Helideck y embarque con rotores en movimiento (Hot Loading)", "Acuatizaje al costado de la embarcación"],
      correctIndex: 2
    }
  ],
  "2": [
    {
      question: "¿Por qué la planificación de potencia en estacionario o helideck marítimo debe hacerse calculando valores OGE (Out of Ground Effect)?",
      options: ["Porque el downwash desplaza la masa de agua disipando la presión del colchón IGE", "Porque el BO105 no posee certificación IGE", "Por exigencia del proveedor de combustible Jet A-1", "Para volar a mayor velocidad de crucero"],
      correctIndex: 0
    },
    {
      question: "A 1.000 ft AGL de altitud de crucero sobre agua, ¿qué distancia horizontal máxima puede recorrer el BO105 en autorrotación?",
      options: ["7 km", "5 km", "10 km", "1.2 km (0.65 NM)"],
      correctIndex: 3
    },
    {
      question: "¿Qué velocidad en KIAS se recomienda para la mínima tasa de descenso en autorrotación según el RFM del BO105 CBS4?",
      options: ["90 KIAS", "65 KIAS", "45 KIAS", "110 KIAS"],
      correctIndex: 1
    },
    {
      question: "Dado que el DLV Seminole está posicionado a 7 km (3.8 NM) de la costa, ¿qué sucede con la autorrotación desde el punto medio del tramo marítimo?",
      options: ["Permite alcanzar la costa con holgura", "No alcanza la tierra firme, exigiendo asumir el ditching como maniobra planificada de alta probabilidad", "Permite ascender de inmediato", "No afecta la seguridad del vuelo"],
      correctIndex: 1
    }
  ],
  "3": [
    {
      question: "¿Por qué está estrictamente PROHIBIDO el uso de chalecos salvavidas auto-inflables al contacto con el agua?",
      options: ["Porque pesan demasiado para la carga útil HEMS", "Porque dañan el tapizado de la cabina", "Porque el inflado intra-cabina atrapa al ocupante contra el techo sumergido impidiendo el egreso", "Porque no funcionan en aguas frías"],
      correctIndex: 2
    },
    {
      question: "¿Qué autonomía de respiración subacuática proporciona el sistema Air Pocket Plus (EBS)?",
      options: ["10 minutos", "45 a 60 segundos", "5 minutos", "30 segundos"],
      correctIndex: 1
    },
    {
      question: "¿Dónde se ubica la Balsa Salvavidas de 6 personas en la cabina del BO105 CBS4?",
      options: ["Estibada en el compartimento posterior de cabina, inmediatamente a espaldas del Médico Aeroevacuador", "En el baúl portaequipajes exterior", "Debajo del asiento del piloto al mando", "Amarrada al patín izquierdo de la aeronave"],
      correctIndex: 0
    },
    {
      question: "¿Por qué se exige el uso obligatorio de traje seco antiexposición (Dry Suit) en las aguas del Golfo San Matías?",
      options: ["Por estética del uniforme médico", "Para protegerse de la radiación solar", "Por exigencia del hospital de destino", "Porque previene el choque térmico y la hipotermia severa en aguas de 10°C a 14°C"],
      correctIndex: 3
    }
  ],
  "4": [
    {
      question: "¿Qué viento es el predominante en la costa de Punta Colorada generando cizalladura al cruzar la línea de costa hacia el mar?",
      options: ["Vientos Patagónicos del sector OESTE / SUROESTE", "Vientos del Este", "Vientos del Norte cálidos", "Vientos del Sur árticos"],
      correctIndex: 0
    },
    {
      question: "¿Qué peligro óptico se produce sobre agua completamente calma en días sin viento?",
      options: ["Refracción solar directa", "Ceguera nocturna", "Espejismo de desierto", "Ilusión de Agua Calma (Glassy Water Illusion) que elimina la percepción de altura"],
      correctIndex: 3
    },
    {
      question: "¿Qué fenómeno meteorológico marino puede cubrir el buque DLV Seminole reduciendo la visibilidad a cero en minutos?",
      options: ["Tormenta de nieve", "Niebla de advección marina", "Tornado marino", "Lluvia ácida"],
      correctIndex: 1
    }
  ],
  "5": [
    {
      question: "¿Cuál es la forma y dimensiones del Helideck del buque DLV Seminole?",
      options: ["Octogonal de 22.2 m × 22.2 m", "Cuadrado de 10 m × 10 m", "Circular de 15 m de diámetro", "Rectangular de 30 m × 10 m"],
      correctIndex: 0
    },
    {
      question: "¿Cuál es la capacidad máxima de carga útil autorizada del Helideck del DLV Seminole?",
      options: ["2.5 toneladas", "15.0 toneladas", "9.3 toneladas", "5.0 toneladas"],
      correctIndex: 2
    },
    {
      question: "¿Por qué el buque DLV Seminole no puede virar rápidamente su proa para ajustar el viento relativo al helicóptero?",
      options: ["Porque no tiene capitán habilitado", "Porque el buque está varado en la orilla", "Por falta de potencia en sus motores de propulsión", "Porque está fondeado mediante 10 líneas de anclaje y no posee Posicionamiento Dinámico (DP)"],
      correctIndex: 3
    },
    {
      question: "Durante el embarque del paciente en helideck con rotores girando (Hot Loading), ¿por qué sector se debe aproximar a la aeronave?",
      options: ["Por la parte posterior cerca del rotor de cola", "Por debajo de los patines de aterrizaje", "Por cualquier sector sin mirar al piloto", "Por el sector delantero visible entre las 10:00 y las 02:00 con indicación del piloto"],
      correctIndex: 3
    }
  ],
  "6": [
    {
      question: "¿Qué ocurre con la actitud del fuselaje del BO105 CBS4 inmediatamente tras acuatizar en ditching sin flotadores?",
      options: ["Flota perfectamente nivelado en la superficie", "Se volcará e invertirá (capsize) en menos de 5 segundos por tener el centro de gravedad elevado", "Se hunde verticalmente sin volcar", "Planea sobre la superficie marina"],
      correctIndex: 1
    },
    {
      question: "¿Qué acción debe realizar el piloto con el mando de colectivo inmediatamente tras el contacto con el agua en ditching?",
      options: ["Aplicar paso colectivo máximo para frenar mecánicamente las palas del rotor contra el agua", "Bajar todo el colectivo inmediatamente", "Soltar los mandos de vuelo", "Mantener el colectivo en posición media"],
      correctIndex: 0
    },
    {
      question: "En la secuencia HUET de egreso subacuático, ¿cuándo se debe liberar el arnés de seguridad del asiento?",
      options: ["Antes de tocar la superficie del agua", "LUEGO de fijar la mano de referencia en la puerta/ventana y verificar la detención del movimiento", "Inmediatamente al volcar la aeronave", "Nunca se debe liberar"],
      correctIndex: 1
    }
  ],
  "7": [
    {
      question: "En la rutina de seguridad AMRM, ¿cuál es el rol primario del Médico Aeroevacuador durante un amerizaje forzoso?",
      options: ["Operar los mandos de vuelo del helicóptero", "Filmar la maniobra", "Colocarse el Air Pocket Plus, mantener su mano de referencia, egresar y desplegar la balsa de 6 pax con la painter line", "Esperar en su asiento sin moverse"],
      correctIndex: 2
    },
    {
      question: "¿Cuál es el tiempo máximo exigido al médico para colocarse la boquilla y pinza nasal del Air Pocket Plus en simulacros en tierra?",
      options: ["30 segundos", "1 minuto", "Menos de 10 segundos con ojos cerrados", "5 segundos sin ajustar la pinza nasal"],
      correctIndex: 2
    }
  ],
  "8": [
    {
      question: "¿Qué información debe intercambiar el piloto con el HLO del DLV Seminole por VHF a 10 NM del buque?",
      options: ["Menú de comidas a bordo", "Rumbo/velocidad del buque, anemómetro, movimiento de cubierta y confirmación Green Deck", "Número de pasaportes del paciente", "La marca del helicóptero únicamente"],
      correctIndex: 1
    },
    {
      question: "Si el helideck del DLV Seminole se declara en estatus RED DECK por movimiento del buque, ¿cuál es la conducta?",
      options: ["Exigir el aterrizaje inmediato por emergencia médica", "Aceptar la espera o maniobra de seguridad indicada por el Piloto al Mando sin interferir", "Abrir la puerta posterior en vuelo", "Saltar desde el patín hacia la cubierta"],
      correctIndex: 1
    }
  ],
  "9": [
    {
      question: "En el árbol de decisión Go/No-Go HEMS Offshore, ¿cuál de los siguientes factores cancela o rechaza (NO-GO) la misión?",
      options: ["VFR Diurno garantizado", "Tiempo de exposición overwater superior a 5 minutos o falta de confirmación de Green Deck", "HUET vigente en los 4 ocupantes", "Balsa salvavidas de 6 pax a bordo"],
      correctIndex: 1
    },
    {
      question: "¿En qué frecuencia emite la señal de alerta satelital la radiobaliza de localización personal (PLB)?",
      options: ["118.1 MHz", "243.0 MHz", "406.0 MHz (con homing en 121.5 MHz)", "156.8 MHz"],
      correctIndex: 2
    },
    {
      question: "¿Cuál es el destino de evacuación médica final establecido en la planificación de ruta HEMS?",
      options: ["Helipuerto de Sierra Grande", "Aeropuerto de Puerto Madryn (SAVY / El Tehuelche)", "Sanatorio de Comodoro Rivadavia", "Hospital de Bahía Blanca"],
      correctIndex: 1
    }
  ]
};
