'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [lcscId, setLcscId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  const saveToHistory = (id: string) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    // Add to front and remove duplicates, keep max 8 items
    const newHistory = [id, ...history.filter((h: string) => h !== id)].slice(0, 8);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

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

      saveToHistory(cleanId);
      router.push(`/view/${cleanId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to find component. Please check the LCSC ID and try again.');
      setLoading(false);
    }
  };

  const exampleIds = ['C2040', 'C25804', 'C2828', 'C14663'];
  const displayExamples = searchHistory.length > 0 ? searchHistory : exampleIds;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              EasyEDA to KiCad Web
            </h1>
            <p className="text-base text-gray-300 mb-1">
              Convert EasyEDA/LCSC components to KiCad format
            </p>
            <p className="text-sm text-gray-400">
              View footprints in 2D and 3D models online
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="lcscId" className="block text-sm font-medium text-gray-300 mb-1.5">
                  LCSC Component ID
                </label>
                <input
                  type="text"
                  id="lcscId"
                  value={lcscId}
                  onChange={(e) => setLcscId(e.target.value)}
                  placeholder="e.g., C2040"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-400"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">
                {searchHistory.length > 0 ? 'Recent searches:' : 'Try these examples:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {displayExamples.map((id) => (
                  <button
                    key={id}
                    onClick={() => setLcscId(id)}
                    className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs transition-colors"
                    disabled={loading}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl mb-2">📦</div>
              <h3 className="text-base font-semibold mb-1">Browse Components</h3>
              <p className="text-gray-400 text-xs">
                Search any LCSC component by ID and view detailed information
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="text-base font-semibold mb-1">2D Footprint</h3>
              <p className="text-gray-400 text-xs">
                Visualize component footprints with interactive 2D viewer
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-base font-semibold mb-1">3D Models</h3>
              <p className="text-gray-400 text-xs">
                Explore 3D models with interactive rotation and zoom
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-base font-semibold mb-2">About</h3>
            <p className="text-gray-300 text-xs mb-2">
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
