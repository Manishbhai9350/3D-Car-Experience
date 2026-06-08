import { useControls } from "leva";
import { TunnelMaterial } from "./materials/TunnelMaterial";

const Tunnel = () => {
  const Radius = 5;

  

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry
        args={[Radius, Radius, 80, 130, 130, true, Math.PI / 2, Math.PI]}
      />
      <TunnelMaterial />
    </mesh>
  );
};

export default Tunnel;
