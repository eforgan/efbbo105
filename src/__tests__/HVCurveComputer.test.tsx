import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HVCurveComputer from '../components/HVCurveComputer';

// Mock Recharts
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AreaChart: () => <div>AreaChart</div>,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    ReferenceDot: () => null,
    Label: () => null,
  };
});

describe('HVCurveComputer', () => {
  it('identifies default state (80 KIAS, 200 ft) as safe', () => {
    render(<HVCurveComputer />);
    // Default: weight 2400, speed 80, height 200 -> outside the avoid envelope
    expect(screen.getByText('Estado de Operación: OPERACIÓN SEGURA')).toBeInTheDocument();
  });

  it('identifies low speed and mid height as unsafe (main avoid area)', () => {
    render(<HVCurveComputer />);

    const sliders = screen.getAllByRole('slider');
    const speedSlider = sliders[3];
    const heightSlider = sliders[4];

    fireEvent.change(speedSlider, { target: { value: '20' } });
    fireEvent.change(heightSlider, { target: { value: '100' } });

    expect(screen.getByText('Estado de Operación: ÁREA A EVITAR (INSEGURA)')).toBeInTheDocument();
  });

  it('identifies high speed and sufficient height as safe', () => {
    render(<HVCurveComputer />);
    
    const sliders = screen.getAllByRole('slider');
    const speedSlider = sliders[3]; // 4th slider is speed
    const heightSlider = sliders[4]; // 5th slider is height
    
    fireEvent.change(speedSlider, { target: { value: '80' } });
    fireEvent.change(heightSlider, { target: { value: '100' } });
    
    expect(screen.getByText('Estado de Operación: OPERACIÓN SEGURA')).toBeInTheDocument();
  });

  it('identifies high speed and very low height as unsafe (lower avoid area)', () => {
    render(<HVCurveComputer />);
    
    const sliders = screen.getAllByRole('slider');
    const speedSlider = sliders[3];
    const heightSlider = sliders[4];
    
    fireEvent.change(speedSlider, { target: { value: '90' } });
    fireEvent.change(heightSlider, { target: { value: '10' } });
    
    expect(screen.getByText('Estado de Operación: ÁREA A EVITAR (INSEGURA)')).toBeInTheDocument();
  });
});
