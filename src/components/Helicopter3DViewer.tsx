'use client';
import { Suspense, useRef, useState, useLayoutEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows, Environment, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-red-900 rounded-xl border border-red-500 p-8">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-2">¡La aplicación ha crasheado!</h2>
            <p className="font-mono text-sm bg-black/50 p-4 rounded text-left overflow-auto max-w-2xl">
              {this.state.error?.toString()}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Un hotspot interactivo
function Hotspot({ position, label, info, onClick }: { position: [number, number, number], label: string, info: string, onClick: (info: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.x = hovered ? 1.5 : 1;
      meshRef.current.scale.y = hovered ? 1.5 : 1;
      meshRef.current.scale.z = hovered ? 1.5 : 1;
      // Pequeña animación de flotación
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onClick(info); }}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={hovered ? "red" : "orange"} emissive={hovered ? "red" : "orange"} emissiveIntensity={0.5} />
      </mesh>
      
      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-slate-900 text-white px-2 py-1 rounded text-xs font-bold shadow-lg border border-slate-700 whitespace-nowrap z-10">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// Modelo real cargado desde .3DS
function RealHelicopter({ onHotspotClick }: { onHotspotClick: (info: string) => void }) {
  const [object, setObject] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const loader = new TDSLoader();
    loader.setResourcePath('/bo1053d/');
    loader.load(
      '/bo1053d/bo105.3ds',
      (loadedObject) => {
        // Auto-escala el modelo para que ocupe unas 10 unidades máximo
        const box = new THREE.Box3().setFromObject(loadedObject);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const targetScale = 10 / maxDim;
          loadedObject.scale.set(targetScale, targetScale, targetScale);
        }
        
        // Ajustar materiales (doble cara, sombras)
        loadedObject.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.side = THREE.DoubleSide;
              child.material.needsUpdate = true;
            }
          }
        });
        setObject(loadedObject);
      },
      undefined,
      (err) => {
        console.error("Error loading 3DS:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    );
  }, []);

  if (error) {
    return (
      <Html center>
        <div className="bg-red-900 text-white p-4 rounded text-sm max-w-xs text-center border border-red-500">
          <p className="font-bold mb-2">Error cargando modelo 3D</p>
          <p>{error}</p>
        </div>
      </Html>
    );
  }

  if (!object) {
    return (
      <Html center>
        <div className="text-sky-400 font-mono animate-pulse bg-slate-900/80 p-2 rounded">
          Procesando geometría 3D...
        </div>
      </Html>
    );
  }

  return (
    <group position={[0, -2, 0]}>
      <primitive 
        object={object} 
        rotation={[-Math.PI / 2, 0, 0]} 
      />
    </group>
  );
}

export default function Helicopter3DViewer() {
  const [activeInfo, setActiveInfo] = useState<string>("Modelo 3D del BO105. Puedes usar el ratón para rotar y hacer zoom sobre la aeronave.");

  return (
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col md:flex-row bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative">
        
        {/* Panel de Info */}
        <div className="w-full md:w-1/3 bg-slate-800 p-6 flex flex-col z-10 border-b md:border-b-0 md:border-r border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-2">Inspección Pre-Vuelo</h3>
          <p className="text-sky-400 text-sm mb-6 font-mono uppercase tracking-wider">Módulo 1 & 7 - BO105 CBS4</p>
          
          <div className="flex-1">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 min-h-[150px]">
              <p className="text-slate-300 leading-relaxed text-lg">{activeInfo}</p>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500 flex flex-col gap-1">
            <span><kbd className="bg-slate-700 px-1 py-0.5 rounded">ClickIzq + Arrastrar</kbd> = Rotar</span>
            <span><kbd className="bg-slate-700 px-1 py-0.5 rounded">ClickDer + Arrastrar</kbd> = Mover</span>
            <span><kbd className="bg-slate-700 px-1 py-0.5 rounded">Scroll</kbd> = Zoom</span>
          </div>
        </div>

        {/* Canvas 3D */}
        <div className="w-full md:w-2/3 h-[500px] md:h-auto relative cursor-grab active:cursor-grabbing bg-slate-900">
          <Canvas camera={{ position: [10, 5, 10], fov: 45 }}>
            <color attach="background" args={['#0f172a']} />
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 10]} intensity={2} />
            <directionalLight position={[-10, -10, -10]} intensity={1} />
            
            <Suspense fallback={
              <Html center>
                <div className="text-sky-400 font-mono animate-pulse">Cargando...</div>
              </Html>
            }>
              <RealHelicopter onHotspotClick={setActiveInfo} />
            </Suspense>
            
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              minDistance={1}
              maxDistance={50}
            />
          </Canvas>
        </div>

      </div>
    </ErrorBoundary>
  );
}
