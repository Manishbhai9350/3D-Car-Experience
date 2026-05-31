import { MeshPhysicalMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import CSM from "three-custom-shader-material/vanilla";
import bodyVertex from "../shaders/bodyshader/vertex.glsl";
import bodyFragment from "../shaders/bodyshader/fragment.glsl";
import { useControls } from "leva";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface BodyMaterialProps {
  minY: number;
  maxY: number;
}

const BodyMaterial = ({ maxY, minY }: BodyMaterialProps) => {
  const { progress, noiseScale, noiseStrength } = useControls("Body Material", {
    progress: { value: 0., min: 0, max: 1, step: 0.01 },
    noiseScale: { value: 3.0, min: 0, max: 10, step: 0.1 },
    noiseStrength: { value: 0.5, min: 0, max: 2, step: 0.01 },
  });

  const CSMRef = useRef<CSM<typeof MeshPhysicalMaterial>>(null!);

  useFrame(({ clock }) => {
    if (!CSMRef.current) return;
    CSMRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <CustomShaderMaterial
      ref={CSMRef}
      baseMaterial={MeshPhysicalMaterial}
      roughness={0.45}
      metalness={1}
      color={0xffffff}
      vertexShader={bodyVertex}
      fragmentShader={bodyFragment}
      uniforms={{
        uMinY: { value: minY },
        uMaxY: { value: maxY },
        uProgress: { value: progress },
        uNoiseScale: { value: noiseScale },
        uNoiseStrength: { value: noiseStrength },
        uTime: { value: 0.0 },
      }}
    />
  );
};

export default BodyMaterial;
