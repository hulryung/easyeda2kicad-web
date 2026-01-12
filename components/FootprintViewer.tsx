'use client';

import { ParsedFootprint } from '@/types/easyeda';
import { convertMillToPixels } from '@/lib/kicad-parser';
import { useEffect, useRef, useState } from 'react';

interface FootprintViewerProps {
  footprint: ParsedFootprint;
}

export default function FootprintViewer({ footprint }: FootprintViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1); // Start at 1x, viewBox handles sizing
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 100, height: 100 });

  // Calculate dynamic stroke width based on viewBox size
  const strokeWidth = Math.max(viewBox.width / 500, 0.2);

  // Log actual rendered sizes
  useEffect(() => {
    if (svgRef.current && containerRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      console.log('SVG rendered size:', svgRect.width, 'x', svgRect.height);
      console.log('Container size:', containerRect.width, 'x', containerRect.height);
    }
  }, [viewBox]);

  useEffect(() => {
    if (!footprint) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let hasValidData = false;

    footprint.pads.forEach(pad => {
      // Skip if any values are NaN
      if (isNaN(pad.x) || isNaN(pad.y) || isNaN(pad.width) || isNaN(pad.height)) return;

      const x = pad.x;
      const y = pad.y;
      const w = pad.width / 2;
      const h = pad.height / 2;

      minX = Math.min(minX, x - w);
      minY = Math.min(minY, y - h);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
      hasValidData = true;
    });

    footprint.lines.forEach(line => {
      // Skip if any values are NaN
      if (isNaN(line.x1) || isNaN(line.y1) || isNaN(line.x2) || isNaN(line.y2)) return;

      minX = Math.min(minX, line.x1, line.x2);
      minY = Math.min(minY, line.y1, line.y2);
      maxX = Math.max(maxX, line.x1, line.x2);
      maxY = Math.max(maxY, line.y1, line.y2);
      hasValidData = true;
    });

    footprint.circles.forEach(circle => {
      if (isNaN(circle.x) || isNaN(circle.y) || isNaN(circle.radius)) return;

      minX = Math.min(minX, circle.x - circle.radius);
      minY = Math.min(minY, circle.y - circle.radius);
      maxX = Math.max(maxX, circle.x + circle.radius);
      maxY = Math.max(maxY, circle.y + circle.radius);
      hasValidData = true;
    });

    if (hasValidData && minX !== Infinity && !isNaN(minX) && !isNaN(maxX) && !isNaN(minY) && !isNaN(maxY)) {
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;

      console.log('Footprint bounds:', { minX, minY, maxX, maxY, contentWidth, contentHeight });

      // Ensure minimum size
      const minSize = 10;
      const finalWidth = Math.max(contentWidth, minSize);
      const finalHeight = Math.max(contentHeight, minSize);

      // Add minimal 5% padding around the content (like LCSC viewer)
      const paddingPercent = 0.05;
      const paddingX = finalWidth * paddingPercent;
      const paddingY = finalHeight * paddingPercent;

      const newViewBox = {
        x: minX - paddingX,
        y: minY - paddingY,
        width: finalWidth + paddingX * 2,
        height: finalHeight + paddingY * 2,
      };

      console.log('ViewBox:', newViewBox);
      setViewBox(newViewBox);
    }
  }, [footprint]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(50, prev + delta)));
  };

  if (!footprint) {
    return <div className="text-gray-500">No footprint data available</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between shrink-0">
        <h3 className="text-lg font-semibold text-white">
          {footprint.name || 'Footprint Preview'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleZoom(0.2)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            +
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            -
          </button>
          <button
            onClick={() => setScale(1)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Reset
          </button>
          <span className="text-sm text-gray-400">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden bg-gray-900 relative">
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s'
          }}
        >
          <defs>
            <pattern
              id="grid"
              width={Math.max(viewBox.width / 20, 5)}
              height={Math.max(viewBox.height / 20, 5)}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${Math.max(viewBox.width / 20, 5)} 0 L 0 0 0 ${Math.max(viewBox.height / 20, 5)}`}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={Math.max(viewBox.width / 500, 0.2)}
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

          {footprint.lines
            .filter(line => !isNaN(line.x1) && !isNaN(line.y1) && !isNaN(line.x2) && !isNaN(line.y2))
            .map((line, i) => (
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

          {footprint.circles
            .filter(circle => !isNaN(circle.x) && !isNaN(circle.y) && !isNaN(circle.radius))
            .map((circle, i) => (
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

          {footprint.arcs
            .filter(arc => !isNaN(arc.x) && !isNaN(arc.y) && !isNaN(arc.startX) && !isNaN(arc.startY) && !isNaN(arc.angle))
            .map((arc, i) => {
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

          {footprint.pads
            .filter(pad => !isNaN(pad.x) && !isNaN(pad.y) && !isNaN(pad.width) && !isNaN(pad.height))
            .map((pad, i) => {
              const isCircle = pad.shape === 'circle' || pad.shape === 'ELLIPSE';
              const color = pad.type === 'smd' ? '#fbbf24' : '#ef4444';
              const rotation = pad.rotation || 0;

              return (
                <g key={`pad-${i}`} transform={`rotate(${rotation} ${pad.x} ${pad.y})`}>
                {isCircle ? (
                  <circle
                    cx={pad.x}
                    cy={pad.y}
                    r={pad.width / 2}
                    fill={color}
                    stroke="#000"
                    strokeWidth={strokeWidth}
                  />
                ) : (
                  <rect
                    x={pad.x - pad.width / 2}
                    y={pad.y - pad.height / 2}
                    width={pad.width}
                    height={pad.height}
                    fill={color}
                    stroke="#000"
                    strokeWidth={strokeWidth}
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
                    strokeWidth={strokeWidth}
                  />
                )}
                <text
                  x={pad.x}
                  y={pad.y}
                  fontSize={Math.max(viewBox.width / 80, 1)}
                  fill="#fff"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                  style={{ fontWeight: 'bold' }}
                >
                  {pad.number}
                </text>
              </g>
            );
          })}

          {footprint.texts
            .filter(text => !isNaN(text.x) && !isNaN(text.y) && !isNaN(text.size))
            .map((text, i) => (
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

      <div className="p-4 bg-gray-800 border-t border-gray-700 text-sm text-gray-300 shrink-0">
        <div className="grid grid-cols-3 gap-2">
          <div>Pads: {footprint.pads.length}</div>
          <div>Lines: {footprint.lines.length}</div>
          <div>ViewBox: {viewBox.width.toFixed(1)} x {viewBox.height.toFixed(1)}</div>
        </div>
        {footprint.pads.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            First pad: ({footprint.pads[0].x.toFixed(2)}, {footprint.pads[0].y.toFixed(2)})
          </div>
        )}
      </div>
    </div>
  );
}
