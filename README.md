# EasyEDA to KiCad Web

A web-based tool to convert EasyEDA/LCSC components to KiCad format with real-time 2D and 3D visualization.

🌐 **Live Demo**: [https://easyeda2kicad-web.vercel.app](https://easyeda2kicad-web.vercel.app)

## ✨ Features

- 🔍 **Component Search** - Search any EasyEDA/LCSC component by ID
- 📐 **Schematic Symbol Viewer** - Interactive SVG-based schematic symbol visualization
- 🎨 **2D Footprint Viewer** - Real-time PCB footprint preview with zoom and pan
- 🎯 **3D Model Viewer** - Three.js-based 3D model viewer with full rotation
- 💾 **KiCad Export** - Download `.kicad_sym`, `.kicad_mod`, `.obj`, and `.step` files
- 📦 **Batch Download** - Download all files as a single ZIP archive
- 🎪 **Side-by-Side View** - View schematic, footprint, and 3D model simultaneously

## 🚀 Quick Start

Try these example components:
- **C2040** - MCU (LQFN-56)
- **C25804** - USB Type-C Connector
- **C2828** - Capacitor (0805)
- **C14663** - LED

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Rendering**: Three.js, React Three Fiber, React Three Drei
- **File Handling**: JSZip
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/hulryung/easyeda2kicad-web.git
cd easyeda2kicad-web

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🎯 Usage

1. **Search**: Enter an LCSC component ID (e.g., C2040)
2. **View**: See schematic symbol, footprint, and 3D model side-by-side
3. **Download**:
   - Click "Download Symbol" for `.kicad_sym` file
   - Click "Download Footprint" for `.kicad_mod` file
   - Click "Download OBJ/STEP" for 3D models
   - Click "Download All (ZIP)" for everything at once

## 📁 Project Structure

```
easyeda2kicad-web/
├── app/
│   ├── api/
│   │   ├── component/[lcscId]/route.ts  # Component data API
│   │   └── 3dmodel/[uuid]/route.ts      # 3D model file API
│   ├── view/[lcscId]/page.tsx           # Main viewer page
│   ├── icon.tsx                          # Custom favicon
│   ├── page.tsx                          # Landing page
│   └── layout.tsx                        # Root layout with footer
├── components/
│   ├── SchematicViewer.tsx              # Schematic symbol viewer
│   ├── FootprintViewer.tsx              # 2D footprint viewer
│   └── Model3DViewer.tsx                # 3D model viewer
├── lib/
│   └── kicad-parser.ts                  # EasyEDA to KiCad converter
└── types/
    └── easyeda.ts                       # TypeScript definitions
```

## 🔧 API Endpoints

### GET `/api/component/[lcscId]`

Fetch component information from EasyEDA.

**Response:**
```json
{
  "success": true,
  "lcscId": "C2040",
  "data": {
    "schematicStr": "...",
    "footprintStr": "...",
    "title": "STM32F103C8T6",
    "description": "ARM Microcontroller",
    "3d_model": "uuid"
  }
}
```

### GET `/api/3dmodel/[uuid]?format=[obj|step]`

Fetch 3D model files in OBJ or STEP format.

## 🎨 Features in Detail

### Schematic Symbol Viewer
- SVG-based rendering with zoom and pan
- Pin number and direction visualization
- Grid background for easy alignment

### Footprint Viewer
- Accurate pad positioning and rotation
- Interactive zoom and reset controls
- Real-time coordinate display

### 3D Model Viewer
- Full 360° rotation
- Auto-rotation mode
- OBJ file format support

## 🙏 Acknowledgments

This project is inspired by [easyeda2kicad.py](https://github.com/uPesy/easyeda2kicad.py) by uPesy.

## ⚠️ Disclaimer

The accuracy of symbols and footprints converted by easyeda2kicad is not guaranteed. Always verify components before using in production PCB designs.

## 📄 License

MIT License

## 👤 Author

Created by [hulryung](https://github.com/hulryung)

- GitHub: [@hulryung](https://github.com/hulryung)
- X (Twitter): [@hulryung](https://x.com/hulryung)
- LinkedIn: [hulryung](https://linkedin.com/in/hulryung)

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!
