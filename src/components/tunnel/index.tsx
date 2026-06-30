import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Mesh, type MeshBasicMaterial, type PlaneGeometry, type IUniform, type Texture } from "three";
import CSM from "three-custom-shader-material/vanilla";
import { TunnelMaterial } from "./materials/TunnelMaterial";

// ---- Constants ----
const RADIUS = 5;
const DEPTH = 80;
const SCROLL_SPEED = 0.1;

// ---- Uniform shape, strongly typed ----
export interface TunnelUniforms {
  uTime: IUniform<number>;
  uDepth: IUniform<number>;
  uNoiseUvYOffset: IUniform<number>;
  uAudioAverage: IUniform<number>;
  uAudioTexture: IUniform<Texture | null>;
}

type TunnelMesh = Mesh<PlaneGeometry, CSM<typeof MeshBasicMaterial>>;

interface TunnelProps {
  audioAnalyser: AnalyserNode | null;
}

const Tunnel = ({ audioAnalyser }: TunnelProps) => {
  const meshRef = useRef<TunnelMesh>(null!);
  const uniformsRef = useRef<TunnelUniforms | null>(null);

  useFrame((_, dt) => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;

    uniforms.uNoiseUvYOffset.value += SCROLL_SPEED * dt * .1;
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry
        args={[RADIUS, RADIUS, DEPTH, 200, 200, true, Math.PI / 2, Math.PI]}
      />
      <TunnelMaterial
        audioAnalyser={audioAnalyser}
        depth={DEPTH}
        initialYOffset={0}
        uniformsRef={uniformsRef}
      />
    </mesh>
  );
};

export default Tunnel;