import TunnelVertex from "../shaders/vertex.glsl";
import TunnelFragment from "../shaders/fragment.glsl";
import {
  Color,
  DataTexture,
  DoubleSide,
  MeshBasicMaterial,
  RedFormat,
  Uniform,
} from "three";
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
  uAudioTexture: { value: null }, // 🔥 IMPORTANT
  uAudioAverage: { value: 0 }, // 🔥 IMPORTANT
});

interface TunnelMaterialProps {
  depth: number;
  initialYOffset?: number;
  // Tunnel.tsx uses this ref to increment uNoiseUvYOffset on reset
  uniformsRef?: React.MutableRefObject<ReturnType<
    typeof createUniforms
  > | null>;
  audioAnalyser: AnalyserNode | null;
}

export const TunnelMaterial = ({
  initialYOffset = 0,
  uniformsRef,
  depth,
  audioAnalyser,
}: TunnelMaterialProps) => {
  const { currentColorIndex } = useCar();

  const uniforms = useRef(createUniforms(initialYOffset, depth));
  const CSMRef = useRef<CSM<typeof MeshBasicMaterial>>(null);

  // 🔥 AUDIO (SAFE MUTABLE REFS)
  const dataRef = useRef<Uint8Array | null>(null);
  const textureRef = useRef<DataTexture | null>(null);

  const prevIndexRef = useRef(currentColorIndex);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressProxy = useRef({ value: 0 });

  // -------------------------------
  // 🎧 INIT AUDIO TEXTURE
  // -------------------------------
  useEffect(() => {
    if (!audioAnalyser) return;

    const size = audioAnalyser.frequencyBinCount;

    const data = new Uint8Array(size);
    const texture = new DataTexture(data, 1, size, RedFormat);

    texture.needsUpdate = true;

    dataRef.current = data;
    textureRef.current = texture;

    if (CSMRef.current) {
      CSMRef.current.uniforms.uAudioTexture = { value: texture };
    }
  }, [audioAnalyser]);

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

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if(uniforms.current.uNoiseUvYOffset) {
      uniforms.current.uNoiseUvYOffset.value = time * .03;
    }
  })

  useEffect(
    () => () => {
      tweenRef.current?.kill();
    },
    [],
  );

  // -------------------------------
  // ⚡ FRAME LOOP (AUDIO UPDATE)
  // -------------------------------
  useFrame(({ clock }) => {
    if (!CSMRef.current) return;

    CSMRef.current.uniforms.uTime.value = clock.getElapsedTime();

    if (!audioAnalyser || !dataRef.current || !textureRef.current) return;

    const data = dataRef.current;
    const texture = textureRef.current;

    // 🎧 get frequency data
    audioAnalyser.getByteFrequencyData(data);

    // 🚀 FASTEST WAY (no loop)
    texture.image.data.set(data);

    texture.needsUpdate = true;

    const AudioAverage = data.reduce((a,v) => a + v/data.length/255,0);
    CSMRef.current.uniforms.uAudioAverage.value = AudioAverage;
    // CSMRef.current.uniforms.uAudioAverage.value = 1;

    if (!CSMRef.current.uniforms.uAudioTexture.value) {
      CSMRef.current.uniforms.uAudioTexture.value = texture;
    }
  });

  // Expose uniforms to parent via ref
  useEffect(() => {
    if (uniformsRef) uniformsRef.current = uniforms.current;
  }, [uniformsRef]);

  useFrame(({ clock }) => {
    uniforms.current.uTime.value = clock.getElapsedTime();
  });

  return (
    <CustomShaderMaterial
      ref={CSMRef}
      baseMaterial={MeshBasicMaterial}
      vertexShader={TunnelVertex}
      fragmentShader={TunnelFragment}
      side={DoubleSide}
      uniforms={uniforms.current}
    />
  );
};
