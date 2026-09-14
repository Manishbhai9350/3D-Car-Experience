import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const CameraMovement = () => {
  const { camera } = useThree();

  const mouse = useRef({
    x: 0,
    y: 0,
  });

  const target = useRef(new THREE.Vector3());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame(() => {
    // Your scene's center point
    const center = new THREE.Vector3(0, 1, 0);

    // Small mouse influence
    const offsetX = mouse.current.x * 0.5;
    const offsetY = -mouse.current.y * 0.2;

    target.current.lerp(
      new THREE.Vector3(
        center.x + offsetX,
        center.y + offsetY,
        center.z
      ),
      0.08
    );

    camera.lookAt(target.current);
  });

  return null;
};

export default CameraMovement;