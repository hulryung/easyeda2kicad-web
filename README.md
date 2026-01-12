# EasyEDA to KiCad Web

A Next.js application that converts EasyEDA/LCSC components to KiCad format and allows viewing them online.

## Features

- 🔍 **Component Search by LCSC ID** - Search any EasyEDA/LCSC component by ID
- 📐 **2D Footprint Viewer** - Interactive SVG-based 2D footprint visualization
- 🎯 **3D Model Viewer** - Three.js-based 3D model viewer with rotation and zoom support
- 💾 **Download Functionality** - Download support for Footprint JSON, OBJ, and STEP formats

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Rendering**: Three.js, React Three Fiber, React Three Drei
- **API**: EasyEDA API Proxy

## Getting Started

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view it.

### Build

```bash
npm run build
npm start
```

## Usage

1. Enter an LCSC component ID on the main page (e.g., C2040)
2. Click the "View Component" button
3. Check the component's pad layout in the Footprint (2D) tab
4. Rotate and zoom the 3D model in the 3D Model tab
5. Download files in the desired format using the download buttons

## Example Components

- **C2040** - Resistor
- **C25804** - USB Type-C Connector
- **C2828** - Capacitor
- **C14663** - LED

## API Endpoints

### GET /api/component/[lcscId]

Fetches component information from EasyEDA.

**Response Example:**
```json
{
  "success": true,
  "lcscId": "C2040",
  "data": {
    "dataStr": "...",
    "title": "Component Name",
    "description": "Component Description",
    "3d_model": "uuid"
  }
}
```

### GET /api/3dmodel/[uuid]?format=[obj|step]

Fetches 3D model files.

**Parameters:**
- `uuid`: 3D model UUID
- `format`: 'obj' or 'step' (default: 'obj')

## Project Structure

```
easyeda2kicad-web/
├── app/
│   ├── api/
│   │   ├── component/[lcscId]/route.ts  # Component API
│   │   └── 3dmodel/[uuid]/route.ts      # 3D Model API
│   ├── view/[lcscId]/page.tsx           # Component Viewer Page
│   ├── page.tsx                          # Main Page
│   └── layout.tsx                        # Layout
├── components/
│   ├── FootprintViewer.tsx              # 2D Footprint Viewer
│   └── Model3DViewer.tsx                # 3D Model Viewer
├── lib/
│   └── kicad-parser.ts                  # EasyEDA Data Parser
└── types/
    └── easyeda.ts                       # TypeScript Type Definitions
```

## Based On

This project is based on [easyeda2kicad.py](https://github.com/uPesy/easyeda2kicad.py).

## Disclaimer

⚠️ **Disclaimer**: The accuracy of symbols and footprints converted by easyeda2kicad is not guaranteed. Please verify before using in production.

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!
