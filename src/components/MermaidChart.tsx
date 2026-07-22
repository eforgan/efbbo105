'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MermaidChartProps {
  chart: string;
}

export default function MermaidChart({ chart }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const renderChart = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          suppressErrorRendering: true,
        });

        const id = `mermaid-chart-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        
        if (isMounted) {
          setSvgContent(svg);
          setHasError(false);
        }
      } catch (error) {
        console.error('Failed to render mermaid chart', error);
        if (isMounted) {
          setHasError(true);
        }
        // Clean up error elements injected by mermaid into DOM
        const errElems = document.querySelectorAll('[id^="dmermaid-"]');
        errElems.forEach(el => el.remove());
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (hasError) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="mermaid flex justify-center items-center overflow-x-auto w-full my-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
