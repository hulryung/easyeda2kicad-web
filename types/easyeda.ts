export interface EasyEDAComponent {
  lcsc_id: string;
  name: string;
  description?: string;
  dataStr?: {
    head?: {
      c_para?: {
        package?: string;
      };
    };
    shape?: Array<{
      gge?: string;
      layerid?: string;
    }>;
  };
  model_3d?: string;
  footprint_data?: string;
}

export interface ComponentResponse {
  success: boolean;
  result?: {
    dataStr?: string;
    title?: string;
    description?: string;
    '3d_model'?: string;
  };
}

export interface ParsedFootprint {
  name: string;
  pads: Array<{
    number: string;
    type: string;
    shape: string;
    x: number;
    y: number;
    width: number;
    height: number;
    drill?: number;
    rotation?: number;
  }>;
  lines: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    layer: string;
  }>;
  circles: Array<{
    x: number;
    y: number;
    radius: number;
    width: number;
    layer: string;
  }>;
  arcs: Array<{
    x: number;
    y: number;
    startX: number;
    startY: number;
    angle: number;
    width: number;
    layer: string;
  }>;
  texts: Array<{
    text: string;
    x: number;
    y: number;
    size: number;
    layer: string;
  }>;
}
