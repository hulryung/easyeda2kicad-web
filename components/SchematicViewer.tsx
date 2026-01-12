'use client';

import { useEffect, useRef, useState } from 'react';

interface ParsedSchematic {
  name: string;
  pins: Array<{
    number: string;
    name: string;
    x: number;
    y: number;
    rotation?: number;
    length?: number;
  }>;
  polylines: Array<{
    points: Array<{ x: number; y: number }>;
    strokeWidth: number;
  }>;
  circles: Array<{
    x: number;
    y: number;
    radius: number;
  }>;
  rectangles: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    rx?: number;
    ry?: number;
  }>;
  texts: Array<{
    text: string;
    x: number;
    y: number;
    size: number;
  }>;
}

interface SchematicViewerProps {
  schematic: ParsedSchematic;
}

function parseSchematicData(dataStr: string | any): ParsedSchematic {
  const schematic: ParsedSchematic = {
    name: '',
    pins: [],
    polylines: [],
    circles: [],
    rectangles: [],
    texts: [],
  };

  try {
    let data = dataStr;
    if (typeof dataStr === 'string') {
      data = JSON.parse(dataStr);
    }

    // Get component name
    if (data.head?.c_para) {
      schematic.name = data.head.c_para.name || data.head.c_para.package || '';
    }

    // Parse shape array
    if (data.shape && Array.isArray(data.shape)) {
      for (const shape of data.shape) {
        let shapeStr: string;
        if (typeof shape === 'string') {
          shapeStr = shape;
        } else if (shape.gge) {
          shapeStr = shape.gge;
        } else {
          continue;
        }

        const parts = shapeStr.split('~');
        const type = parts[0];

        switch (type) {
          case 'P':
            // PIN format: P~show~0~pinNumber~x~y~rotation~gId~...^^x~y^^M x y h/v length~...
            const pinNumber = parts[3] || '';
            const pinX = parseFloat(parts[4] || '0');
            const pinY = parseFloat(parts[5] || '0');
            const pinRotation = parseFloat(parts[6] || '0');

            // Extract pin length from SVG path data
            let pinLength = 10; // default
            // Find the SVG path part after ^^
            const pathParts = shapeStr.split('^^');
            if (pathParts.length > 2) {
              // pathParts[2] contains something like "M 380 280 h 20"
              const pathData = pathParts[2];
              const pathMatch = pathData.match(/[hv]\s*([-\d.]+)/);
              if (pathMatch) {
                pinLength = Math.abs(parseFloat(pathMatch[1]));
              }
            }

            schematic.pins.push({
              number: pinNumber,
              name: pinNumber, // Use number as name for now
              x: pinX,
              y: pinY,
              rotation: pinRotation,
              length: pinLength,
            });
            break;

          case 'PL':
            // Polyline format: PL~x1 y1 x2 y2 x3 y3...~color~width~layer~style~gId~flags
            const coordStr = parts[1] || '';
            const coordValues = coordStr.trim().split(/\s+/);
            const points: Array<{ x: number; y: number }> = [];
            for (let i = 0; i < coordValues.length; i += 2) {
              if (i + 1 < coordValues.length) {
                points.push({
                  x: parseFloat(coordValues[i]),
                  y: parseFloat(coordValues[i + 1]),
                });
              }
            }
            if (points.length > 0) {
              schematic.polylines.push({
                points,
                strokeWidth: parseFloat(parts[3] || '1'),
              });
            }
            break;

          case 'C':
          case 'CIRCLE':
            // CIRCLE format: C~x~y~radius~width~layer~gId
            schematic.circles.push({
              x: parseFloat(parts[1] || '0'),
              y: parseFloat(parts[2] || '0'),
              radius: parseFloat(parts[3] || '0'),
            });
            break;

          case 'E':
            // ELLIPSE format: E~x~y~rx~ry~color~width~layer~style~gId~flags
            // Treat as circle with radius being the average of rx and ry
            const ex = parseFloat(parts[1] || '0');
            const ey = parseFloat(parts[2] || '0');
            const rx = parseFloat(parts[3] || '0');
            const ry = parseFloat(parts[4] || '0');
            schematic.circles.push({
              x: ex,
              y: ey,
              radius: (rx + ry) / 2,
            });
            break;

          case 'R':
            // RECT format: R~x~y~rx~ry~width~height~color~strokeWidth~layer~style~gId~flags
            let rectX, rectY, rectWidth, rectHeight, rectRx, rectRy;

            rectX = parseFloat(parts[1] || '0');
            rectY = parseFloat(parts[2] || '0');

            // Check if we need to use parts[3],[4] or parts[5],[6] for width/height
            const val3 = parseFloat(parts[3] || '0');
            const val4 = parseFloat(parts[4] || '0');
            const val5 = parseFloat(parts[5] || '0');
            const val6 = parseFloat(parts[6] || '0');

            if (parts[3] === '' || (val5 > val3 && val6 > val4)) {
              // parts[3],[4] are empty or corner radius, parts[5],[6] are width/height
              rectRx = val3;
              rectRy = val4;
              rectWidth = val5;
              rectHeight = val6;
            } else {
              // parts[3],[4] are width/height
              rectWidth = val3;
              rectHeight = val4;
              rectRx = 0;
              rectRy = 0;
            }

            if (rectWidth > 0 && rectHeight > 0) {
              schematic.rectangles.push({
                x: rectX,
                y: rectY,
                width: rectWidth,
                height: rectHeight,
                rx: rectRx,
                ry: rectRy,
              });
            }
            break;

          case 'A':
            // ARC/PATH format: A~svg_path_data~color~width~layer~style~gId~flags
            // For now, skip complex arc rendering
            // We would need to parse SVG path commands to render this properly
            break;

          case 'T':
          case 'TEXT':
            // TEXT format: T~x~y~rotation~text~...
            schematic.texts.push({
              text: parts[4] || '',
              x: parseFloat(parts[1] || '0'),
              y: parseFloat(parts[2] || '0'),
              size: 12,
            });
            break;
        }
      }
    }
  } catch (error) {
    console.error('Error parsing schematic:', error);
  }

  console.log('Parsed schematic:', {
    name: schematic.name,
    pins: schematic.pins.length,
    polylines: schematic.polylines.length,
    circles: schematic.circles.length,
    rectangles: schematic.rectangles.length,
    texts: schematic.texts.length,
  });

  return schematic;
}

export { parseSchematicData };

export default function SchematicViewer({ schematic }: SchematicViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!schematic) return;

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    schematic.pins.forEach(pin => {
      minX = Math.min(minX, pin.x);
      minY = Math.min(minY, pin.y);
      maxX = Math.max(maxX, pin.x);
      maxY = Math.max(maxY, pin.y);
    });

    schematic.polylines.forEach(polyline => {
      polyline.points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    schematic.circles.forEach(circle => {
      minX = Math.min(minX, circle.x - circle.radius);
      minY = Math.min(minY, circle.y - circle.radius);
      maxX = Math.max(maxX, circle.x + circle.radius);
      maxY = Math.max(maxY, circle.y + circle.radius);
    });

    schematic.rectangles.forEach(rect => {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });

    // Default bounds if no data
    if (minX === Infinity) {
      minX = 0;
      minY = 0;
      maxX = 100;
      maxY = 100;
    }

    // Add padding
    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    setViewBox({
      x: minX - padding,
      y: minY - padding,
      width,
      height,
    });
  }, [schematic]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(10, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(10, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.1, prev / 1.2));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (!schematic) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <p className="text-gray-500">No schematic data available</p>
      </div>
    );
  }

  const gridSize = 10;
  const currentViewBox = {
    x: viewBox.x - pan.x / zoom,
    y: viewBox.y - pan.y / zoom,
    width: viewBox.width / zoom,
    height: viewBox.height / zoom,
  };

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden relative">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Schematic Symbol</h3>
        <p className="text-sm text-gray-400 mt-1">
          {schematic.name || 'Component Symbol'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {schematic.pins.length} pins, {schematic.polylines.length} lines, {schematic.rectangles.length} rects, {schematic.circles.length} circles
        </p>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={handleResetView}
          className="w-10 h-10 bg-white border-2 border-blue-400 rounded-full flex items-center justify-center hover:bg-blue-50 shadow-lg"
          title="Reset view"
        >
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeWidth="2" />
            <circle cx="12" cy="12" r="8" strokeWidth="2" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white border-2 border-blue-400 rounded-full flex items-center justify-center hover:bg-blue-50 shadow-lg"
          title="Zoom out"
        >
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white border-2 border-blue-400 rounded-full flex items-center justify-center hover:bg-blue-50 shadow-lg"
          title="Zoom in"
        >
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-[calc(100%-80px)] overflow-hidden cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={`${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`}
          className="w-full h-full"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        >
          {/* Grid pattern */}
          <defs>
            <pattern
              id="grid"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect
            x={currentViewBox.x}
            y={currentViewBox.y}
            width={currentViewBox.width}
            height={currentViewBox.height}
            fill="url(#grid)"
          />

          {/* Polylines (symbol outline) */}
          {schematic.polylines.map((polyline, i) => (
            <polyline
              key={`polyline-${i}`}
              points={polyline.points.map(p => `${p.x},${p.y}`).join(' ')}
              stroke="#7f1d1d"
              strokeWidth={polyline.strokeWidth}
              fill="none"
            />
          ))}

          {/* Circles */}
          {schematic.circles.map((circle, i) => (
            <circle
              key={`circle-${i}`}
              cx={circle.x}
              cy={circle.y}
              r={circle.radius}
              stroke="#7f1d1d"
              strokeWidth={2}
              fill="none"
            />
          ))}

          {/* Rectangles */}
          {schematic.rectangles.map((rect, i) => (
            <rect
              key={`rect-${i}`}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              rx={rect.rx || 0}
              ry={rect.ry || 0}
              stroke="#7f1d1d"
              strokeWidth={2}
              fill="none"
            />
          ))}

          {/* Pins */}
          {schematic.pins.map((pin, i) => {
            // Determine pin line direction based on rotation
            // rotation: 0 = right, 90 = down, 180 = left, 270 = up
            const pinLength = pin.length || 10;
            let x2 = pin.x, y2 = pin.y;
            let textOuterX = pin.x, textOuterY = pin.y;
            let textInnerX = pin.x, textInnerY = pin.y;
            let textAnchor = 'start';

            if (pin.rotation === 0) {
              // Pin points to the right
              x2 = pin.x - pinLength;
              textOuterX = pin.x - pinLength - 4;
              textInnerX = pin.x + 4;
              textAnchor = 'end';
              textOuterY = pin.y + 4;
              textInnerY = pin.y + 4;
            } else if (pin.rotation === 90) {
              // Pin points down
              y2 = pin.y + pinLength;
              textOuterY = pin.y + pinLength + 12;
              textInnerY = pin.y - 4;
              textOuterX = pin.x;
              textInnerX = pin.x;
            } else if (pin.rotation === 180) {
              // Pin points to the left
              x2 = pin.x + pinLength;
              textOuterX = pin.x + pinLength + 4;
              textInnerX = pin.x - 4;
              textAnchor = 'start';
              textOuterY = pin.y + 4;
              textInnerY = pin.y + 4;
            } else if (pin.rotation === 270) {
              // Pin points up
              y2 = pin.y - pinLength;
              textOuterY = pin.y - pinLength - 4;
              textInnerY = pin.y + 12;
              textOuterX = pin.x;
              textInnerX = pin.x;
            }

            return (
              <g key={`pin-${i}`}>
                {/* Pin line */}
                <line
                  x1={pin.x}
                  y1={pin.y}
                  x2={x2}
                  y2={y2}
                  stroke="#7f1d1d"
                  strokeWidth={1}
                />
                {/* Pin circle */}
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r={2.5}
                  fill="white"
                  stroke="#991b1b"
                  strokeWidth={1.5}
                />
                {/* Pin number (outside) */}
                <text
                  x={textOuterX}
                  y={textOuterY}
                  textAnchor={pin.rotation === 180 ? 'start' : pin.rotation === 0 ? 'end' : 'middle'}
                  fontSize="9.6"
                  fill="#2563eb"
                  fontFamily="Arial, sans-serif"
                  fontWeight="bold"
                >
                  {pin.number}
                </text>
                {/* Pin number (inside) */}
                <text
                  x={textInnerX}
                  y={textInnerY}
                  textAnchor={pin.rotation === 180 ? 'end' : pin.rotation === 0 ? 'start' : 'middle'}
                  fontSize="9.6"
                  fill="#2563eb"
                  fontFamily="Arial, sans-serif"
                  fontWeight="bold"
                >
                  {pin.number}
                </text>
              </g>
            );
          })}

          {/* Texts */}
          {schematic.texts.map((text, i) => (
            <text
              key={`text-${i}`}
              x={text.x}
              y={text.y}
              fontSize={text.size}
              fill="#374151"
              fontFamily="Arial, sans-serif"
            >
              {text.text}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
