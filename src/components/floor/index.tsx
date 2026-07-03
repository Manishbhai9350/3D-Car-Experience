import { MeshReflectorMaterial, useTexture } from "@react-three/drei";
import { useControls, folder } from "leva";
import { useEffect, useRef } from "react";
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
    // normalScaleX,
    // normalScaleY,
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
          // normalMap={normalMap}
          // normalScale={[normalScaleX, normalScaleY]}
          // roughnessMap={roughnessMap}
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

const CircleVertex = /* glsl */ `

  varying vec2 vUv;

  void main(){

    vUv = uv;
    
  }
`;
const CircleFragment = /* glsl */ `

  uniform sampler2D uAudioTexture;
  varying vec2 vUv;

  void main(){

    vec2 centeredUV = vUv - vec2(.5);

    float circle = length(centeredUV);
    float smoothed = smoothstep(.5,.492,circle);

    // Using tan() inverse to calculate the theta;
    float angle = atan(centeredUV.y,centeredUV.x) + PI;

    angle = angle / 2.0 / PI;

    float AngleProg = angle;
    
    angle = fract(angle * 15.0);
    
    float gapFactor = .7;

    
    angle = step(angle,gapFactor);

    angle *= 1. - step(length(centeredUV),.2);



    csm_FragColor = vec4(smoothed);

    csm_FragColor.rgb = vec3(angle);
    csm_FragColor.a = min(step(length(centeredUV),.5),angle) * 0.0 + 1.0;

    float audioIntensity = texture(uAudioTexture,vec2(AngleProg * .7)).r;

    csm_FragColor.r = audioIntensity;

    csm_FragColor.gb = vec2(0.0);


  }
`;

export const CircleMaterial = () => {
  const csm = useRef<CSM<typeof MeshBasicMaterial>>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const textureRef = useRef<DataTexture | null>(null);

  // 🔥 you need an analyser reference to know frequencyBinCount.
  // Simplest: pull it off the bus, or accept it as a prop like TunnelMaterial does.
  useEffect(() => {
    const size = 512; // match your analyser.fftSize / 2 (frequencyBinCount)
    const data = new Uint8Array(size);
    const texture = new DataTexture(data, 1, size, RedFormat);
    texture.needsUpdate = true;

    dataRef.current = data;
    textureRef.current = texture;

    if (csm.current) {
      csm.current.uniforms.uAudioTexture.value = texture;
    }
  }, []);

  useOnAudio((frequencyData, average) => {
    if (!csm.current || !textureRef.current || !textureRef.current.image.data)
      return;

    textureRef.current.image.data.set(frequencyData);
    textureRef.current.needsUpdate = true;

    csm.current.uniforms.uAudioAverage.value = average;
  });

  return (
    <CustomShaderMaterial
      ref={csm}
      baseMaterial={MeshBasicMaterial}
      vertexShader={CircleVertex}
      fragmentShader={CircleFragment}
      uniforms={{
        uTime: new Uniform(0),
        uAudioTexture: new Uniform(null),
        uAudioAverage: new Uniform(0),
      }}
      transparent
    />
  );
};

export default Floor;
