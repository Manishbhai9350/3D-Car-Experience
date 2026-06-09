import TunnelVertex from "../shaders/vertex.glsl";
import TunnelFragment from "../shaders/fragment.glsl";
import { Color, DoubleSide, MeshBasicMaterial, Uniform } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import CSM from "three-custom-shader-material/vanilla";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useCar } from "../../../context/car/car.hook";
import { COLORS } from "../../../data.";
import gsap from "gsap";

// ✅ Stable uniforms — created once, lives outside the component
const tunnelUniforms = {
  uTime:      new Uniform(0),
  uColor1:    new Uniform(new Color(COLORS[0].dark)),
  uColor2:    new Uniform(new Color(COLORS[0].light)),
  uColorT1:   new Uniform(new Color(COLORS[0].dark)),
  uColorT2:   new Uniform(new Color(COLORS[0].light)),
  uTProgress: new Uniform(0),
};

export const TunnelMaterial = () => {
  const CSMRef = useRef<CSM<typeof MeshBasicMaterial>>(null!);
  const { currentColorIndex } = useCar();

  const prevIndexRef = useRef(currentColorIndex);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressProxy = useRef({ value: 0 });

  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    const nextIndex = currentColorIndex;

    if (prevIndex === nextIndex) return;

    // Swap: current target becomes the new "from"
    tunnelUniforms.uColor1.value.copy(tunnelUniforms.uColorT1.value);
    tunnelUniforms.uColor2.value.copy(tunnelUniforms.uColorT2.value);

    // Set new targets
    tunnelUniforms.uColorT1.value.set(COLORS[nextIndex].dark);
    tunnelUniforms.uColorT2.value.set(COLORS[nextIndex].light);

    // Reset progress
    progressProxy.current.value = 0;
    tunnelUniforms.uTProgress.value = 0;

    tweenRef.current?.kill();
    tweenRef.current = gsap.to(progressProxy.current, {
      value: 1,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        tunnelUniforms.uTProgress.value = progressProxy.current.value;
      },
      onComplete: () => {
        prevIndexRef.current = nextIndex;
      },
    });
  }, [currentColorIndex]);

  useEffect(() => () => { tweenRef.current?.kill(); }, []);

  useFrame(({ clock }) => {
    tunnelUniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <CustomShaderMaterial
      ref={CSMRef}
      baseMaterial={MeshBasicMaterial}
      vertexShader={TunnelVertex}
      fragmentShader={TunnelFragment}
      side={DoubleSide}
      uniforms={tunnelUniforms}
    />
  );
};