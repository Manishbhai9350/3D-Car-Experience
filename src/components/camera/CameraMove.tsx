import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect } from "react";

interface CameraMovementProps {
  overlay: boolean;
}

const CameraMovement = ({ overlay = true }: CameraMovementProps) => {
  const { camera } = useThree();

  useEffect(() => {
    if (!camera) return;

    const targetFov = !overlay ? 50 : 45;

    gsap.to(camera, {
      fov: targetFov,
      duration: 0.7,
      ease: "power2.out",
      onUpdate: () => {
        camera.updateProjectionMatrix(); // ⚠️ VERY IMPORTANT
      },
    });
  }, [overlay, camera]);

  return <CameraControls />;
};

export default CameraMovement;
