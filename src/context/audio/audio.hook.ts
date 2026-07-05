import { useEffect, useRef } from "react";
import { audioBus, type AudioCallback } from "./audio.bus";

export const useOnAudio = (callback: AudioCallback) => {
  // keep latest callback without re-subscribing every render,
  // same trick drei's useFrame uses internally
  const callbackRef = useRef(callback);

  useEffect(() => {
    const stable: AudioCallback = (data, average, delta) =>
      callbackRef.current(data, average, delta);

    return audioBus.subscribe(stable);
  }, []);
};
