'use client';
import { Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { AnimatePresence, motion } from 'framer-motion';
import { Move } from 'lucide-react';
import { StlChunk } from '@/lib/types';

function Room() {
  const { scene } = useGLTF('/centered-room.compressed.glb');
  return <primitive object={scene} />;
}

function STLColorChunks({ url, color, position, scale = 0.1 }: { url: string; color: string; position: [number, number, number]; scale?: number }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh geometry={geometry} position={position} scale={scale} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </mesh>
  );
}


export default function PreviewRoom({ chunks }: { chunks: StlChunk[] }) {
  const [interacted, setInteracted] = useState(false);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [-1, 0.2, -0.5], fov: 40 }}
        shadows
        onPointerDown={() => setInteracted(true)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 2, -5]} intensity={3} castShadow />
        <Suspense fallback={null}>
          <Room />
          { chunks.map((chunk) => (
            <STLColorChunks
              key={chunk.url}
              url={chunk.url}
              color={chunk.color}
              position={chunk.position}
            />
          ))}
        </Suspense>
        <OrbitControls maxPolarAngle={(102 * Math.PI) / 180} maxDistance={1} minDistance={0.4} />
      </Canvas>

      <AnimatePresence>
        {!interacted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="flex items-center gap-2 font-serif italic text-white text-sm bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded">
              <Move className="size-4" />
              Drag to rotate
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

useGLTF.preload('/centered-room.compressed.glb');
