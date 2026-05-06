import * as THREE from 'three';
import { OfficeMap } from '../world/OfficeMap.js';
import { LightingSystem } from '../systems/environment/LightingSystem.js';

export class SceneManager {
  constructor() {
    this.scene = null;
    this.officeMap = new OfficeMap();
    this.lightingSystem = new LightingSystem();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050707);
    this.scene.fog = new THREE.FogExp2(0x050707, 0.055);

    // Initialize map
    this.officeMap.init(this.scene);

    // Initialize lighting
    this.lightingSystem.init(this.scene);
  }

  update(deltaTime) {
    this.lightingSystem.update(deltaTime);
  }
}
