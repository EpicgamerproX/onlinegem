import * as THREE from 'three';

export class OfficeMap {
  constructor() {
    this.scene = null;
    this.materials = {};
  }

  init(scene) {
    this.scene = scene;
    this.createMaterials();
    this.createFloor();
    this.createWalls();
    this.createCubicles();
    this.createDesk();
    this.createOfficeProps();
  }

  createMaterials() {
    this.materials.floor = new THREE.MeshStandardMaterial({
      color: 0x2a2d2b,
      roughness: 0.92,
      metalness: 0.02
    });
    this.materials.wall = new THREE.MeshStandardMaterial({
      color: 0x4f5554,
      roughness: 0.88,
      side: THREE.DoubleSide
    });
    this.materials.cubicle = new THREE.MeshStandardMaterial({
      color: 0x6e7371,
      roughness: 0.82
    });
    this.materials.wood = new THREE.MeshStandardMaterial({
      color: 0x6b3e24,
      roughness: 0.72
    });
    this.materials.darkPlastic = new THREE.MeshStandardMaterial({
      color: 0x111414,
      roughness: 0.56
    });
    this.materials.paper = new THREE.MeshStandardMaterial({
      color: 0xd8d2bd,
      roughness: 0.96
    });
    this.materials.screen = new THREE.MeshStandardMaterial({
      color: 0x050809,
      emissive: 0x143236,
      emissiveIntensity: 0.65,
      roughness: 0.35
    });
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(20, 20);
    const floor = new THREE.Mesh(geometry, this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(20, 20, 0x3a403e, 0x303533);
    grid.material.opacity = 0.22;
    grid.material.transparent = true;
    grid.position.y = 0.01;
    this.scene.add(grid);
  }

  createWalls() {
    const wallMaterial = this.materials.wall;

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    backWall.position.set(0, 2.5, -10);
    backWall.rotation.y = Math.PI;
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Side walls
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    leftWall.position.set(-10, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    rightWall.position.set(10, 2.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    // Ceiling
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), wallMaterial);
    ceiling.position.set(0, 5, 0);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    this.scene.add(ceiling);
  }

  createCubicles() {
    const cubicleMaterial = this.materials.cubicle;
    const wallGeometry = new THREE.BoxGeometry(0.12, 1.75, 3.1);

    [-4.5, -1.5, 1.5, 4.5].forEach((x, index) => {
      const wall = new THREE.Mesh(wallGeometry, cubicleMaterial);
      wall.position.set(x, 0.9, -1.5 + (index % 2) * 3.2);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);
    });

    [-3, 0, 3].forEach(x => {
      const divider = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.45, 0.12), cubicleMaterial);
      divider.position.set(x, 0.75, -3.1);
      divider.castShadow = true;
      divider.receiveShadow = true;
      this.scene.add(divider);
    });
  }

  createDesk() {
    const deskMaterial = this.materials.wood;

    // Desk top
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 1), deskMaterial);
    deskTop.position.set(0, 0.8, 4.8);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    this.scene.add(deskTop);

    // Desk legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.1);
    const positions = [
      [-0.9, 0.35, 4.4],
      [0.9, 0.35, 4.4],
      [-0.9, 0.35, 5.2],
      [0.9, 0.35, 5.2]
    ];

    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, deskMaterial);
      leg.position.set(...pos);
      leg.castShadow = true;
      this.scene.add(leg);
    });
  }

  createOfficeProps() {
    this.createMonitor(0, 1.08, 4.35);
    this.createKeyboard(0, 0.88, 4.95);
    this.createPapers(-0.55, 0.88, 4.9);
    this.createFilingCabinet(-7.8, 0.75, -8.5);
    this.createExitDoor(7.2, 1.6, -9.96);
    this.createCeilingPanels();
  }

  createMonitor(x, y, z) {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.12), this.materials.darkPlastic);
    stand.position.set(x, y, z + 0.15);
    stand.castShadow = true;
    this.scene.add(stand);

    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.62, 0.08), this.materials.screen);
    screen.position.set(x, y + 0.42, z);
    screen.rotation.x = -0.08;
    screen.castShadow = true;
    this.scene.add(screen);
  }

  createKeyboard(x, y, z) {
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.28), this.materials.darkPlastic);
    keyboard.position.set(x, y, z);
    keyboard.castShadow = true;
    this.scene.add(keyboard);
  }

  createPapers(x, y, z) {
    for (let i = 0; i < 4; i++) {
      const paper = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.01, 0.3), this.materials.paper);
      paper.position.set(x + i * 0.05, y + i * 0.012, z + i * 0.03);
      paper.rotation.y = (i - 1.5) * 0.1;
      paper.castShadow = true;
      this.scene.add(paper);
    }
  }

  createFilingCabinet(x, y, z) {
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.5, 0.75), new THREE.MeshStandardMaterial({
      color: 0x3d4547,
      roughness: 0.64,
      metalness: 0.28
    }));
    cabinet.position.set(x, y, z);
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    this.scene.add(cabinet);

    for (let i = 0; i < 3; i++) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.035, 0.04), this.materials.darkPlastic);
      handle.position.set(x, 0.35 + i * 0.42, z + 0.39);
      this.scene.add(handle);
    }
  }

  createExitDoor(x, y, z) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.45, 3.2, 0.08), new THREE.MeshStandardMaterial({
      color: 0x262b2c,
      roughness: 0.8
    }));
    door.position.set(x, y, z);
    door.receiveShadow = true;
    this.scene.add(door);

    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshStandardMaterial({
      color: 0xb8a15a,
      roughness: 0.38,
      metalness: 0.55
    }));
    handle.position.set(x - 0.48, 1.55, z + 0.08);
    this.scene.add(handle);
  }

  createCeilingPanels() {
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3331, roughness: 0.75 });
    for (let x = -6; x <= 6; x += 4) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.04, 1.2), frameMaterial);
      panel.position.set(x, 4.95, -3);
      panel.receiveShadow = true;
      this.scene.add(panel);
    }
  }
}
