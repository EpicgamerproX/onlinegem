import * as THREE from 'three';
import { zoneDefinitions } from '../config/zoneConfig.js';

export class OfficeMap {
  constructor() {
    this.scene = null;
    this.materials = {};
    this.bounds = { minX: -28, maxX: 28, minZ: -26, maxZ: 25 };
    this.colliders = [];
    this.interactables = [];
  }

  init(scene) {
    this.scene = scene;
    this.createMaterials();
    this.createFloor();
    this.createOuterShell();
    this.createSectorBands();
    this.createCubicleMaze();
    this.createArchiveRoom();
    this.createServerRoom();
    this.createExecutiveOffices();
    this.createConferenceWing();
    this.createCafeteria();
    this.createMaintenanceCorridor();
    this.createSecurityAndBasement();
    this.createLobby();
    this.createEnvironmentalStorytelling();
  }

  createMaterials() {
    this.materials.floor = new THREE.MeshStandardMaterial({ color: 0x242826, roughness: 0.94 });
    this.materials.wall = new THREE.MeshStandardMaterial({ color: 0x4a5250, roughness: 0.9 });
    this.materials.partition = new THREE.MeshStandardMaterial({ color: 0x666d6a, roughness: 0.84 });
    this.materials.dark = new THREE.MeshStandardMaterial({ color: 0x101414, roughness: 0.72 });
    this.materials.wood = new THREE.MeshStandardMaterial({ color: 0x5d3b26, roughness: 0.76 });
    this.materials.paper = new THREE.MeshStandardMaterial({ color: 0xd5cfbb, roughness: 0.96 });
    this.materials.metal = new THREE.MeshStandardMaterial({ color: 0x313b3d, roughness: 0.58, metalness: 0.25 });
    this.materials.screen = new THREE.MeshStandardMaterial({
      color: 0x031012,
      emissive: 0x0d4a50,
      emissiveIntensity: 0.55,
      roughness: 0.35
    });
    this.materials.emergency = new THREE.MeshBasicMaterial({ color: 0xff3444 });
  }

  createFloor() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(56, 52), this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(56, 28, 0x3a403e, 0x303533);
    grid.material.opacity = 0.16;
    grid.material.transparent = true;
    grid.position.y = 0.01;
    this.scene.add(grid);
  }

  createOuterShell() {
    this.addWall(0, 2.5, -26, 56, 5, 0.18);
    this.addWall(0, 2.5, 25, 56, 5, 0.18);
    this.addWall(-28, 2.5, -0.5, 0.18, 5, 51);
    this.addWall(28, 2.5, -0.5, 0.18, 5, 51);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(56, 52), this.materials.wall);
    ceiling.position.set(0, 5, -0.5);
    ceiling.rotation.x = Math.PI / 2;
    this.scene.add(ceiling);
  }

  createSectorBands() {
    zoneDefinitions.forEach(zone => {
      const { bounds } = zone;
      const color = zone.falseSafe ? 0x2e3733 : zone.pressure > 1.25 ? 0x302b2d : 0x28302e;
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.98 });
      const carpet = new THREE.Mesh(
        new THREE.PlaneGeometry(bounds.maxX - bounds.minX - 0.5, bounds.maxZ - bounds.minZ - 0.5),
        mat
      );
      carpet.rotation.x = -Math.PI / 2;
      carpet.position.set((bounds.minX + bounds.maxX) / 2, 0.025, (bounds.minZ + bounds.maxZ) / 2);
      this.scene.add(carpet);
    });
  }

  createCubicleMaze() {
    for (let x = -8; x <= 8; x += 4) {
      for (let z = -5; z <= 5; z += 4) {
        this.addCubicle(x, z, (x + z) % 8 === 0);
      }
    }
    this.createInteractable({
      id: 'cubicle_motion_sensor',
      kind: 'motion_sensor',
      label: 'inspect motion sensor',
      zoneId: 'cubicles',
      position: new THREE.Vector3(7.8, 1.7, -5.8),
      size: [0.35, 0.22, 0.08],
      material: this.materials.dark,
      holdTime: 1.2,
      soundRadius: 5,
      threat: 0.1,
      soundType: 'sensor'
    });
  }

  addCubicle(x, z, hasDesk) {
    this.addBox(x, 0.8, z - 1.2, 3.4, 1.55, 0.1, this.materials.partition, true);
    this.addBox(x - 1.65, 0.8, z, 0.1, 1.55, 2.4, this.materials.partition, true);
    if (hasDesk) {
      this.addDesk(x + 0.35, z + 0.45, 'cubicles');
    }
  }

  createArchiveRoom() {
    for (let x = -25; x <= -14; x += 2.2) {
      this.addBox(x, 1, -6, 0.45, 2, 10, this.materials.metal, true);
    }
    this.createInteractable({
      id: 'archive_file_box',
      kind: 'file_box',
      label: 'recover employee file',
      zoneId: 'archive',
      position: new THREE.Vector3(-18.4, 1.05, 3.8),
      size: [0.8, 0.42, 0.55],
      material: this.materials.paper,
      holdTime: 2.6,
      soundRadius: 4.5,
      threat: 0.14,
      soundType: 'paper'
    });
  }

  createServerRoom() {
    for (let x = -25; x <= -13; x += 3) {
      this.addServerRack(x, -18.5);
      this.addServerRack(x, -23);
    }
    this.createInteractable({
      id: 'server_node_alpha',
      kind: 'server_terminal',
      label: 'reconnect node alpha',
      zoneId: 'server',
      position: new THREE.Vector3(-12.2, 1.1, -16.5),
      size: [0.9, 0.8, 0.18],
      material: this.materials.screen,
      holdTime: 4.2,
      soundRadius: 10,
      threat: 0.28,
      soundType: 'server'
    });
  }

  createExecutiveOffices() {
    this.addWall(11, 1.6, 0, 0.14, 3.2, 15);
    [14, 19, 24].forEach((x, index) => {
      this.addDesk(x, 3.5 - index * 4.8, 'executive');
      this.addBox(x + 1.4, 1.3, 6.3 - index * 5, 0.08, 2.2, 3.5, this.materials.partition, true);
    });
    this.createInteractable({
      id: 'executive_voice_log',
      kind: 'voice_log',
      label: 'play voice log',
      zoneId: 'executive',
      position: new THREE.Vector3(23.5, 0.95, -3.8),
      size: [0.55, 0.12, 0.35],
      material: this.materials.screen,
      holdTime: 2.8,
      soundRadius: 7,
      threat: 0.16,
      soundType: 'voice_log'
    });
  }

  createConferenceWing() {
    this.addBox(18.5, 0.8, 16.5, 8, 0.14, 2.2, this.materials.wood, true);
    for (let i = 0; i < 8; i++) {
      this.addChair(14.8 + i, 15);
      this.addChair(14.8 + i, 18.1);
    }
    this.createInteractable({
      id: 'conference_speakerphone',
      kind: 'speakerphone',
      label: 'silence speakerphone',
      zoneId: 'conference',
      position: new THREE.Vector3(18.5, 1, 16.5),
      size: [0.5, 0.12, 0.35],
      material: this.materials.dark,
      holdTime: 2,
      soundRadius: 8,
      threat: 0.18,
      soundType: 'speaker'
    });
  }

  createCafeteria() {
    for (let x = -25; x <= -15; x += 5) {
      this.addBox(x, 0.65, 15, 2.2, 0.12, 1.3, this.materials.wood, true);
      this.addChair(x - 1.2, 14.2);
      this.addChair(x + 1.2, 15.8);
    }
    this.addBox(-25.5, 1, 21, 1.2, 2, 0.7, this.materials.screen, true);
    this.createInteractable({
      id: 'cafeteria_motion_sensor',
      kind: 'motion_sensor',
      label: 'reset vending sensor',
      zoneId: 'cafeteria',
      position: new THREE.Vector3(-24.8, 1.35, 20.5),
      size: [0.35, 0.35, 0.1],
      material: this.materials.dark,
      holdTime: 1.7,
      soundRadius: 6,
      threat: 0.12,
      soundType: 'sensor'
    });
  }

  createMaintenanceCorridor() {
    this.addWall(0, 1.7, -15, 20, 3.4, 0.12);
    this.addWall(0, 1.7, -25, 20, 3.4, 0.12);
    [-6, 0, 6].forEach(x => {
      this.addBox(x, 3.1, -20, 0.08, 0.08, 8, this.materials.metal, false);
    });
    this.createInteractable({
      id: 'maintenance_breaker',
      kind: 'breaker',
      label: 'hold breaker relay',
      zoneId: 'maintenance',
      position: new THREE.Vector3(8.9, 1.25, -19.5),
      size: [0.45, 0.85, 0.12],
      material: this.materials.metal,
      holdTime: 3.4,
      soundRadius: 9,
      threat: 0.24,
      soundType: 'breaker'
    });
  }

  createSecurityAndBasement() {
    this.addDesk(20, -21.5, 'security');
    this.addBox(14, 1.2, -11, 2.3, 2.4, 2.3, this.materials.metal, true);
    this.addBox(22, 1.2, -11.5, 2.3, 2.4, 2.3, this.materials.metal, true);
    this.createInteractable({
      id: 'security_console',
      kind: 'security_console',
      label: 'cycle security console',
      zoneId: 'security',
      position: new THREE.Vector3(20, 1.15, -22.05),
      size: [1.1, 0.55, 0.16],
      material: this.materials.screen,
      holdTime: 3,
      soundRadius: 8,
      threat: 0.18,
      soundType: 'terminal'
    });
  }

  createLobby() {
    this.addBox(-2.2, 1.6, 23.8, 1.5, 3.2, 0.1, this.materials.metal, true);
    this.addBox(2.2, 1.6, 23.8, 1.5, 3.2, 0.1, this.materials.metal, true);
    this.createInteractable({
      id: 'elevator_panel',
      kind: 'elevator_panel',
      label: 'press elevator panel',
      zoneId: 'lobby',
      position: new THREE.Vector3(3.25, 1.35, 23.65),
      size: [0.28, 0.5, 0.08],
      material: this.materials.screen,
      holdTime: 1.1,
      soundRadius: 7,
      threat: 0.12,
      soundType: 'elevator'
    });
  }

  createEnvironmentalStorytelling() {
    this.addSign('QUIET FLOOR', 0, 2.1, 24.88);
    this.addSign('HR INCIDENT: ROOM 17', 21, 2.1, 8.8);
    this.addSign('DO NOT ANSWER THE PHONES', -19, 2.1, 7.8);
    this.addSign('SERVER FANS MUST REMAIN ON', -19, 2.1, -9.2);
  }

  addDesk(x, z, zoneId) {
    this.addBox(x, 0.78, z, 2, 0.12, 1, this.materials.wood, true);
    this.addBox(x, 1.2, z - 0.28, 0.9, 0.55, 0.08, this.materials.screen, false);
    for (let i = 0; i < 3; i++) {
      this.addBox(x - 0.45 + i * 0.18, 0.88 + i * 0.01, z + 0.28 + i * 0.05, 0.36, 0.01, 0.25, this.materials.paper, false);
    }
  }

  addServerRack(x, z) {
    this.addBox(x, 1.15, z, 1.1, 2.3, 0.8, this.materials.dark, true);
    for (let i = 0; i < 5; i++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.02), new THREE.MeshBasicMaterial({
        color: i % 2 ? 0x74ffd8 : 0xff3847
      }));
      led.position.set(x + 0.42, 0.4 + i * 0.32, z - 0.42);
      this.scene.add(led);
    }
  }

  addChair(x, z) {
    const group = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), this.materials.dark);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.72, 0.08), this.materials.dark);
    back.position.set(0, 0.36, 0.28);
    group.add(seat, back);
    group.position.set(x, 0.45, z);
    group.rotation.y = (x + z) * 0.13;
    group.traverse(child => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    this.scene.add(group);
    this.addCollider(x - 0.36, x + 0.36, z - 0.36, z + 0.36);
  }

  addSign(text, x, y, z) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = '#101414';
    context.fillRect(0, 0, 512, 128);
    context.fillStyle = '#d8fff4';
    context.font = '38px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 256, 64);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.7), material);
    sign.position.set(x, y, z);
    this.scene.add(sign);
  }

  createInteractable({ id, kind, label, zoneId, position, size, material, holdTime, soundRadius, threat, soundType }) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.userData.interactableId = id;
    this.scene.add(mesh);
    this.interactables.push({ id, kind, label, zoneId, mesh, holdTime, soundRadius, threat, soundType });
    return mesh;
  }

  addWall(x, y, z, width, height, depth) {
    this.addBox(x, y, z, width, height, depth, this.materials.wall, true);
  }

  addBox(x, y, z, width, height, depth, material, collides = false) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (collides) {
      this.addCollider(x - width / 2, x + width / 2, z - depth / 2, z + depth / 2);
    }
    return mesh;
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

  getInteractables() {
    return this.interactables;
  }
}
