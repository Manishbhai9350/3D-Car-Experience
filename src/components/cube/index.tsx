import { useTexture } from "@react-three/drei";
import { CircleFragmentCube, CircleVertexCube, createCubeWithPerFaceUVs } from "./utils/cube.utils";
import CustomShaderMaterial from "three-custom-shader-material";
import { Color, DataTexture, MeshBasicMaterial, RedFormat } from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Uniform } from "three";
import { UseAudio } from "../../context/audio/audio.context";
import { useCar } from "../../context/car/car.hook";
import CSM from "three-custom-shader-material/vanilla";
import { useOnAudio } from "../../context/audio/audio.hook";
import gsap from "gsap";

const Cube = () => {
  
  return (
    <mesh position={[0,.7,0]} geometry={createCubeWithPerFaceUVs()}>
      <CircleMaterial />
    </mesh>
  );
};



export const CircleMaterial = () => {
  const csm = useRef<CSM<typeof MeshBasicMaterial>>(null);
  const textureRef = useRef<DataTexture | null>(null);

  const meow = useTexture(
    "https://imgs.search.brave.com/e0_9sQwxONrYIpvb3YYsTaPhDKBpEcxMlTcVGeLVIlI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy83/Lzc3L0tpdHR5X01l/b3dfTWVvdy5KUEc",
  );


  const { radial } = UseAudio();

  const { colors, currentColorIndex } = useCar();
  const InitialColor = colors[currentColorIndex];

  const uniforms = useMemo(
    () => ({
      uTime: new Uniform(0),
      uAudioTexture: new Uniform(null),
      uAudioAverage: new Uniform(0),
      uColorFrom: new Uniform(new Color(InitialColor.body)),
      uColorTo: new Uniform(new Color(InitialColor.body)),
      uColorProgress: new Uniform(1), // 1 = fully settled on uColorTo
      uRadial: new Uniform(0),
      meow: new Uniform(null)
    }),
    [],
  );

  const transitionDuration = 0.6; // seconds, tune to taste
  

  // Whenever the target color changes, snapshot where we currently
  // are (the blended color) as the new "from", set the new "to",
  // and reset progress to 0 so useFrame animates it back to 1.
  useEffect(() => {
    const currentBlend = uniforms.uColorFrom.value
      .clone()
      .lerp(uniforms.uColorTo.value, uniforms.uColorProgress.value);

    uniforms.uColorFrom.value.copy(currentBlend);
    uniforms.uColorTo.value.set(colors[currentColorIndex].body);
    uniforms.uColorProgress.value = 0;
  }, [colors, currentColorIndex]);

  useEffect(() => {
    gsap.to(uniforms.uRadial, {
      value: radial ? 1 : 0,
    });
    return () => {
      gsap.to(uniforms.uRadial, {
        value: 0,
      });
    };
  }, [radial, uniforms.uRadial]);

  useFrame((_, delta) => {
    if (uniforms.uTime) {
      uniforms.uTime.value += delta;
    }
    if (uniforms.uColorProgress.value < 1) {
      uniforms.uColorProgress.value = Math.min(
        uniforms.uColorProgress.value + delta / transitionDuration,
        1,
      );
    }
  });

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
    if (texture && texture.image.data) {
      texture.image.data.set(frequencyData);
      texture.needsUpdate = true;
    }

    csm.current.uniforms.uAudioAverage.value = average;
  });

  return (
    <CustomShaderMaterial
      ref={csm}
      baseMaterial={MeshBasicMaterial}
      vertexShader={CircleVertexCube}
      fragmentShader={CircleFragmentCube}
      uniforms={uniforms}
      // transparent
    />
  );
};

export default Cube;
