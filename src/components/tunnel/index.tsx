import { TunnelMaterial } from "./materials/TunnelMaterial";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Mesh, type MeshBasicMaterial, type PlaneGeometry } from "three";
import CSM from "three-custom-shader-material/vanilla";

// Shared counter — increments each time any segment resets
let globalYOffset = 3; // starts at 3 since segments init at 0, 1, 2

const Tunnel = () => {
  const Radius = 5;
  const Depth = 80;

  const refs = [
    useRef<Mesh<PlaneGeometry, CSM<typeof MeshBasicMaterial>>>(null!),
    useRef<Mesh<PlaneGeometry, CSM<typeof MeshBasicMaterial>>>(null!),
    useRef<Mesh<PlaneGeometry, CSM<typeof MeshBasicMaterial>>>(null!),
  ];

  // Holds each TunnelMaterial's uniforms so we can update uNoiseUvYOffset
  const uniformRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  useFrame((_,dt) => {
    if (refs.some(r => !r.current)) return;

    refs.forEach((ref, i) => {
      ref.current.position.z -= 3.0 * dt;

      if (ref.current.position.z < -Depth) {
        ref.current.position.z += 3 * Depth;

        // Assign next continuous Y offset to this segment
        if (uniformRefs[i].current) {
          uniformRefs[i].current.uNoiseUvYOffset.value = globalYOffset;
          globalYOffset += 1;
        }
      }
    });
  });

  return (
    <group>
      {([0, Depth, 2 * Depth] as const).map((z, i) => (
        <mesh
          key={i}
          ref={refs[i]}
          position={[0, 0, z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[Radius, Radius, Depth, 130, 130, true, Math.PI / 2, Math.PI]} />
          <TunnelMaterial depth={Depth} initialYOffset={i} uniformsRef={uniformRefs[i]} />
        </mesh>
      ))}
    </group>
  );
};

export default Tunnel;