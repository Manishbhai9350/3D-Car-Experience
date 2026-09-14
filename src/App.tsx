import { Canvas } from "@react-three/fiber";
import "./App.css";
import { useProgress } from "@react-three/drei";
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
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
const CanvasRef = useRef<HTMLCanvasElement>(null);

return (
  <>
    <Leva hidden />
    {dom}

    <main>
      <UI visible={!Overlay} />

      <OverlayComponent
        loaded={Loaded}
        overlay={Overlay}
        setOverlay={setOverlay}
      />

      <Canvas
        ref={CanvasRef}
        camera={{ fov: 50, position: [1, 2, 6] }}
      >
        <AudioDriver analyser={analyser} />
        <CameraMovement overlay={Overlay} />
        <Floor />
        <Lights />
        <Cubes />
        <Car />
        <Tunnel audioAnalyser={analyser} />
      </Canvas>
    </main>
  </>
);
};

const OverlayComponent = ({
  loaded = false,
}: {
  loaded: boolean;
}) => {
  const TopRef = useRef<HTMLDivElement>(null);
  const BottomRef = useRef<HTMLDivElement>(null);
  const BarRef = useRef<HTMLDivElement[]>([]);

  const { progress } = useProgress();

  const BARS = 12;
  const RADIUS = 30;
  const WIDTH = 25;

  // Animate loading bars
  useGSAP(() => {
    BarRef.current.forEach((el, i) => {
      if (!el) return;

      const threshold = (i / BARS) * 100;
      const active = progress >= threshold;

      gsap.to(el, {
        opacity: loaded ? 0 : active ? 1 : 0.3,
        duration: 0.2,
        ease: "power2.out",
      });
    });
  }, [progress, loaded]);

  // Open loader when loading is finished
  useGSAP(() => {
    if (!loaded) return;
    if (!TopRef.current || !BottomRef.current) return;

    gsap.to([TopRef.current, BottomRef.current], {
      height: 0,
      duration: 1,
      ease: "power4.inOut",
    });
  }, [loaded]);

  return (
    <>
      {/* Loading indicator */}
      <div className="progres-bar">
        {new Array(BARS).fill(null).map((_, i) => {
          const thetaPerBar = (2 * Math.PI) / BARS;
          const theta = thetaPerBar * i - Math.PI / 2;

          const px = Math.cos(theta) * RADIUS - WIDTH / 2;
          const py = Math.sin(theta) * RADIUS;

          return (
            <div
              ref={(el) => {
                if (el) {
                  BarRef.current[i] = el;
                }
              }}
              className="bar"
              key={i}
              style={{
                opacity: 0.3,
                width: WIDTH,
                position: "absolute",
                transform: `translate(${px}px, ${py}px) rotate(${theta}rad)`,
              }}
            />
          );
        })}
      </div>

      {/* Black loading screen */}
      <div
        ref={TopRef}
        className="overlay top-overlay"
      />

      <div
        ref={BottomRef}
        className="overlay bottom-overlay"
      />
    </>
  );
};

export default App;
