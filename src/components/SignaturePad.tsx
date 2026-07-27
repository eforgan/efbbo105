'use client';

import React from 'react';
import { Eraser, PenLine } from 'lucide-react';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
}

// Minimal pointer-driven signature capture used as the PIC's dispatch conformity —
// exports a PNG data URL (transparent background) embedded directly into the PDF.
export const SignaturePad: React.FC<SignaturePadProps> = ({ onChange }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawingRef = React.useRef(false);
  const hasInkRef = React.useRef(false);

  const getPos = (canvas: HTMLCanvasElement, e: React.PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = getPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(canvas, e);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInkRef.current = true;
  };

  const finishStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasInkRef.current) onChange(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    hasInkRef.current = false;
    onChange(null);
  };

  return (
    <div className="space-y-1.5">
      <div className="relative bg-slate-950 border border-slate-700 rounded-lg overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={360}
          height={110}
          className="w-full h-[110px] cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerLeave={finishStroke}
        />
        <span className="absolute bottom-1 left-2 text-[9px] text-slate-600 pointer-events-none flex items-center gap-1">
          <PenLine className="w-3 h-3" /> Firmá acá con mouse o dedo
        </span>
      </div>
      <button type="button" onClick={clear} className="text-[10px] text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer">
        <Eraser className="w-3 h-3" /> Limpiar Firma
      </button>
    </div>
  );
};
