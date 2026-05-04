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
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 1.6, 2); // Position inside room, looking towards the debug box
    this.camera.lookAt(0, 0.5, -5); // Look at the green debug box

    // Pointer lock for mouse look
    document.addEventListener('click', () => {
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
      this.camera.position.addScaledVector(this.direction, this.moveSpeed * deltaTime);
    }
  }
}