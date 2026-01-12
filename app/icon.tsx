import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '6px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circuit board pattern */}
          <rect x="4" y="4" width="16" height="16" rx="1" stroke="white" strokeWidth="1.5" fill="none" />

          {/* Connection points/pads */}
          <circle cx="8" cy="8" r="1.5" fill="white" />
          <circle cx="16" cy="8" r="1.5" fill="white" />
          <circle cx="8" cy="16" r="1.5" fill="white" />
          <circle cx="16" cy="16" r="1.5" fill="white" />
          <circle cx="12" cy="12" r="2" fill="white" />

          {/* Traces/connections */}
          <line x1="8" y1="8" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
          <line x1="16" y1="8" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
          <line x1="8" y1="16" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
          <line x1="16" y1="16" x2="12" y2="12" stroke="white" strokeWidth="1.2" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
