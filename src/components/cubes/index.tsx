import { useRef } from "react";
import Cube from "./components/cube";

const CubesData = [
  {
    position: [0, 0.5, -.05],
    rotation: [0,0,0]
},
{
    position: [1, 0.5, .1],
    rotation: [0,0,0]
},
{
    position: [-1.2, 0.5, 0],
    rotation: [0,.2,0]
},
{
    position: [-0.4, 1.5, 0],
    rotation: [0,.2,0]
},
];

const Cubes = () => {
  const CubesDataRef = useRef(CubesData);
  const CubesRef = useRef([]);

  return CubesData.map((c, i) => {
    return <Cube key={i} {...c} />;
  });
};

export default Cubes;
