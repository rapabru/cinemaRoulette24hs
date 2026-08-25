const SOUND_STORAGE_KEY = 'cyber_sound_enabled';

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedContext) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      sharedContext = new Ctor();
    }
    if (sharedContext.state === 'suspended') {
      sharedContext.resume().catch(() => {});
    }
    return sharedContext;
  } catch {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  if (stored === null) return true;
  return stored === 'on';
}

export const SOUND_CHANGED_EVENT = 'cyber-sound-changed';

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off');
  window.dispatchEvent(new CustomEvent(SOUND_CHANGED_EVENT, { detail: enabled }));
}

function playTone(freq: number, startOffset: number, duration: number, ctx: AudioContext, gainValue: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  const startTime = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/** Short arcade "tick" — one reel step of the slot machine. */
export function playReelTick(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(320, 0, 0.05, ctx, 0.06);
}

/** Little 3-note chime on landing on the drawn movie. */
export function playWinChime(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(523.25, 0, 0.14, ctx, 0.08); // C5
  playTone(659.25, 0.09, 0.14, ctx, 0.08); // E5
  playTone(783.99, 0.18, 0.22, ctx, 0.09); // G5
}
