import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Cube from "./cube";
import { Group } from "three";

export interface ChildCube {
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface CubeGroupProps {
  rotation: [number, number, number];
  position: [number, number, number];
  scale: number;
  cubes: ChildCube[];
}

const CubeGroup = ({ cubes, rotation, position, scale }: CubeGroupProps) => {
  const groupRef = useRef<Group>(null);

  useFrame((_, dt) => {
    if (!groupRef.current || !(groupRef.current instanceof Group)) return;

    const speed = 4.3;
    const MaxDeltaZ = 30;

    groupRef.current.position.z -= speed * dt;

    if (groupRef.current.position.z < -MaxDeltaZ) {
      groupRef.current.position.z = MaxDeltaZ;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group scale={scale} rotation={rotation}>
        {cubes.map((C, i) => (
          <Cube {...C} key={i} />
        ))}
      </group>
    </group>
  );
};

export default CubeGroup;
