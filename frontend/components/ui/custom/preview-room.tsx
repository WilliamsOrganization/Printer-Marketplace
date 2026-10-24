'use client';
import { Suspense, memo, useEffect, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SlottedThreeMFLoader } from '@/lib/three-mf-loader';

const SPAWN_POSITION: [number, number, number] = [0, 0, 0.3];

/** 3MF slot (pindex) -> hex color */
export type SlotColors = Record<number, string>;

const Room = memo(function Room() {
  const { scene } = useGLTF('/centered-room.compressed.glb');
  return <primitive object={scene} />;
});

function ThreeMFModel({ url, slotColors, scale = 1 }: { url: string; slotColors: SlotColors; scale?: number }) {
  const loaded = useLoader(SlottedThreeMFLoader, url);

  // useLoader caches by url, so clone before mutating materials. Each mesh
  // keeps its file material so slots without a chosen color fall back to it.
  const model = useMemo(() => {
    const clone = loaded.clone(true);
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.fileMaterial = mesh.material;
    });
    return clone;
  }, [loaded]);

  useEffect(() => {
    const materials = new Map<number, THREE.MeshStandardMaterial>();
    for (const [slot, hex] of Object.entries(slotColors)) {
      materials.set(Number(slot), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5, metalness: 0.0 }));
    }
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = materials.get(mesh.userData.slot) ?? mesh.userData.fileMaterial;
    });
    return () => materials.forEach((material) => material.dispose());
  }, [model, slotColors]);

  return <primitive object={model} scale={scale} position={SPAWN_POSITION} />;
}

export default function PreviewRoom({ url, slotColors }: { url: string; slotColors: SlotColors }) {
  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [-1, 0.2, -0.5], fov: 40 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 5, -5]} intensity={2} />
        <Suspense fallback={null}>
          <Room />
          <ThreeMFModel url={url} slotColors={slotColors} />
        </Suspense>
        <OrbitControls
          target={SPAWN_POSITION}
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={(94 * Math.PI) / 180}
          maxDistance={0.5}
          minDistance={0.3}
          autoRotate
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/centered-room.compressed.glb');
