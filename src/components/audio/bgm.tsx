import { useEffect, useRef, useState } from "react";

const BGM = () => {
  const AudioRef = useRef<HTMLAudioElement>(null);
  const [Analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [Played, setPlayed] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const audioContext = new window.AudioContext();
    contextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    setAnalyser(analyser);

    const audioElement = AudioRef.current;
    if (!audioElement) return;

    const source = audioContext.createMediaElementSource(audioElement);

    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }, []);

  useEffect(() => {
    const OnClick = async () => {
      if (!AudioRef.current || Played) return;

      // ✅ Resume context
      await contextRef.current?.resume();

      // ✅ Unmute (important if you ever re-add muted)
      AudioRef.current.muted = false;

      // ✅ Play
      await AudioRef.current.play();

      setPlayed(true);
    };

    window.addEventListener("click", OnClick);

    return () => {
      window.removeEventListener("click", OnClick);
    };
  }, [Played]);

  return {
    dom: (
      <audio loop src="/audio/bg1.mp3" ref={AudioRef} crossOrigin="anonymous" />
    ),
    analyser: Analyser,
  };
};

export default BGM;
