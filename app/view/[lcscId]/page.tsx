'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FootprintViewer from '@/components/FootprintViewer';
import Model3DViewer from '@/components/Model3DViewer';
import SchematicViewer, { parseSchematicData } from '@/components/SchematicViewer';
import { parseEasyEDAFootprint, convertToKiCadFootprint, convertToKiCadSymbol } from '@/lib/kicad-parser';
import { ParsedFootprint } from '@/types/easyeda';
import Link from 'next/link';
import JSZip from 'jszip';

interface ComponentData {
  success: boolean;
  lcscId: string;
  data: {
    schematicStr?: string;
    footprintStr?: string;
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
  const [schematic, setSchematic] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'schematic' | 'footprint' | '3d'>('schematic');

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

        // Parse schematic symbol data
        if (data.data?.schematicStr) {
          try {
            const parsedSchematic = parseSchematicData(data.data.schematicStr);
            setSchematic(parsedSchematic);
          } catch (err) {
            console.error('Error parsing schematic:', err);
          }
        }

        // Parse footprint data
        if (data.data?.footprintStr) {
          try {
            const parsed = parseEasyEDAFootprint(data.data.footprintStr);
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

  const handleDownloadAll = async () => {
    if (!componentData) return;

    try {
      const zip = new JSZip();

      // Use component title as base name
      const componentTitle = componentData.data.title?.replace(/[^a-zA-Z0-9_-]/g, '_') || lcscId;

      // Add symbol file
      if (schematic) {
        const kicadSymbol = convertToKiCadSymbol(schematic);
        const symbolPackage = schematic.name?.replace(/[^a-zA-Z0-9_-]/g, '_') || '';
        const symbolName = symbolPackage ? `${symbolPackage}_${componentTitle}_${lcscId}` : `${componentTitle}_${lcscId}`;
        zip.file(`${symbolName}.kicad_sym`, kicadSymbol);
      }

      // Add footprint file
      if (footprint) {
        const kicadFootprint = convertToKiCadFootprint(footprint);
        const footprintPackage = footprint.name?.replace(/[^a-zA-Z0-9_-]/g, '_') || '';
        const footprintName = footprintPackage ? `${footprintPackage}_${componentTitle}_${lcscId}` : `${componentTitle}_${lcscId}`;
        zip.file(`${footprintName}.kicad_mod`, kicadFootprint);
      }

      // Add 3D models
      if (componentData.data['3d_model']) {
        const uuid = componentData.data['3d_model'];
        const footprintPackage = footprint?.name?.replace(/[^a-zA-Z0-9_-]/g, '_') || '';
        const modelBaseName = footprintPackage ? `${footprintPackage}_${componentTitle}_${lcscId}` : `${componentTitle}_${lcscId}`;

        // Download OBJ
        try {
          const objResponse = await fetch(`/api/3dmodel/${uuid}?format=obj`);
          if (objResponse.ok) {
            const objBlob = await objResponse.blob();
            zip.file(`${modelBaseName}.obj`, objBlob);
          }
        } catch (err) {
          console.error('Error downloading OBJ:', err);
        }

        // Download STEP
        try {
          const stepResponse = await fetch(`/api/3dmodel/${uuid}?format=step`);
          if (stepResponse.ok) {
            const stepBlob = await stepResponse.blob();
            zip.file(`${modelBaseName}.step`, stepBlob);
          }
        } catch (err) {
          console.error('Error downloading STEP:', err);
        }
      }

      // Generate and download zip with consistent naming
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;

      // Use footprint package name for ZIP file naming (matching individual files)
      const footprintPackage = footprint?.name?.replace(/[^a-zA-Z0-9_-]/g, '_') || '';
      const zipName = footprintPackage ? `${footprintPackage}_${componentTitle}_${lcscId}` : `${componentTitle}_${lcscId}`;
      a.download = `${zipName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating zip:', err);
      alert('Failed to create zip file');
    }
  };

  const handleDownload = async (type: 'symbol' | 'footprint' | 'step' | 'obj') => {
    if (!componentData) return;

    try {
      const componentTitle = componentData.data.title?.replace(/[^a-zA-Z0-9_-]/g, '_') || lcscId;

      if (type === 'symbol' && schematic) {
        // Convert to KiCad symbol format
        const kicadContent = convertToKiCadSymbol(schematic);
        const blob = new Blob([kicadContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const symbolPackage = schematic.name?.replace(/[^a-zA-Z0-9_-]/g, '_') || '';
        const symbolName = symbolPackage ? `${symbolPackage}_${componentTitle}_${lcscId}` : `${componentTitle}_${lcscId}`;
        a.download = `${symbolName}.kicad_sym`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (type === 'footprint' && footprint) {
        // Convert to KiCad footprint format
        const kicadContent = convertToKiCadFootprint(footprint);
        const blob = new Blob([kicadContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const footprintPackage = footprint.name?.replace(/[^a-zA-Z0-9_-]/g, '_') || '';
        const footprintName = footprintPackage ? `${footprintPackage}_${componentTitle}_${lcscId}` : `${componentTitle}_${lcscId}`;
        a.download = `${footprintName}.kicad_mod`;
        a.click();
        URL.revokeObjectURL(url);
      } else if ((type === 'step' || type === 'obj') && componentData.data['3d_model']) {
        const uuid = componentData.data['3d_model'];
        const format = type === 'step' ? 'step' : 'obj';
        const apiUrl = `/api/3dmodel/${uuid}?format=${format}`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to download model');

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const footprintPackage = footprint?.name?.replace(/[^a-zA-Z0-9_-]/g, '_') || '';
        const modelBaseName = footprintPackage ? `${footprintPackage}_${componentTitle}_${lcscId}` : `${componentTitle}_${lcscId}`;
        a.download = `${modelBaseName}.${format}`;
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
                onClick={handleDownloadAll}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors font-semibold"
                disabled={!schematic && !footprint && !has3DModel}
              >
                Download All (ZIP)
              </button>
              <button
                onClick={() => handleDownload('symbol')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                disabled={!schematic}
              >
                Download Symbol
              </button>
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
                onClick={() => setActiveTab('schematic')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'schematic'
                    ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-750'
                }`}
              >
                Schematic Symbol
              </button>
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
            {activeTab === 'schematic' && schematic && (
              <div className="h-[700px]">
                <SchematicViewer schematic={schematic} />
              </div>
            )}

            {activeTab === 'schematic' && !schematic && (
              <div className="h-[700px] flex items-center justify-center">
                <p className="text-gray-500">No schematic data available</p>
              </div>
            )}

            {activeTab === 'footprint' && footprint && (
              <div className="h-[700px]">
                <FootprintViewer footprint={footprint} />
              </div>
            )}

            {activeTab === 'footprint' && !footprint && (
              <div className="h-[700px] flex items-center justify-center">
                <p className="text-gray-500">No footprint data available</p>
              </div>
            )}

            {activeTab === '3d' && has3DModel && (
              <div className="h-[700px]">
                <Model3DViewer
                  modelUrl={`/api/3dmodel/${componentData.data['3d_model']}?format=obj`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
