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
        // castShadow
      />
      <spotLight
        color={[1, 1, 1]}
        intensity={400}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 2]}
        shadow-bias={-0.0001}
        castShadow
      />
      <pointLight 
        position={[0,1,0]}
        color={0xffffff}
        intensity={10}
      />
      <ambientLight 
        color={0xffffff}
        intensity={15}
      />
      <color attach={"background"} args={["#000000"]} />
    </>
  );
};

export default Lights;
