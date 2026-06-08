import { Color, MeshPhysicalMaterial, Vector2 } from "three";
import CSM from "three-custom-shader-material/vanilla";
import bodyVertex from "../shaders/bodyshader/vertex.glsl";
import inkFragment1 from "../shaders/bodyshader/ink_transition_1.glsl";
import CustomShaderMaterial from "three-custom-shader-material";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { createColorSet } from "../../../utils";

// ─── 10 vivid ping-pong colors ───────────────────────────────────────────────
const RAW_COLORS = [
  "#ff2d55",
  "#ff9f0a",
  "#46ff1c",
  "#0af5ff",
  "#bf5af2",
  "#ff6b35",
  "#00ff88",
  "#ff375f",
  "#ffd60a",
  "#30d5c8",
  "#ff2d95",
];

const COLORS = RAW_COLORS.map(createColorSet);

interface BodyMaterialProps {
  minY: number;
  maxY: number;
}

const BodyMaterial = ({ maxY, minY }: BodyMaterialProps) => {
  const CSMRef = useRef<CSM<typeof MeshPhysicalMaterial>>(null!);

  // Track which color index we're currently ON (fully revealed)
  const colorIndexRef = useRef(0);

  // Stable GSAP tween ref so we can kill it on unmount
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // The proxy object GSAP actually animates
  const progressProxy = useRef({ value: 0 });

  function playNextTransition() {
    const nextIndex = (colorIndexRef.current + 1) % COLORS.length;

    if (!CSMRef.current) return;

    // Swap colors: prevColor = whatever is currently showing
    //              newColor  = next in the sequence
    CSMRef.current.uniforms.prevColor.value =
      COLORS[colorIndexRef.current].body;

    CSMRef.current.uniforms.newColor.value = COLORS[nextIndex].body;

    // Reset progress to 0 before animating
    progressProxy.current.value = 0;
    CSMRef.current.uniforms.uProgress.value = 0;

    // Animate progress 0 → 1, then on complete: ping-pong to next color
    tweenRef.current = gsap.to(progressProxy.current, {
      value: 1,
      duration: 4,
      ease: "power2.inOut",
      onUpdate: () => {
        if (!CSMRef.current) return;
        CSMRef.current.uniforms.uProgress.value = progressProxy.current.value;
      },
      onComplete: () => {
        // Advance the index — newColor is now the "current" color
        colorIndexRef.current = nextIndex;
        // Brief pause then play the next one
        gsap.delayedCall(0.3, playNextTransition);
      },
    });
  }

  // ── Kick off the first transition on mount ──────────────────────────────
  useEffect(() => {
    playNextTransition();
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

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
        // Start with first two colors pre-loaded
        prevColor: { value: new Color(COLORS[0].body) },
        newColor: { value: new Color(COLORS[1].body) },
        uResolution: { value: new Vector2(innerWidth, innerHeight) },
      }}
    />
  );
};

export default BodyMaterial;
