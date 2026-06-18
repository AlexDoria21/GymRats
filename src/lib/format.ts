/** Seconds -> "m:ss" */
export function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return m + ':' + (ss < 10 ? '0' : '') + ss;
}

/** Circumference of the timer ring (r = 52 => 2*pi*r). */
export const RING_CIRCUMFERENCE = 326.7;

export function ringDashOffset(total: number, remaining: number): number {
  return RING_CIRCUMFERENCE * (1 - (total ? remaining / total : 0));
}

export function openVideo(url: string): void {
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

/** Build a YouTube search URL for an exercise guide from its name. */
export function youtubeSearch(name: string): string {
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' tecnica');
}

/** Three short beeps via the Web Audio API. */
export function beep(): void {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.18);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.2);
    });
  } catch {
    /* audio not allowed — ignore */
  }
}
