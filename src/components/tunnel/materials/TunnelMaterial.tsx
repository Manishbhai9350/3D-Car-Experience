import TunnelVertex from "../shaders/vertex.glsl";
import TunnelFragment from "../shaders/fragment.glsl";
import { Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, Uniform } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import CSM from "three-custom-shader-material/vanilla";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";

export const TunnelMaterial = () => {
  const CSMRef = useRef<CSM<typeof MeshStandardMaterial>>(null!);

  const { color1,color2 } = useControls('Tunnel',{
    color1:{
      value:'#154153'
    },
    color2:{
      value:'#0074a1'
    },
  })

  useFrame(({ clock }) => {
    if (CSMRef.current) {
      CSMRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <CustomShaderMaterial
      ref={CSMRef}
      baseMaterial={MeshBasicMaterial}
      vertexShader={TunnelVertex}
      fragmentShader={TunnelFragment}
      // metalness={1}
      // roughness={0.9}
      // color={"skyblue"}
      // emissive={"skyblue"}
      // emissiveIntensity={1}
      side={DoubleSide}
      uniforms={{
        uTime: new Uniform(0),
        uColor1: new Uniform(new Color(color1)),
        uColor2: new Uniform(new Color(color2)),
      }}
    />
  );
};
