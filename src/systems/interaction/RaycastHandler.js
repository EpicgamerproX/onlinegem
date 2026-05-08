import * as THREE from 'three';

export class RaycastHandler {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.center = new THREE.Vector2(0, 0);
    this.targets = [];
    this.maxDistance = 3.1;
  }

  setTargets(targets) {
    this.targets = targets || [];
  }

  getTarget(camera) {
    if (!camera || !this.targets.length) return null;
    this.raycaster.setFromCamera(this.center, camera);
    const meshes = this.targets.map(target => target.mesh).filter(Boolean);
    const hits = this.raycaster.intersectObjects(meshes, true);
    const hit = hits.find(item => item.distance <= this.maxDistance);
    if (!hit) return null;
    return this.targets.find(target => target.mesh === hit.object || target.mesh.children?.includes(hit.object)) || null;
  }
}
