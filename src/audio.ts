type Tone = {
  frequency: number;
  duration: number;
  gain?: number;
  type?: OscillatorType;
};

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextCtor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  return new AudioContextCtor();
}

function playSequence(sequence: Tone[]): void {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  void context.resume();
  let cursor = context.currentTime + 0.02;

  sequence.forEach((tone) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = tone.type ?? 'triangle';
    oscillator.frequency.setValueAtTime(tone.frequency, cursor);
    gainNode.gain.setValueAtTime(0.0001, cursor);
    gainNode.gain.exponentialRampToValueAtTime(
      tone.gain ?? 0.08,
      cursor + 0.02,
    );
    gainNode.gain.exponentialRampToValueAtTime(0.0001, cursor + tone.duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(cursor);
    oscillator.stop(cursor + tone.duration + 0.03);

    cursor += tone.duration;
  });
}

export function playRollSound(): void {
  playSequence([
    { frequency: 420, duration: 0.07, gain: 0.05 },
    { frequency: 540, duration: 0.07, gain: 0.05 },
    { frequency: 700, duration: 0.1, gain: 0.06 },
  ]);
}

export function playSuccessSound(): void {
  playSequence([
    { frequency: 520, duration: 0.09, gain: 0.06, type: 'sine' },
    { frequency: 660, duration: 0.1, gain: 0.06, type: 'sine' },
    { frequency: 880, duration: 0.16, gain: 0.07, type: 'sine' },
  ]);
}

export function playErrorSound(): void {
  playSequence([
    { frequency: 320, duration: 0.09, gain: 0.04, type: 'square' },
    { frequency: 240, duration: 0.12, gain: 0.04, type: 'square' },
  ]);
}

export function playVictorySound(): void {
  playSequence([
    { frequency: 523.25, duration: 0.1, gain: 0.05, type: 'sine' },
    { frequency: 659.25, duration: 0.1, gain: 0.05, type: 'sine' },
    { frequency: 783.99, duration: 0.1, gain: 0.06, type: 'sine' },
    { frequency: 1046.5, duration: 0.22, gain: 0.08, type: 'sine' },
  ]);
}
