import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { audioBus } from "./audio.bus";

interface AudioDriverProps {
  analyser: AnalyserNode | null;
}

// Mount this ONCE, inside <Canvas>. It does no rendering itself.
export const AudioDriver = ({ analyser }: AudioDriverProps) => {
  useEffect(() => {
    audioBus.setAnalyser(analyser);
  }, [analyser]);

  useFrame((_, delta) => {
    audioBus.tick(delta);
  });

  return null;
};