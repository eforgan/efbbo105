'use client';

import React from 'react';
import {
  HelpCircle, ShieldAlert, Scale, Gauge, AlertOctagon, Flame, MapPin, Fuel, CloudSun, Moon,
  Compass, HeartPulse, CheckSquare, ShieldCheck, FileText, BookOpen, Book, FileCheck,
  UserCircle, Home, Layers, Route
} from 'lucide-react';

interface ManualSection {
  icon: React.ElementType;
  title: string;
  body: string[];
}

const GENERAL_SECTIONS: ManualSection[] = [
  {
    icon: Home,
    title: 'Inicio',
    body: [
      'Pantalla de bienvenida con un resumen de todos los módulos de la aplicación, agrupados por categoría. Cada tarjeta es un acceso directo: al hacer clic te lleva directamente a ese módulo.',
      'Incluye accesos rápidos a este Manual de Operación y a "Mi Perfil".',
    ],
  },
  {
    icon: Layers,
    title: 'Datos Compartidos Entre Módulos',
    body: [
      'La app mantiene tres datos en común entre pestañas: las estaciones de carga de Peso & Balanceo, las condiciones ambientales de Performance, y la Misión seleccionada en el encabezado.',
      'Esto significa que si cargás el peso real del vuelo en "Peso & Balanceo" y las condiciones reales en "Performance HOGE/HIGE", el módulo "Despacho PDF Oficial" va a imprimir esos mismos valores — no valores de ejemplo. Lo mismo aplica a la ruta: cambiar la Misión en el selector del encabezado actualiza automáticamente la ruta usada en "Rutas Modena HEMS" y en el despacho.',
    ],
  },
  {
    icon: UserCircle,
    title: 'Mi Perfil (Registro Local)',
    body: [
      'Formulario para registrar tus datos como tripulante: nombre completo, rol (PIC / SIC / Médico / Despachante), licencia, email y teléfono.',
      'Importante: este perfil se guarda solo en este dispositivo y navegador (localStorage), no en un servidor. No requiere contraseña ni conexión a internet. Sirve para autocompletar tu nombre en Despacho PDF, Plan de Vuelo OACI y Bitácora Digital según tu rol, evitando reescribirlo cada vez.',
      'Si varias personas usan el mismo equipo, cada una puede actualizar el perfil antes de despachar su propio vuelo — el botón "Borrar Perfil" limpia los datos guardados.',
    ],
  },
];

const CALCULO_SECTIONS: ManualSection[] = [
  {
    icon: Scale,
    title: 'Peso & Balanceo',
    body: [
      'Cargá el peso de cada estación (tripulación, médico, paciente, equipo, bodega, combustible) con los controles deslizantes, o usá los botones de carga rápida (Configuración HEMS Completa, Misión Liviana, Tanques Llenos, Reiniciar).',
      'La app calcula en vivo el peso total, el CG longitudinal, el desequilibrio lateral y el peso sin combustible (ZFW), y los compara contra la envolvente de peso/CG del BO105 CBS-4 (3.080–3.420 mm, MTOW 2.500 kg).',
      'El diagrama muestra gráficamente el punto de despegue (TOW) y sin combustible (ZFW) sobre la envolvente. La tabla inferior detalla brazo, peso y momento por estación.',
    ],
  },
  {
    icon: Gauge,
    title: 'Performance HOGE/HIGE',
    body: [
      'Ingresá altitud de presión, temperatura, QNH, viento y peso de despegue. La app calcula la altitud densidad, la desviación ISA, el peso máximo para estacionario dentro (HIGE) y fuera (HOGE) de efecto suelo, el régimen de ascenso monomotor (OEI) y la VNE ajustada.',
      'El gráfico y la tabla comparan el límite HIGE/HOGE contra el peso actual en distintas altitudes, útil para evaluar el margen antes de una operación en helideck o zona urbana.',
    ],
  },
  {
    icon: AlertOctagon,
    title: 'Curva H-V Dead Man',
    body: [
      'Simulador de la curva altura-velocidad: seleccioná falla de motor único (OEI) o doble falla (autorrotación), y ajustá peso, temperatura, altitud, velocidad y altura para ver si la combinación cae dentro de la zona a evitar.',
      'Esta curva es una forma estilizada con fines de estudio, no una transcripción del RFM oficial — para la curva limitante certificada, consultá el RFM real en "Biblioteca ANAC & RFM" (Fig. 5-5 falla simple / Fig. 5-6 falla doble).',
    ],
  },
  {
    icon: Flame,
    title: 'Emergencia OEI Monomotor',
    body: [
      'Ante falla de un motor en crucero, ingresá peso, altitud de presión y temperatura actuales para obtener el techo máximo de vuelo nivelado monomotor y el régimen de ascenso/descenso resultante.',
      'Si la altitud actual supera el techo OEI, la app muestra el perfil de "drift down" (descenso gradual) hasta estabilizar en el techo monomotor.',
    ],
  },
];

const NAV_SECTIONS: ManualSection[] = [
  {
    icon: Route,
    title: 'Planificación de Navegación',
    body: [
      'Buscá cada punto de tu ruta por código OACI (4 letras, ej. SAZN), código de 3 letras (ej. NQN) o nombre de localidad, contra un listado de referencia de aeródromos, aeropuertos y helipuertos de Argentina. Elegí el resultado para agregarlo como punto de la ruta.',
      'Si un punto no está en el listado (pista privada, helipuerto no registrado, etc.), cargálo manualmente con su nombre y coordenadas en grados/minutos/segundos.',
      'A medida que agregás puntos, la app arma los tramos automáticamente: rumbo magnético y distancia entre cada par de puntos consecutivos, con velocidad de crucero fija de 100 kt para calcular el tiempo parcial y total.',
      'Marcá uno o más puntos como "Alternativa" — la app calcula distancia y tiempo directo desde el destino a cada alternativa y señala la más lejana, que es la que se usa para el combustible de reserva.',
      'Con esos datos calcula el combustible programado: viaje + alternativa más lejana + reserva/espera (minutos configurables), y compara el total contra la capacidad utilizable del BO105 (450 kg).',
      'Automáticamente adjunta el METAR en vivo de los aeródromos de la ruta que tengan código OACI de 4 letras, para tener la meteorología de los puntos más cercanos al vuelo planificado.',
      'Nota: el listado de aeródromos proviene de una base de datos abierta (OurAirports), no del registro oficial completo de ANAC — verificá siempre contra el AIP/NOTAM vigente antes de operar.',
    ],
  },
  {
    icon: MapPin,
    title: 'Rutas Modena HEMS',
    body: [
      'Elegí una de las cuatro rutas operativas predefinidas (Neuquén/Vista, Rosario/UTV, SAME Buenos Aires, YPF VMOS Offshore) o dejá que siga la Misión activa del encabezado.',
      'Muestra distancia, rumbo magnético, tiempo de vuelo y combustible por tramo, el perfil de altitud/consumo acumulado, y la exposición overwater (con el límite de 5 minutos para operaciones offshore) junto con el punto de igual tiempo (ETP).',
    ],
  },
  {
    icon: Fuel,
    title: 'Combustible & Autonomía',
    body: [
      'Ajustá combustible cargado, temperatura, velocidad de crucero, consumo específico y reserva mínima VFR para obtener autonomía bruta y útil, alcance en millas náuticas y el punto de combustible "bingo" (retorno obligatorio).',
      'El gráfico de agotamiento y la tabla muestran el estado del combustible cada 15 minutos de vuelo.',
    ],
  },
  {
    icon: CloudSun,
    title: 'METAR / TAF & Viento',
    body: [
      'Meteorología en vivo de las bases operativas (Neuquén, Rosario, Aeroparque, San Fernando) obtenida de NOAA Aviation Weather Center — si no hay conexión, muestra datos de referencia guardados.',
      'Incluye METAR crudo y decodificado, pronóstico TAF, calculadora de componente de viento cruzado/frente contra el rumbo de pista, y el estado del mar en Punta Colorada (Golfo San Matías) para operaciones offshore.',
    ],
  },
  {
    icon: Moon,
    title: 'Visión Nocturna & NVG',
    body: [
      'Calcula orto, ocaso y fin del crepúsculo civil (en UTC) para la ubicación seleccionada, junto con la fase lunar y el porcentaje de iluminación.',
      'Clasifica la aptitud para operar con visores nocturnos (NVG) según la iluminación lunar disponible: Excelente, Medio (requiere faro) o Crítico (sin iluminación).',
    ],
  },
  {
    icon: Compass,
    title: 'Simulador Helipuerto',
    body: [
      'Elegí un helipuerto/helideck y ajustá dirección e intensidad del viento junto con el rumbo de aproximación para visualizar el viento relativo.',
      'Calcula componente de frente/cola y viento cruzado, y alerta si el viento cruzado supera el límite operativo o si hay viento de cola peligroso en la aproximación.',
    ],
  },
];

const HEMS_SECTIONS: ManualSection[] = [
  {
    icon: HeartPulse,
    title: 'Oxígeno UTV/SAME',
    body: [
      'Calculadora de autonomía de oxígeno médico según volumen del cilindro, presión y flujo requerido por el paciente, con reserva del 20%.',
      'Incluye un checklist de seguridad de cabina médica (camilla bloqueada, cilindro LOX asegurado, alimentación eléctrica médica) y un puntaje clínico NEWS2 de referencia para el riesgo del paciente.',
    ],
  },
  {
    icon: CheckSquare,
    title: 'Listas QRH & Voz',
    body: [
      'Checklists interactivas normales, por base operativa y de emergencia (QRH). Marcá cada ítem a medida que lo completás; el estado se resetea por categoría o completo.',
      'El "Copiloto de Voz" lee en voz alta cada ítem marcado usando el sintetizador de voz del navegador — útil para verificación hands-free en cabina.',
      'Podés filtrar por categoría o buscar un procedimiento específico con el buscador.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Matriz Riesgo SMS OACI',
    body: [
      'Evaluación dinámica de amenazas operativas según la matriz 5x5 (severidad × probabilidad) del Doc. 9859 OACI. Ajustá la probabilidad de cada amenaza para ver si el riesgo resultante es Aceptable, Tolerable o Intolerable.',
      'Si algún riesgo queda en nivel Intolerable, la app señala que se debe aplicar una barrera mitigadora antes del despacho.',
    ],
  },
];

const DESPACHO_SECTIONS: ManualSection[] = [
  {
    icon: FileText,
    title: 'Plan de Vuelo OACI EANA',
    body: [
      'Formulario reglamentario FPL 1801 (ARO-AIS EANA): completá indicativo, reglas y tipo de vuelo, equipo, ruta, aeródromos y datos de búsqueda y salvamento.',
      'Podés copiar la cadena ATS cruda, descargar el formulario en PDF, o enviarlo por correo electrónico directamente a la oficina ARO-AIS (o a cualquier destinatario que indiques).',
    ],
  },
  {
    icon: BookOpen,
    title: 'Biblioteca ANAC & RFM',
    body: [
      'Visor de documentación oficial: Manual de Vuelo (RFM) del BO105 CBS-4, Reglamentos RAAC 91 y 135 de ANAC, y los Manuales de Operación por Base (MOP) de Modena Air Service.',
      'Acá se consulta el RFM real para verificar cualquier cálculo aproximado que muestre la app (performance, curva H-V, etc.).',
    ],
  },
  {
    icon: Book,
    title: 'Bitácora Digital',
    body: [
      'Registro de vuelos: fecha, misión/contrato, tramo, horas, combustible, aterrizajes, PIC y observaciones. Se guarda en este dispositivo y persiste entre sesiones.',
      'Exportable a CSV para llevar el registro a una planilla externa o presentarlo a la operación.',
    ],
  },
  {
    icon: FileCheck,
    title: 'Despacho PDF Oficial',
    body: [
      'Genera la hoja de despacho de vuelo: usa el peso y balanceo, la performance y la ruta configurados en sus respectivos módulos (no valores de ejemplo), más los nombres de tripulación que completes acá.',
      'El contrato/misión que se imprime sigue automáticamente a la Misión seleccionada en el encabezado. El documento incluye el disclaimer de que los cálculos son aproximaciones no verificadas contra el RFM oficial.',
    ],
  },
];

const SectionBlock: React.FC<{ section: ManualSection }> = ({ section }) => {
  const Icon = section.icon;
  return (
    <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-cyan-400 shrink-0" /> {section.title}
      </h3>
      <div className="space-y-1.5">
        {section.body.map((p, idx) => (
          <p key={idx} className="text-xs text-slate-400 leading-relaxed">{p}</p>
        ))}
      </div>
    </div>
  );
};

export const OperationManualModule: React.FC = () => {
  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto font-sans">
      <div className="glass-panel p-4 rounded-xl border border-slate-800 font-mono">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" /> Manual de Operación de la Aplicación
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Guía de referencia de todas las funciones del EFB BO105 CBS-4 y su forma de uso, módulo por módulo.
        </p>
      </div>

      <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-300 font-mono">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Este manual explica <strong>cómo usar la aplicación</strong>. No reemplaza el Manual de Vuelo (RFM), el MOP
          Modena ni ningún procedimiento oficial — para la operación real de la aeronave, consultá siempre la
          documentación certificada disponible en &ldquo;Biblioteca ANAC &amp; RFM&rdquo;.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">General</h2>
        <div className="space-y-3">
          {GENERAL_SECTIONS.map(s => <SectionBlock key={s.title} section={s} />)}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">Cálculo & Rendimiento</h2>
        <div className="space-y-3">
          {CALCULO_SECTIONS.map(s => <SectionBlock key={s.title} section={s} />)}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">Navegación & Meteorología</h2>
        <div className="space-y-3">
          {NAV_SECTIONS.map(s => <SectionBlock key={s.title} section={s} />)}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">Operación HEMS & Seguridad</h2>
        <div className="space-y-3">
          {HEMS_SECTIONS.map(s => <SectionBlock key={s.title} section={s} />)}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">Despacho & Documentación</h2>
        <div className="space-y-3">
          {DESPACHO_SECTIONS.map(s => <SectionBlock key={s.title} section={s} />)}
        </div>
      </div>
    </div>
  );
};
