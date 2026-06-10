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

const createUniforms = (initialYOffset: number, depth: number) => ({
  uTime: new Uniform(0),
  uNoiseUvYOffset: new Uniform(initialYOffset),
  uDepth: new Uniform(depth),
  uColor1: new Uniform(new Color(COLORS[0].dark)),
  uColor2: new Uniform(new Color(COLORS[0].light)),
  uColorT1: new Uniform(new Color(COLORS[0].dark)),
  uColorT2: new Uniform(new Color(COLORS[0].light)),
  uTProgress: new Uniform(0),
});

interface TunnelMaterialProps {
  depth: number;
  initialYOffset?: number;
  // Tunnel.tsx uses this ref to increment uNoiseUvYOffset on reset
  uniformsRef?: React.MutableRefObject<ReturnType<
    typeof createUniforms
  > | null>;
}

export const TunnelMaterial = ({
  initialYOffset = 0,
  uniformsRef,
  depth,
}: TunnelMaterialProps) => {
  const { currentColorIndex } = useCar();

  const uniforms = useRef(createUniforms(initialYOffset, depth));

  // Expose uniforms to parent via ref
  useEffect(() => {
    if (uniformsRef) uniformsRef.current = uniforms.current;
  }, []);

  const prevIndexRef = useRef(currentColorIndex);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressProxy = useRef({ value: 0 });

  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    const nextIndex = currentColorIndex;
    if (prevIndex === nextIndex) return;

    const u = uniforms.current;
    u.uColor1.value.copy(u.uColorT1.value);
    u.uColor2.value.copy(u.uColorT2.value);
    u.uColorT1.value.set(COLORS[nextIndex].dark);
    u.uColorT2.value.set(COLORS[nextIndex].light);

    progressProxy.current.value = 0;
    u.uTProgress.value = 0;

    tweenRef.current?.kill();
    tweenRef.current = gsap.to(progressProxy.current, {
      value: 1,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        uniforms.current.uTProgress.value = progressProxy.current.value;
      },
      onComplete: () => {
        prevIndexRef.current = nextIndex;
      },
    });
  }, [currentColorIndex]);

  useEffect(
    () => () => {
      tweenRef.current?.kill();
    },
    [],
  );

  useFrame(({ clock }) => {
    uniforms.current.uTime.value = clock.getElapsedTime();
  });

  return (
    <CustomShaderMaterial
      baseMaterial={MeshBasicMaterial}
      vertexShader={TunnelVertex}
      fragmentShader={TunnelFragment}
      side={DoubleSide}
      uniforms={uniforms.current}
    />
  );
};
