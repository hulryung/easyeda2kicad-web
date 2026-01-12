import { ParsedFootprint } from '@/types/easyeda';

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
  const shape = parts[1] || 'RECT';
  const x = parseFloat(parts[2] || '0');
  const y = parseFloat(parts[3] || '0');
  const width = parseFloat(parts[4] || '0');
  const height = parseFloat(parts[5] || '0');
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
  // EasyEDA TRACK format: TRACK~width~startX~startY~endX~endY~layer~...
  return {
    x1: parseFloat(parts[2] || '0'),
    y1: parseFloat(parts[3] || '0'),
    x2: parseFloat(parts[4] || '0'),
    y2: parseFloat(parts[5] || '0'),
    width: parseFloat(parts[1] || '0'),
    layer: parts[6] || '1',
  };
}

function parseCircle(parts: string[]) {
  return {
    x: parseFloat(parts[1] || '0'),
    y: parseFloat(parts[2] || '0'),
    radius: parseFloat(parts[3] || '0'),
    width: parseFloat(parts[4] || '0'),
    layer: parts[5] || '1',
  };
}

function parseArc(parts: string[]) {
  return {
    x: parseFloat(parts[2] || '0'),
    y: parseFloat(parts[3] || '0'),
    startX: parseFloat(parts[4] || '0'),
    startY: parseFloat(parts[5] || '0'),
    angle: parseFloat(parts[6] || '0'),
    width: parseFloat(parts[1] || '0'),
    layer: parts[7] || '1',
  };
}

function parseText(parts: string[]) {
  return {
    text: parts[1] || '',
    x: parseFloat(parts[2] || '0'),
    y: parseFloat(parts[3] || '0'),
    size: parseFloat(parts[5] || '12'),
    layer: parts[6] || '1',
  };
}

export function convertMillToPixels(mm: number, scale: number = 10): number {
  return mm * scale;
}
