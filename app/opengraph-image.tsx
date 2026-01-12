import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'EasyEDA to KiCad Web - Component Viewer & Converter'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              width: '120px',
              height: '120px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '30px',
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="4" width="16" height="16" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
              <circle cx="8" cy="8" r="1.5" fill="white" />
              <circle cx="16" cy="8" r="1.5" fill="white" />
              <circle cx="8" cy="16" r="1.5" fill="white" />
              <circle cx="16" cy="16" r="1.5" fill="white" />
              <circle cx="12" cy="12" r="2" fill="white" />
              <line x1="8" y1="8" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
              <line x1="16" y1="8" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
              <line x1="8" y1="16" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
              <line x1="16" y1="16" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
            </svg>
          </div>
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          EasyEDA to KiCad
        </div>

        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          Convert EasyEDA/LCSC components to KiCad format
        </div>

        <div
          style={{
            fontSize: 28,
            color: '#64748b',
            marginTop: '30px',
            display: 'flex',
            gap: '30px',
          }}
        >
          <span>📐 Schematic</span>
          <span>•</span>
          <span>🎨 Footprint</span>
          <span>•</span>
          <span>🎯 3D Model</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
