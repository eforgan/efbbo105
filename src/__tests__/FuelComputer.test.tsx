import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FuelComputer from '../components/FuelComputer';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Gauge: () => <div>GaugeIcon</div>,
  Clock: () => <div>ClockIcon</div>,
  Ruler: () => <div>RulerIcon</div>,
  Flame: () => <div>FlameIcon</div>,
  AlertTriangle: () => <div>AlertTriangleIcon</div>,
}));

describe('FuelComputer', () => {
  it('renders default conditions correctly without warning', () => {
    render(<FuelComputer />);
    // Default fuel is 300, so no reserve warning
    expect(screen.queryByText(/¡Advertencia! Combustible en nivel de reserva o inferior/)).not.toBeInTheDocument();
  });

  it('shows warning when fuel is low', () => {
    render(<FuelComputer />);
    
    const sliders = screen.getAllByRole('slider');
    // Masa, Altitud, Temperatura, Velocidad, Combustible
    const fuelSlider = sliders[4];
    
    fireEvent.change(fuelSlider, { target: { value: '25' } });
    
    expect(screen.getByText(/¡Advertencia! Combustible en nivel de reserva o inferior/)).toBeInTheDocument();
  });
});
