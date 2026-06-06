import TunnelVertex from "../shaders/vertex.glsl";
import TunnelFragment from "../shaders/fragment.glsl";
import { DoubleSide, MeshStandardMaterial, Uniform } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import CSM from "three-custom-shader-material/vanilla";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export const TunnelMaterial = () => {
  const CSMRef = useRef<CSM<typeof MeshStandardMaterial>>(null!);

  useFrame(({ clock }) => {
    if (CSMRef.current) {
      CSMRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <CustomShaderMaterial
      ref={CSMRef}
      baseMaterial={MeshStandardMaterial}
      vertexShader={TunnelVertex}
      fragmentShader={TunnelFragment}
      metalness={1}
      roughness={0.7}
      color={"skyblue"}
      emissive={"skyblue"}
      emissiveIntensity={3}
      side={DoubleSide}
      uniforms={{
        uTime: new Uniform(0),
      }}
    />
  );
};
