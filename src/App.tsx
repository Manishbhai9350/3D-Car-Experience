import { Canvas } from "@react-three/fiber";
import "./App.css";
import { Progress, Stats, useProgress } from "@react-three/drei";
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
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import useWindow from "./hooks/useWindow";
import Car from "./components/car";
import CameraMovement from "./components/camera/CameraMove";

// position: [2, 3, 5]
// [0, 2, 10]

const App = () => {
  const { analyser, dom } = BGM();

  const LoadingTimeoutRef = useRef(0);

  const [Overlay, setOverlay] = useState(true);
  const [Loaded, setLoaded] = useState(false);

  const { progress } = useProgress();

  useEffect(() => {
    if (progress == 100) {
      clearTimeout(LoadingTimeoutRef.current);
      LoadingTimeoutRef.current = setTimeout(() => {
        setLoaded(true);
        setOverlay(false);
      }, 500);
    }

    return () => {};
  }, [progress]);

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
      <OverlayComponent
        loaded={Loaded}
        overlay={Overlay}
        setOverlay={setOverlay}
      />
      {true && (
        <main>
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
      )}
    </>
  );
};

const OverlayComponent = ({
  loaded = false,
  overlay = false,
  setOverlay = () => {},
}: {
  loaded: boolean;
  overlay: boolean;
  setOverlay: Dispatch<SetStateAction<boolean>>;
}) => {
  const TopRef = useRef(null);
  const BottomRef = useRef(null);
  const TimeOutID = useRef(0);
  const BarRef = useRef<(HTMLDivElement | null)[]>([]);

  const { size } = useWindow();

  const OverlayHeight = useMemo(
    () => (!loaded ? innerHeight / 2 : size.width < 900 ? 40 : 50),
    [size.width, loaded],
  );

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
      document.body.style.cursor = "grab";
      clearTimeout(TimeOutID.current);
      setOverlay(false);
    };

    window.addEventListener("mousedown", OnMouseDown);
    window.addEventListener("mouseup", OnMouseUP);

    return () => {
      window.removeEventListener("mousedown", OnMouseDown);
      window.removeEventListener("mouseup", OnMouseUP);
    };
  }, [overlay, loaded]);

  useEffect(() => {
    if (overlay) {
      gsap.to([TopRef.current, BottomRef.current], {
        height: OverlayHeight,
      });
    } else {
      gsap.to([TopRef.current, BottomRef.current], {
        height: 0,
      });
    }

    return () => {};
  }, [overlay, OverlayHeight]);

  const { progress } = useProgress();

  const BARS = 12;
  const RADIUS = 30;
  const WIDTH = 25;

  useGSAP(() => {
    BarRef.current.forEach((el, i) => {
      const Prog = i / BARS;
      const Active = progress > Prog * 100;
      gsap.to(el, {
        opacity: loaded ? 0 : Active ? 1 : 0.3,
      });
    });

    return () => {};
  }, [progress, loaded]);

  return (
    <div>
      {
        <div className="progres-bar">
          {new Array(BARS).fill("_").map((_, i) => {
            const ThetaPerBar = (2 * Math.PI) / BARS;
            const Theta = ThetaPerBar * i - Math.PI / 2;

            const PX = Math.cos(Theta) * RADIUS - WIDTH / 2;
            const PY = Math.sin(Theta) * RADIUS;

            return (
              <div
                ref={(el) => (BarRef.current[i] = el)}
                className="bar"
                key={i}
                style={{
                  opacity: 0.3,
                  width: WIDTH,
                  position: "absolute",
                  transform: `translate(${PX}px,${PY}px) rotate(${Theta}rad)`,
                }}
              ></div>
            );
          })}
        </div>
      }
      <div ref={TopRef} className="overlay top-overlay"></div>
      <div ref={BottomRef} className="overlay bottom-overlay"></div>
    </div>
  );
};

export default App;
