import { Canvas } from "@react-three/fiber";
import "./App.css";
import Floor from "./components/floor";

const App = () => {
  return <Canvas>
    <Floor />
  </Canvas>;
};

export default App;
