import { Canvas } from "@react-three/fiber";
import "./App.css";
import Floor from "./components/floor";
import { OrbitControls, Stats } from "@react-three/drei";
import Lights from "./components/lights";
import Car3D from "./components/car";
import { Leva } from "leva";
import Tunnel from "./components/tunnel";

// position: [2, 3, 5]

const App = () => {
  return (
    <main>
      <Leva
        titleBar={{
          position:{
            x:-100,
            y:350
          }
        }}
      />
      <Canvas 
        shadows
        camera={{ fov: 50, position: [0, 2, 10] }}
          
      >
        <Stats />
        <OrbitControls target={[-.5, 1, 0]} makeDefault />
        <Floor />
        <Lights />
        <Car3D />
        <Tunnel />
      </Canvas>
    </main>
  );
};

export default App;
