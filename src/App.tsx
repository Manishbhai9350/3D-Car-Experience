import { Canvas } from "@react-three/fiber";
import "./App.css";
import { Stats } from "@react-three/drei";
import Lights from "./components/lights";
import Tunnel from "./components/tunnel";
import UI from "./components/ui";
import BGM from "./components/audio/bgm";
import Floor from "./components/floor";
import { AudioDriver } from "./context/audio/Audio.driver";
import { Leva } from "leva";
import Cubes from "./components/cubes";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CameraMovement from "./components/camera/CameraMove";
import Car from "./components/car";

// position: [2, 3, 5]
// [0, 2, 10]

const App = () => {
  const { analyser, dom } = BGM();

  const [Overlay, setOverlay] = useState(true);

  useEffect(() => {
    gsap.to(".overlay", {
      delay: 0,
      scaleY: 0,
      onComplete() {
        setOverlay(false);
      },
    });

    return () => {};
  }, []);

  // const { bokehScale, focalLength, focusDistance, height } = useControls({
  //   focusDistance: {
  //     min: 0,
  //     max: 30,
  //     value: 16,
  //   },
  //   focalLength: {
  //     min: 0,
  //     max: 30,
  //     value: 21,
  //   },
  //   bokehScale: {
  //     min: 0,
  //     max: 30,
  //     value: 1.5,
  //   },
  //   height: {
  //     min: 0,
  //     max: 30,
  //     value: 30,
  //   },
  // });

  return (
    <>
      <Leva hidden />
      {dom}
      <main>
        <OverlayComponent overlay={Overlay} setOverlay={setOverlay} />
        <UI visible={!Overlay} />
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
          <CameraMovement overlay={Overlay} />
          <Floor />
          <Lights />
          <Cubes />
          <Car />
          <Tunnel audioAnalyser={analyser} />

          {/* <EffectComposer>
            <DepthOfField
              focusDistance={focusDistance} // normalized — 0 = camera near, focus on car
              focalLength={focalLength} // shorter = tighter focus range
              bokehScale={bokehScale} // size of bokeh circles on blurred areas
              height={height} // resolution — lower = softer/cheaper bokeh
            />
          </EffectComposer> */}
        </Canvas>
      </main>
    </>
  );
};

const OverlayComponent = ({
  overlay = false,
  setOverlay = () => {},
}: {
  overlay: boolean;
  setOverlay: Dispatch<SetStateAction<boolean>>;
}) => {
  const TopRef = useRef(null);
  const BottomRef = useRef(null);
  const TimeOutID = useRef(0);

  useGSAP(() => {
    if (!TopRef.current || !BottomRef.current || !overlay) return;

    const OnMouseDown = () => {
      clearTimeout(TimeOutID.current);
      document.body.style.cursor = "grabbing";

      TimeOutID.current = setTimeout(() => {
        setOverlay(true);
      }, 200);
    };
    const OnMouseUP = () => {
      clearTimeout(TimeOutID.current);
      document.body.style.cursor = "grab";
      setOverlay(false);
    };

    window.addEventListener("mousedown", OnMouseDown);
    window.addEventListener("mouseup", OnMouseUP);

    return () => {
      window.removeEventListener("mousedown", OnMouseDown);
      window.removeEventListener("mouseup", OnMouseUP);
    };
  }, [overlay]);

  useEffect(() => {
    if (overlay) {
      gsap.to([TopRef.current, BottomRef.current], {
        scaleY: 1,
      });
    } else {
      gsap.to([TopRef.current, BottomRef.current], {
        scaleY: 0,
      });
    }

    return () => {};
  }, [overlay]);

  return (
    <div>
      <div ref={TopRef} className="overlay top-overlay"></div>
      <div ref={BottomRef} className="overlay bottom-overlay"></div>
    </div>
  );
};

export default App;
