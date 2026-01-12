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
