'use client';

import { ParsedFootprint } from '@/types/easyeda';
import { convertMillToPixels } from '@/lib/kicad-parser';
import { useEffect, useRef, useState } from 'react';

interface FootprintViewerProps {
  footprint: ParsedFootprint;
}

export default function FootprintViewer({ footprint }: FootprintViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(3);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });

  useEffect(() => {
    if (!footprint) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    footprint.pads.forEach(pad => {
      const x = pad.x;
      const y = pad.y;
      const w = pad.width / 2;
      const h = pad.height / 2;

      minX = Math.min(minX, x - w);
      minY = Math.min(minY, y - h);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    footprint.lines.forEach(line => {
      minX = Math.min(minX, line.x1, line.x2);
      minY = Math.min(minY, line.y1, line.y2);
      maxX = Math.max(maxX, line.x1, line.x2);
      maxY = Math.max(maxY, line.y1, line.y2);
    });

    if (minX !== Infinity) {
      const padding = 50;
      const width = maxX - minX + padding * 2;
      const height = maxY - minY + padding * 2;

      setViewBox({
        x: minX - padding,
        y: minY - padding,
        width: width,
        height: height,
      });
    }
  }, [footprint]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  if (!footprint) {
    return <div className="text-gray-500">No footprint data available</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {footprint.name || 'Footprint Preview'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleZoom(0.5)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            +
          </button>
          <button
            onClick={() => handleZoom(-0.5)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            -
          </button>
          <button
            onClick={() => setScale(3)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="w-full h-full"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect
            x={viewBox.x}
            y={viewBox.y}
            width={viewBox.width}
            height={viewBox.height}
            fill="url(#grid)"
          />

          {footprint.lines.map((line, i) => (
            <line
              key={`line-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#10b981"
              strokeWidth={line.width || 1}
              strokeLinecap="round"
            />
          ))}

          {footprint.circles.map((circle, i) => (
            <circle
              key={`circle-${i}`}
              cx={circle.x}
              cy={circle.y}
              r={circle.radius}
              fill="none"
              stroke="#10b981"
              strokeWidth={circle.width || 1}
            />
          ))}

          {footprint.arcs.map((arc, i) => {
            const startAngle = 0;
            const endAngle = (arc.angle * Math.PI) / 180;
            const largeArc = Math.abs(arc.angle) > 180 ? 1 : 0;
            const sweep = arc.angle > 0 ? 1 : 0;

            const radius = Math.sqrt(
              Math.pow(arc.startX - arc.x, 2) + Math.pow(arc.startY - arc.y, 2)
            );

            const endX = arc.x + radius * Math.cos(endAngle);
            const endY = arc.y + radius * Math.sin(endAngle);

            return (
              <path
                key={`arc-${i}`}
                d={`M ${arc.startX} ${arc.startY} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${endX} ${endY}`}
                fill="none"
                stroke="#10b981"
                strokeWidth={arc.width || 1}
              />
            );
          })}

          {footprint.pads.map((pad, i) => {
            const isCircle = pad.shape === 'circle' || pad.shape === 'ELLIPSE';
            const color = pad.type === 'smd' ? '#fbbf24' : '#ef4444';

            return (
              <g key={`pad-${i}`}>
                {isCircle ? (
                  <circle
                    cx={pad.x}
                    cy={pad.y}
                    r={pad.width / 2}
                    fill={color}
                    stroke="#000"
                    strokeWidth="0.5"
                  />
                ) : (
                  <rect
                    x={pad.x - pad.width / 2}
                    y={pad.y - pad.height / 2}
                    width={pad.width}
                    height={pad.height}
                    fill={color}
                    stroke="#000"
                    strokeWidth="0.5"
                    rx={pad.shape === 'oval' ? pad.width / 2 : 0}
                  />
                )}
                {pad.drill && (
                  <circle
                    cx={pad.x}
                    cy={pad.y}
                    r={pad.drill / 2}
                    fill="#1f2937"
                    stroke="#000"
                    strokeWidth="0.5"
                  />
                )}
                <text
                  x={pad.x}
                  y={pad.y}
                  fontSize="4"
                  fill="#fff"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {pad.number}
                </text>
              </g>
            );
          })}

          {footprint.texts.map((text, i) => (
            <text
              key={`text-${i}`}
              x={text.x}
              y={text.y}
              fontSize={text.size}
              fill="#3b82f6"
              textAnchor="middle"
            >
              {text.text}
            </text>
          ))}
        </svg>
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700 text-sm text-gray-300">
        <div className="grid grid-cols-2 gap-2">
          <div>Pads: {footprint.pads.length}</div>
          <div>Lines: {footprint.lines.length}</div>
          <div>Circles: {footprint.circles.length}</div>
          <div>Arcs: {footprint.arcs.length}</div>
        </div>
      </div>
    </div>
  );
}
