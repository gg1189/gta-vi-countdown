export type CountdownScore = {
  resume: () => Promise<void>;
  tick: (secondsLeft: number) => void;
  boom: () => void;
  startRiser: (seconds: number) => void;
  stop: () => void;
};

export function createCountdownScore(): CountdownScore {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.28;
  master.connect(ctx.destination);

  const live: AudioNode[] = [];

  function envGain(peak: number, attack: number, release: number) {
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
    g.connect(master);
    return g;
  }

  return {
    resume() {
      return ctx.resume();
    },
    tick(secondsLeft: number) {
      const osc = ctx.createOscillator();
      const g = envGain(0.22, 0.01, 0.16);
      osc.type = secondsLeft <= 3 ? "square" : "triangle";
      osc.frequency.value = 196 + (11 - secondsLeft) * 48;
      osc.connect(g);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    },
    boom() {
      const osc = ctx.createOscillator();
      const g = envGain(0.34, 0.02, 0.7);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(196, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.55);
      osc.connect(g);
      osc.start();
      osc.stop(ctx.currentTime + 0.75);

      const noiseLen = Math.floor(ctx.sampleRate * 0.4);
      const buffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < noiseLen; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const ng = envGain(0.2, 0.005, 0.35);
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 800;
      noise.connect(filter);
      filter.connect(ng);
      noise.start();
    },
    startRiser(seconds: number) {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(5200, ctx.currentTime + seconds);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(70, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + seconds);
      g.gain.setValueAtTime(0.015, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + seconds);
      osc.connect(filter);
      filter.connect(g);
      g.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + seconds + 0.05);
      live.push(osc, filter, g);
    },
    stop() {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(0.0001, t, 0.05);
      window.setTimeout(() => {
        void ctx.close();
      }, 180);
    },
  };
}
