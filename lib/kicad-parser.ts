import { ParsedFootprint } from '@/types/easyeda';

// Safe parseFloat that returns a default value if NaN
function safeParseFloat(value: string | undefined, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function parseEasyEDAFootprint(dataStr: string | any): ParsedFootprint {
  const footprint: ParsedFootprint = {
    name: '',
    pads: [],
    lines: [],
    circles: [],
    arcs: [],
    texts: [],
  };

  try {
    // Handle both cases where dataStr is already an object or a string
    let data = dataStr;
    if (typeof dataStr === 'string') {
      data = JSON.parse(dataStr);
    }

    if (data.head?.c_para?.package) {
      footprint.name = data.head.c_para.package;
    }

    if (data.shape && Array.isArray(data.shape)) {
      for (const shape of data.shape) {
        // When shape is a string (e.g., "PAD~RECT~...")
        let parts: string[];
        if (typeof shape === 'string') {
          parts = shape.split('~');
        } else if (shape.gge) {
          // When shape is an object and has a gge property
          parts = shape.gge.split('~');
        } else {
          continue;
        }

        const type = parts[0];

        switch (type) {
          case 'PAD':
            footprint.pads.push(parsePad(parts));
            break;
          case 'TRACK':
            footprint.lines.push(parseTrack(parts));
            break;
          case 'CIRCLE':
            footprint.circles.push(parseCircle(parts));
            break;
          case 'ARC':
            footprint.arcs.push(parseArc(parts));
            break;
          case 'TEXT':
            footprint.texts.push(parseText(parts));
            break;
        }
      }
    }
  } catch (error) {
    console.error('Error parsing footprint:', error);
  }

  return footprint;
}

function parsePad(parts: string[]) {
  // EasyEDA PAD format: PAD~shape~X~Y~width~height~layer~?~number~...
  // Use original coordinates, viewBox will handle scaling
  const shape = parts[1] || 'RECT';
  const x = safeParseFloat(parts[2]);
  const y = safeParseFloat(parts[3]);
  const width = safeParseFloat(parts[4]);
  const height = safeParseFloat(parts[5]);
  const layer = parts[6] || '1';
  const number = parts[8] || '';

  // Determine type by layer (1 = top, 2 = bottom, 11 = through-hole)
  const type = layer === '11' ? 'through-hole' : 'smd';

  return {
    number,
    type,
    shape: shape.toLowerCase(),
    x,
    y,
    width,
    height,
    drill: type === 'through-hole' ? width * 0.6 : undefined,
  };
}

function parseTrack(parts: string[]) {
  // EasyEDA TRACK format: TRACK~width~layer~~x1 y1 x2 y2~id~...
  // Use original coordinates, viewBox will handle scaling
  const width = safeParseFloat(parts[1]);
  const layer = parts[2] || '1';

  // Coordinates are in parts[4] as space-separated values
  const coords = (parts[4] || '').trim().split(/\s+/);
  if (coords.length >= 4) {
    return {
      x1: safeParseFloat(coords[0]),
      y1: safeParseFloat(coords[1]),
      x2: safeParseFloat(coords[2]),
      y2: safeParseFloat(coords[3]),
      width,
      layer,
    };
  }

  // Fallback for old format
  return {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    width,
    layer,
  };
}

function parseCircle(parts: string[]) {
  return {
    x: safeParseFloat(parts[1]),
    y: safeParseFloat(parts[2]),
    radius: safeParseFloat(parts[3]),
    width: safeParseFloat(parts[4]),
    layer: parts[5] || '1',
  };
}

function parseArc(parts: string[]) {
  return {
    x: safeParseFloat(parts[2]),
    y: safeParseFloat(parts[3]),
    startX: safeParseFloat(parts[4]),
    startY: safeParseFloat(parts[5]),
    angle: safeParseFloat(parts[6]),
    width: safeParseFloat(parts[1]),
    layer: parts[7] || '1',
  };
}

function parseText(parts: string[]) {
  return {
    text: parts[1] || '',
    x: safeParseFloat(parts[2]),
    y: safeParseFloat(parts[3]),
    size: safeParseFloat(parts[5], 12),
    layer: parts[6] || '1',
  };
}

export function convertMillToPixels(mm: number, scale: number = 10): number {
  return mm * scale;
}

// Convert EasyEDA coordinates to KiCad mm (EasyEDA uses 10mil units)
function convertToKiCadMm(easyedaValue: number): number {
  return easyedaValue * 0.254; // 10mil to mm conversion
}

// Convert EasyEDA layer ID to KiCad layer name (based on easyeda2kicad.py)
function convertLayer(layerId: string): string {
  switch (layerId) {
    case '1': return 'F.Cu';
    case '2': return 'B.Cu';
    case '3': return 'F.SilkS';
    case '4': return 'B.SilkS';
    case '5': return 'F.Paste';
    case '6': return 'B.Paste';
    case '7': return 'F.Mask';
    case '8': return 'B.Mask';
    case '10': return 'Edge.Cuts';
    case '11': return 'Edge.Cuts';
    case '12': return 'Cmts.User';
    case '13': return 'F.Fab';
    case '14': return 'B.Fab';
    case '15': return 'Dwgs.User';
    case '101': return 'F.Fab';
    default: return 'F.Fab';
  }
}

export function convertToKiCadFootprint(footprint: ParsedFootprint): string {
  const lines: string[] = [];

  // Sanitize footprint name for filename
  const footprintName = footprint.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Footprint';

  // Calculate bounding box for coordinate normalization
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  footprint.pads.forEach(pad => {
    if (!isNaN(pad.x) && !isNaN(pad.y)) {
      minX = Math.min(minX, pad.x - pad.width / 2);
      minY = Math.min(minY, pad.y - pad.height / 2);
      maxX = Math.max(maxX, pad.x + pad.width / 2);
      maxY = Math.max(maxY, pad.y + pad.height / 2);
    }
  });

  footprint.lines.forEach(line => {
    if (!isNaN(line.x1) && !isNaN(line.y1)) {
      minX = Math.min(minX, line.x1, line.x2);
      minY = Math.min(minY, line.y1, line.y2);
      maxX = Math.max(maxX, line.x1, line.x2);
      maxY = Math.max(maxY, line.y1, line.y2);
    }
  });

  footprint.circles.forEach(circle => {
    if (!isNaN(circle.x) && !isNaN(circle.y)) {
      minX = Math.min(minX, circle.x - circle.radius);
      minY = Math.min(minY, circle.y - circle.radius);
      maxX = Math.max(maxX, circle.x + circle.radius);
      maxY = Math.max(maxY, circle.y + circle.radius);
    }
  });

  // Default to 0 if no valid data
  if (minX === Infinity) minX = 0;
  if (minY === Infinity) minY = 0;
  if (maxX === -Infinity) maxX = 0;
  if (maxY === -Infinity) maxY = 0;

  // Calculate center for normalization (to center footprint at origin)
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Calculate bbox dimensions in mm for reference text positioning
  const bboxHeight = convertToKiCadMm(maxY - minY);
  const refY = -(bboxHeight / 2 + 1); // Place reference above footprint
  const valY = bboxHeight / 2 + 1;    // Place value below footprint

  lines.push(`(footprint "${footprintName}" (version 20211014) (generator easyeda2kicad)`);
  lines.push('  (layer "F.Cu")');

  // Determine if SMD or through-hole
  const hasThroughHole = footprint.pads.some(pad => pad.type === 'through-hole');
  lines.push(`  (attr ${hasThroughHole ? 'through_hole' : 'smd'})`);

  // Add reference text
  lines.push(`  (fp_text reference "REF**" (at 0 ${refY.toFixed(2)}) (layer "F.SilkS")`);
  lines.push('    (effects (font (size 1 1) (thickness 0.15)))');
  lines.push('  )');

  // Add value text
  lines.push(`  (fp_text value "${footprintName}" (at 0 ${valY.toFixed(2)}) (layer "F.Fab")`);
  lines.push('    (effects (font (size 1 1) (thickness 0.15)))');
  lines.push('  )');

  // Add lines (silkscreen/fab)
  footprint.lines.forEach((line, i) => {
    const x1 = convertToKiCadMm(line.x1 - centerX);
    const y1 = convertToKiCadMm(line.y1 - centerY);
    const x2 = convertToKiCadMm(line.x2 - centerX);
    const y2 = convertToKiCadMm(line.y2 - centerY);
    const width = convertToKiCadMm(line.width);
    const layer = convertLayer(line.layer);

    lines.push(`  (fp_line (start ${x1.toFixed(4)} ${y1.toFixed(4)}) (end ${x2.toFixed(4)} ${y2.toFixed(4)}) (layer "${layer}") (width ${width.toFixed(4)}))`);
  });

  // Add circles
  footprint.circles.forEach((circle, i) => {
    const cx = convertToKiCadMm(circle.x - centerX);
    const cy = convertToKiCadMm(circle.y - centerY);
    const r = convertToKiCadMm(circle.radius);
    const width = convertToKiCadMm(circle.width);
    const layer = convertLayer(circle.layer);

    lines.push(`  (fp_circle (center ${cx.toFixed(4)} ${cy.toFixed(4)}) (end ${(cx + r).toFixed(4)} ${cy.toFixed(4)}) (layer "${layer}") (width ${width.toFixed(4)}))`);
  });

  // Add arcs
  footprint.arcs.forEach((arc, i) => {
    const cx = convertToKiCadMm(arc.x - centerX);
    const cy = convertToKiCadMm(arc.y - centerY);
    const startX = convertToKiCadMm(arc.startX - centerX);
    const startY = convertToKiCadMm(arc.startY - centerY);
    const width = convertToKiCadMm(arc.width);
    const layer = convertLayer(arc.layer);

    // Calculate end point based on angle
    const radius = Math.sqrt(Math.pow(arc.startX - arc.x, 2) + Math.pow(arc.startY - arc.y, 2));
    const startAngle = Math.atan2(arc.startY - arc.y, arc.startX - arc.x);
    const endAngle = startAngle + (arc.angle * Math.PI / 180);
    const endX = convertToKiCadMm((arc.x - centerX) + radius * Math.cos(endAngle));
    const endY = convertToKiCadMm((arc.y - centerY) + radius * Math.sin(endAngle));

    lines.push(`  (fp_arc (start ${startX.toFixed(4)} ${startY.toFixed(4)}) (mid ${cx.toFixed(4)} ${cy.toFixed(4)}) (end ${endX.toFixed(4)} ${endY.toFixed(4)}) (layer "${layer}") (width ${width.toFixed(4)}))`);
  });

  // Add pads
  footprint.pads.forEach((pad, i) => {
    const x = convertToKiCadMm(pad.x - centerX);
    const y = convertToKiCadMm(pad.y - centerY);
    const width = convertToKiCadMm(pad.width);
    const height = convertToKiCadMm(pad.height);

    const padType = pad.type === 'through-hole' ? 'thru_hole' : 'smd';
    let shape = 'rect';
    if (pad.shape === 'circle' || pad.shape === 'ellipse') {
      shape = 'circle';
    } else if (pad.shape === 'oval') {
      shape = 'oval';
    }

    const layers = pad.type === 'through-hole' ? '"*.Cu" "*.Mask"' : '"F.Cu" "F.Paste" "F.Mask"';

    if (pad.drill) {
      const drill = convertToKiCadMm(pad.drill);
      lines.push(`  (pad "${pad.number}" ${padType} ${shape} (at ${x.toFixed(4)} ${y.toFixed(4)}) (size ${width.toFixed(4)} ${height.toFixed(4)}) (drill ${drill.toFixed(4)}) (layers ${layers}))`);
    } else {
      lines.push(`  (pad "${pad.number}" ${padType} ${shape} (at ${x.toFixed(4)} ${y.toFixed(4)}) (size ${width.toFixed(4)} ${height.toFixed(4)}) (layers ${layers}))`);
    }
  });

  // Add custom texts
  footprint.texts.forEach((text, i) => {
    const x = convertToKiCadMm(text.x - centerX);
    const y = convertToKiCadMm(text.y - centerY);
    const size = convertToKiCadMm(text.size);
    const layer = convertLayer(text.layer);

    lines.push(`  (fp_text user "${text.text}" (at ${x.toFixed(4)} ${y.toFixed(4)}) (layer "${layer}")`);
    lines.push(`    (effects (font (size ${size.toFixed(4)} ${size.toFixed(4)}) (thickness ${(size * 0.15).toFixed(4)})))`);
    lines.push('  )');
  });

  lines.push(')');

  return lines.join('\n');
}
