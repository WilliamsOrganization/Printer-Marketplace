'use client';
import { Suspense, memo, useEffect, useMemo, useRef, useState, type ElementRef, type RefObject } from 'react';
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Physics, RigidBody, BallCollider, CuboidCollider, type RapierRigidBody } from '@react-three/rapier';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';
import { Move } from 'lucide-react';
import { StlChunk } from '@/lib/types';

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const REST_EPSILON = 0.001; // below this, treat velocity/spin as "at rest"

const SPAWN_POSITION: [number, number, number] = [0, 1, 0];
const MOVE_SPEED = 0.576; // world units/sec, capped regardless of frame rate or key-repeat rate
const MOVE_DAMPING = 8; // higher = snappier accel/decel toward the target velocity
const CAMERA_DAMPING = 8; // same damping function/feel, reused for the orbit target
const DRAG_SENSITIVITY = 0.0018; // pixels -> world units; direct 1:1-feeling drag, no cap or damping
// [forward, right] relative to the camera's current horizontal facing, not world axes.
const ARROW_KEYS: Record<string, [number, number]> = {
  ArrowUp: [1, 0],
  ArrowDown: [-1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

// table_Material5001_0: x:[-0.79,0.83] y top:-0.22 z:[-0.85,1.74]
const TABLE_BOUNDS = { minX: -0.79, maxX: 0.83, minZ: -0.85, maxZ: 1.74, topY: -0.22 };
// floor_floor_0: x:[-6.69,3.15] y:-0.987 z:[-3.77,4.16]
const FLOOR_Y = -0.987;
const COLLIDER_THICKNESS = 0.03; // half-height of the flat table/floor slabs

// The baked room's mesh went through simplification during compression,
// which can shift a surface slightly from where it visually renders — fine
// for looks, bad for a trimesh collider (that's what was making the sphere
// sink partway into the table before resting). Flat boxes have no curvature
// to approximate, so hand-placing them from the real geometry's bounding
// boxes gives accurate, stable landing surfaces instead.
//
// Memoized: takes no props, so it should never re-render after its initial
// mount — without memo it would re-render every time a sibling's state
// (drag-active, first-interaction) changes PreviewRoom, for no reason.
const Room = memo(function Room() {
  const { scene } = useGLTF('/centered-room.compressed.glb');
  return (
    <>
      <primitive object={scene} />
      <RigidBody type="fixed" colliders={false} friction={0.7}>
        <CuboidCollider
          args={[
            (TABLE_BOUNDS.maxX - TABLE_BOUNDS.minX) / 2,
            COLLIDER_THICKNESS,
            (TABLE_BOUNDS.maxZ - TABLE_BOUNDS.minZ) / 2,
          ]}
          position={[
            (TABLE_BOUNDS.maxX + TABLE_BOUNDS.minX) / 2,
            TABLE_BOUNDS.topY - COLLIDER_THICKNESS,
            (TABLE_BOUNDS.maxZ + TABLE_BOUNDS.minZ) / 2,
          ]}
        />
        {/* floor_floor_0: x:[-6.69,3.15] z:[-3.77,4.16] */}
        <CuboidCollider args={[4.92, COLLIDER_THICKNESS, 3.97]} position={[-1.77, FLOOR_Y - COLLIDER_THICKNESS, 0.2]} />
      </RigidBody>
    </>
  );
});

// Keeps OrbitControls' orbit target following the ball, since dragging/
// nudging moves it away from the origin the controls default to. Damped
// (not snapped) so it doesn't fight OrbitControls' own internal damping —
// two different "instant" systems both fighting for the same target every
// frame was the source of the camera jitter.
//
// Memoized: bodyRef/controlsRef are stable ref objects for the whole
// PreviewRoom lifetime, so this never needs to re-render after mount either.
const CameraFollowsBall = memo(function CameraFollowsBall({
  bodyRef,
  controlsRef,
}: {
  bodyRef: RefObject<RapierRigidBody | null>;
  controlsRef: RefObject<ElementRef<typeof OrbitControls> | null>;
}) {
  useFrame((_, delta) => {
    const body = bodyRef.current;
    const controls = controlsRef.current;
    if (!body || !controls) return;
    const t = body.translation();
    controls.target.set(
      THREE.MathUtils.damp(controls.target.x, t.x, CAMERA_DAMPING, delta),
      THREE.MathUtils.damp(controls.target.y, t.y, CAMERA_DAMPING, delta),
      THREE.MathUtils.damp(controls.target.z, t.z, CAMERA_DAMPING, delta)
    );
    // drei's OrbitControls only calls its own internal update() when
    // `enabled` is true, so setting `enabled={false}` during a ball-drag
    // (further down) would otherwise freeze the camera's actual transform
    // for the whole drag — no visible follow, then a jump on release, and
    // camera.getWorldDirection() reading a stale orientation the whole time.
    // Calling it ourselves unconditionally decouples that from `enabled`.
    controls.update();
  });
  return null;
});

// Joins the separate sphere-third STLs into one mesh (one rigid body) instead
// of three, and gives it a single BallCollider — cheaper and more stable for
// a dynamic body than a trimesh collider generated from the merged geometry.
//
// Memoized: with `chunks` now a stable module-level reference (see
// product-carousel.tsx) and bodyRef/onDragStateChange stable for the whole
// lifetime, this only needs to actually re-render when `scale` changes.
const SphereBody = memo(function SphereBody({
  chunks,
  bodyRef,
  scale = 0.1,
  onDragStateChange,
}: {
  chunks: StlChunk[];
  bodyRef: RefObject<RapierRigidBody | null>;
  scale?: number;
  onDragStateChange: (dragging: boolean) => void;
}) {
  const geometries = useLoader(STLLoader, chunks.map((chunk) => chunk.url));
  const { camera, gl } = useThree();
  const isDraggingRef = useRef(false);
  const [bodyType, setBodyType] = useState<'dynamic' | 'kinematicPosition'>('dynamic');
  // The ball's position when the drag started, plus the accumulated
  // world-space offset since then — set directly (not a velocity target),
  // so the drag is a true 1:1 mapping of mouse movement to ball movement,
  // not a capped/damped "push toward a direction" like the keyboard.
  const dragStart = useRef(new THREE.Vector3());
  const dragOffset = useRef(new THREE.Vector3());
  // Reusable scratch vectors for the hot paths below (per-frame keyboard
  // movement, per-event mouse drag) — avoids allocating new THREE.Vector3
  // instances dozens of times a second, which otherwise creates enough
  // garbage to cause GC-pause micro-stutter in a render/input loop.
  const scratch = useRef({
    flatForward: new THREE.Vector3(),
    flatRight: new THREE.Vector3(),
    target: new THREE.Vector3(),
    camRight: new THREE.Vector3(),
    camUp: new THREE.Vector3(),
    dragDelta: new THREE.Vector3(),
    nextPosition: new THREE.Vector3(),
  }).current;

  const stopDragging = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setBodyType('dynamic');
    if (document.pointerLockElement === gl.domElement) document.exitPointerLock();
    onDragStateChange(false);
  };

  // Safety net: if pointerlock is exited involuntarily (Escape, browser UI,
  // etc.) or a pointerup/cancel never reaches us, this guarantees the drag
  // state always clears instead of leaving OrbitControls permanently
  // disabled and the ball stuck in kinematic mode.
  useEffect(() => {
    const handlePointerLockChange = () => {
      if (document.pointerLockElement !== gl.domElement) stopDragging();
    };
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  const { geometry, materials, radius } = useMemo(() => {
    const merged = mergeGeometries(geometries, true)!;
    merged.computeBoundingSphere();
    const materials = chunks.map(
      (chunk) => new THREE.MeshStandardMaterial({ color: chunk.color, roughness: 0.5, metalness: 0.1 })
    );
    return {
      geometry: merged,
      materials,
      // Collider radius must match the mesh's actual rendered size; the mesh
      // is scaled but the RigidBody itself isn't, so pre-scale it here.
      radius: (merged.boundingSphere?.radius ?? 1) * scale,
    };
  }, [geometries, chunks, scale]);

  // Raw pointer-lock movement deltas, applied directly to position every
  // event — no cap, no damping. Uses the camera's actual local right/up axes
  // (derived from its quaternion, not `cross(forward, worldUp)`), i.e. the
  // plane orthogonal to the camera's current view direction, like dragging a
  // flat sticker that's always facing you: screen-up moves along wherever
  // the camera's "up" really points right now — which has a real world-Y
  // component whenever it's tilted, letting you lift the ball off a surface.
  //
  // Since this is a kinematic position-set (not a physics push), nothing
  // else stops it from driving the ball down through the table/floor — so
  // any per-event delta that would move it downward is just dropped. Lifting
  // (and horizontal movement) is unrestricted; only the downward component is
  // blocked. Coming back down happens by releasing the drag, not by dragging
  // down through solid geometry.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const body = bodyRef.current;
      if (!body) return;

      const { camRight, camUp, dragDelta, nextPosition } = scratch;
      camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
      camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);

      dragDelta
        .copy(camRight)
        .multiplyScalar(e.movementX * DRAG_SENSITIVITY)
        .addScaledVector(camUp, -e.movementY * DRAG_SENSITIVITY);
      if (dragDelta.y < 0) dragDelta.y = 0;

      dragOffset.current.add(dragDelta);
      nextPosition.copy(dragStart.current).add(dragOffset.current);
      body.setNextKinematicTranslation(nextPosition);
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  // Tracks which arrow keys are currently held — the actual movement is
  // applied once per frame below, not per keydown event (keydown repeats at
  // the OS's key-repeat rate, and stacking impulses on that had no ceiling,
  // so holding a key accelerated the ball indefinitely).
  const heldKeys = useRef(new Set<string>());
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!ARROW_KEYS[e.key]) return;
      e.preventDefault();
      heldKeys.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      heldKeys.current.delete(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Damps current velocity toward a target velocity every frame — MOVE_SPEED
  // in the held keyboard direction (flattened to the ground plane, typical
  // WASD-style movement), or zero when nothing's held. That "toward zero"
  // case is what actually brakes the ball: previously this only touched
  // velocity while a key was down, so releasing left the ball gliding
  // forever. Only runs for keyboard input now — mouse-drag is handled
  // separately as direct position control, not a velocity target. Skips
  // once truly at rest with no input, so it can still fall asleep normally.
  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body || isDraggingRef.current) return;

    const hasKeyInput = heldKeys.current.size > 0;
    // Rapier already tracks its own rest state — once it's put the body to
    // sleep and nothing's being held, skip the linvel/angvel WASM reads
    // entirely instead of pulling both every frame just to find out we have
    // nothing to do. This is the common case for most of a viewing session.
    if (!hasKeyInput && body.isSleeping()) return;

    const currentVel = body.linvel();
    const currentAngVel = body.angvel();
    const isMovingLinearly = Math.abs(currentVel.x) > REST_EPSILON || Math.abs(currentVel.z) > REST_EPSILON;
    const isSpinning =
      Math.abs(currentAngVel.x) > REST_EPSILON ||
      Math.abs(currentAngVel.y) > REST_EPSILON ||
      Math.abs(currentAngVel.z) > REST_EPSILON;

    if (hasKeyInput || isMovingLinearly) {
      const { flatForward, flatRight, target } = scratch;
      camera.getWorldDirection(flatForward);
      flatForward.y = 0;
      flatForward.normalize();
      flatRight.crossVectors(flatForward, WORLD_UP);

      target.set(0, 0, 0);
      for (const key of heldKeys.current) {
        const [f, r] = ARROW_KEYS[key];
        target.addScaledVector(flatForward, f).addScaledVector(flatRight, r);
      }
      if (target.lengthSq() > 1) target.normalize();
      target.multiplyScalar(MOVE_SPEED);

      body.setLinvel(
        {
          x: THREE.MathUtils.damp(currentVel.x, target.x, MOVE_DAMPING, delta),
          y: currentVel.y,
          z: THREE.MathUtils.damp(currentVel.z, target.z, MOVE_DAMPING, delta),
        },
        true
      );
    }

    // Spin (from rolling, collisions, drag) has nothing damping it otherwise
    // and would keep tumbling forever — always decay it toward zero.
    if (isSpinning) {
      body.setAngvel(
        {
          x: THREE.MathUtils.damp(currentAngVel.x, 0, MOVE_DAMPING, delta),
          y: THREE.MathUtils.damp(currentAngVel.y, 0, MOVE_DAMPING, delta),
          z: THREE.MathUtils.damp(currentAngVel.z, 0, MOVE_DAMPING, delta),
        },
        true
      );
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const body = bodyRef.current;
    if (!body) return;
    const t = body.translation();
    dragStart.current.set(t.x, t.y, t.z);
    dragOffset.current.set(0, 0, 0);
    isDraggingRef.current = true;
    setBodyType('kinematicPosition');
    gl.domElement.requestPointerLock();
    onDragStateChange(true);
  };

  return (
    <RigidBody ref={bodyRef} type={bodyType} colliders={false} position={SPAWN_POSITION}>
      <BallCollider args={[radius]} friction={0.7} />
      <mesh
        geometry={geometry}
        material={materials}
        scale={scale}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
      />
    </RigidBody>
  );
});

export default function PreviewRoom({ chunks }: { chunks: StlChunk[] }) {
  const [interacted, setInteracted] = useState(false);
  const [draggingBall, setDraggingBall] = useState(false);
  const bodyRef = useRef<RapierRigidBody>(null);
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [-1, 1.2, -0.5], fov: 40 }}
        shadows
        onPointerDown={() => setInteracted(true)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 2, -5]} intensity={3} castShadow />
        <Suspense fallback={null}>
          <Physics>
            <Room />
            <SphereBody chunks={chunks} bodyRef={bodyRef} onDragStateChange={setDraggingBall} />
          </Physics>
          <CameraFollowsBall bodyRef={bodyRef} controlsRef={controlsRef} />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enabled={!draggingBall}
          maxPolarAngle={(94 * Math.PI) / 180}
          maxDistance={0.9}
          minDistance={0.4}
        />
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
              Drag to rotate — drag the ball to move it, arrow keys to nudge
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

useGLTF.preload('/centered-room.compressed.glb');
