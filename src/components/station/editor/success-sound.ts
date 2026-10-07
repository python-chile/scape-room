const STORAGE_KEY = "pyschool-success-sound";

let enabled = readPreference();
let audioContext: AudioContext | undefined;

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function getSuccessSoundPreference(): boolean {
  return enabled;
}

export function setSuccessSoundPreference(value: boolean): void {
  enabled = value;

  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    return;
  }
}

export function prepareSuccessSound(): void {
  if (!enabled) {
    return;
  }

  try {
    audioContext ??= new AudioContext();

    if (audioContext.state === "suspended") {
      void audioContext.resume().catch(() => undefined);
    }
  } catch {
    return;
  }
}

export function playSuccessSound(): void {
  if (!enabled || !audioContext || audioContext.state !== "running") {
    return;
  }

  const context = audioContext;
  const startTime = context.currentTime;

  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = startTime + index * 0.12;
    const end = start + 0.22;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.015);
    gain.gain.linearRampToValueAtTime(0, end);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };

    oscillator.start(start);
    oscillator.stop(end);
  });
}
