import * as THREE from 'three';

export class OfficeMap {
  constructor() {
    this.scene = null;
    this.materials = {};
    this.bounds = { minX: -9.25, maxX: 9.25, minZ: -9.25, maxZ: 8.6 };
    this.colliders = [];
  }

  init(scene) {
    this.scene = scene;
    this.createMaterials();
    this.createFloor();
    this.createWalls();
    this.createCubicles();
    this.createDesk();
    this.createOfficeProps();
    this.createLandmarks();
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
      this.addCollider(x - 0.06, x + 0.06, wall.position.z - 1.55, wall.position.z + 1.55);
    });

    [-3, 0, 3].forEach(x => {
      const divider = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.45, 0.12), cubicleMaterial);
      divider.position.set(x, 0.75, -3.1);
      divider.castShadow = true;
      divider.receiveShadow = true;
      this.scene.add(divider);
      this.addCollider(x - 1.6, x + 1.6, -3.16, -3.04);
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
    this.addCollider(-1.1, 1.1, 4.25, 5.35);

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
    this.addCollider(x - 0.62, x + 0.62, z - 0.42, z + 0.42);

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

  createLandmarks() {
    this.createServerRack(-8.4, 1.1, 1.9);
    this.createWarningLight(-7.7, 2.85, -9.88);
    this.createWhiteboard(-5.4, 2.15, -9.92);
    this.createLooseChairs();
  }

  createServerRack(x, y, z) {
    const rackMaterial = new THREE.MeshStandardMaterial({ color: 0x15191a, roughness: 0.48, metalness: 0.35 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1, 2.2, 0.75), rackMaterial);
    rack.position.set(x, y, z);
    rack.castShadow = true;
    rack.receiveShadow = true;
    this.scene.add(rack);
    this.addCollider(x - 0.55, x + 0.55, z - 0.42, z + 0.42);

    for (let i = 0; i < 6; i++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.02), new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xff3847 : 0x74ffd8
      }));
      led.position.set(x + 0.34, 0.35 + i * 0.28, z - 0.39);
      this.scene.add(led);
    }
  }

  createWarningLight(x, y, z) {
    const light = new THREE.PointLight(0xff2438, 0.6, 4, 2);
    light.position.set(x, y, z + 0.25);
    this.scene.add(light);

    const casing = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff2438 }));
    casing.position.copy(light.position);
    this.scene.add(casing);
  }

  createWhiteboard(x, y, z) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 0.04), new THREE.MeshStandardMaterial({
      color: 0xb7c0b8,
      roughness: 0.42,
      metalness: 0.08
    }));
    board.position.set(x, y, z);
    this.scene.add(board);
  }

  createLooseChairs() {
    [
      [-2.4, 0.45, 3.6, 0.3],
      [2.35, 0.45, 2.15, -0.45],
      [6.7, 0.45, -1.25, 0.8]
    ].forEach(([x, y, z, rotation]) => {
      const chair = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({ color: 0x202829, roughness: 0.7 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), material);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.08), material);
      back.position.set(0, 0.38, 0.28);
      chair.add(seat, back);
      chair.position.set(x, y, z);
      chair.rotation.y = rotation;
      chair.traverse(child => {
        child.castShadow = true;
        child.receiveShadow = true;
      });
      this.scene.add(chair);
      this.addCollider(x - 0.38, x + 0.38, z - 0.38, z + 0.38);
    });
  }

  addCollider(minX, maxX, minZ, maxZ) {
    this.colliders.push({ minX, maxX, minZ, maxZ });
  }

  getNavigationBounds() {
    return this.bounds;
  }

  getCollisionBoxes() {
    return this.colliders;
  }
}
