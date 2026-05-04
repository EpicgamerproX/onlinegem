import * as THREE from 'three';

export class FearEffects {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.grainPass = null;
    this.distortionPass = null;
    this.audioContext = null;
    this.breathingSound = null;
  }

  init(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // Create post-processing effects (simplified)
    this.createGrainEffect();
    this.createDistortionEffect();

    // Initialize audio
    this.initAudio();
  }

  createGrainEffect() {
    // Simple grain effect using shader material
    const grainMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        amount: { value: 0 },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        uniform float time;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          float grain = random(vUv + time) * amount;
          gl_FragColor = color + vec4(grain, grain, grain, 0.0);
        }
      `
    });

    // For simplicity, apply to a full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, grainMaterial);
    mesh.position.z = -1;
    this.camera.add(mesh);
  }

  createDistortionEffect() {
    // Simple chromatic aberration
    // Similar shader approach
  }

  initAudio() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Create breathing sound effect
    this.createBreathingSound();
  }

  createBreathingSound() {
    // Simple breathing simulation using oscillator
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

    oscillator.start();
    this.breathingSound = { oscillator, gainNode };
  }

  update(fearRatio) {
    // Update grain
    if (this.grainPass) {
      this.grainPass.uniforms.amount.value = fearRatio * 0.1;
      this.grainPass.uniforms.time.value += 0.01;
    }

    // Update breathing sound
    if (this.breathingSound) {
      const volume = fearRatio * 0.2;
      this.breathingSound.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
    }

    // Add screen shake
    if (fearRatio > 0.5) {
      this.camera.position.x += (Math.random() - 0.5) * fearRatio * 0.01;
      this.camera.position.y += (Math.random() - 0.5) * fearRatio * 0.01;
    }
  }
}