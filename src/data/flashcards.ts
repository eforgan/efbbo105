export type Flashcard = {
  id: string;
  front: string;
  back: string;
  frontEn?: string;
  backEn?: string;
  category: 'limitations' | 'systems' | 'emergencies';
};

export const flashcardsData: Flashcard[] = [
  {
    id: 'lim_1',
    front: '¿VNE con puertas removidas?',
    back: '100 KIAS',
    frontEn: 'VNE with doors removed?',
    backEn: '100 KIAS',
    category: 'limitations'
  },
  {
    id: 'lim_2',
    front: 'Máxima temperatura de aceite de transmisión',
    back: '105°C',
    frontEn: 'Maximum transmission oil temperature',
    backEn: '105°C',
    category: 'limitations'
  },
  {
    id: 'lim_3',
    front: 'Límite de RPM del rotor en autorrotación',
    back: 'Mínimo 97%, Máximo 110%',
    frontEn: 'Rotor RPM limit in autorotation',
    backEn: 'Minimum 97%, Maximum 110%',
    category: 'limitations'
  },
  {
    id: 'sys_1',
    front: 'Capacidad total de los tanques principales',
    back: '580 kg',
    frontEn: 'Total capacity of main tanks',
    backEn: '580 kg',
    category: 'systems'
  },
  {
    id: 'sys_2',
    front: 'Presión normal del sistema hidráulico',
    back: '103.5 Bar (1500 PSI)',
    frontEn: 'Normal hydraulic system pressure',
    backEn: '103.5 Bar (1500 PSI)',
    category: 'systems'
  },
  {
    id: 'emg_1',
    front: 'Primer paso ante luz roja ENG FIRE',
    back: 'Confirmar fuego, cortar combustible del motor afectado.',
    frontEn: 'First step for ENG FIRE red light',
    backEn: 'Confirm fire, cut off fuel to affected engine.',
    category: 'emergencies'
  }
];
