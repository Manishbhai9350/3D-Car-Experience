import { useRef } from "react";
import Cube from "./components/cube";

const xoffset = -2;

const CubesData = [
  {
    position: [xoffset, 0.5, -0.05 + 10],
    rotation: [Math.PI, 0, 0],
  },
  {
    position: [1 + xoffset, 0.5, 0.1 + 10],
    rotation: [0, 0, 0],
  },
  {
    position: [-1.2 + xoffset, 0.5, 10],
    rotation: [Math.PI, 0.2, 0],
  },
  {
    position: [-0.4 + xoffset, 1.5, 10],
    rotation: [0, 0.2, 0],
  },
];

const Cubes = () => {
  return CubesData.map((c, i) => {
    return <Cube key={i} {...c} />;
  });
};

export default Cubes;
