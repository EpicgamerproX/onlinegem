import * as THREE from 'three';
import { entityConfig } from '../../config/entityConfig.js';

export class EntityController {
  constructor() {
    this.scene = null;
    this.entity = null;
    this.distance = entityConfig.initialDistance;
    this.minDistance = entityConfig.minDistance;
    this.approachSpeed = entityConfig.baseApproachSpeed;
    this.playerPosition = new THREE.Vector3();
    this.hasReachedPlayer = false;
  }

  init(scene) {
    this.scene = scene;

    this.entity = this.createEntityMesh();
    this.entity.position.set(0, 1.2, -this.distance);
    this.scene.add(this.entity);
  }

  createEntityMesh() {
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      emissive: 0x070101,
      roughness: 0.94,
      metalness: 0
    });
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xfff2d8 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.35, 6, 12), bodyMaterial);
    body.position.y = 0.15;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 18), bodyMaterial);
    head.position.y = 1.08;
    head.scale.set(0.78, 1.05, 0.72);
    head.castShadow = true;
    group.add(head);

    [-0.15, 0.15].forEach(x => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeMaterial);
      eye.position.set(x, 1.15, 0.34);
      group.add(eye);
    });

    group.traverse(child => {
      child.visible = false;
    });

    return group;
  }

  update(noiseLevel, deltaTime, camera) {
    if (camera) {
      this.playerPosition.copy(camera.position);
    }

    let speedMultiplier = entityConfig.noiseSpeedMultiplier.low;
    if (noiseLevel > 0.3) speedMultiplier = entityConfig.noiseSpeedMultiplier.veryLoud;
    else if (noiseLevel > 0.15) speedMultiplier = entityConfig.noiseSpeedMultiplier.loud;
    else if (noiseLevel < 0.05) speedMultiplier = entityConfig.noiseSpeedMultiplier.silent;

    // Approach player
    const direction = new THREE.Vector3().subVectors(this.playerPosition, this.entity.position).normalize();
    if (Number.isFinite(direction.x)) {
      this.entity.position.addScaledVector(direction, this.approachSpeed * speedMultiplier * deltaTime);
    }

    // Update distance
    this.distance = this.entity.position.distanceTo(this.playerPosition);
    this.entity.lookAt(this.playerPosition.x, this.entity.position.y, this.playerPosition.z);
    this.updateVisibility();

    // Clamp minimum distance
    if (this.distance < this.minDistance) {
      this.distance = this.minDistance;
      this.hasReachedPlayer = true;
    }
  }

  updateVisibility() {
    const shouldShow = this.distance < 8;
    this.entity.traverse(child => {
      child.visible = shouldShow;
    });

    const scale = THREE.MathUtils.clamp(1.35 - this.distance * 0.035, 0.82, 1.2);
    this.entity.scale.setScalar(scale);
  }

  getEntityDistance() {
    return this.distance;
  }

  getEntityPosition() {
    return this.entity.position.clone();
  }

  shouldTriggerJumpScare() {
    return this.hasReachedPlayer || this.distance <= this.minDistance + 0.45;
  }
}
