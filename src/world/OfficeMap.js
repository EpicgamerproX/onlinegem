import * as THREE from 'three';

export class OfficeMap {
  constructor() {
    this.scene = null;
  }

  init(scene) {
    this.scene = scene;
    this.createFloor();
    this.createWalls();
    this.createCubicles();
    this.createDesk();
    this.createDebugObjects();
  }

  createDebugObjects() {
    const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, emissive: 0x002200 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), boxMaterial);
    box.position.set(0, 1, -5);
    box.castShadow = true;
    box.receiveShadow = true;
    this.scene.add(box);
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  createWalls() {
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x666666, side: THREE.DoubleSide });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    backWall.position.set(0, 2.5, -10);
    backWall.rotation.y = Math.PI;
    this.scene.add(backWall);

    // Side walls
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    leftWall.position.set(-10, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    rightWall.position.set(10, 2.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(rightWall);

    // Ceiling
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), wallMaterial);
    ceiling.position.set(0, 5, 0);
    ceiling.rotation.x = Math.PI / 2;
    this.scene.add(ceiling);
  }

  createCubicles() {
    const cubicleMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });

    // Simple cubicle walls
    for (let i = 0; i < 3; i++) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, 3), cubicleMaterial);
      wall.position.set(i * 3 - 3, 1, 5);
      this.scene.add(wall);
    }
  }

  createDesk() {
    const deskMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

    // Desk top
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 1), deskMaterial);
    deskTop.position.set(0, 0.8, 7);
    this.scene.add(deskTop);

    // Desk legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.1);
    const positions = [
      [-0.9, 0.35, 6.6],
      [0.9, 0.35, 6.6],
      [-0.9, 0.35, 7.4],
      [0.9, 0.35, 7.4]
    ];

    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, deskMaterial);
      leg.position.set(...pos);
      this.scene.add(leg);
    });
  }
}