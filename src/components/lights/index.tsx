import React from "react";

const Lights = () => {
  return (
    <>
      <spotLight
        color={[0.14, 0.5, 1]}
        intensity={400}
        angle={0.6}
        penumbra={0.5}
        position={[-5, 5, -2]}
        shadow-bias={-0.0001}
        castShadow
      />
      <spotLight
        color={[1, 1, 1]}
        intensity={600}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 2]}
        shadow-bias={-0.0001}
        castShadow
      />
      {/* <ambientLight args={[0xffffff,.5]} /> */}
      <color attach={"background"} args={["#000000"]} />
    </>
  );
};

export default Lights;
