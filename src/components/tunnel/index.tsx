import { TunnelMaterial } from "./materials/TunnelMaterial";

const Tunnel = () => {
  const Radius = 7;

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry
        args={[Radius, Radius, 50, 130, 130, true, Math.PI / 2, Math.PI]}
      />
      <TunnelMaterial />
    </mesh>
  );
};

export default Tunnel;
