import * as THREE from 'three';

export class LightingSystem {
  constructor() {
    this.scene = null;
    this.ambientLight = null;
    this.directionalLight = null;
    this.pointLights = [];
    this.flickerTime = 0;
  }

  init(scene) {
    this.scene = scene;

    // Dim, cool ambient fill keeps silhouettes readable without flattening the room.
    this.ambientLight = new THREE.AmbientLight(0x9aa7a0, 0.18);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xbac6bd, 0.18);
    this.directionalLight.position.set(-4, 8, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.camera.far = 24;
    this.directionalLight.shadow.camera.left = -12;
    this.directionalLight.shadow.camera.right = 12;
    this.directionalLight.shadow.camera.top = 12;
    this.directionalLight.shadow.camera.bottom = -12;
    this.scene.add(this.directionalLight);

    // Desk lamp
    const deskLamp = new THREE.PointLight(0xffdca8, 1.45, 7.5, 1.8);
    deskLamp.position.set(0, 2.25, 4.8);
    deskLamp.castShadow = true;
    deskLamp.shadow.mapSize.width = 512;
    deskLamp.shadow.mapSize.height = 512;
    this.scene.add(deskLamp);
    this.pointLights.push(deskLamp);

    [
      [-5.5, 4.55, -3.2],
      [0, 4.55, -3.2],
      [5.5, 4.55, -3.2]
    ].forEach(([x, y, z]) => {
      const ceilingLight = new THREE.PointLight(0xd8fff4, 0.55, 8, 2.1);
      ceilingLight.position.set(x, y, z);
      ceilingLight.castShadow = true;
      ceilingLight.shadow.mapSize.width = 512;
      ceilingLight.shadow.mapSize.height = 512;
      this.scene.add(ceilingLight);
      this.pointLights.push(ceilingLight);
    });
  }

  update(deltaTime) {
    this.flickerTime += deltaTime;

    this.pointLights.forEach((light, index) => {
      const pulse = Math.sin(this.flickerTime * (7 + index * 1.7)) * 0.045;
      const buzz = Math.sin(this.flickerTime * (23 + index * 3.1)) * 0.018;
      const failureDip = Math.sin(this.flickerTime * 0.45 + index) > 0.985 ? -0.22 : 0;
      const baseIntensity = index === 0 ? 1.45 : 0.55;
      light.intensity = Math.max(0.08, baseIntensity + pulse + buzz + failureDip);
    });
  }
}
