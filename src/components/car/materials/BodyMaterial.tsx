import { Color, MeshPhysicalMaterial, Vector2 } from "three";
import CSM from "three-custom-shader-material/vanilla";
import bodyVertex from "../shaders/bodyshader/vertex.glsl";
import inkFragment1 from "../shaders/bodyshader/ink_transition_1.glsl";
import CustomShaderMaterial from "three-custom-shader-material";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";

// ─── 10 vivid ping-pong colors ───────────────────────────────────────────────
const COLORS = [
  "#ff2d55", // hot pink
  "#ff9f0a", // amber
  "#46ff1c", // electric green
  "#0af5ff", // cyan
  "#bf5af2", // purple
  "#ff6b35", // orange
  "#00ff88", // mint
  "#ff375f", // red
  "#ffd60a", // yellow
  "#30d5c8", // turquoise
  "#ff2d95", // magenta
];

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

  // ── Kick off the first transition on mount ──────────────────────────────
  useEffect(() => {
    playNextTransition();
    return () => { tweenRef.current?.kill(); };
  }, []);

  function playNextTransition() {
    const nextIndex = (colorIndexRef.current + 1) % COLORS.length;

    if (!CSMRef.current) return;

    // Swap colors: prevColor = whatever is currently showing
    //              newColor  = next in the sequence
    CSMRef.current.uniforms.prevColor.value = new Color(
      COLORS[colorIndexRef.current]
    );
    CSMRef.current.uniforms.newColor.value = new Color(COLORS[nextIndex]);

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
        uMinY:        { value: minY },
        uMaxY:        { value: maxY },
        uProgress:    { value: 0 },
        uTime:        { value: 0.0 },
        // Start with first two colors pre-loaded
        prevColor:    { value: new Color(COLORS[0]) },
        newColor:     { value: new Color(COLORS[1]) },
        uResolution:  { value: new Vector2(innerWidth, innerHeight) },
      }}
    />
  );
};

export default BodyMaterial;