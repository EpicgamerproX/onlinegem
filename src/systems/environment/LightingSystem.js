import * as THREE from 'three';

export class LightingSystem {
  constructor() {
    this.scene = null;
    this.ambientLight = null;
    this.pointLights = [];
  }

  init(scene) {
    this.scene = scene;

    // Dim ambient light
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(this.ambientLight);

    // Directional light for general illumination
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight);

    // Desk lamp
    const deskLamp = new THREE.PointLight(0xffffff, 0.8, 12);
    deskLamp.position.set(0, 3, 7);
    deskLamp.castShadow = true;
    deskLamp.shadow.mapSize.width = 512;
    deskLamp.shadow.mapSize.height = 512;
    this.scene.add(deskLamp);
    this.pointLights.push(deskLamp);

    // Ceiling light
    const ceilingLight = new THREE.PointLight(0xffffff, 0.6, 18);
    ceilingLight.position.set(0, 4.5, 0);
    ceilingLight.castShadow = true;
    this.scene.add(ceilingLight);
    this.pointLights.push(ceilingLight);

    // Add visual debug helper for lighting
    const helper = new THREE.PointLightHelper(ceilingLight, 0.2, 0xff0000);
    this.scene.add(helper);
  }

  update(deltaTime) {
    // Subtle flickering effect
    this.pointLights.forEach(light => {
      light.intensity += (Math.random() - 0.5) * 0.01;
      light.intensity = Math.max(0.1, Math.min(1, light.intensity));
    });
  }
}