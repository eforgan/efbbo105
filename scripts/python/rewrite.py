import os

data_dir = r"c:\Users\SERVER-MADERO\Desktop\Output\cursoadptacionbo105bolkow\bo105-course\src\data"

modules = {
    "1": """# Módulo 1: General (Generalidades)

## 1.1 Introducción
Este manual proporciona toda la información requerida por las autoridades aeronáuticas para la operación segura y eficiente del helicóptero **BO105 CBS4**. El helicóptero BO105 es un modelo bimotor ligero, multipropósito, fabricado originalmente por MBB (Messerschmitt-Bölkow-Blohm) y luego por Eurocopter.

## 1.2 Dimensiones de la Aeronave
- **Longitud del Fuselaje:** 8.81 m
- **Diámetro del Rotor Principal:** 9.84 m
- **Diámetro del Rotor de Cola:** 1.90 m
- **Altura Total:** 3.00 m
- **Ancho del Patín:** 2.50 m

## 1.3 Terminos y Abreviaturas
- **MTOW** (Maximum Take-Off Weight): Peso Máximo de Despegue.
- **OEI** (One Engine Inoperative): Condición de vuelo con un motor inoperativo.
- **IGE** (In Ground Effect): En Efecto Suelo.
- **OGE** (Out of Ground Effect): Fuera de Efecto Suelo.
- **Vne** (Velocity Never Exceed): Velocidad que nunca debe excederse.
- **Vy**: Velocidad de mejor régimen de ascenso.

> **WARNING**  
> Las instrucciones marcadas como WARNING indican un procedimiento operativo, práctica, etc., que si no se sigue correctamente, puede resultar en lesiones personales o pérdida de vidas.

> **CAUTION**  
> Las advertencias tipo CAUTION indican procedimientos que si no se siguen correctamente, pueden resultar en daño o destrucción del equipo.

> **NOTE**  
> Una nota resalta una condición operativa esencial.
""",
    "2": """# Módulo 2: Limitations (Limitaciones)

## 2.1 Limitaciones de Velocidad
- **Vne (Nivel del mar a 2500 kg):** 135 KIAS.
- **Vne en Autorrotación:** 90 KIAS.
- **Vuelo con Puertas Desmontadas:** Vne máxima de 100 KIAS con cualquier puerta trasera extraída.

## 2.2 Limitaciones de los Motores (Rolls-Royce 250-C20B)
### Límites de RPM del Rotor Principal
- **Power On:** 100% - 104%
- **Power Off (Autorrotación):** 85% (mínimo) a 104% (máximo).

### Límites de Torque (Transmisión)
- **AEO (All Engines Operating):** 
  - Máximo Continuo: 2x 42% (Total 84%)
  - Límite de despegue (5 min): 2x 50% (Total 100%)
- **OEI (One Engine Inoperative):**
  - Máximo Continuo: 75%
  - Límite Transitorio (2.5 min): 100%

### Temperatura de Turbina (TOT)
- **Arranque:** 810°C máximo (10 segundos a 927°C).
- **AEO Continuo:** 738°C
- **AEO 5 Minutos:** 810°C
- **OEI Continuo:** 810°C

## 2.3 Limitaciones Ambientales
- **Altitud Máxima:** 17,000 ft (Densidad) o 16,000 ft PA.
- **Temperatura Operativa:** -45°C a +50°C.

> **WARNING**  
> Volar fuera de estos límites de performance y pesos invalida los certificados de aeronavegabilidad y compromete gravemente la integridad estructural de la máquina.
""",
    "3": """# Módulo 3: Emergency and Malfunction Procedures (Procedimientos de Emergencia)

## 3.1 Fallo de Motor en Vuelo (Engine Failure in Flight)
En caso de falla de un motor durante la fase de crucero:
1. **Colective Lever:** Ajustar según sea necesario para mantener el régimen de RPM (N2/NR) dentro de los límites.
2. **Airspeed:** Ajustar a Vy (Velocidad de mejor régimen de ascenso/OEI).
3. **Falla de motor:** Identificar motor afectado.
4. **Engine Twist Grip (Afectado):** Posición IDLE, evaluar reinicio, o OFF si es falla catastrófica.
5. Aterrizar lo antes posible (Land as soon as possible).

## 3.2 Fuego en Motores (Engine Fire)
Si la advertencia **FIRE** se enciende en vuelo:
1. Confirmar visualmente.
2. **Engine Twist Grip (Afectado):** OFF.
3. **Fire Extinguisher Button:** Presionar (si el equipo cuenta con extintor).
4. Proceder a un aterrizaje inmediato (Land immediately).

## 3.3 Autorrotación (Autorotation)
Si ambos motores fallan:
1. **Collective Pitch:** Bajar completamente (Full down) de manera inmediata.
2. **Airspeed:** Mantener 75 KIAS.
3. **Rotor RPM:** Mantener entre 85% y 104%.
4. Dirigirse al área de aterrizaje más cercana y apta.

> **WARNING**  
> Durante el aterrizaje en autorrotación, aplique el colectivo de forma progresiva a unos 50-70 ft AGL para amortiguar la tasa de descenso (flare).
""",
    "4": """# Módulo 4: Normal Procedures (Procedimientos Normales)

## 4.1 Inspección Pre-vuelo (Preflight Inspection)
El piloto es responsable de asegurar que el helicóptero esté en condiciones aptas para el vuelo.
- **General:** Quitar todas las fundas y anclajes (Tie-downs).
- **Rotor Principal:** Inspeccionar cabeza de rotor (Hingeless), anclajes, estado de los elastómeros y palas.
- **Fuselaje:** Puertas aseguradas, sin fugas visibles de combustible o fluidos hidráulicos.
- **Rotor de Cola:** Caja de transmisión de cola (TGB) con nivel de aceite correcto, palas sin daños.

## 4.2 Arranque de Motores (Engine Starting)
1. **Batería y Master:** ON.
2. **Anti-Collision Lights:** ON.
3. **Fuel Pumps:** ON (Verificar presión).
4. Presionar botón de arranque (Starter).
5. A **15% de N1**, avanzar el Twist Grip a la posición de IDLE para inyectar combustible.
6. Monitorear cuidadosamente la TOT para evitar un Hot Start. (Abortar si TOT excede 810°C abruptamente).
7. Repetir procedimiento para el segundo motor.

## 4.3 Chequeos Previos al Despegue (Pre-Takeoff Checks)
- **Sistemas Hidráulicos:** Verificar el correcto funcionamiento del SYS 1 y SYS 2 ciclando el interruptor y moviendo los controles cíclicos y de colectivo de forma suave.
- **RPM:** Verificar N2 / NR estabilizadas al 100%.

> **CAUTION**  
> No mover bruscamente los controles de vuelo cuando se aísla un sistema hidráulico en tierra para evitar cargas excesivas en el sistema remanente.
""",
    "5": """# Módulo 5: Performance Data (Datos de Performance)

## 5.1 Efecto Suelo (Hover IGE / OGE)
El BO105 CBS4 tiene excelentes capacidades aerodinámicas, pero la altitud de densidad afecta drásticamente sus pesos operativos.

- **IGE (In Ground Effect):** Permitido hasta un mayor techo de altitud debido a la interacción del flujo del rotor con el suelo (típicamente medido a 3 ft de altura de patín).
- **OGE (Out of Ground Effect):** Requiere una cantidad significativamente mayor de potencia (Torque) para mantenerse en estación estacionaria. A mayores temperaturas u OAT, el peso permitido (MTOW OGE) decrece.

## 5.2 Diagrama Height-Velocity (H-V Diagram)
Este diagrama delimita las combinaciones de altura y velocidad que deben evitarse (zonas sombreadas) porque una falla de motor en esas áreas no garantiza un aterrizaje seguro en autorrotación.
- **Evite:** Vuelos estacionarios prolongados a gran altura sin velocidad de avance (Hover elevado).
- **Curva típica:** Despegar manteniendo una aceleración de avance progresiva y permanecer cerca de la pista hasta superar los 40-50 KIAS.

## 5.3 OEI Performance
Con un solo motor operativo (OEI), el helicóptero no puede mantener vuelo estacionario OGE a máxima carga. El piloto debe consultar las gráficas del manual para confirmar si se garantiza un régimen positivo de ascenso bajo las condiciones del día.
""",
    "6": """# Módulo 6: Mass and Balance (Peso y Balanceo)

## 6.1 Generalidades de Carga
Para que el helicóptero mantenga controlabilidad dinámica, el peso y centro de gravedad (CG) deben encontrarse dentro de los límites aprobados durante todas las fases del vuelo.

## 6.2 Límites de CG
- **Datum (Línea de Referencia):** Ubicado 3.0 metros delante del plano de simetría de las patas delanteras del patín.
- El desplazamiento del CG Longitudinal tiene un límite estrecho hacia adelante (Aft Limit) y hacia atrás (Forward Limit).
- Volar con el CG fuera de límite puede provocar que en maniobras bruscas el bastón cíclico no tenga suficiente recorrido (Control Bottoming) para corregir el ángulo de actitud.

## 6.3 Cálculo Práctico
El momento de la aeronave se obtiene con la fórmula:
`Momento = Peso x Brazo (Arm)`

Se debe calcular:
1. Peso Básico Vacío (Basic Empty Weight).
2. Peso de la tripulación y pasajeros.
3. Carga útil.
4. Combustible utilizable.

> **WARNING**  
> Tenga extrema precaución a medida que el combustible se consuma. El centro de gravedad se desplazará progresivamente y podría salir del rango permitido en la fase final del vuelo si se despegó muy cerca de los límites.
""",
    "7": """# Módulo 7: System Description (Descripción de Sistemas)

## 7.1 Rotor Principal
El sistema de rotor principal es de tipo **Hingeless** (rígido, sin articulaciones de batimiento o de arrastre). Construido con una cabeza de rotor sólida de titanio y palas de material compuesto plástico reforzado con fibra de vidrio (GFRP). Esto le brinda al helicóptero una capacidad de maniobra excepcional e instantánea.

## 7.2 Sistema de Transmisión
La transmisión principal ZF combina la potencia de ambos motores y reduce la alta velocidad de giro de la turbina al rango operativo del mástil del rotor principal y rotor de cola. Posee un sistema de lubricación dedicado.

## 7.3 Sistema de Combustible (Fuel System)
Consta de un conjunto de tanques interconectados localizados debajo del suelo de cabina y detrás de los asientos.
- Alimentación por celdas principales e inferior (Supply tanks).
- Bombas booster eléctricas impulsan el combustible a presión hacia los motores.

## 7.4 Sistemas Hidráulicos (Hydraulic Systems)
Dos sistemas paralelos y completamente independientes (SYS 1 y SYS 2). 
- Operan los actuadores de control del cíclico, colectivo y rotor de cola.
- Si un sistema falla, el otro asume de inmediato toda la carga sin interrupción del control manual del piloto.

## 7.5 Sistema Eléctrico
- **Corriente Continua (DC):** 28 VDC nominal suministrados por dos generadores accionados por la transmisión (uno por cada motor) y una batería de 24V.
- La distribución se realiza a través de un bus principal y buses esenciales de batería.
"""
}

for mod_num, content in modules.items():
    path = os.path.join(data_dir, f"modulo-{mod_num}.md")
    with open(path, "w", encoding="utf-8") as file:
        file.write(content)

print("Text overwritten with extensive Spanish translation.")
