import { Canvas } from "@react-three/fiber";
import "./App.css";
import Floor from "./components/floor";
import {
  Environment,
  Lightformer,
  OrbitControls,
  Stats,
} from "@react-three/drei";
import Lights from "./components/lights";
import Car3D from "./components/car";
import { Leva } from "leva";
import { BackSide, DoubleSide } from "three";
import Tunnel from "./components/tunnel";

const App = () => {


  return (
    <main>
      <Leva />
      <Canvas shadows camera={{ fov: 50, position: [3, 5, 3] }}>
        <Stats />
        <OrbitControls target={[0, 0.35, 0]} makeDefault />
        <Floor />
        <Lights />
        {/* <Car3D /> */}
        <Tunnel />
      </Canvas>
    </main>
  );
};

export default App;
