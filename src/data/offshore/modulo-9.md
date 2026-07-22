# Módulo OF9: Operación HEMS Offshore de Corto Alcance y Gestión de Seguridad (SMS)

## OF9.1 Alcance y Restricciones Operativas
Este protocolo establece los lineamientos de seguridad, equipamiento y gestión de riesgos para operaciones HEMS sobre el agua a **corta distancia (menos de 8 km de la costa)** utilizando el helicóptero MBB BO105 CBS4 **sin sistema de flotación de emergencia instalado**.

> [!CAUTION]
> **Restricciones Operativas Absolutas:**
> 1. **Misiones HEMS Exclusivas:** Prohibidos los vuelos de transporte comercial, carga o entrenamiento sin carácter HEMS.
> 2. **VFR Diurno Exclusivo:** Prohibidos los vuelos nocturnos o IFR sobre el agua.
> 3. **Operación en Helideck (Sin Izaje):** Prohibido el uso de winche o torno de rescate. Toda transferencia se realiza por aterrizaje y *Hot Loading* en el helideck del DLV Seminole.
> 4. **Tiempo de Exposición Overwater < 5 Minutos:** El tiempo acumulado de sobrevuelo acuático (ida y vuelta) no superará los 5 minutos totales.

## OF9.2 Equipamiento de Supervivencia Obligatorio

### Requisitos para la Tripulación (Pilotos y Médico)
* **Traje Antiexposición (Dry Suit):** Estanco y térmicamente aislado para prevenir la hipotermia en aguas del Golfo San Matías (10°C - 14°C).
* **Chaleco Salvavidas Inflable MANUAL:** Doble cámara de activación estrictamente manual (prohibido autoinflable intra-cabina).
* **Air Pocket Plus (EBS):** Rebreather de emergencia subacuática que otorga 45 a 60 segundos de respiración autónoma.
* **PLB 406 MHz / 121.5 MHz:** Radiobaliza de localización personal fijada al chaleco salvavidas.

### Requisitos de Cabina y Balsa Salvavidas
* **Balsa Salvavidas Inflable de 6 Personas:** Estibada en la cabina posterior a espaldas del Médico Aeroevacuador.
* **Línea de Amarre (Painter Line):** Mosquetonada a un punto fijo de la estructura de la cabina antes del despegue.

---

## OF9.3 Lista de Chequeo Mandatoria Go / No-Go HEMS Offshore

```mermaid
graph TD
    A[Alerta HEMS Offshore: DLV Seminole] --> B{¿Condición VFR Diurna Garantizada?}
    B -- NO --> Z[NO-GO: RECHAZAR MISIÓN]
    B -- SI --> C{¿Distancia a costa < 8 km?}
    C -- NO --> Z
    C -- SI --> D{¿Tiempo de exposición overwater < 5 min?}
    D -- NO --> Z
    D -- SI --> E{¿Operación mediante Aterrizaje + Hot Loading (Sin Izaje)?}
    E -- NO --> Z
    E -- SI --> F{¿HUET vigente + PPE Dry Suit + Air Pocket + PLB + Balsa 6 pax?}
    F -- NO --> Z
    F -- SI --> G{¿GREEN DECK confirmado en DLV Seminole?}
    G -- NO --> Z
    G -- SI --> H[GO: ACEPTAR MISIÓN HEMS]

    style Z fill:#e74c3c,stroke:#c0392b,color:#fff
    style H fill:#27ae60,stroke:#2ecc71,color:#fff
```

---

## OF9.4 Matriz de Tolerabilidad de Riesgos OACI (Doc 9859)

| Peligro Identificado | Riesgo Inicial | Barreras Mitigadoras Aplicadas | Riesgo Residual |
| :--- | :---: | :--- | :---: |
| **Falla Técnica Overwater (Motor/Transmisión)** | **3A (Inaceptable)** | • Tiempo de exposición $< 5\text{ min}$<br>• Bimotor Turbine<br>• Mant. Preventivo Riguroso | **1B (Aceptable)** |
| **Ahogamiento / Hipotermia tras Ditching** | **3A (Inaceptable)** | • HUET Vigente<br>• Dry Suits Aislantes<br>• Air Pocket Plus (EBS)<br>• Chalecos Manuales | **2C (Tolerable)** |
| **Pérdida del Paciente durante Evacuación** | **3A (Inaceptable)** | • Balsa 6 pax a cargo de Médico<br>• Chaleco adaptado a paciente<br>• Arnés de camilla 4 pts | **2B (Tolerable*)** |
| **Ingreso Inadvertido en IIMC / Niebla Marina** | **4A (Inaceptable)** | • VFR Diurno Exclusivo<br>• Límite Visibilidad 5 km<br>• Radioaltímetro Activo | **1A (Aceptable)** |
| **Accidente en Helideck durante Hot Loading** | **3B (Tolerable*)** | • Helideck Octogonal 22.2m<br>• Sector de aproximación 10:00-02:00<br>• Señalización HLO y no-izaje | **1C (Aceptable)** |

---

## OF9.3 Estudio SMS Extendido: Modelo de Queso Suizo y Diagrama Bow-Tie

### OF9.3.1 Modelo de Queso Suizo de James Reason (Swiss Cheese Model)
En ausencia de flotadores de emergencia fijos en el fuselaje, la seguridad del vuelo HEMS offshore sobre el agua descansa sobre 5 capas defensivas continuas. Cada capa actúa como una barrera que previene que los agujeros del sistema se alineen:

1. **Capa 1 — Aeronavegabilidad y Mantenimiento:** Inspecciones estrictas bajo RAAC 135 y mantenimiento preventivo de los turbomotores Allison 250-C20B y transmisión del BO105.
2. **Capa 2 — Mitigación Geográfica y Exposición:** Distancia máxima de costa $< 8\text{ km}$ y tiempo acumulado de sobrevuelo overwater $< 5\text{ minutos}$ totales (ida y vuelta).
3. **Capa 3 — Mitigación Operativa y Entrenamiento:** Reglas VFR Diurnas exclusivas, árbol Go/No-Go y certificación HUET presencial obligatoria para los 4 ocupantes.
4. **Capa 4 — Equipamiento de Supervivencia Individual (PPE):** Traje antiexposición *Dry Suit*, chaleco salvavidas de activación manual, *Air Pocket Plus (EBS)* y baliza *PLB 406 MHz*.
5. **Capa 5 — Plataforma Colectiva de Supervivencia:** Balsa salvavidas inflable de 6 personas estibada a cargo del Médico Aeroevacuador, amarrada mediante *Painter Line*.

### OF9.3.2 Modelo Bow-Tie Completo para Ditching sin Flotadores

```mermaid
graph LR
    subgraph AMENAZAS
        T1[Falla de Motor / Transmisión]
        T2[Advección Repentina de Niebla]
        T3[Ilusión de Agua Calma]
    end

    subgraph BARRERAS PREVENTIVAS
        P1[Programa Mantenimiento RAAC 135]
        P2[Tiempo Overwater < 5 min]
        P3[Hot Loading en Helideck 22.2m]
    end

    subgraph EVENTO TOPICO
        TE[AMARAJE FORZOSO / DITCHING EN AGUA]
    end

    subgraph BARRERAS MITIGADORAS
        M1[Air Pocket Plus EBS Inserción Previa]
        M2[Traje Seco Dry Suit Aislante]
        M3[Egreso HUET por Mano de Referencia]
        M4[Despliegue Balsa 6 pax con Painter Line]
        M5[Baliza PLB 406 MHz Cospas-Sarsat]
    end

    subgraph CONSECUENCIAS
        C1[Capsize Inminente en < 5 seg]
        C2[Inmersión Fría Controlada]
        C3[SUPERVIVENCIA Y RESCATE SAR EXITOSO]
    end

    T1 --> P1 --> TE
    T2 --> P2 --> TE
    T3 --> P3 --> TE

    TE --> M1 --> C1
    TE --> M2 --> C2
    TE --> M3 --> C3
    TE --> M4 --> C3
    TE --> M5 --> C3

    style TE fill:#e74c3c,color:#fff
    style C3 fill:#27ae60,color:#fff
```

