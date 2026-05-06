import * as THREE from 'three';

export class CameraController {
  constructor() {
    this.camera = null;
    this.pointer = new THREE.Vector2();
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.moveSpeed = 5;
    this.lookSpeed = 0.002;
    this.pitch = 0;
    this.yaw = 0;
    this.keys = {};
    this.bounds = { minX: -9.25, maxX: 9.25, minZ: -9.25, maxZ: 8.6 };
    this.colliders = [];
  }

  init(options = {}) {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    if (options.bounds) this.bounds = options.bounds;
    if (options.colliders) this.colliders = options.colliders;
    this.setPose(options.spawn || { position_x: 0, position_y: 1.6, position_z: 2, rotation_yaw: 0, rotation_pitch: 0 });

    // Pointer lock for mouse look
    document.getElementById('game-container').addEventListener('click', () => {
      document.body.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === document.body) {
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
      } else {
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
      }
    });
  }

  onMouseMove(event) {
    this.yaw -= event.movementX * this.lookSpeed;
    this.pitch -= event.movementY * this.lookSpeed;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
  }

  onKeyDown(event) {
    this.keys[event.code] = true;
  }

  onKeyUp(event) {
    this.keys[event.code] = false;
  }

  update(deltaTime) {
    // Update camera rotation
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // Movement
    this.direction.set(0, 0, 0);
    if (this.keys['KeyW']) this.direction.z -= 1;
    if (this.keys['KeyS']) this.direction.z += 1;
    if (this.keys['KeyA']) this.direction.x -= 1;
    if (this.keys['KeyD']) this.direction.x += 1;

    if (this.direction.length() > 0) {
      this.direction.normalize();
      this.direction.applyEuler(new THREE.Euler(0, this.yaw, 0));
      const nextPosition = this.camera.position.clone().addScaledVector(this.direction, this.moveSpeed * deltaTime);
      this.camera.position.copy(this.resolveCollision(nextPosition));
    }
  }

  resolveCollision(position) {
    const radius = 0.32;
    position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, position.x));
    position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, position.z));

    this.colliders.forEach(collider => {
      const minX = collider.minX - radius;
      const maxX = collider.maxX + radius;
      const minZ = collider.minZ - radius;
      const maxZ = collider.maxZ + radius;
      if (position.x < minX || position.x > maxX || position.z < minZ || position.z > maxZ) return;

      const pushLeft = Math.abs(position.x - minX);
      const pushRight = Math.abs(maxX - position.x);
      const pushBack = Math.abs(position.z - minZ);
      const pushFront = Math.abs(maxZ - position.z);
      const smallest = Math.min(pushLeft, pushRight, pushBack, pushFront);

      if (smallest === pushLeft) position.x = minX;
      else if (smallest === pushRight) position.x = maxX;
      else if (smallest === pushBack) position.z = minZ;
      else position.z = maxZ;
    });

    position.y = 1.6;
    return position;
  }

  setPose(state) {
    this.camera.position.set(state.position_x, state.position_y, state.position_z);
    this.camera.position.copy(this.resolveCollision(this.camera.position));
    this.yaw = state.rotation_yaw || 0;
    this.pitch = state.rotation_pitch || 0;
  }

  getPose() {
    return {
      position: this.camera.position.clone(),
      yaw: this.yaw,
      pitch: this.pitch
    };
  }
}
