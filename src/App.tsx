import { Canvas } from "@react-three/fiber";
import "./App.css";
import { OrbitControls, Stats } from "@react-three/drei";
import Lights from "./components/lights";
import Tunnel from "./components/tunnel";
import Car from "./components/car";
import UI from "./components/ui";
import BGM from "./components/audio/bgm";
import Floor from "./components/floor";
import { AudioDriver } from "./context/audio/Audio.driver";
import { Leva } from "leva";
import Cubes from "./components/cubes";
import { useEffect, useState } from "react";
import gsap from "gsap";

// position: [2, 3, 5]
// [0, 2, 10]

const App = () => {
  const { analyser, dom } = BGM();

  const [Overlay, setOverlay] = useState(true);

  useEffect(() => {
    

    gsap.to('.overlay',{
      delay:4,
      scaleY:0,
      onComplete(){
        setOverlay(false)
      }
    })
  
    return () => {
      
    }
  }, [])
  

  return (
    <>
      <Leva hidden />
      {dom}
      <main>
        {Overlay && <OverlayComponent />}
        {!Overlay && <UI />}
        {/* <Leva
          titleBar={{
            position: {
              x: -100,
              y: 350,
            },
          }}
          /> */}
        <Canvas camera={{ fov: 50, position: [2, 3, 5] }}>
          <AudioDriver analyser={analyser} />
          <Stats />
          <OrbitControls />
          <Floor />
          <Lights />
          <Cubes />
          {/* <Car /> */}
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
    </>
  );
};


const OverlayComponent = () => {
  return <div>
    <div className="overlay top-overlay"></div>
    <div className="overlay bottom-overlay"></div>
  </div>
}

export default App;
