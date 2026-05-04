export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.ambientSounds = [];
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
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        this.playFakeSound();
      }
    }, 10000); // Every 10 seconds
  }

  playFakeSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(200 + Math.random() * 800, this.audioContext.currentTime);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 2);
  }
}