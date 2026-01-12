import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyEDA to KiCad Web - Component Viewer & Converter",
  description: "Convert EasyEDA/LCSC components to KiCad format online. View schematic symbols, PCB footprints in 2D, and 3D models. Download .kicad_sym, .kicad_mod, OBJ, and STEP files.",
  keywords: [
    "EasyEDA",
    "KiCad",
    "LCSC",
    "PCB",
    "footprint viewer",
    "schematic symbol",
    "3D model viewer",
    "component converter",
    "electronics",
    "PCB design",
    "kicad_sym",
    "kicad_mod",
    "STEP",
    "OBJ",
    "electronic components",
  ],
  authors: [{ name: "hulryung", url: "https://github.com/hulryung" }],
  creator: "hulryung",
  publisher: "hulryung",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://easyeda2kicad-web.vercel.app",
    title: "EasyEDA to KiCad Web - Component Viewer & Converter",
    description: "Convert EasyEDA/LCSC components to KiCad format online. View schematic symbols, PCB footprints, and 3D models.",
    siteName: "EasyEDA to KiCad Web",
    images: [
      {
        url: "https://easyeda2kicad-web.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "EasyEDA to KiCad Web Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyEDA to KiCad Web - Component Viewer & Converter",
    description: "Convert EasyEDA/LCSC components to KiCad format online. View schematic symbols, PCB footprints, and 3D models.",
    creator: "@hulryung",
    images: ["https://easyeda2kicad-web.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'EasyEDA to KiCad Web',
    description: 'Convert EasyEDA/LCSC components to KiCad format online. View schematic symbols, PCB footprints, and 3D models.',
    url: 'https://easyeda2kicad-web.vercel.app',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Person',
      name: 'hulryung',
      url: 'https://github.com/hulryung',
    },
    featureList: [
      'Component Search by LCSC ID',
      'Schematic Symbol Viewer',
      '2D Footprint Viewer',
      '3D Model Viewer',
      'KiCad Export (.kicad_sym, .kicad_mod)',
      '3D Model Export (OBJ, STEP)',
      'Batch ZIP Download',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className="flex-1">
          {children}
        </div>
        <footer className="bg-gray-900 border-t border-gray-800 py-6 px-4 text-gray-400">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span>Created by</span>
                <a
                  href="https://github.com/hulryung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  hulryung
                </a>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <a
                  href="https://github.com/hulryung/easyeda2kicad-web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>

                <a
                  href="https://x.com/hulryung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X
                </a>

                <a
                  href="https://linkedin.com/in/hulryung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
