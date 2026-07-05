import { Canvas } from "@react-three/fiber";
import "./App.css";
import { OrbitControls, OrthographicCamera, Stats } from "@react-three/drei";
import Lights from "./components/lights";
import Tunnel from "./components/tunnel";
import CarProvider from "./context/car/car.provider";
import UI from "./components/ui";
import BGM from "./components/audio/bgm";
import { Car } from "./components/car";
import Floor from "./components/floor";
import { AudioDriver } from "./context/audio/Audio.driver";
import { Leva } from "leva";

// position: [2, 3, 5]
// [0, 2, 10]

const App = () => {
  const { analyser, dom } = BGM();

  return (
    <CarProvider>
      <Leva hidden />
      {dom}
      <main>
        <p className="audio-instruction">Double Click For Audio</p>
        <UI />
        {/* <Leva
          titleBar={{
            position: {
              x: -100,
              y: 350,
            },
          }}
          /> */}
        <Canvas shadows camera={{ fov: 50, position: [0, 3.5, 0] }}>
          <AudioDriver analyser={analyser} />
          {/* <Stats /> */}
          {/* <orthographicCamera
            left={-2}
            top={2}
            right={2}
            bottom={-2}
            position={[0, -100, 10]}
            lookAt={[0, 0, 0]}
          /> */}
          <Floor />
          <Lights />
          {/* <Car /> */}
          {/* <Tunnel audioAnalyser={analyser} /> */}

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
