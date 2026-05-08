import * as THREE from 'three';

export class CarrySystem {
  constructor() {
    this.camera = null;
    this.scene = null;
    this.anchor = null;
    this.heldItem = null;
    this.inspectMode = false;
    this.rotationState = 0;
  }

  init(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.anchor = new THREE.Group();
    this.anchor.position.set(0.45, -0.45, -1.05);
    this.anchor.rotation.set(-0.12, 0, 0);
    this.camera.add(this.anchor);
  }

  hasHeldItem() {
    return Boolean(this.heldItem);
  }

  getHeldItemId() {
    return this.heldItem?.id || null;
  }

  getCarryPenalty() {
    if (!this.heldItem) return 0;
    const weight = this.heldItem.weight || 1;
    return Math.min(0.48, 0.08 + weight * 0.14);
  }

  pickup(target) {
    if (!target || this.heldItem) return null;
    const mesh = target.mesh;
    mesh.userData.carried = true;
    mesh.userData.originalPosition = mesh.position.clone();
    mesh.userData.originalQuaternion = mesh.quaternion.clone();
    mesh.userData.originalParent = mesh.parent;
    this.anchor.add(mesh);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(-0.08, Math.PI, 0);
    mesh.scale.setScalar(0.96);
    this.heldItem = {
      id: target.id,
      label: target.label,
      kind: target.kind,
      weight: target.weight || 1,
      soundType: target.soundType || 'metal',
      mesh,
      zoneId: target.zoneId,
      threat: target.threat || 0.14
    };
    return this.heldItem;
  }

  drop() {
    if (!this.heldItem) return null;
    const mesh = this.heldItem.mesh;
    mesh.userData.carried = false;
    mesh.scale.setScalar(1);
    mesh.rotation.set(0, 0, 0);
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    direction.y = 0;
    direction.normalize();
    const dropPosition = this.camera.position.clone().addScaledVector(direction, 1.05);
    this.camera.remove(mesh);
    this.scene.add(mesh);
    mesh.position.copy(dropPosition);
    mesh.quaternion.copy(this.camera.quaternion);
    mesh.rotateY(Math.PI);
    const dropped = {
      type: 'object_drop',
      interactableId: this.heldItem.id,
      kind: this.heldItem.kind,
      zoneId: this.heldItem.zoneId,
      label: this.heldItem.label,
      soundType: this.heldItem.soundType || 'metal',
      threat: Math.min(0.68, this.heldItem.threat * 1.4 + 0.06),
      radius: 7 + this.heldItem.weight * 4,
      duration: 0.7 + this.heldItem.weight * 0.7
    };
    this.heldItem = null;
    this.inspectMode = false;
    return dropped;
  }

  toggleInspect() {
    if (!this.heldItem) return false;
    this.inspectMode = !this.inspectMode;
    return this.inspectMode;
  }

  update(deltaTime) {
    if (!this.heldItem) return;
    this.rotationState += deltaTime * (this.inspectMode ? 1.3 : 0.4);
    const sway = Math.sin(this.rotationState * 1.8) * 0.02;
    this.anchor.rotation.y = sway + (this.inspectMode ? Math.sin(this.rotationState * 0.9) * 0.12 : 0);
    this.anchor.rotation.x = -0.12 + (this.inspectMode ? Math.sin(this.rotationState * 0.5) * 0.04 : 0);
  }
}
