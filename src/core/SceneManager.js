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
    this.scene.fog = new THREE.Fog(0x000000, 10, 50); // Add fog for atmosphere

    // Initialize map
    this.officeMap.init(this.scene);

    // Initialize lighting
    this.lightingSystem.init(this.scene);
  }
}