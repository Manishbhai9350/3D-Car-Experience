import { useEffect, useRef, useState } from "react";
import { UseAudio } from "../../context/audio/audio.context";

const BGM = () => {
  const AudioRef = useRef<HTMLAudioElement>(null);
  const [Analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const { played, setPlayed } = UseAudio();

  useEffect(() => {
    const audioContext = new window.AudioContext();
    contextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    // analyser.smoothingTimeConstant = 0.8;

    setAnalyser(analyser);

    const audioElement = AudioRef.current;
    if (!audioElement) return;

    const source = audioContext.createMediaElementSource(audioElement);

    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }, []);

  useEffect(() => {
    const ToggleAudio = async () => {
      if (!AudioRef.current) return;

      if (!played) {
        // ✅ Unmute (important if you ever re-add muted)
        AudioRef.current.muted = true;

        // ✅ Play
        await AudioRef.current.pause();
      } else {
        // ✅ Resume context
        await contextRef.current?.resume();

        // ✅ Unmute (important if you ever re-add muted)
        AudioRef.current.muted = false;

        // ✅ Play
        await AudioRef.current.play();
      }
    };

    ToggleAudio();

    return () => {};
  }, [played, setPlayed]);

  return {
    dom: (
      <audio loop src="/audio/bg1.mp3" ref={AudioRef} crossOrigin="anonymous" />
    ),
    analyser: Analyser,
    setPlayed,
  };
};

export default BGM;
