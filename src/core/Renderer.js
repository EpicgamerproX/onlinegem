import * as THREE from 'three';

export class Renderer {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }

  init(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.renderer = new THREE.WebGLRenderer({ antialias: false }); // Disable antialias for performance
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Tone mapping for better visuals
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;
    this.renderer.setClearColor(0x111111, 1); // Dark gray background to confirm rendering

    console.log('Canvas created:', this.renderer.domElement);
    document.getElementById('game-container').appendChild(this.renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    // Test rendering by changing background color
    const time = Date.now() * 0.001;
    const r = Math.sin(time) * 0.1 + 0.1;
    const g = Math.sin(time + 2) * 0.1 + 0.1;
    const b = Math.sin(time + 4) * 0.1 + 0.1;
    this.renderer.setClearColor(new THREE.Color(r, g, b), 1);

    this.renderer.render(this.scene, this.camera);
  }
}