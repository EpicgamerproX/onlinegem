import { audioConfig } from '../../config/audioConfig.js';

export class MicAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.noiseLevel = 0;
    this.smoothedLevel = 0;
    this.smoothingFactor = 0.1;
    this.isInitialized = false;
  }

  async init() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      // Prepare data array
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.isInitialized = true;
      console.log('Microphone initialized');
    } catch (error) {
      console.error('Failed to initialize microphone:', error);
      // Fallback: simulate noise for testing
      this.simulateNoise();
    }
  }

  simulateNoise() {
    // For testing without mic
    setInterval(() => {
      this.noiseLevel = Math.random() * 0.5; // Random noise 0-0.5
    }, 100);
  }

  update() {
    if (!this.isInitialized && !this.simulateNoise) return;

    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i];
      }
      this.noiseLevel = sum / this.dataArray.length / 255; // Normalize to 0-1
    }

    this.smoothedLevel = this.smoothedLevel * (1 - this.smoothingFactor) + this.noiseLevel * this.smoothingFactor;
  }

  getNoiseLevel() {
    return this.smoothedLevel;
  }

  getNoiseCategory() {
    const level = this.getNoiseLevel();
    if (level < audioConfig.silentThreshold) return 'silent';
    if (level < audioConfig.lowNoiseThreshold) return 'low';
    if (level < audioConfig.loudNoiseThreshold) return 'loud';
    return 'very_loud';
  }
}