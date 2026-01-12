'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [lcscId, setLcscId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lcscId.trim()) {
      alert('Please enter an LCSC ID');
      return;
    }

    const cleanId = lcscId.trim().toUpperCase();
    setLoading(true);

    try {
      const response = await fetch(`/api/component/${cleanId}`);
      if (!response.ok) {
        throw new Error('Component not found');
      }

      router.push(`/view/${cleanId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to find component. Please check the LCSC ID and try again.');
      setLoading(false);
    }
  };

  const exampleIds = ['C2040', 'C25804', 'C2828', 'C14663'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              EasyEDA to KiCad Web
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Convert EasyEDA/LCSC components to KiCad format
            </p>
            <p className="text-gray-400">
              View footprints in 2D and 3D models online
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-2xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="lcscId" className="block text-sm font-medium text-gray-300 mb-2">
                  LCSC Component ID
                </label>
                <input
                  type="text"
                  id="lcscId"
                  value={lcscId}
                  onChange={(e) => setLcscId(e.target.value)}
                  placeholder="e.g., C2040"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400 text-lg"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  'View Component'
                )}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-3">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => setLcscId(id)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
                    disabled={loading}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="text-lg font-semibold mb-2">Browse Components</h3>
              <p className="text-gray-400 text-sm">
                Search any LCSC component by ID and view detailed information
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold mb-2">2D Footprint</h3>
              <p className="text-gray-400 text-sm">
                Visualize component footprints with interactive 2D viewer
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">3D Models</h3>
              <p className="text-gray-400 text-sm">
                Explore 3D models with interactive rotation and zoom
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <p className="text-gray-300 text-sm mb-3">
              This tool converts electronic components from EasyEDA and LCSC to KiCad library format.
              It supports both KiCad v5.x and v6.x, including symbols, footprints, and 3D models.
            </p>
            <p className="text-gray-400 text-xs">
              Based on{' '}
              <a
                href="https://github.com/uPesy/easyeda2kicad.py"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                easyeda2kicad.py
              </a>
              {' '}by uPesy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
