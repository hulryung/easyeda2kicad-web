'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FootprintViewer from '@/components/FootprintViewer';
import Model3DViewer from '@/components/Model3DViewer';
import { parseEasyEDAFootprint } from '@/lib/kicad-parser';
import { ParsedFootprint } from '@/types/easyeda';
import Link from 'next/link';

interface ComponentData {
  success: boolean;
  lcscId: string;
  data: {
    dataStr?: string;
    title?: string;
    description?: string;
    '3d_model'?: string;
  };
}

export default function ViewPage() {
  const params = useParams();
  const lcscId = params.lcscId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [componentData, setComponentData] = useState<ComponentData | null>(null);
  const [footprint, setFootprint] = useState<ParsedFootprint | null>(null);
  const [activeTab, setActiveTab] = useState<'footprint' | '3d'>('footprint');

  useEffect(() => {
    if (!lcscId) return;

    setLoading(true);
    setError('');

    fetch(`/api/component/${lcscId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch component');
        return res.json();
      })
      .then((data: ComponentData) => {
        setComponentData(data);

        if (data.data?.dataStr) {
          try {
            const parsed = parseEasyEDAFootprint(data.data.dataStr);
            setFootprint(parsed);
          } catch (err) {
            console.error('Error parsing footprint:', err);
          }
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading component:', err);
        setError(err.message || 'Failed to load component');
        setLoading(false);
      });
  }, [lcscId]);

  const handleDownload = async (type: 'footprint' | 'step' | 'obj') => {
    if (!componentData) return;

    try {
      if (type === 'footprint' && footprint) {
        const json = JSON.stringify(footprint, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lcscId}_footprint.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if ((type === 'step' || type === 'obj') && componentData.data['3d_model']) {
        const uuid = componentData.data['3d_model'];
        const format = type === 'step' ? 'step' : 'obj';
        const url = `/api/3dmodel/${uuid}?format=${format}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to download model');

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${lcscId}_model.${format}`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading component {lcscId}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!componentData) {
    return null;
  }

  const has3DModel = !!componentData.data['3d_model'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {componentData.data.title || `Component ${lcscId}`}
              </h1>
              {componentData.data.description && (
                <p className="text-gray-400">{componentData.data.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">LCSC ID: {lcscId}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownload('footprint')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                disabled={!footprint}
              >
                Download Footprint
              </button>
              {has3DModel && (
                <>
                  <button
                    onClick={() => handleDownload('obj')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Download OBJ
                  </button>
                  <button
                    onClick={() => handleDownload('step')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Download STEP
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="border-b border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('footprint')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'footprint'
                    ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-750'
                }`}
              >
                Footprint (2D)
              </button>
              {has3DModel && (
                <button
                  onClick={() => setActiveTab('3d')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === '3d'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-750'
                  }`}
                >
                  3D Model
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'footprint' && footprint && (
              <div className="h-[700px]">
                <FootprintViewer footprint={footprint} />
              </div>
            )}

            {activeTab === '3d' && has3DModel && (
              <div className="h-[700px]">
                <Model3DViewer
                  modelUrl={`/api/3dmodel/${componentData.data['3d_model']}?format=obj`}
                />
              </div>
            )}

            {activeTab === 'footprint' && !footprint && (
              <div className="h-[700px] flex items-center justify-center">
                <p className="text-gray-500">No footprint data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
