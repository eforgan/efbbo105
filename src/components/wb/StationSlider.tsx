'use client';

import React from 'react';
import { WBStation } from '../../types/efb';

interface StationSliderProps {
  station: WBStation;
  onChange: (id: string, weightKg: number) => void;
}

export const StationSlider: React.FC<StationSliderProps> = ({ station, onChange }) => {
  const max = station.maxWeightKg || 300;

  return (
    <div className="glass-card p-3 rounded-xl border border-slate-800 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-xs font-bold text-slate-200">{station.name}</h4>
          <p className="text-[10px] text-slate-400 font-mono">Brazo: {station.armMm} mm • {station.description}</p>
        </div>
        <div className="text-right font-mono">
          <span className="text-sm font-bold text-cyan-400">{station.weightKg} kg</span>
          <span className="text-[10px] text-slate-500 block">({Math.round(station.weightKg * 2.20462)} lb)</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="range"
          min={0}
          max={max}
          value={station.weightKg}
          onChange={(e) => onChange(station.id, Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Preset buttons */}
      <div className="flex space-x-1 pt-1">
        <button
          onClick={() => onChange(station.id, 0)}
          className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded hover:bg-slate-700 font-mono"
        >
          Vacío (0kg)
        </button>
        {station.maxWeightKg !== undefined && (
          <button
            onClick={() => onChange(station.id, Math.round((station.maxWeightKg ?? 300) * 0.75))}
            className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded hover:bg-slate-700 font-mono"
          >
            Estándar ({Math.round((station.maxWeightKg ?? 300) * 0.75)}kg)
          </button>
        )}
        {station.maxWeightKg !== undefined && (
          <button
            onClick={() => onChange(station.id, station.maxWeightKg!)}
            className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded hover:bg-slate-700 font-mono"
          >
            Máx ({station.maxWeightKg}kg)
          </button>
        )}
      </div>
    </div>
  );
};
