export type AudioCallback = (
  frequencyData: Uint8Array,
  average: number,
  delta: number
) => void;

class AudioBus {
  private analyser: AnalyserNode | null = null;
  private data: Uint8Array | null = null;
  private callbacks = new Set<AudioCallback>();

  setAnalyser(analyser: AnalyserNode | null) {
    this.analyser = analyser;
    this.data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
  }

  subscribe(cb: AudioCallback) {
    this.callbacks.add(cb);
    return () => {
      this.callbacks.delete(cb);
    };
  }

  // called once per frame by <AudioDriver />
  tick(delta: number) {
    if (!this.analyser || !this.data) return;

    this.analyser.getByteFrequencyData(this.data);

    let sum = 0;
    for (let i = 0; i < this.data.length; i++) sum += this.data[i];
    const average = sum / this.data.length / 255;

    // same Uint8Array reference every frame — subscribers must
    // treat it as read-only / copy it if they need to keep it
    this.callbacks.forEach((cb) => cb(this.data as Uint8Array, average, delta));
  }
}

export const audioBus = new AudioBus();