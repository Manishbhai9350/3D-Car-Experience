import CubeGroup, { type CubeGroupProps } from "./components/cube-group";

const CubesData: CubeGroupProps[] = [
  {
    rotation: [0, 1, 0],
    position: [-10,0,0],
    scale: .7,
    cubes: [
      {
        position: [0, 0.5, -0.05 + 10],
        rotation: [Math.PI, 0, 0],
      },
      {
        position: [1, 0.5, 0.1 + 10],
        rotation: [0, 0, 0],
      },
      {
        position: [-1.2, 0.5, 10],
        rotation: [Math.PI, 0.2, 0],
      },
      {
        position: [-0.4, 1.5, 10],
        rotation: [0, 0.2, 0],
      },
    ],
  },
];

const Cubes = () => {
  return CubesData.map((C, i) => {
    return <CubeGroup key={i} {...C} />;
  });
};

export default Cubes;
