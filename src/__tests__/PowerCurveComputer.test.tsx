import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PowerCurveComputer from '../components/PowerCurveComputer';

// Mock Recharts
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ComposedChart: () => <div>ComposedChart</div>,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    ReferenceDot: () => null,
  };
});

describe('PowerCurveComputer', () => {
  it('renders correctly under normal conditions', () => {
    render(<PowerCurveComputer />);
    
    // Default conditions: 2000kg, 15C, 0ft
    expect(screen.getByText('Análisis Aerodinámico')).toBeInTheDocument();
    
    // Debería tener un margen de potencia positivo
    // En las condiciones base, la potencia no excede
    expect(screen.queryByText(/¡PELIGRO! La potencia requerida excede/)).not.toBeInTheDocument();
  });

  it('shows warning when density altitude is too high and power is exceeded', () => {
    render(<PowerCurveComputer />);
    
    const sliders = screen.getAllByRole('slider');
    const weightSlider = sliders[0];
    const tempSlider = sliders[1];
    const altSlider = sliders[2];
    
    // Peso máximo (2500)
    fireEvent.change(weightSlider, { target: { value: '2500' } });
    
    // Temperatura extrema (50 C)
    fireEvent.change(tempSlider, { target: { value: '50' } });
    
    // Altitud extrema (15000 ft)
    fireEvent.change(altSlider, { target: { value: '15000' } });
    
    // En estas condiciones extremas, la potencia requerida excede la disponible
    expect(screen.getByText(/¡PELIGRO! La potencia requerida excede/)).toBeInTheDocument();
  });
});
