export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.ambientSounds = [];
    this.fakeSoundTimer = null;
  }

  init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create ambient hum
    this.createAmbientHum();

    // Create occasional fake sounds
    this.scheduleFakeSounds();
  }

  createAmbientHum() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime); // Low hum
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime); // Quiet

    oscillator.start();
    this.ambientSounds.push({ oscillator, gainNode });
  }

  scheduleFakeSounds() {
    // Schedule random fake sounds
    this.fakeSoundTimer = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        this.playFakeSound();
      }
    }, 10000); // Every 10 seconds
  }

  playFakeSound() {
    this.playTransient({ type: 'static', intensity: 0.1, duration: 2 });
  }

  playTransient({ type = 'static', intensity = 0.1, duration = 1 } = {}) {
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    const frequency = {
      steps: 90,
      keyboard: 520,
      metal: 180,
      ceramic: 320,
      phone: 420,
      voice_fragment: 260,
      server: 70,
      breaker: 130,
      speaker: 330,
      static: 220
    }[type] || 220;
    oscillator.frequency.setValueAtTime(frequency + Math.random() * frequency * 0.35, now);
    oscillator.type = type === 'voice_fragment' ? 'triangle' : type === 'steps' ? 'sine' : type === 'ceramic' ? 'triangle' : type === 'phone' ? 'sine' : 'sawtooth';

    gainNode.gain.setValueAtTime(intensity, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start();
    oscillator.stop(now + duration);
  }
}
