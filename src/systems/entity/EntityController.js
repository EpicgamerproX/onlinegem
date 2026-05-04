import * as THREE from 'three';
import { entityConfig } from '../../config/entityConfig.js';

export class EntityController {
  constructor() {
    this.scene = null;
    this.entity = null;
    this.distance = 20; // Start far away
    this.minDistance = 2;
    this.approachSpeed = 0.5;
    this.playerPosition = new THREE.Vector3();
  }

  init(scene) {
    this.scene = scene;

    // Create invisible entity (represented by a debug sphere for now)
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false }); // Invisible
    this.entity = new THREE.Mesh(geometry, material);
    this.entity.position.set(0, 1, -this.distance);
    this.scene.add(this.entity);
  }

  update(noiseLevel, deltaTime, camera) {
    if (camera) {
      this.playerPosition.copy(camera.position);
    }

    // Calculate approach speed based on noise
    let speedMultiplier = 1;
    if (noiseLevel > 0.3) speedMultiplier = 3; // Loud noise
    else if (noiseLevel > 0.15) speedMultiplier = 2; // Low noise
    else if (noiseLevel < 0.05) speedMultiplier = 0.5; // Silent

    // Approach player
    const direction = new THREE.Vector3().subVectors(this.playerPosition, this.entity.position).normalize();
    this.entity.position.addScaledVector(direction, this.approachSpeed * speedMultiplier * deltaTime);

    // Update distance
    this.distance = this.entity.position.distanceTo(this.playerPosition);

    // Clamp minimum distance
    if (this.distance < this.minDistance) {
      this.distance = this.minDistance;
      // Trigger end condition
      console.log('Entity reached player - Game Over');
    }
  }

  getEntityDistance() {
    return this.distance;
  }

  getEntityPosition() {
    return this.entity.position.clone();
  }
}