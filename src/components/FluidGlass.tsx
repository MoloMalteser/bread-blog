/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import { useRef, useState, useEffect, memo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { useFBO, useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import { easing } from 'maath';

interface FluidGlassProps {
  mode?: 'lens';
  lensProps?: {
    scale?: number;
    ior?: number;
    thickness?: number;
    chromaticAberration?: number;
    anisotropy?: number;
  };
  className?: string;
}

export default function FluidGlass({
  mode = 'lens',
  lensProps = {},
  className = '',
}: FluidGlassProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
        <ModeWrapper
          glb="/assets/3d/lens.glb"
          geometryKey="Cylinder"
          modeProps={{
            scale: 0.15,
            ior: 1.15,
            thickness: 5,
            chromaticAberration: 0.1,
            anisotropy: 0.01,
            ...lensProps,
          }}
        />
      </Canvas>
    </div>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  glb,
  geometryKey,
  modeProps = {} as any,
}: {
  glb: string;
  geometryKey: string;
  modeProps?: any;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF(glb) as any;
  const buffer = useFBO();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  useEffect(() => {
    const geo = nodes[geometryKey]?.geometry;
    if (!geo) return;
    geo.computeBoundingBox();
    geoWidthRef.current =
      geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = (pointer.x * v.width) / 2;
    const destY = (pointer.y * v.height) / 2;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if (modeProps.scale != null) {
      ref.current.scale.setScalar(modeProps.scale);
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } =
    modeProps;
  const geometry = nodes[geometryKey]?.geometry;
  if (!geometry) return null;

  return (
    <>
      {createPortal(<></>, scene)}
      <mesh ref={ref} geometry={geometry}>
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior}
          thickness={thickness}
          anisotropy={anisotropy}
          chromaticAberration={chromaticAberration}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

useGLTF.preload('/assets/3d/lens.glb');
