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

const App = () => {
  return (
    <main>
      <Leva />
      <Canvas shadows camera={{ fov: 50, position: [3, 5, 3] }}>
        <Stats />
        <OrbitControls target={[0, 0.35, 0]} makeDefault />
        <Floor />
        <Lights />
        <Car3D />
        <Environment>
          {/* <Lightformer
            form="rect" // circle | ring | rect (optional, default = rect)
            intensity={100} // power level (optional = 1)
            scale={[.5,.5]}
            color="skyblue" // (optional = white)
            target={[0, 0, 0]} // Target position (optional = undefined)
            position={[1,0,0]}
          /> */}
        </Environment>
      </Canvas>
    </main>
  );
};

export default App;
