import { Canvas } from "@react-three/fiber";
import "./App.css";
import { OrbitControls, Stats } from "@react-three/drei";
import Lights from "./components/lights";
import Tunnel from "./components/tunnel";
import CarProvider from "./context/car/car.provider";
import UI from "./components/ui";
import BGM from "./components/audio/bgm";
import { McLaren } from "./components/maclarn";

// position: [2, 3, 5]

const App = () => {
  const { analyser, dom } = BGM();

  return (
    <CarProvider>
      {dom}
      <main>
        <UI />
        {/* <Leva
          titleBar={{
            position: {
              x: -100,
              y: 350,
            },
          }}
        /> */}
        <Canvas shadows camera={{ fov: 50, position: [0, 2, 10] }}>
          <Stats />
          <OrbitControls target={[-0.5, 1, 0]} makeDefault />
          {/* <Floor /> */}
          <Lights />
          {/* <Car /> */}
          <McLaren />
          <Tunnel audioAnalyser={analyser} />

          {/* <EffectComposer>
            <DepthOfField
              focusDistance={1.0} // normalized — 0 = camera near, focus on car
              focalLength={0.02} // shorter = tighter focus range
              bokehScale={6} // size of bokeh circles on blurred areas
              height={480} // resolution — lower = softer/cheaper bokeh
            />
          </EffectComposer> */}
        </Canvas>
      </main>
    </CarProvider>
  );
};

export default App;
