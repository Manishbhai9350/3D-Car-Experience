import { MeshReflectorMaterial, useTexture } from "@react-three/drei";
import { useControls, folder } from "leva";
import { useEffect, useMemo, useRef } from "react";
import {
  DataTexture,
  MeshBasicMaterial,
  RedFormat,
  RepeatWrapping,
  Uniform,
} from "three";
import CSM from "three-custom-shader-material/vanilla";
import CustomShaderMaterial from "three-custom-shader-material";
import { useOnAudio } from "../../context/audio/audio.hook";
import { CircleVertex, CircleFragment } from "./shaders/circle";

const Floor = () => {
  const [normalMap, roughnessMap] = useTexture([
    "/textures/terrain-normal.jpg",
    "/textures/terrain-roughness.jpg",
  ]);

  const { repeat } = useControls(
    "Floor Texture",
    {
      repeat: { value: 3, min: 1, max: 10, step: 0.5 },
    },
    { collapsed: true },
  );

  useEffect(() => {
    [normalMap, roughnessMap].forEach((t) => {
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.repeat.set(repeat, repeat);
      t.needsUpdate = true;
    });
  }, [normalMap, roughnessMap, repeat]);

  const {
    color,
    roughness,
    metalness,
    envMapIntensity,
    dithering,
    blurX,
    blurY,
    mixBlur,
    mixStrength,
    mixContrast,
    resolution,
    mirror,
    depthScale,
    minDepthThreshold,
    maxDepthThreshold,
    depthToBlurRatioBias,
    reflectorOffset,
  } = useControls(
    "MeshReflectorMaterial",
    {
      Surface: folder({
        color: "#090909",
        roughness: { value: 0.04, min: 0, max: 1, step: 0.01 },
        metalness: { value: 0, min: 0, max: 1, step: 0.01 },
        envMapIntensity: { value: 0, min: 0, max: 5, step: 0.01 },
        dithering: true,
      }),
      "Normal Map": folder({
        normalScaleX: { value: 0.5, min: 0, max: 2, step: 0.01 },
        normalScaleY: { value: 0.5, min: 0, max: 2, step: 0.01 },
      }),
      Blur: folder({
        blurX: { value: 1000, min: 0, max: 2048, step: 1 },
        blurY: { value: 700, min: 0, max: 2048, step: 1 },
        mixBlur: { value: 30, min: 0, max: 100, step: 0.1 },
        depthToBlurRatioBias: { value: 0.25, min: 0, max: 1, step: 0.01 },
      }),
      Reflection: folder({
        mixStrength: { value: 56, min: 0, max: 200, step: 1 },
        mixContrast: { value: 1, min: 0, max: 5, step: 0.01 },
        resolution: { value: 256, options: [256, 512, 1024, 2048] },
        mirror: { value: 0.93, min: 0, max: 1, step: 0.01 },
        reflectorOffset: { value: 0, min: -1, max: 1, step: 0.01 },
      }),
      Depth: folder({
        depthScale: { value: 0.01, min: 0, max: 1, step: 0.001 },
        minDepthThreshold: { value: 0.9, min: 0, max: 1, step: 0.01 },
        maxDepthThreshold: { value: 1, min: 0, max: 1, step: 0.01 },
      }),
    },
    { collapsed: true },
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[25, 25]} />
        <MeshReflectorMaterial
          envMapIntensity={envMapIntensity}
          dithering={dithering}
          color={color}
          roughness={roughness}
          metalness={metalness}
          blur={[blurX, blurY]}
          mixBlur={mixBlur}
          mixStrength={mixStrength}
          mixContrast={mixContrast}
          resolution={resolution}
          mirror={mirror}
          depthScale={depthScale}
          minDepthThreshold={minDepthThreshold}
          maxDepthThreshold={maxDepthThreshold}
          depthToBlurRatioBias={depthToBlurRatioBias}
          reflectorOffset={reflectorOffset}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 5]} />
        <CircleMaterial />
      </mesh>
    </group>
  );
};

export const CircleMaterial = () => {
  const csm = useRef<CSM<typeof MeshBasicMaterial>>(null);
  const textureRef = useRef<DataTexture | null>(null);

  const uniforms = useMemo(
    () => ({
      uTime: new Uniform(0),
      uAudioTexture: new Uniform(null),
      uAudioAverage: new Uniform(0),
    }),
    [],
  );

  const ensureTexture = (length: number) => {
    if (
      textureRef.current &&
      textureRef.current.image.data &&
      textureRef.current.image.data.length === length
    ) {
      return textureRef.current;
    }

    const data = new Uint8Array(length);
    const texture = new DataTexture(data, 1, length, RedFormat);

    // Critical: default UNPACK_ALIGNMENT is 4 bytes. With a 1-byte-wide
    // single-channel row, the GPU misreads row boundaries unless told
    // the data is tightly packed. Without this, parts of the buffer
    // (often near the end) silently read as garbage/zero.
    texture.unpackAlignment = 1;
    texture.needsUpdate = true;

    textureRef.current = texture;
    if (csm.current) {
      csm.current.uniforms.uAudioTexture.value = texture;
    }
    return texture;
  };

  useOnAudio((frequencyData, average) => {
    if (!csm.current) return;

    const texture = ensureTexture(frequencyData.length);
    if(texture && texture.image.data){
      texture.image.data.set(frequencyData);
      texture.needsUpdate = true;
    };

    csm.current.uniforms.uAudioAverage.value = average;
  });

  return (
    <CustomShaderMaterial
      ref={csm}
      baseMaterial={MeshBasicMaterial}
      vertexShader={CircleVertex}
      fragmentShader={CircleFragment}
      uniforms={uniforms}
      transparent
    />
  );
};

export default Floor;
