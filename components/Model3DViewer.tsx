'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Grid } from '@react-three/drei';
import { Suspense, useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface Model3DViewerProps {
  modelUrl: string;
}

function Model({ objData }: { objData: string }) {
  const [model, setModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (!objData) return;

    const loader = new OBJLoader();

    // Suppress OBJLoader warnings about material properties
    const originalWarn = console.warn;
    console.warn = (message: any, ...args: any[]) => {
      if (
        typeof message === 'string' &&
        message.includes('THREE.OBJLoader: Unexpected line:') &&
        (message.includes('"d ') ||
         message.includes('"Ka ') ||
         message.includes('"Kd ') ||
         message.includes('"Ks ') ||
         message.includes('"newmtl') ||
         message.includes('"endmtl'))
      ) {
        // Suppress these specific warnings
        return;
      }
      originalWarn(message, ...args);
    };

    try {
      const loadedModel = loader.parse(objData);

      loadedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.5,
            roughness: 0.5,
          });
        }
      });

      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      loadedModel.position.sub(center);

      setModel(loadedModel);
    } catch (error) {
      console.error('Error parsing OBJ:', error);
    } finally {
      // Restore original console.warn
      console.warn = originalWarn;
    }
  }, [objData]);

  if (!model) return null;

  return <primitive object={model} />;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

export default function Model3DViewer({ modelUrl }: Model3DViewerProps) {
  const [objData, setObjData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (!modelUrl) {
      setError('No model URL provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    fetch(modelUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch 3D model');
        return res.text();
      })
      .then(data => {
        setObjData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading 3D model:', err);
        setError(err.message || 'Failed to load 3D model');
        setLoading(false);
      });
  }, [modelUrl]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading 3D model</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  if (!objData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <p className="text-gray-500">No 3D model available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">3D Model Preview</h3>
        <p className="text-sm text-gray-400 mt-1">
          Use mouse to rotate, scroll to zoom
        </p>
      </div>
      <div className="w-full h-[600px]">
        <Canvas
          camera={{ position: [5, -5, 5], fov: 50 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#1f2937']} />
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <Suspense fallback={<LoadingFallback />}>
            <Stage environment="city" intensity={0.6}>
              <Model objData={objData} />
            </Stage>
          </Suspense>

          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6b7280"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9ca3af"
            fadeDistance={25}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.05}
            autoRotate
            autoRotateSpeed={2}
            enableRotate={true}
            minPolarAngle={-Math.PI * 10}
            maxPolarAngle={Math.PI * 10}
          />
        </Canvas>
      </div>
    </div>
  );
}
