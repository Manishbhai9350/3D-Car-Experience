import { Color, MeshPhysicalMaterial, Vector2 } from "three";
import CSM from "three-custom-shader-material/vanilla";
import bodyVertex from "../shaders/bodyshader/vertex.glsl";
import inkFragment1 from "../shaders/bodyshader/ink_transition_1.glsl";
import CustomShaderMaterial from "three-custom-shader-material";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useCar } from "../../../context/car/car.hook";

interface BodyMaterialProps {
  minY: number;
  maxY: number;
}

const BodyMaterial = ({ maxY, minY }: BodyMaterialProps) => {
  const CSMRef = useRef<CSM<typeof MeshPhysicalMaterial>>(null!);
  const { colors, currentColorIndex, isAnimatingRef } = useCar();

  // Track the previous index so we know what to animate FROM
  const prevColorIndexRef = useRef(currentColorIndex);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressProxy = useRef({ value: 0 });

  // Simple guard ref — no re-renders, no effect retriggering

  useEffect(() => {
    if (!CSMRef.current || !isAnimatingRef) return;

    const prevIndex = prevColorIndexRef.current;
    const nextIndex = currentColorIndex;

    if (prevIndex === nextIndex) return;

    // 🚫 Bail if already animating
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    CSMRef.current.uniforms.prevColor.value = new Color(colors[prevIndex].body);
    CSMRef.current.uniforms.newColor.value = new Color(colors[nextIndex].body);

    progressProxy.current.value = 0;
    CSMRef.current.uniforms.uProgress.value = 0;

    tweenRef.current?.kill();
    tweenRef.current = gsap.to(progressProxy.current, {
      value: 1,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        if (!CSMRef.current) return;
        CSMRef.current.uniforms.uProgress.value = progressProxy.current.value;
      },
      onComplete: () => {
        prevColorIndexRef.current = nextIndex;
        isAnimatingRef.current = false;
      },
    });
  }, [currentColorIndex, colors, isAnimatingRef]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      tweenRef.current?.kill();
    },
    [],
  );

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
      fragmentShader={inkFragment1}
      uniforms={{
        uMinY: { value: minY },
        uMaxY: { value: maxY },
        uProgress: { value: 0 },
        uTime: { value: 0.0 },
        prevColor: { value: new Color(colors[currentColorIndex].body) },
        newColor: { value: new Color(colors[currentColorIndex].body) },
        uResolution: { value: new Vector2(innerWidth, innerHeight) },
      }}
    />
  );
};

export default BodyMaterial;
