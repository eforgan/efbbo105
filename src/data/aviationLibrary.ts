export interface DocSection {
  id: string;
  title: string;
  content: string[];
}

export interface AviationDoc {
  id: string;
  category: 'anac-raac' | 'rfm-bo105' | 'mop-modena' | 'safety';
  title: string;
  code: string;
  summary: string;
  highlights: string[];
  lastRevision: string;
  sections: DocSection[];
  /** URL o ruta del PDF. Puede ser ruta local `/docs/...` o URL externa. */
  pdfUrl?: string;
  /** Nombre de archivo PDF esperado en /public/docs/ (para mostrar instrucciones de carga) */
  pdfFilename?: string;
}

export const AVIATION_LIBRARY_DOCS: AviationDoc[] = [
  // ─────────────────────────────────────────────────────────────────
  // ANAC RAAC
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'raac-135-k',
    category: 'anac-raac',
    code: 'ANAC RAAC 135 Subparte K',
    title: 'Operaciones HEMS & Aeroevacuación Médica en Helicópteros',
    summary: 'Requisitos técnicos y operativos para vuelos de ambulancia aérea y traslado interhospitalario con tripulación médica. Aplicable a todos los operadores certificados bajo RAAC 135 que realicen servicios de emergencia médica aérea (HEMS) en Argentina.',
    highlights: [
      'Mínimos VFR HEMS diurnos: Visibilidad > 5 km, Techo > 1,000 ft AGL.',
      'Mínimos VFR HEMS nocturnos NVG: Visibilidad > 8 km, Techo > 1,500 ft AGL.',
      'Exposición overwater de bimotores clase 1: Límite máximo 5.0 minutos.',
      'Soporte continuo de oxígeno médico con margen de reserva reglamentario del 20%.',
      'Camilla con sistema de bloqueo longitudinal en 4 puntos de anclaje.',
    ],
    lastRevision: '2025-11-15',
    pdfUrl: 'https://www.argentina.gob.ar/sites/default/files/raac_parte_135.pdf',
    pdfFilename: 'raac-parte-135.pdf',
    sections: [
      {
        id: 'raac-135-k-1',
        title: 'K.1 — Definiciones HEMS',
        content: [
          'Servicio de Emergencia Médica Aérea (HEMS): Operación de un helicóptero con el propósito de facilitar la asistencia médica de emergencia cuando es necesario un desplazamiento inmediato y rápido de personal médico o una persona lesionada o enferma.',
          'Miembro de la tripulación de emergencia médica (HEMS Crew Member — HCM): Persona en misión HEMS que no actúa como miembro de tripulación de vuelo.',
          'Base HEMS: Aeródromo/helipuerto donde el helicóptero y la tripulación HEMS están en régimen de alerta para su desplazamiento.',
          'Lugar de Aterrizaje HEMS (HEMS Landing Site — HLS): Sitio temporal utilizado por un helicóptero en misión HEMS fuera de aeropuertos/helipuertos regulados.',
        ],
      },
      {
        id: 'raac-135-k-2',
        title: 'K.2 — Mínimos Meteorológicos VFR HEMS',
        content: [
          'Vuelo Diurno en Ruta: Visibilidad en vuelo ≥ 5 km / Techo de Nubes ≥ 1,000 ft AGL. Por debajo de estos mínimos, la misión debe cancelarse o desviarse.',
          'Vuelo Nocturno sin NVG (Night Vision Goggles): Visibilidad ≥ 8 km / Techo ≥ 2,000 ft AGL. Requiere aprobación operativa específica del explotador.',
          'Vuelo Nocturno con NVG (Aprobado ANAC): Visibilidad ≥ 5 km bajo NVG verificados / Techo ≥ 1,500 ft AGL / Luminancia de fondo mínima 0.003 cd/m².',
          'Lugares de Aterrizaje (HLS) urbanos: No se permite la aproximación si la visibilidad horizontal es inferior a 1,500 m cuando se requiera maniobra visual de reconocimiento.',
          'Reducción Especial: El Comandante puede reducir los mínimos en un 50% cuando la misión involucre riesgo inmediato para la vida y no exista alternativa terrestre.',
        ],
      },
      {
        id: 'raac-135-k-3',
        title: 'K.3 — Habilitaciones de Tripulación HEMS',
        content: [
          'Comandante HEMS: Mínimo Licencia de Piloto Comercial con habilitación de helicóptero, 1,000 horas totales (500 en helicóptero, 100 en vuelo nocturno), habilitación médica Clase 1 ANAC vigente.',
          'Copiloto HEMS: Licencia de Piloto Privado mínimo con 200 horas en helicóptero y entrenamiento específico HEMS.',
          'Médico Aeroevacuador / HCM: Certificación de seguridad aérea del explotador, formación de evacuación de emergencia y reanimación cardiopulmonar avanzada vigente.',
          'Entrenamiento recurrente anual: Simulacros de evacuación de emergencia en tierra, familiarización con sistemas HEMS de a bordo y CRM (Crew Resource Management) aeromédico.',
        ],
      },
      {
        id: 'raac-135-k-4',
        title: 'K.4 — Equipamiento Médico Obligatorio a Bordo',
        content: [
          'Sistema de Suministro de Oxígeno Médico: Capacidad mínima para 1 paciente adulto durante 60 min al flujo de 15 L/min, con reserva adicional del 20% (= mínimo 1,080 L de O₂). Sistemas LOX o botellas de O₂ a alta presión (200 bar).',
          'Camilla de Traslado: Certificada para aceleraciones de 16G longitudinal y 6G lateral. Sistema de anclaje de 4 puntos certificado FAR/CS 27 categoría HEMS.',
          'Desfibrilador Externo Automático (DEA): Certificado para uso en vuelo, protegido contra interferencias electromagnéticas (EMC).',
          'Aspirador Portátil: Caudal mínimo 30 L/min, funcionamiento con potencia propia y fuente 28V DC del helicóptero.',
          'Monitor Portátil de Signos Vitales: Certificado para operar en aeronave con rango de temperatura -20°C a +55°C y vibraciones clase aeronáutica.',
        ],
      },
      {
        id: 'raac-135-k-5',
        title: 'K.5 — Operaciones sobre Agua (Overwater) HEMS',
        content: [
          'Límite de Exposición sobre Agua (Bimotor Clase 1): No se podrá sobrevolar extensiones de agua en ruta si el tiempo de vuelo sobre agua supera los 5 minutos, a menos que el helicóptero disponga de equipamiento completo de supervivencia marítima.',
          'Equipamiento Mínimo para Overwater Extendido (>5 min): Flotadores inflables de emergencia en patines, trajes de supervivencia (Dry Suit) para toda la tripulación con temperatura del agua <15°C, Localizador de Señalización de Emergencia (PLB 406 MHz registrado ANAC), Balsa salvavidas autoinflamable homologada.',
          'Procedimiento de Amerizaje (Ditching): Tripulación debe completar entrenamiento HUET (Helicopter Underwater Escape Training) cada 2 años.',
          'Zona YPF VMOS Offshore (Golfo San Matías): Aplicación obligatoria de este numeral por distancia de 7.8 km sobre agua entre Punta Colorada y la ubicación de plataformas DLV Seminole.',
        ],
      },
    ],
  },

  {
    id: 'raac-91-f',
    category: 'anac-raac',
    code: 'ANAC RAAC 91 Subparte F',
    title: 'Equipamiento Mínimo para Vuelo VFR & NVG en Helicópteros',
    summary: 'Regulaciones generales para el mantenimiento del Certificado de Aeronavegabilidad y equipo de vuelo en operaciones de servicio aéreo bajo RAAC 91.',
    highlights: [
      'Doble altímetro barométrico y altímetro de radar para vuelos sobre agua.',
      'Faro de búsqueda regulable de 30M Candlepower para aterrizajes urbanos.',
      'Faros de navegación aptos NVIS para operaciones NVG.',
      'Balsa salvavidas auto-inflable de 6 pax naranja de alta visibilidad.',
    ],
    lastRevision: '2026-02-01',
    pdfUrl: 'https://www.argentina.gob.ar/sites/default/files/raac_parte_91.pdf',
    pdfFilename: 'raac-parte-91.pdf',
    sections: [
      {
        id: 'raac-91-f-1',
        title: 'F.1 — Lista de Equipamiento Mínimo (MEL) Helicópteros',
        content: [
          'Todo operador de helicópteros bajo RAAC 91 debe poseer una MEL (Minimum Equipment List) aprobada por ANAC, basada en la MMEL del fabricante.',
          'La MEL establece los equipos que pueden estar inoperativos sin comprometer la seguridad del vuelo, con condiciones específicas de operación.',
          'Equipos de CATEGORÍA A (reparación antes del siguiente vuelo): Sistemas hidráulicos, instrumentos de vuelo básicos, sistema de escape de incendio.',
          'Equipos de CATEGORÍA B (reparación en 3 días calendario): Radio altímetro, ADF, interfonía interna.',
          'Equipos de CATEGORÍA C (reparación en 10 días calendario): Iluminación de cabina secundaria, calefacción de pitot auxiliar.',
        ],
      },
      {
        id: 'raac-91-f-2',
        title: 'F.2 — Instrumentos Obligatorios de Vuelo IFR/VFR',
        content: [
          'VFR Diurno Mínimo: Velocímetro (KIAS), Altímetro barométrico calibrable, Variómetro, Brújula magnética, Reloj con segundero, Horizonte artificial.',
          'VFR Nocturno Mínimo (adicional al diurno): Luces de posición anticolisión, Faro de aterrizaje orientable, Fuente de iluminación de cabina de emergencia independiente.',
          'Operaciones sobre Agua: Altímetro de radar (Radio Altimeter) operativo obligatorio en rutas sobre agua y sectores fluviales de baja altura.',
          'NVG (Visión Nocturna): Sistema de iluminación NVIS (Night Vision Imaging System) compatible clase A o B, con todos los instrumentos y paneles con iluminación NVIS certificada.',
        ],
      },
      {
        id: 'raac-91-f-3',
        title: 'F.3 — Comunicaciones y Navegación',
        content: [
          'VHF-AM (118-136 MHz): Mínimo 2 radios VHF independientes para IFR. Para VFR HEMS: 1 VHF operativo + 1 como respaldo.',
          'Transpondedor Modo C (SSR): Obligatorio en espacio aéreo controlado. Modo S recomendado para vuelos en TMA Buenos Aires.',
          'GPS certificado TSO-C145 o C146: Recomendado como apoyo de navegación. No reemplaza instrumentos de vuelo primarios sin aprobación IFR específica.',
          'ELT 406 MHz: Obligatorio en todos los helicópteros. Registro en base de datos COSPAS-SARSAT ANAC vigente.',
          'HEMS Frecuencias Operativas Modena: 123.450 MHz (Emergencias), 122.800 MHz (Tráfico SAME Buenos Aires), 122.000 MHz (Bases Neuquén / Vaca Muerta).',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // RFM BO105 CBS-4 — Secciones 1 a 9
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'rfm-sec-1',
    category: 'rfm-bo105',
    code: 'RFM BO105 CBS-4 — Sección 1',
    title: 'Sec. 1: Descripción General, Dimensiones & Motores',
    summary: 'Especificaciones físicas completas, geometría del sistema de rotor de titanio sin bisagras (Hingeless Rotor) y planta motriz dual Rolls-Royce Allison 250-C20B del modelo CBS-4 Stretched.',
    highlights: [
      'Diámetro rotor principal: 9.84 m | Rotor de cola: 1.90 m | Long. total: 11.86 m.',
      'Motor: 2× Rolls-Royce Allison 250-C20B | 420 SHP despegue | 370 SHP continuo.',
      'Sistema Hingeless Rotor de titanio monobloc: sin bisagras de batimiento ni arrastre.',
      'Cabina Stretched CBS-4: +25.4 cm respecto al CBS-2 estándar.',
    ],
    lastRevision: '2025-10-01',
    pdfFilename: 'rfm-bo105-cbs4-sec1.pdf',
    sections: [
      {
        id: 'rfm-1-1',
        title: '1.1 — Descripción General de la Aeronave',
        content: [
          'El MBB Bölkow BO 105 CBS-4 es un helicóptero polivalente de motor turbina doble (bimotor) de cabina articulada, concebido para misiones de transporte, búsqueda y rescate, patrullaje policial y emergencias médicas aéreas (HEMS).',
          'La variante CBS-4 (Cabin Stretched, version 4) incorpora un fuselaje alargado en 25.4 cm (10 pulgadas) en la sección de cabina trasera respecto al modelo CBS-2, permitiendo el alojamiento de una camilla longitudinal de traslado de pacientes.',
          'El sistema de rotor rígido (Hingeless Titanium Rotor System) es la característica técnica distintiva del BO 105: la cabeza de rotor fabricada en titanio de alta resistencia no posee bisagras de batimiento ni de arrastre, lo que otorga al helicóptero una respuesta de control precisa y la capacidad de realizar maniobras acrobáticas certificadas.',
        ],
      },
      {
        id: 'rfm-1-2',
        title: '1.2 — Dimensiones & Datos Físicos',
        content: [
          'Longitud total (rotores girando): 11.86 m',
          'Longitud del fuselaje (sin rotor): 8.56 m',
          'Altura total (hasta cima del rotor de cola): 3.00 m',
          'Anchura del fuselaje: 1.50 m',
          'Diámetro del rotor principal: 9.84 m (4 palas de fibra de vidrio/epoxi)',
          'Diámetro del rotor de cola: 1.90 m (2 palas, montaje en lado izquierdo)',
          'Pista del tren de aterrizaje (patines): 2.50 m',
          'Superficie del disco del rotor principal: 76.0 m²',
        ],
      },
      {
        id: 'rfm-1-3',
        title: '1.3 — Sistema de Planta Motriz (2× Allison 250-C20B)',
        content: [
          'Fabricante: Rolls-Royce (originalmente Detroit Diesel Allison)',
          'Modelo: 250-C20B Turboshaft',
          'Potencia de Despegue (5 min): 420 SHP (313 kW) por motor',
          'Potencia Máxima Continua: 370 SHP (276 kW) por motor',
          'Potencia OEI 30 segundos: 444 SHP (331 kW)',
          'Turbina de Gas: 6 etapas de compresor axial + 1 etapa centrífuga. 2 etapas de expansión de gas (turbina de potencia libre) + 2 etapas de turbina del compresor.',
          'Tipo de Combustible: JET A-1 (ASTM D1655) / JP-4 / JP-8 / AVTUR (Mil-T-5624)',
          'Consumo Específico Nominal (ambos motores, crucero): ~180 kg/h',
        ],
      },
    ],
  },

  {
    id: 'rfm-sec-2',
    category: 'rfm-bo105',
    code: 'RFM BO105 CBS-4 — Sección 2',
    title: 'Sec. 2: Limitaciones Operativas, Pesos & Velocidades',
    summary: 'Límites de diseño certificados por MBB/Eurocopter para el modelo BO105 CBS-4: pesos, velocidades, temperaturas de turbina (TOT), límites de torque y envolvente de vuelo.',
    highlights: [
      'MTOW: 2,500 kg | BEW HEMS: 1,460 kg | Combustible Máx: 450 kg.',
      'VNE: 145 KIAS SL (-3 KIAS/1,000 ft DA > 3,000 ft).',
      'Torque Dual Max Cont.: 2× 88% | OEI Max Cont.: 100% | OEI 30 sec: 108%.',
      'TOT Max Cont.: 738°C | Despegue 5 min: 793°C | Arranque 12 sec: 927°C.',
    ],
    lastRevision: '2025-10-01',
    pdfFilename: 'rfm-bo105-cbs4-sec2.pdf',
    sections: [
      {
        id: 'rfm-2-1',
        title: '2.1 — Limitaciones de Pesos',
        content: [
          'Peso Máximo de Despegue (MTOW): 2,500 kg (5,511 lb) — válido para configuración normal y HEMS.',
          'Peso Máximo de Aterrizaje (MLW): 2,500 kg (igual al MTOW, sin restricción específica de aterrizaje).',
          'Peso Básico Vacío (BEW) configuración HEMS Modena: 1,460 kg (incluye camilla 4 puntos, sistema LOX, soporte médico y flotadores de emergencia).',
          'Peso Máximo Sin Combustible (ZFW): 2,300 kg.',
          'Carga de Pago Máxima: 1,040 kg (= MTOW - BEW).',
          'Capacidad máxima de combustible usable: 450 kg (~570 L de JET A-1 a 15°C).',
        ],
      },
      {
        id: 'rfm-2-2',
        title: '2.2 — Limitaciones de Velocidad',
        content: [
          'VNE (Velocidad Nunca Exceder) Nivel del Mar: 145 KIAS',
          'VNE Reducción por Altitud: -3 KIAS por cada 1,000 ft de altitud de densidad (DA) por encima de 3,000 ft DA.',
          'VNE con Puertas Removidas: 120 KIAS',
          'VNE en Autorrotación: 120 KIAS',
          'VMO (Velocidad Máxima Operativa) para Maniobras de Entrenamiento: 100 KIAS',
          'Velocidad de Mejor Tasa de Ascenso (Vy) Bimotor: 70 KIAS',
          'Velocidad de Mejor Tasa de Ascenso (Vy) Monomotor (OEI): 65 KIAS',
          'Velocidad de Mínimo Régimen de Descenso en Autorrotación: 60 KIAS',
          'Velocidad de Mayor Alcance en Autorrotación: 80 KIAS',
        ],
      },
      {
        id: 'rfm-2-3',
        title: '2.3 — Limitaciones de Torque & Temperaturas de Turbina (TOT)',
        content: [
          '— OPERACIÓN BIMOTOR (AEO — All Engines Operating) —',
          'Potencia Máxima Continua (Dual): 2× 88% TQ / TOT ≤ 738°C',
          'Potencia Máxima de Despegue 5 minutos (Dual): 2× 100% TQ / TOT ≤ 793°C',
          '— OPERACIÓN MONOMOTOR (OEI — One Engine Inoperative) —',
          'OEI Potencia Máxima Continua: 100% TQ / TOT ≤ 738°C (motor operativo)',
          'OEI Potencia Máxima 30 Segundos (Emergency): 108% TQ / TOT ≤ 843°C',
          '— ARRANQUE DE MOTORES —',
          'TOT Máxima durante Arranque (12 segundos): 927°C',
          'TOT Máxima de Inactividad (Interturbina en Tierra): 150°C',
          '— VELOCIDAD DE ROTORES —',
          'RPM Rotor Principal Normal: 394 ±8 RPM (100%)',
          'RPM Máxima Transitoria: 412 RPM (105%)',
          'RPM Mínima en Autorrotación: 324 RPM (82%)',
        ],
      },
      {
        id: 'rfm-2-4',
        title: '2.4 — Envolvente de Centro de Gravedad (CG)',
        content: [
          'Datum (Eje de Referencia 0 mm): Ubicado 3,000 mm adelante del eje del mástil del rotor principal.',
          'LÍMITE DELANTERO (Forward CG): 3,080 mm desde el datum, entre 1,600 kg y 2,500 kg.',
          'LÍMITE TRASERO (Aft CG): 3,420 mm desde el datum, entre 1,600 kg y 2,500 kg.',
          'LÍMITE LATERAL (Lateral CG): ±80 mm de la línea de centro del helicóptero.',
          'La verificación del CG es OBLIGATORIA antes de cada vuelo en configuración HEMS con camilla cargada, especialmente si se transporta equipo médico pesado a popa (LOX, aspirador, monitor).',
        ],
      },
      {
        id: 'rfm-2-5',
        title: '2.5 — Limitaciones de Viento & Pendiente de Terreno',
        content: [
          'Viento Cruzado Demostrado (Crosswind): 25 kt en todas las azimuts de proa.',
          'Pendiente Máxima del Terreno — Nariz Alta (Pitch Up): 8°',
          'Pendiente Máxima del Terreno — Nariz Baja (Pitch Down): 8°',
          'Inclinación Lateral Máxima del Terreno (Roll): 8° hacia cualquier lado.',
          'Operación en Helipuertos Inclínados tipo Offshore (Helideck): Máx 3° de inclinación combinada.',
          'Aterrizaje con viento de cola (Tailwind): No se recomienda superar 10 kt de viento de cola en el posado final.',
        ],
      },
    ],
  },

  {
    id: 'rfm-sec-3',
    category: 'rfm-bo105',
    code: 'RFM BO105 CBS-4 — Sección 3',
    title: 'Sec. 3: Procedimientos de Emergencia (QRH)',
    summary: 'Acciones inmediatas y procedimientos de memoria ante fallas críticas de motor, sistemas hidráulicos, rotor de cola o pérdida de sustentación en vuelo. Referencia directa de la Lista de Verificación de Referencia Rápida (QRH).',
    highlights: [
      'Falla Motor OEI en crucero: Vy = 65 KIAS | TQ motor operativo ≤ 100%.',
      'Incendio de Motor: SHUTOFF → Válvula Fuego OFF → Extintor.',
      'Autorrotación completa (doble falla): 60 KIAS | Flare a 40 ft AGL.',
      'Pérdida Empuje Rotor Cola: 70–90 KIAS | Aterrizaje corrido.',
      'Falla Hidráulica: Reducir a 60–80 KIAS | Interruptor OFF.',
    ],
    lastRevision: '2025-10-01',
    pdfFilename: 'rfm-bo105-cbs4-sec3.pdf',
    sections: [
      {
        id: 'rfm-3-1',
        title: '3.1 — Falla de Motor en Vuelo (OEI)',
        content: [
          'SEÑAL DE ALARMA: Luz ENGINE OUT encendida + Caída de Nr / Torque asimétrico.',
          '1. COLECTIVO — Ajustar para mantener Nr dentro del arco verde (394 ±8 RPM).',
          '2. PALANCA DE COMBUSTIBLE (motor fallado) — Verificar posición FLIGHT (no accionar hasta confirmar falla irreversible).',
          '3. VELOCIDAD — Establecer Vy OEI = 65 KIAS.',
          '4. TORQUE (motor operativo) — Mantener ≤ 100% continuo. Puede usar 108% durante 30 seg en emergencia.',
          '5. ALTITUD — Evaluar capacidad de vuelo nivelado. Si altitud > Techo OEI: iniciar Drift Down gradual.',
          '6. COMUNICAR — Declarar emergencia PAN-PAN o MAYDAY según severidad. Informar posición y sitio de aterrizaje previsto.',
          '7. ATERRIZAJE — Seleccionar área disponible más cercana. Planificar aproximación final a 65 KIAS con viento de frente.',
        ],
      },
      {
        id: 'rfm-3-2',
        title: '3.2 — Incendio de Motor en Vuelo',
        content: [
          'SEÑAL DE ALARMA: Luz FIRE encendida (detector de loop Kidde en compartimento de motor).',
          '1. PALANCA CORTE COMBUSTIBLE (motor incendiado) — SHUTOFF (posición hacia atrás).',
          '2. VÁLVULA DE INCENDIO (Firewall Shutoff) — OFF (corta combustible en el tabique cortafuegos).',
          '3. BOTELLA EXTINTORA — Disparar (sistema Halon/Novec 1230 en compartimento motor).',
          '4. Si el fuego persiste después de 10 segundos: Iniciar descenso de emergencia y aterrizaje inmediato.',
          '5. Después del aterrizaje: Evacuar la aeronave y pacientes a distancia de seguridad (mínimo 50 m). No retornar hasta extinción total.',
        ],
      },
      {
        id: 'rfm-3-3',
        title: '3.3 — Doble Falla de Motores / Autorrotación',
        content: [
          'SEÑAL: Ambas luces ENGINE OUT + Caída total de Nr + Silencio de turbinas.',
          '1. COLECTIVO — Bajar INMEDIATAMENTE para restablecer Nr ≥ 82% (324 RPM). Acción refleja sin demora.',
          '2. VELOCIDAD — Establecer 60 KIAS (mínimo régimen de descenso) o 80 KIAS (máximo alcance de planeo).',
          '3. INTENTO DE REARRANQUE — (si altura y tiempo lo permiten): Starter ON → Combustible → Esperar encendido. Máximo 2 intentos.',
          '4. FLARE FINAL — Iniciar a ~40 ft AGL reduciendo velocidad a ~30 KIAS, colectivo a fondo en el último segundo antes del contacto.',
          '5. Tasa de descenso en autorrotación a 60 KIAS / MSL = ~1,800 fpm. Alcance de planeo = ~2:1 NM/1,000 ft.',
        ],
      },
      {
        id: 'rfm-3-4',
        title: '3.4 — Pérdida de Empuje del Rotor de Cola (LTE)',
        content: [
          'SEÑAL: Giro incontrolado de la aeronave, pedales de timón sin respuesta, pérdida de control direccional.',
          '1. VELOCIDAD — Aumentar a 70–90 KIAS INMEDIATAMENTE. A esta velocidad el estabilizador vertical (deriva) proporciona suficiente empuje lateral para control direccional.',
          '2. PEDALES — Aplicar presión al pedal en dirección contraria al giro para atenuar. El sistema AFCS puede asistir.',
          '3. POTENCIA — Reducir torque si la velocidad permite mantener altitud con menos exigencia al rotor de cola.',
          '4. ATERRIZAJE CORRIDO (Running Landing) — Preparar área larga y limpia. Posado con velocidad residual de avance (≥30 KIAS al contacto) para asegurar control.',
          '5. NO intentar detener el giro con colectivo alto a baja velocidad (puede agravar la situación).',
        ],
      },
      {
        id: 'rfm-3-5',
        title: '3.5 — Falla Sistema Hidráulico 1 o 2',
        content: [
          'SEÑAL: Luz HYD 1 o HYD 2 encendida. Aumento notable en fuerzas de control (pedales, colectivo, cíclico).',
          '1. VELOCIDAD — Reducir a 60–80 KIAS para disminuir las fuerzas aerodinámicas sobre los servomandos.',
          '2. INTERRUPTOR HIDRÁULICO fallado — Conmutar a OFF manualmente si no se desconectó automáticamente.',
          '3. Verificar si el sistema restante (1 o 2) mantiene presión normal de 1,050 psi.',
          '4. En Falla DUAL (ambos sistemas HYD 1 y HYD 2): Vuelo posible en modo de emergencia con fuerzas de control muy elevadas. Aterrizaje inmediato obligatorio. Velocidad ≤ 60 KIAS.',
          '5. Evitar maniobras bruscas o de gran deflexión de control. Movimientos suaves y progresivos.',
        ],
      },
    ],
  },

  {
    id: 'rfm-sec-4',
    category: 'rfm-bo105',
    code: 'RFM BO105 CBS-4 — Sección 4',
    title: 'Sec. 4: Procedimientos Normales & Lista Pre-Vuelo',
    summary: 'Secuencia estandarizada de inspección walkaround 360°, arranque de motores Allison 250-C20B, pruebas de sistemas y procedimientos de despegue, crucero y aterrizaje.',
    highlights: [
      'Walkaround 360°: Palas, aceites, combustible, transmisiones.',
      'Arranque: Batería 28V → TOT <150°C → Starter → Combustible a 12% N1 → N1 ≥ 58%.',
      'Prueba Hidráulica: HYD 1 y 2 OFF individual → verificar 1,050 psi.',
      'Despegue: Elevar a 3 ft HIGE → Torque simétrico → Vy 65 KIAS.',
    ],
    lastRevision: '2025-10-01',
    pdfFilename: 'rfm-bo105-cbs4-sec4.pdf',
    sections: [
      {
        id: 'rfm-4-1',
        title: '4.1 — Inspección Pre-Vuelo Walkaround (Check Externo 360°)',
        content: [
          'ZONA 1 — NARIZ Y CABINA DE PILOTAJE: Verificar estado exterior del parabrisas, limpiaparabrisas operativo, pitot sin tapones, antenas de comunicación sin daños físicos.',
          'ZONA 2 — COMPARTIMENTO MOTOR IZQUIERDO: Nivel de aceite motor izquierdo 250-C20B en mirilla (entre MIN y MAX), filtro de aceite sin banderín de bypass activado, colector de escapes sin fisuras.',
          'ZONA 3 — ROTOR PRINCIPAL (4 palas): Inspección visual de cada pala de fibra de vidrio — sin delaminaciones, grietas o impactos de objetos extraños (FOD). Verificar pesos de punta de pala y paso en "paso mínimo".',
          'ZONA 4 — TREN DE ATERRIZAJE Y PATINES: Sin deformaciones en la estructura de tubo de acero. Patines rectos y sin daño.',
          'ZONA 5 — COMPARTIMENTO MOTOR DERECHO: Ídem motor izquierdo.',
          'ZONA 6 — ROTOR DE COLA: 2 palas sin grietas. Caja de engranajes de cola con nivel de aceite correcto.',
          'ZONA 7 — CELDA DE COMBUSTIBLE: Verificar que la tapa de llenado esté bloqueada. Sin evidencia de derrames o condensación de agua visible por la válvula de purga.',
          'ZONA 8 — CABINA HEMS: Camilla asegurada en 4 puntos. Cilindro LOX / Oxígeno con válvula cerrada (se abre tras embarcar paciente). Equipo médico amarrado.',
        ],
      },
      {
        id: 'rfm-4-2',
        title: '4.2 — Secuencia de Arranque de Motores',
        content: [
          'PASO 1: Batería Principal → ON (28V DC). Verificar tensión ≥ 24V.',
          'PASO 2: Freno de Rotor (Rotor Brake) → LIBERADO.',
          'PASO 3: Palancas de Combustible MOTOR 1 y 2 → FLIGHT (posición de vuelo).',
          'PASO 4: Verificar TOT <150°C antes de iniciar arranque.',
          'PASO 5: Starter Motor 1 → Activar. Observar N1 aumentando. A 12% N1 → abrir combustible (palanca motor 1 a IDLE).',
          'PASO 6: Monitor TOT durante el encendido. NO debe superar 927°C en los primeros 12 segundos.',
          'PASO 7: Esperar N1 ≥ 58% → Starter desconectado automáticamente. Motor estabilizado en Idle (N1 ~63%, TOT <600°C).',
          'PASO 8: Repetir secuencia para Motor 2.',
          'PASO 9: Observar Rpm de Rotor Principal subir a rango normal (394 RPM / 100%). Verificar presiones hidráulicas HYD 1 y HYD 2 en 1,050 psi.',
        ],
      },
      {
        id: 'rfm-4-3',
        title: '4.3 — Chequeos Antes del Despegue (Pre-Takeoff)',
        content: [
          'Sistemas de Hidráulica 1 y 2: Probar individualmente apagando cada uno — verificar que las fuerzas de control aumentan pero son manejables. Encender nuevamente antes de despegar.',
          'Freno de Rotor: LIBERADO (luz apagada).',
          'Torque Bimotor en Hover HIGE: ≤ 85% TQ (indicativo de márgenes de potencia disponible).',
          'AFCS (Sistema de Control de Vuelo Automático): Activar y verificar respuesta de testes de autocomprobación.',
          'Comunicaciones: Frecuencia de salida establecida. Informe de altímetro QNH confirmado con ATC o ASOS.',
          'Peso y Balanceo: Hoja de W&B firmada con CG dentro de la envoltura.',
        ],
      },
    ],
  },

  {
    id: 'rfm-sec-5',
    category: 'rfm-bo105',
    code: 'RFM BO105 CBS-4 — Sección 5',
    title: 'Sec. 5: Gráficos de Performance (HIGE, HOGE & OEI)',
    summary: 'Tablas y curvas de rendimiento de sustentación en efecto de suelo (HIGE) y fuera de efecto de suelo (HOGE) a distintas altitudes de densidad y temperaturas. Incluye Curva H-V (Avoid Zone) y régimen de ascenso monomotor (OEI).',
    highlights: [
      'HIGE Techo (MTOW 2,500 kg): hasta 8,500 ft ISA.',
      'HOGE Techo (MTOW 2,500 kg): hasta 5,200 ft ISA.',
      'Avoid Zone (H-V Curve): Zona prohibida entre 10 y 450 ft AGL a <40 KIAS.',
      'OEI Climb Rate SL ISA (2,200 kg): +350 fpm a Vy = 65 KIAS.',
    ],
    lastRevision: '2025-10-01',
    pdfFilename: 'rfm-bo105-cbs4-sec5.pdf',
    sections: [
      {
        id: 'rfm-5-1',
        title: '5.1 — Hover en Efecto de Suelo HIGE (In Ground Effect)',
        content: [
          'El HIGE se produce cuando el helicóptero se encuentra a menos de 1 diámetro de rotor del suelo (~9.84 m). El colchón de aire comprimido entre el rotor y el suelo reduce el ángulo de ataque requerido y el torque necesario, mejorando el rendimiento de sustentación.',
          'Techo HIGE a ISA (MTOW = 2,500 kg): 8,500 ft DA.',
          'Techo HIGE a ISA +15°C (MTOW = 2,500 kg): 6,800 ft DA.',
          'Techo HIGE a ISA (MTOW = 2,200 kg): >10,000 ft DA (no limitado en altura por performance).',
          'Regla Práctica: Por cada 100 kg adicional sobre el BEW, el techo HIGE disminuye ~380 ft. Por cada +1°C sobre ISA, disminuye ~120 ft.',
        ],
      },
      {
        id: 'rfm-5-2',
        title: '5.2 — Hover Fuera de Efecto de Suelo HOGE (Out of Ground Effect)',
        content: [
          'El HOGE se produce a alturas superiores a ~1 diámetro de rotor (>9.84 m AGL). Sin el beneficio del efecto de suelo, el rotor requiere más paso colectivo y mayor torque para mantener la misma sustentación.',
          'Techo HOGE a ISA (MTOW = 2,500 kg): 5,200 ft DA.',
          'Techo HOGE a ISA +15°C (MTOW = 2,500 kg): 3,600 ft DA.',
          'Techo HOGE a ISA (MTOW = 2,200 kg): 7,800 ft DA.',
          'APLICACIÓN HEMS OFFSHORE: El despegue de la plataforma DLV Seminole a MTOW de 2,420 kg exige verificar HOGE en altitud de densidad del helideck. La plataforma se encuentra a ~15 m sobre el nivel del mar, equivalente a una altitud de presión de ~50 ft DA, lo que no representa restricción significativa.',
          'VERIFICACIÓN ANTES DE CADA MISIÓN: Confirmar que el peso de despacho es ≤ límite HOGE para la altitud y temperatura del día.',
        ],
      },
      {
        id: 'rfm-5-3',
        title: '5.3 — Curva H-V (Avoid Zone / Dead Man\'s Curve)',
        content: [
          'La Curva H-V define las combinaciones de altura AGL y velocidad KIAS en las que, ante una falla súbita de motor (o doble falla), NO es posible ejecutar una autorrotación segura antes de impactar el suelo.',
          'ZONA ROJA ALTA (Baja Velocidad y Altura Media): La zona principal comprende entre 0 KIAS y ~45 KIAS a alturas entre 30 ft y ~450 ft AGL. En esta región, la altura es insuficiente para convertir energía potencial en RPM de rotor y completar el flare.',
          'ZONA ROJA BAJA (Alta Velocidad y Baja Altura): Por debajo de ~15 ft AGL en cualquier velocidad, la distancia hasta el suelo es insuficiente para cualquier maniobra de autorrotación.',
          'EXCEPCIÓN: A velocidades superiores a ~45–65 KIAS, con alturas mayores de ~500 ft, la autorrotación ES posible, ya que la energía cinética del vuelo translacional permite elevar las RPM del rotor durante la transición.',
          'OPERACIÓN HEMS PRÁCTICA: En despegues desde helipuertos urbanos (SAME) y helidecks de pozos (Vaca Muerta), usar perfiles de despegue de alto ángulo para cruzar la Avoid Zone con la menor exposición posible.',
        ],
      },
    ],
  },

  {
    id: 'rfm-sec-6',
    category: 'rfm-bo105',
    code: 'RFM BO105 CBS-4 — Sección 6',
    title: 'Sec. 6: Peso, Balanceo Longitudinal & Lateral HEMS',
    summary: 'Metodología de cálculo del Centro de Gravedad (CG) y verificación de la envoltura de W&B para la configuración HEMS con camilla, paciente, médico y LOX del BO105 CBS-4.',
    highlights: [
      'Datum: 3,000 mm delante del mástil del rotor principal.',
      'CG Fwd: 3,080 mm | CG Aft: 3,420 mm.',
      'CG Lateral: ±80 mm.',
      'Config HEMS: Piloto 1,800mm | Médico 2,750mm | Camilla 2,650mm | LOX 3,100mm.',
    ],
    lastRevision: '2025-10-01',
    pdfFilename: 'rfm-bo105-cbs4-sec6.pdf',
    sections: [
      {
        id: 'rfm-6-1',
        title: '6.1 — Sistema de Referencia y Brazo de Palanca (Datum)',
        content: [
          'El Datum (eje de referencia 0) está ubicado 3,000 mm (3.0 m) por delante del eje del mástil del rotor principal.',
          'Los brazos de palanca se miden en milímetros desde el datum hacia la COLA (valores positivos = más a la popa).',
          'Todos los pesos y momentos se suman algebraicamente para determinar el CG resultante de despegue.',
          'FÓRMULA CG: CG (mm) = Σ Momentos (kg·mm) ÷ Σ Pesos (kg)',
        ],
      },
      {
        id: 'rfm-6-2',
        title: '6.2 — Estaciones de Carga HEMS CBS-4',
        content: [
          'Peso Vacío de Fábrica (BEW): 1,460 kg — Brazo: 3,250 mm — Momento: 4,745,000 kg·mm',
          'Piloto al Mando (PIC): Brazo 1,800 mm (asiento delantero izquierdo)',
          'Copiloto (SIC): Brazo 1,800 mm (asiento delantero derecho)',
          'Médico Aeroevacuador: Brazo 2,750 mm (asiento lateral trasero izquierdo)',
          'Paciente en Camilla: Brazo 2,650 mm (posición decúbito supino longitudinal)',
          'Sistema de Oxígeno LOX / Botella: Brazo 3,100 mm (compartimento lateral trasero)',
          'Equipo Médico Portátil: Brazo ~2,800 mm (varía según instalación)',
          'Combustible JET A-1: Brazo ~3,180 mm (centroide del tanque principal)',
        ],
      },
      {
        id: 'rfm-6-3',
        title: '6.3 — Procedimiento de Cálculo W&B HEMS Estándar',
        content: [
          '1. Registrar el peso de cada ocupante y carga (camilla + paciente combinados).',
          '2. Multiplicar cada peso por su brazo para obtener el momento individual.',
          '3. Sumar todos los pesos → Peso Total de Despegue (TOW).',
          '4. Sumar todos los momentos → Momento Total.',
          '5. Dividir Momento Total ÷ TOW → CG de Despegue.',
          '6. Verificar que el CG está DENTRO de la envoltura: 3,080 mm ≤ CG ≤ 3,420 mm.',
          '7. Verificar que el TOW no supere el MTOW de 2,500 kg.',
          '8. Calcular también el CG de aterrizaje (restando el combustible quemado estimado).',
          'NOTA HEMS MODENA: Con configuración PIC (85kg) + SIC (85kg) + Médico (85kg) + Paciente en Camilla (85kg) + LOX (25kg) + Equipo Médico (40kg) + Combustible (350kg), el CG típico resulta en ~3,195 mm — DENTRO de envoltura.',
        ],
      },
    ],
  },

  {
    id: 'rfm-sec-7',
    category: 'rfm-bo105',
    code: 'RFM BO105 CBS-4 — Sección 7',
    title: 'Sec. 7: Descripción de Sistemas',
    summary: 'Descripción técnica de los sistemas principales: combustible, eléctrico, hidráulico, transmisión, AFCS y equipamiento sanitario HEMS instalado en el CBS-4 Stretched.',
    highlights: [
      'Combustible: Celdas auto-sellantes 570 L JET A-1 con bombas sumergidas.',
      'Eléctrico: 2× Gen-Starter 200A 28V DC + Batería NiCd 24V 27Ah.',
      'Hidráulico Dual: 2× circuitos independientes 1,050 psi (cíclico + colectivo).',
      'HEMS: Camilla longitudinal + LOX 10L + Inversor 220V AC médico.',
    ],
    lastRevision: '2025-10-01',
    pdfFilename: 'rfm-bo105-cbs4-sec7.pdf',
    sections: [
      {
        id: 'rfm-7-1',
        title: '7.1 — Sistema de Combustible',
        content: [
          'Tanque Principal: Celda de combustible de hule auto-sellante, capacidad 570 L de JET A-1 (450 kg a 0.80 kg/L / 15°C). Ubicada en el fuselaje central bajo la transmisión.',
          'Bombas de Trasvase: 2 bombas eléctricas sumergidas de 28V DC de baja presión. Funcionan en modo continuo durante el vuelo.',
          'Sistema de Gravedad (Backup): Alimentación por gravedad disponible si las bombas fallan, con flujo suficiente para potencia de crucero.',
          'Sistema Crossfeed: No disponible en el BO105 CBS-4 estándar. Cada motor se alimenta del tanque común central.',
          'Indicadores de Combustible: Indicador de nivel combinado en el panel principal + Sensor de low fuel que activa luz de advertencia a ~80 L (~64 kg) restantes.',
          'Combustibles Aprobados: JET A-1 (primario), JP-4, JP-8, AVTUR Mil-T-5624. Mezclas con AVGAS de piston NO permitidas.',
        ],
      },
      {
        id: 'rfm-7-2',
        title: '7.2 — Sistema Eléctrico 28V DC',
        content: [
          'Fuentes Principales: 2 Generadores-Arrancadores integrados en cada motor (Starter-Generator) de 200 Amperios / 28V DC regulados por unidad de control de voltaje.',
          'Batería Principal: Níquel-Cadmio (NiCd) 24V / 27 Ah. Proporciona energía de emergencia para 30 minutos de instrumentación crítica si ambos generadores fallan.',
          'Barras Eléctricas (Bus Bars): Bus Principal 28V DC / Bus de Emergencia (Essential Bus) alimentado directamente de batería. En caso de falla de generadores, el Essential Bus mantiene radio VHF, instrumentos básicos, transponder y bomba de combustible de emergencia.',
          'Inversores: Inversor Médico 28V DC → 220V AC 50Hz de 500W instalado para alimentación del equipamiento sanitario (monitor, aspirador, desfibrilador). Interruptor dedicado en panel HEMS.',
        ],
      },
      {
        id: 'rfm-7-3',
        title: '7.3 — Sistema Hidráulico Dual',
        content: [
          'El BO105 CBS-4 cuenta con DOS sistemas hidráulicos totalmente independientes que alimentan los servomandos de control de vuelo (servocontroles del cíclico y colectivo).',
          'Presión Nominal de Operación: 1,050 psi (72.4 bar) en ambos sistemas.',
          'Bombas: Cada sistema cuenta con una bomba hidráulica accionada mecánicamente desde la caja de transmisión principal (MGB).',
          'Fluido Hidráulico: MIL-PRF-5606 (rojo) — NO mezclar con otros fluidos.',
          'Diseño de Seguridad: Si FALLA UN SISTEMA: Los controles permanecen totalmente asistidos por el sistema restante. Si FALLAN AMBOS SISTEMAS: El vuelo continúa posible con fuerzas de control marcadamente elevadas. Máxima velocidad recomendada: 60 KIAS. Aterrizaje inmediato obligatorio.',
        ],
      },
      {
        id: 'rfm-7-4',
        title: '7.4 — Instalación Médica HEMS Modena (CBS-4 Stretched)',
        content: [
          'Camilla de Traslado: Ferno® Washington modelo 35 A certificada FAR/CS 27. Sistema de anclaje de 4 puntos. Capacidad máxima: 180 kg (paciente + equipamiento adjunto).',
          'Sistema Oxígeno: Botella de Oxígeno Líquido (LOX) de 10 litros → evaporador → salidas para mascarilla paciente y máscara de reservorio. Presión de salida: 4–6 bar. Capacidad: ~1,200 L de O₂ gaseoso (suficiente para >100 minutos a 15 L/min).',
          'Inversor Médico: 28V DC a 220V AC 50Hz / 500W para alimentar monitor multiparamétrico, aspirador y desfibrilador. Activado por interruptor dedicado en panel médico.',
          'Sujeción de Equipos: Todos los equipos médicos portátiles deben asegurarse con correas de amarre certificadas para 9G.',
        ],
      },
    ],
  },

  {
    id: 'rfm-sec-8',
    category: 'rfm-bo105',
    code: 'RFM BO105 CBS-4 — Sección 8',
    title: 'Sec. 8: Mantenimiento & Cuidado del Helicóptero',
    summary: 'Procedimientos de reabastecimiento de combustible, especificaciones de fluidos lubricantes aprobados, servicio de LOX y protocolos de lavado de compresor post-operación en ambientes de polvo o sal marina.',
    highlights: [
      'Puesta a tierra electrostática obligatoria en todo reabastecimiento.',
      'Aceite Motor: Mobil Jet Oil II / Royco 500 | Transm.: Aeroshell 560 | Hid.: MIL-PRF-5606.',
      'Compressor Wash: Agua desmineralizada post-operación en polvo o sal marina.',
      'LOX Service: Guantes criogénicos. Llenado solo en área ventilada sin fuentes de ignición.',
    ],
    lastRevision: '2025-10-01',
    pdfFilename: 'rfm-bo105-cbs4-sec8.pdf',
    sections: [
      {
        id: 'rfm-8-1',
        title: '8.1 — Reabastecimiento de Combustible JET A-1',
        content: [
          'PRECAUCIÓN ELÉCTRICA ESTÁTICA: Conectar cable de puesta a tierra (bonding cable) del camión cisterna a la aeronave ANTES de abrir la tapa del tanque. Desconectar DESPUÉS de cerrar la tapa.',
          'MÉTODO: Llenado por boca superior (overwing fueling). No dispone de sistema de presión (pressure fueling) en versión CBS-4 estándar.',
          'DENSIDAD JET A-1: 0.800 kg/L a 15°C. Corrección: -0.00070 kg/L por cada °C sobre 15°C.',
          'Muestras de Combustible (Fuel Sampling): Extraer muestra de la válvula de drenaje inferior antes de cada vuelo. Verificar ausencia de agua (cuentas de agua visibles) y color claro/ámbar sin turbidez.',
          'CAPACIDAD MÁXIMA: 570 litros / 456 kg (a 15°C). No sobrepasar nivel MAX de la mirilla del tanque.',
        ],
      },
      {
        id: 'rfm-8-2',
        title: '8.2 — Fluidos Aprobados y Servicio de Lubricantes',
        content: [
          'ACEITE DE MOTOR Allison 250-C20B:',
          '  Primario: Mobil Jet Oil II (MIL-PRF-23699 Clase STD)',
          '  Alternativo: Royco 500 / Castrol 5000',
          '  Capacidad por motor: 2.5 L. Verificar en mirilla QUILL (transmisión motor-árbol)',
          '',
          'ACEITE DE TRANSMISIÓN PRINCIPAL (MGB):',
          '  Aeroshell Turbine Oil 560 o equivalente DERD2499',
          '  Capacidad MGB: 8.5 L. Nivel verificar en mirilla lateral.',
          '',
          'ACEITE CAJA ROTOR DE COLA (TGB):',
          '  Aeroshell Turbine Oil 560',
          '  Capacidad TGB: 0.5 L',
          '',
          'FLUIDO HIDRÁULICO:',
          '  MIL-PRF-5606 (fluido mineral rojo)',
          '  NO mezclar con fluido Skydrol (éster de fosfato)',
        ],
      },
      {
        id: 'rfm-8-3',
        title: '8.3 — Lavado de Compresor (Compressor Wash)',
        content: [
          'El lavado de compresor es OBLIGATORIO después de operaciones en los siguientes ambientes: zonas de polvo de yacimientos petrolíferos (Vaca Muerta), ambientes de aerosol salino marino (operaciones offshore Golfo San Matías), zonas de ceniza volcánica.',
          'PROCEDIMIENTO: Motor frío (temperatura TOT < 100°C). Inyectar 2 litros de agua desmineralizada (o solución Turboclean® diluida al 5%) a través de la entrada de aire del compresor durante el período de arranque (N1 en Idle).',
          'FRECUENCIA: Cada 25 horas de vuelo en condiciones ambientales adversas, o inmediatamente después de cada vuelo en zona de alta contaminación.',
          'PROPÓSITO: Eliminar depósitos de sales, polvo y carbonilla del compresor que reducen la eficiencia del motor (pérdida de potencia) y aumentan el consumo de combustible.',
        ],
      },
    ],
  },

  {
    id: 'rfm-sec-9',
    category: 'rfm-bo105',
    code: 'RFM BO105 CBS-4 — Sección 9',
    title: 'Sec. 9: Suplementos Operativos Aprobados',
    summary: 'Apéndices y suplementos aprobados por ANAC para la aeronave LV-XXX: operaciones HEMS nocturnas con NVG, operaciones offshore con flotadores de ditching y gancho de carga externa Slingsby.',
    highlights: [
      'Suplemento NVG: Iluminación NVIS Green + faro LED orientable.',
      '⚠️ ATENCIÓN: Los helicópteros de Modena Air Service NO cuentan con sistema de flotación de emergencia instalado. Operaciones sobre agua requieren evaluación de riesgo especial.',
      'Suplemento Gancho Externo Slingsby: Carga max 1,200 kg.',
    ],
    lastRevision: '2025-10-01',
    pdfFilename: 'rfm-bo105-cbs4-sec9.pdf',
    sections: [
      {
        id: 'rfm-9-1',
        title: '9.1 — Suplemento HEMS Nocturno con NVG',
        content: [
          'Habilitación requerida: Aprobación ANAC específica de "Operaciones con Visión Nocturna" en el Certificado de Operador Aéreo (COA) del explotador.',
          'Iluminación NVIS Interior: Todos los instrumentos, paneles e indicadores deben contar con iluminación compatible NVIS Clase B (Tipo "Green Phosphor" a longitud de onda 520 nm), que no satura los fotomultiplicadores de las AN/AVS-6 o similar.',
          'Faro de Búsqueda Exterior: Modelo NightSun® SX-16 o equivalente LED orientable 360°/90° con modo NVIS compatible. Potencia: 10,000 lúmenes.',
          'Luces de Posición: Luminarias de navegación deben ser sustituidas o filtradas con cubierta NVG-compatible (no emisión UV ni IR que sature las gafas).',
          'Mínimos NVG HEMS (Modena Air Service, aprobación COA): Visibilidad ≥ 5 km, Techo ≥ 1,500 ft AGL, Luminancia de fondo ≥ 0.003 cd/m², Luna ≥ cuarto creciente o Iluminación artificial urbana disponible.',
        ],
      },
      {
        id: 'rfm-9-2',
        title: '9.2 — Suplemento Offshore: Estado de Flotación Modena Air Service',
        content: [
          '⛔ ADVERTENCIA OPERATIVA — MODENA AIR SERVICE',
          'LOS HELICÓPTEROS BO105 CBS-4 DE MODENA AIR SERVICE NO CUENTAN CON SISTEMA DE FLOTACIÓN DE EMERGENCIA (Emergency Floats) INSTALADO.',
          'Esta configuración implica que, ante un amerizaje (ditching) no planificado, el helicóptero NO permanecerá a flote. El tiempo disponible para evacuar la aeronave es EXTREMADAMENTE LIMITADO (~10–20 segundos antes de hundimiento).',
          '⛔ RESTRICCIONES OPERATIVAS DIRECTAS',
          'PROHIBIDO el sobrevuelo sobre extensiones de agua cuando el tiempo de exposición supere los límites reglamentarios sin equipamiento de supervivencia marítima completo.',
          'PROHIBIDO operar sobre agua con temperatura <15°C sin trajes de supervivencia (Dry Suit) para toda la tripulación.',
          'PROHIBIDO sobrevolar agua a alturas <200 ft AGL si no existe área de aterrizaje de emergencia en tierra disponible dentro del radio de autorrotación.',
          '⛔ PROCEDIMIENTO DE MITIGACIÓN DE RIESGO OVERWATER',
          'Todo vuelo sobre agua (Río Paraná, Golfo San Matías, ríos neuquinos) debe incluir en el Pre-Flight Briefing: evaluación de distancia de nado/supervivencia, temperatura del agua del día y confirmación del equipamiento de supervivencia disponible a bordo.',
          'Equipamiento mínimo obligatorio en toda misión con exposición overwater: Chalecos salvavidas individuales (LPU) para todos los ocupantes, ELT de impacto activo 406 MHz, y coordinación previa con servicio SAR (PREFECTURA NAVAL / FUERZA AÉREA).',
          '— REFERENCIA REGLAMENTARIA (RAAC 135, Subparte K.5) —',
          'El límite de exposición sobre agua sin flotadores instalados es de 5 minutos para bimotores Clase 1. Superar este límite requiere aprobación operativa extraordinaria del Jefe de Operaciones y del Responsable de Seguridad Operacional (SMS).',
          '— ESTADO ACTUAL DEL EQUIPAMIENTO —',
          'Flotadores de Emergencia en Patines: NO INSTALADOS',
          'Balsa Salvavidas Autoinflamable: NO A BORDO (no es equipamiento estándar de misión)',
          'Dry Suits: Disponibles en Base — No a bordo de forma permanente',
          'EBS (Emergency Breathing System): NO A BORDO',
          'Chalecos LPU individuales: A BORDO en misiones con exposición overwater planificada',
          'ELT 406 MHz de Impacto: INSTALADO (activo en amerizaje)',
        ],
      },
      {
        id: 'rfm-9-3',
        title: '9.3 — Suplemento Gancho de Carga Externa',
        content: [
          'Gancho Slingsby Mk4 certificado FAA TSO-C105.',
          'Capacidad de Carga Máxima Suspendida: 1,200 kg.',
          'MTOW con Carga Suspendida: 2,500 kg (igual al MTOW normal, la carga exterior se computa en el peso total).',
          'Velocidades Máximas con Carga Suspendida: 80 KIAS con carga / 100 KIAS con gancho vacío.',
          'Suelta de Emergencia: Sistema de liberación eléctrica (botón en cíclico PIC) + liberación manual mecánica (palanca de emergencia en suelo).',
          'NOTA: El BO105 CBS-4 configuración HEMS de Modena Air Service NO opera normalmente con gancho externo. Este suplemento es referencia para configuraciones específicas de rescate o apoyo logístico en Vaca Muerta.',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // MANUAL DE OPERACIONES MODENA AIR SERVICE (MOP)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'mop-vista-neuquen',
    category: 'mop-modena',
    code: 'MOP-MOD-SEC-04',
    title: 'Manual Ops. Modena: Vaca Muerta (Vista / YPF) — Neuquén',
    summary: 'Procedimientos específicos de Modena Air Service para operaciones HEMS en zona de yacimientos petrolíferos de la Cuenca Neuquina. Incluye gestión de Brownout, separadores de partículas y comunicaciones con personal de yacimiento.',
    highlights: [
      'Separadores de partículas obligatorios (EAPS) en admisión de motores.',
      'Aproximación de alto ángulo anti-Brownout.',
      'Alineación de proa con viento patagónico ≥ 25 kt.',
    ],
    lastRevision: '2026-01-10',
    pdfFilename: 'mop-vaca-muerta.pdf',
    sections: [
      {
        id: 'mop-04-1',
        title: '4.1 — Descripción de la Zona de Operación (Vaca Muerta)',
        content: [
          'La Formación Vaca Muerta comprende una extensión de ~30,000 km² en las provincias de Neuquén y Río Negro, con pozos de explotación no convencional (shale oil & gas) distribuidos en una red de planchadas y helipuertos privados a altitudes entre 800 y 2,500 ft MSL.',
          'BASES DE OPERACIÓN MODENA: Base principal en Aeropuerto Presidente Perón (SAZN / NQN, 891 ft MSL). Forward Operating Base (FOB) en campamento Vista / YPF en Añelo (1,240 ft MSL).',
          'HELIPUERTOS EN YACIMIENTO: No certificados ANAC. Dimensión típica H (Landing Area) de 25×25 m, rodeada de instalaciones industriales. Cada aterrizaje en planchada requiere coordinación radial previa con el Safety Officer del yacimiento.',
          'PELIGROS ESPECÍFICOS: Cables de alta tensión entre instalaciones, torres de perforación activas con actividad de grúas, gases de antorcha y contaminación de polvo de caliche en los aterrizajes.',
        ],
      },
      {
        id: 'mop-04-2',
        title: '4.2 — Gestión de Brownout (Nube de Polvo)',
        content: [
          'El Brownout ocurre cuando el downwash del rotor levanta polvo o arena fina al acercarse al suelo, creando una nube que obstruye la visibilidad del piloto y puede causar desorientación espacial (IIMC inducido).',
          'PROCEDIMIENTO ANTI-BROWNOUT MODENA: 1) Aproximación con ángulo >8° (mayor ángulo que un perfil estándar). 2) Velocidad de aproximación: 40–60 KIAS hasta 200 ft AGL, luego reducir a 20 KIAS para descenso final rápido. 3) Descenso directo al punto de aterrizaje (sin flare largo a baja altura). 4) Establecer punto visual fijo en la infraestructura (tanque, edificio) como referencia durante la nube.',
          'SEPARADORES DE PARTÍCULAS (EAPS): Instalados en las tomas de aire de ambos motores Allison 250-C20B en toda misión a Vaca Muerta. Los EAPS reducen la ingesta de polvo de caliche y sílice que produce erosión de compresores. Penalización de potencia: ~3–5% de reducción en potencia disponible (compensado ajustando límites de torque).',
        ],
      },
      {
        id: 'mop-04-3',
        title: '4.3 — Comunicaciones & Coordinación en Yacimiento',
        content: [
          'FRECUENCIAS VHF MODENA VACA MUERTA:',
          '  122.000 MHz — Frecuencia CTAF bases Modena / Añelo',
          '  119.300 MHz — Neuquén Control / Aproximación SAZN',
          '  Frecuencia privada yacimiento (canal 5 radio VHF portátil) — coordinar con Safety Officer',
          '',
          'PROTOCOLO DE LLEGADA A PLANCHADA:',
          '  1. Contactar Safety Officer en frecuencia privada a 5 NM del destino.',
          '  2. Confirmar área de aterrizaje despejada de personal y vehículos.',
          '  3. Obtener condición de viento local y verificar ausencia de actividad de grúas en radio de 200 m.',
          '  4. Green Light para el aterrizaje solo después de confirmación verbal del Safety Officer.',
          '',
          'PAUTAS DE SEGURIDAD POST-ATERRIZAJE:',
          '  — Motores en Idle durante embarque/desembarque de paciente.',
          '  — Personal médico NO accede por sector del rotor de cola.',
          '  — Zona de seguridad mínima de 10 m de radio en torno al helicóptero con motores en marcha.',
        ],
      },
    ],
  },

  {
    id: 'mop-utv-rosario',
    category: 'mop-modena',
    code: 'MOP-MOD-SEC-05',
    title: 'Manual Ops. Modena: UTV Rosario & Corredor Fluvial Río Paraná',
    summary: 'Procedimientos HEMS para rescate fluvial, traslado en helipuerto de Sanatorio Parque y operaciones en barcazas fluviales en el Río Paraná. Contrato UTV (Unidad de Traslado Vascular).',
    highlights: [
      'Coordinación VHF con Prefectura Naval Argentina (Rosario).',
      'Verificación de amarre y calado de barcazas antes del posado en cubierta.',
      'Mínimos de niebla de advección: Visibilidad > 5 km.',
    ],
    lastRevision: '2025-12-05',
    pdfFilename: 'mop-utv-rosario.pdf',
    sections: [
      {
        id: 'mop-05-1',
        title: '5.1 — Base de Operaciones UTV Rosario',
        content: [
          'BASE PRINCIPAL: Aeropuerto Internacional Rosario "Islas Malvinas" (SAAR / ROS, 85 ft MSL). Hangar Modena Air Service en sector NW del aeródromo.',
          'ÁREA DE COBERTURA UTV: Radio de 60 NM centrado en Rosario. Incluye: Hospital Sanatorio Parque (helipuerto en techo), barcazas fluviales en el Paraná, hospitales de Venado Tuerto, Cañada de Gómez y zona fluvial de Las Palmas.',
          'PERFIL DE MISIÓN TÍPICO UTV: 1) Activación por coordinador médico. 2) Despegue desde SAAR (10 min desde alerta). 3) Vuelo a velocidad crucero 110 KIAS. 4) Traslado de paciente ACV (accidente cerebrovascular) tiempo-crítico a hemodinamia de Hospital Español o British de Rosario.',
          'TIPOLOGÍA DE CASOS UTV: Síndromes coronarios agudos (SCA), ACV isquémico, politraumatizados, pacientes pediátricos críticos.',
        ],
      },
      {
        id: 'mop-05-2',
        title: '5.2 — Operaciones sobre el Río Paraná (Fluviales)',
        content: [
          'HELIPUERTOS DE BARCAZA/PONTÓN: Embarcaciones fluviales de cargas a granel pueden solicitarse como helipuerto de emergencia. ANTES del posado verificar: a) Confirmación de capitán de la embarcación sobre estabilidad del barco. b) Velocidad de la embarcación ≤ 5 nudos. c) Área de cubierta libre de >15×15 m sin obstáculos superiores.',
          'LÍMITE OVERWATER RÍO PARANÁ: Toda la trayectoria sobre el cauce del Paraná (ancho medio: 1.5 km en Rosario). Tiempo de exposición sobre agua típico: <2 minutos. Dentro del límite reglamentario de 5 minutos.',
          'NIEBLA DE ADVECCIÓN: Principal riesgo meteorológico. La niebla puede desarrollarse en <30 minutos desde márgenes del río hacia el interior urbano. Seguimiento permanente con METAR/SPECI SAAR y consulta a Prefectura Naval de condiciones sobre el río.',
          'RADIO ALTÍMETRO: Obligatorio para vuelos sobre el Paraná a alturas ≤ 200 ft (seguimiento de margen fluvial).',
        ],
      },
      {
        id: 'mop-05-3',
        title: '5.3 — Helipuerto Sanatorio Parque (Rosario)',
        content: [
          'LOCALIZACIÓN: Azucena Villaflor 965, Rosario. Helipuerto en techo de edificio (piso 8, 32 m AGL). Coordenadas: 32°53\'12"S / 60°40\'03"W.',
          'DIMENSIONES: 22 × 22 m de área de posado. Obstáculos: Caja de ascensores (6 m al NE), antena de radio (12 m al SO).',
          'PROCEDIMIENTO DE APROXIMACIÓN NOCTURNA: Desde el NE, identificar luces del helipuerto (balizas perimetrales verdes + punto de toque blanco). Evitar el sector SO por la antena de radio. Aproximación final con viento de frente, 500 ft hasta 200 ft en descenso estabilizado 8°.',
          'LIMITACIONES: Máximo peso de aterrizaje 2,200 kg (restricción estructural del techo, NO del helicóptero). Verificar que TOW al momento del aterrizaje sea ≤ 2,200 kg.',
          'COORDINACIÓN: Frecuencia VHF Sanatorio Parque: 155.175 MHz (medicina aeronáutica). AVISO PREVIO MÍNIMO: 5 minutos antes del aterrizaje para liberar personal no esencial del techo.',
        ],
      },
    ],
  },

  {
    id: 'mop-same-ba',
    category: 'mop-modena',
    code: 'MOP-MOD-SEC-06',
    title: 'Manual Ops. Modena: SAME AÉREO Buenos Aires (Urbano)',
    summary: 'Protocolo operativo HEMS en ambiente urbano densamente poblado para el SAME (Servicio de Atención Médica de Emergencias) de la Ciudad Autónoma de Buenos Aires. Incluye gestión de espacio aéreo bajo y Hot Loading.',
    highlights: [
      'Despacho coordinado con Policía CABA para corte de tránsito.',
      'Reconocimiento visual 360° de tendidos eléctricos y arbolado.',
      'Hot Loading por sector frontal del helicóptero (10h a 02h).',
    ],
    lastRevision: '2026-03-01',
    pdfFilename: 'mop-same-buenos-aires.pdf',
    sections: [
      {
        id: 'mop-06-1',
        title: '6.1 — Base de Operaciones SAME Aéreo CABA',
        content: [
          'BASE: Helipuerto SAME en Parque Roca, Buenos Aires (34°40\'51"S / 58°24\'25"W). Elevación: 26 ft MSL.',
          'ÁREA DE COBERTURA: Ciudad Autónoma de Buenos Aires (203 km²) + GBA Norte y GBA Sur hasta 30 NM.',
          'AEROPUERTO DE ALTERNATIVA: Aeroparque Jorge Newbery (SABE, 18 ft MSL) — 6 NM al NE. En caso de emergencia técnica o meteorológica, aterrizaje de emergencia disponible con prenotificación a TWR SABE.',
          'ESPACIO AÉREO CABA: Bajo jurisdicción de Ezeiza Control (122.100 MHz). Todo vuelo en CABA debe notificarse en 122.100 MHz o frecuencia de sector asignada. Altitudes de vuelo: máx 1,500 ft AGL dentro de TMA Buenos Aires.',
        ],
      },
      {
        id: 'mop-06-2',
        title: '6.2 — Procedimiento de Respuesta en Vía Pública (Calle/Autopista)',
        content: [
          'DESPACHO (T-0 a T-5 minutos): Coordinación simultánea con: a) SAME Tierra (107) para coordinar corte de tránsito policial. b) Policía CABA Central de Operaciones para bloqueo de cuadras. c) ANAC/Ezeiza Control para aviso de zona de aterrizaje ad hoc.',
          'SOBREVUELO RECONOCIMIENTO (T-5 a T-8 minutos): 1 pasada a 300 ft AGL sobre el sitio para evaluar: cables aéreos (media y alta tensión), árboles, señalización vial vertical, condición del pavimento (>20×20 m libres para aterrizaje).',
          'ESTABLECIMIENTO DE RADIO DE SEGURIDAD: Personal policial en el suelo establece perímetro de seguridad de 30 m. El piloto NO aterriza si el perímetro no está establecido.',
          'ATERRIZAJE: Aproximación final en viento de frente. Motores en IDLE tras posado. Médico y asistente desembarcan por sector delantero (10h a 2h en relación al eje de proa). NUNCA por sector del rotor de cola.',
          'HOT LOADING: Embarque del paciente con motores en Idle y rotores girando. El médico guía el ingreso de la camilla. Check de anclaje de camilla (4 puntos) antes de señal de OK para despegar.',
        ],
      },
      {
        id: 'mop-06-3',
        title: '6.3 — Helipuertos Hospitalarios SAME CABA',
        content: [
          'HOSPITAL GENERAL DE AGUDOS J.M. RAMOS MEJÍA: Piso 8, Dr. Enrique Finochietto 1160. Helipuerto 18×18 m. Obstáculo: depósito de agua (4 m) en sector E. Coordenadas: 34°37\'36"S / 58°24\'40"W.',
          'HOSPITAL FERNÁNDEZ: Bulnes 2975. Helipuerto en techo nivel 12. 20×20 m. Acceso por sector NO. Noche: balizas verdes perimetrales. Coordenadas: 34°35\'22"S / 58°24\'28"W.',
          'HOSPITAL SANTOJANNI: Pilar 950. Helipuerto nivel 6 con FATO 22×22 m. El mejor acceso es desde el SO sobre el parque. Coordenadas: 34°39\'00"S / 58°29\'17"W.',
          'HOSPITAL BRITÁNICO: Perdriel 74. Helipuerto nivel 3. Obstáculos múltiples en entorno urbano denso. Solo para emergencias absolutas. Coordenadas: 34°37\'06"S / 58°22\'18"W.',
          'LIMITACIONES GENERALES HELIPUERTOS HOSPITALARIOS: Máximo 2 aeronaves simultáneas en cualquier helipuerto. Aviso previo mínimo 3 min antes del aterrizaje para despejar personal médico no esencial.',
        ],
      },
    ],
  },
];
