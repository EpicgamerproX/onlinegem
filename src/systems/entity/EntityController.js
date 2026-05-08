import * as THREE from 'three';
import { entityConfig } from '../../config/entityConfig.js';
import { EntityBehavior } from './EntityBehavior.js';

export class EntityController {
  constructor() {
    this.scene = null;
    this.entity = null;
    this.distance = entityConfig.initialDistance;
    this.minDistance = entityConfig.minDistance;
    this.approachSpeed = entityConfig.baseApproachSpeed;
    this.playerPosition = new THREE.Vector3();
    this.hasReachedPlayer = false;
    this.behavior = new EntityBehavior();
    this.currentState = 'dormant_pressure';
    this.lastManipulations = [];
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

  update(noiseLevel, deltaTime, camera, context = {}) {
    if (camera) {
      this.playerPosition.copy(camera.position);
    }

    const behaviorResult = this.behavior.update({
      ...context,
      noiseLevel,
      deltaTime,
      playerPosition: this.playerPosition
    });
    this.currentState = behaviorResult.state;
    this.lastManipulations = behaviorResult.manipulations || [];

    const direction = new THREE.Vector3().subVectors(behaviorResult.targetPosition, this.entity.position).normalize();
    if (Number.isFinite(direction.x)) {
      this.entity.position.addScaledVector(direction, this.approachSpeed * behaviorResult.speedMultiplier * deltaTime);
    }

    // Update distance
    this.distance = this.entity.position.distanceTo(this.playerPosition);
    this.entity.lookAt(this.playerPosition.x, this.entity.position.y, this.playerPosition.z);
    this.updateVisibility(behaviorResult.visibilityBias);

    // Clamp minimum distance
    if (this.distance < this.minDistance) {
      this.distance = this.minDistance;
      this.hasReachedPlayer = true;
    }
  }

  updateVisibility(visibilityBias = 0.1) {
    const shouldShow = this.distance < 4 + visibilityBias * 9 || (this.currentState === 'observing' && this.distance < 12);
    this.entity.traverse(child => {
      child.visible = shouldShow;
      if (child.material?.opacity !== undefined) {
        child.material.transparent = true;
        child.material.opacity = THREE.MathUtils.clamp(visibilityBias + (8 - this.distance) * 0.08, 0.18, 0.82);
      }
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

  drainManipulations() {
    const drained = this.lastManipulations;
    this.lastManipulations = [];
    return drained;
  }

  getState() {
    return {
      state: this.currentState,
      threat: this.behavior.threat,
      position: this.getEntityPosition(),
      distance: this.distance
    };
  }
}
