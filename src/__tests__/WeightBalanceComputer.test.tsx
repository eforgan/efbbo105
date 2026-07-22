import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WeightBalanceComputer from '../components/WeightBalanceComputer';

// Mock Recharts ya que depende de ResizeObserver que no está en jsdom
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ComposedChart: () => <div>ComposedChart</div>,
    Line: () => null,
    Scatter: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
  };
});

describe('WeightBalanceComputer', () => {
  it('renders the initial state correctly (within limits)', () => {
    render(<WeightBalanceComputer />);
    
    // El peso inicial es BEW(1350) + crew(160) + fuel(300) = 1810 kg. 
    // Máximo es 2500 kg, así que debe estar "Dentro de los límites operativos."
    expect(screen.getByText('Dentro de los límites operativos.')).toBeInTheDocument();
    expect(screen.getByText(/1810 kg/)).toBeInTheDocument();
  });

  it('shows warning when overweight', () => {
    render(<WeightBalanceComputer />);
    
    // Buscar el slider de pasajeros y subirlo al máximo (400kg)
    const sliders = screen.getAllByRole('slider');
    const paxSlider = sliders[1]; // El segundo slider es Pax
    
    fireEvent.change(paxSlider, { target: { value: '400' } });
    
    // Buscar el slider de equipaje y subirlo (150kg)
    const baggageSlider = sliders[3];
    fireEvent.change(baggageSlider, { target: { value: '150' } });
    
    // Buscar combustible al máximo (460kg)
    const fuelSlider = sliders[2];
    fireEvent.change(fuelSlider, { target: { value: '460' } });
    
    // Total: 1350 + 160 + 400 + 460 + 150 = 2520 kg (> 2500kg)
    expect(screen.getByText('¡ADVERTENCIA! Helicóptero fuera de los límites operativos.')).toBeInTheDocument();
  });
});
