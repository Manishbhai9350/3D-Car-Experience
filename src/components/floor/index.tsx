import { MeshReflectorMaterial, useTexture } from "@react-three/drei";
import { useControls, folder } from "leva";
import { useEffect } from "react";
import { RepeatWrapping } from "three";

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
        roughness: { value: 0.82, min: 0, max: 1, step: 0.01 },
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
        blurY: { value: 400, min: 0, max: 2048, step: 1 },
        mixBlur: { value: 30, min: 0, max: 100, step: 0.1 },
        depthToBlurRatioBias: { value: 0.25, min: 0, max: 1, step: 0.01 },
      }),
      Reflection: folder({
        mixStrength: { value: 56, min: 0, max: 200, step: 1 },
        mixContrast: { value: 1, min: 0, max: 5, step: 0.01 },
        resolution: { value: 512, options: [256, 512, 1024, 2048] },
        mirror: { value: .93, min: 0, max: 1, step: 0.01 },
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
        <planeGeometry args={[50, 50]} />
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
    </group>
  );
};

export default Floor;
