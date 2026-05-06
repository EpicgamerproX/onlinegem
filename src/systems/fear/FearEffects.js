import * as THREE from 'three';

export class FearEffects {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.grainPass = null;
    this.distortionPass = null;
    this.audioContext = null;
    this.breathingSound = null;
    this.jumpScare = null;
    this.baseCameraPosition = new THREE.Vector3();
    this.lastShakeOffset = new THREE.Vector3();
  }

  init(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.scene.add(this.camera);
    this.baseCameraPosition.copy(this.camera.position);

    // Create post-processing effects (simplified)
    this.createGrainEffect();
    this.createDistortionEffect();

    // Initialize audio
    this.initAudio();
  }

  createGrainEffect() {
    const grainMaterial = new THREE.ShaderMaterial({
      uniforms: {
        amount: { value: 0 },
        time: { value: 0 },
        tint: { value: new THREE.Color(0x8f1f1f) }
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform float amount;
        uniform float time;
        uniform vec3 tint;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
          vec2 centered = vUv - 0.5;
          float vignette = smoothstep(0.78, 0.18, length(centered));
          float grain = random(vUv * vec2(900.0, 520.0) + time) * amount;
          float alpha = clamp((1.0 - vignette) * amount * 1.7 + grain, 0.0, 0.42);
          gl_FragColor = vec4(tint, alpha);
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, grainMaterial);
    mesh.renderOrder = 50;
    this.camera.add(mesh);
    this.grainPass = grainMaterial;
  }

  createDistortionEffect() {
    this.createJumpScareOverlay();
  }

  createJumpScareOverlay() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(256, 230, 35, 256, 256, 250);
    gradient.addColorStop(0, '#f4efe2');
    gradient.addColorStop(0.55, '#3b1a1a');
    gradient.addColorStop(1, '#030303');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.ellipse(256, 265, 155, 205, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8ead3';
    ctx.beginPath();
    ctx.ellipse(190, 220, 34, 14, -0.1, 0, Math.PI * 2);
    ctx.ellipse(322, 220, 34, 14, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#120000';
    ctx.beginPath();
    ctx.ellipse(256, 330, 62, 82, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f8ead3';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(170, 160);
    ctx.quadraticCurveTo(205, 138, 238, 158);
    ctx.moveTo(274, 158);
    ctx.quadraticCurveTo(310, 138, 346, 160);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 1.65), material);
    mesh.position.set(0, 0, -0.72);
    mesh.renderOrder = 100;
    this.camera.add(mesh);

    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false
    });
    const flash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), flashMaterial);
    flash.position.set(0, 0, -0.71);
    flash.renderOrder = 99;
    this.camera.add(flash);

    this.jumpScare = {
      mesh,
      flash,
      elapsed: 0,
      duration: 1.25,
      active: false,
      triggered: false
    };
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

  update(fearRatio, deltaTime = 0) {
    this.camera.position.sub(this.lastShakeOffset);
    this.lastShakeOffset.set(0, 0, 0);

    // Update grain
    if (this.grainPass) {
      this.grainPass.uniforms.amount.value = fearRatio * 0.22;
      this.grainPass.uniforms.time.value += deltaTime;
    }

    // Update breathing sound
    if (this.breathingSound) {
      const volume = fearRatio * 0.2;
      this.breathingSound.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
    }

    // Add screen shake
    if (fearRatio > 0.5) {
      const shake = (fearRatio - 0.5) * 0.025;
      this.lastShakeOffset.x += (Math.random() - 0.5) * shake;
      this.lastShakeOffset.y += (Math.random() - 0.5) * shake;
    }

    this.updateJumpScare(deltaTime);
    this.camera.position.add(this.lastShakeOffset);
  }

  triggerJumpScare() {
    if (!this.jumpScare || this.jumpScare.triggered) return;

    this.jumpScare.active = true;
    this.jumpScare.triggered = true;
    this.jumpScare.elapsed = 0;

    if (this.audioContext) {
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(92, now);
      oscillator.frequency.exponentialRampToValueAtTime(38, now + 0.35);
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.55, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.72);
    }
  }

  updateJumpScare(deltaTime) {
    if (!this.jumpScare || !this.jumpScare.active) return;

    this.jumpScare.elapsed += deltaTime;
    const progress = Math.min(1, this.jumpScare.elapsed / this.jumpScare.duration);
    const attack = Math.min(1, progress * 8);
    const release = 1 - THREE.MathUtils.smoothstep(progress, 0.55, 1);
    const opacity = attack * release;

    this.jumpScare.mesh.material.opacity = opacity;
    this.jumpScare.flash.material.opacity = Math.max(0, 0.65 - progress * 2.6);
    this.jumpScare.mesh.scale.setScalar(1 + progress * 0.55);

    const shake = 0.09 * opacity;
    this.lastShakeOffset.x += (Math.random() - 0.5) * shake;
    this.lastShakeOffset.y += (Math.random() - 0.5) * shake;

    if (progress >= 1) {
      this.jumpScare.active = false;
      this.jumpScare.mesh.material.opacity = 0;
      this.jumpScare.flash.material.opacity = 0;
    }
  }
}
