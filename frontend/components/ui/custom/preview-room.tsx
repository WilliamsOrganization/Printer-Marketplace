'use client';
import { Suspense, memo, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import { StlChunk } from '@/lib/types';

const SPAWN_POSITION: [number, number, number] = [0, 0, 0.3];

const Room = memo(function Room() {
  const { scene } = useGLTF('/centered-room.compressed.glb');
  return <primitive object={scene} />;
});

function StlModel({ chunks, scale = 0.1 }: { chunks: StlChunk[]; scale?: number }) {
  const geometries = useLoader(STLLoader, chunks.map((c) => c.url));

  const { geometry, materials } = useMemo(() => {
    const merged = mergeGeometries(geometries, true)!;
    const mats = chunks.map(
      (chunk) => new THREE.MeshStandardMaterial({ color: chunk.color, roughness: 0.4, metalness: 0.15 })
    );
    return { geometry: merged, materials: mats };
  }, [geometries, chunks]);

  return (
    <mesh
      geometry={geometry}
      material={materials}
      scale={scale}
      position={SPAWN_POSITION}
      castShadow
      receiveShadow
    />
  );
}

export default function PreviewRoom({ chunks }: { chunks: StlChunk[] }) {
  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [-1, 0.2, -0.5], fov: 40 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 5, -5]} intensity={2} />
        <Suspense fallback={null}>
          <Room />
          <StlModel chunks={chunks} />
        </Suspense>
        <OrbitControls
          target={SPAWN_POSITION}
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={(94 * Math.PI) / 180}
          maxDistance={0.9}
          minDistance={0.4}
          autoRotate
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/centered-room.compressed.glb');
