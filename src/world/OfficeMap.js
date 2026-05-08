import * as THREE from 'three';
import { zoneDefinitions } from '../config/zoneConfig.js';

export class OfficeMap {
  constructor() {
    this.scene = null;
    this.materials = {};
    this.bounds = { minX: -36, maxX: 36, minZ: -35, maxZ: 30 };
    this.colliders = [];
    this.interactables = [];
  }

  init(scene) {
    this.scene = scene;
    this.createMaterials();
    this.createFloor();
    this.createOuterShell();
    this.createSectorBands();
    this.createPrimaryArchitecture();
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
    this.materials.concrete = new THREE.MeshStandardMaterial({ color: 0x252a2b, roughness: 0.97 });
    this.materials.glass = new THREE.MeshStandardMaterial({
      color: 0x8fb7bd,
      transparent: true,
      opacity: 0.26,
      roughness: 0.12,
      metalness: 0.02
    });
    this.materials.warning = new THREE.MeshBasicMaterial({ color: 0xffc247 });
    this.materials.screen = new THREE.MeshStandardMaterial({
      color: 0x031012,
      emissive: 0x0d4a50,
      emissiveIntensity: 0.55,
      roughness: 0.35
    });
    this.materials.emergency = new THREE.MeshBasicMaterial({ color: 0xff3444 });
  }

  createFloor() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(72, 66), this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(72, 36, 0x3a403e, 0x303533);
    grid.material.opacity = 0.12;
    grid.material.transparent = true;
    grid.position.y = 0.01;
    this.scene.add(grid);
  }

  createOuterShell() {
    this.addWall(0, 2.5, -35, 72, 5, 0.18);
    this.addWall(0, 2.5, 30, 72, 5, 0.18);
    this.addWall(-36, 2.5, -2.5, 0.18, 5, 65);
    this.addWall(36, 2.5, -2.5, 0.18, 5, 65);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(72, 66), this.materials.wall);
    ceiling.position.set(0, 5, -2.5);
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

  createPrimaryArchitecture() {
    // These walls form believable office boundaries while leaving controlled openings.
    this.addWall(-23.5, 1.8, 8.5, 24, 3.6, 0.14);
    this.addWall(-23.5, 1.8, -9.5, 24, 3.6, 0.14);
    this.addWall(23.5, 1.8, 10.5, 24, 3.6, 0.14);
    this.addWall(23.5, 1.8, -8.5, 24, 3.6, 0.14);
    this.addWall(-11.5, 1.8, -0.5, 0.14, 3.6, 15);
    this.addWall(11.5, 1.8, -0.5, 0.14, 3.6, 15);
    this.addWall(-11.5, 1.8, -22, 0.14, 3.6, 24);
    this.addWall(11.5, 1.8, -24, 0.14, 3.6, 20);
    this.addWall(0, 1.8, 11.5, 23, 3.6, 0.14);
    this.addWall(0, 1.8, -11.5, 23, 3.6, 0.14);

    // Door gaps and implied corridors are left open with signage and frames.
    [
      [-11.5, 1.9, 3.5], [-11.5, 1.9, -6.5], [11.5, 1.9, 3.5], [11.5, 1.9, -5.5],
      [-6, 1.9, 11.5], [6, 1.9, 11.5], [-4, 1.9, -11.5], [4, 1.9, -11.5]
    ].forEach(([x, y, z]) => this.addDoorFrame(x, y, z));

    this.createStairwell(-2.5, -29.5);
  }

  createCubicleMaze() {
    for (let x = -8; x <= 8; x += 3.2) {
      for (let z = -8; z <= 8; z += 3.2) {
        this.addCubicle(x, z, Math.round(x + z) % 2 === 0);
      }
    }
    this.addPrinterIsland(-1.5, 0.8);
    this.addPrinterIsland(7.4, 7.2);
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
    const offset = Math.sin(x * 0.7 + z) * 0.18;
    this.addBox(x + offset, 0.8, z - 1.12, 2.9, 1.55, 0.1, this.materials.partition, true);
    this.addBox(x - 1.4 + offset, 0.8, z, 0.1, 1.55, 2.2, this.materials.partition, true);
    if (hasDesk) {
      this.addDesk(x + 0.35, z + 0.45, 'cubicles');
      if (this.fixedChance(x, z) > 0.55) this.addPersonalTrace(x + 0.7, z + 0.88);
    }
  }

  createArchiveRoom() {
    for (let x = -33; x <= -15; x += 2.1) {
      this.addBox(x, 1.15, -5.8, 0.42, 2.3, 11.5, this.materials.metal, true);
      this.addBox(x, 1.15, 4.7, 0.42, 2.3, 3.2, this.materials.metal, true);
    }
    for (let i = 0; i < 22; i++) {
      this.addBox(-33 + (i % 7) * 2.6, 0.35 + Math.floor(i / 7) * 0.42, -8 + (i % 3) * 0.9, 1.1, 0.45, 0.8, this.materials.paper, true);
    }
    this.createInteractable({
      id: 'archive_file_box',
      kind: 'file_box',
      label: 'recover employee file',
      zoneId: 'archive',
      position: new THREE.Vector3(-31.5, 1.05, 6.2),
      size: [0.8, 0.42, 0.55],
      material: this.materials.paper,
      holdTime: 2.6,
      soundRadius: 4.5,
      threat: 0.14,
      soundType: 'paper'
    });
  }

  createServerRoom() {
    for (let x = -33; x <= -15; x += 3) {
      this.addServerRack(x, -15.2);
      this.addServerRack(x, -20.2);
      this.addServerRack(x, -27.2);
    }
    [-32, -25, -18].forEach(x => this.addEmergencyStrip(x, -33.6, 2.7));
    this.createInteractable({
      id: 'server_node_alpha',
      kind: 'server_terminal',
      label: 'reconnect node alpha',
      zoneId: 'server',
      position: new THREE.Vector3(-13.2, 1.1, -13.1),
      size: [0.9, 0.8, 0.18],
      material: this.materials.screen,
      holdTime: 4.2,
      soundRadius: 10,
      threat: 0.28,
      soundType: 'server'
    });
  }

  createExecutiveOffices() {
    this.addGlassWall(12.2, 1.8, 1, 0.08, 2.8, 16);
    this.addGlassWall(23.5, 1.8, 9.8, 22, 2.8, 0.08);
    [16, 23, 30].forEach((x, index) => {
      const z = 5.4 - index * 5.4;
      this.addDesk(x, z, 'executive');
      this.addGlassWall(x + 2.2, 1.45, z + 1.6, 0.08, 2.3, 3.8);
      this.addBox(x - 1.5, 1.2, z - 1.8, 1.2, 1.9, 0.4, this.materials.wood, true);
      this.addPersonalTrace(x + 0.25, z + 0.52);
    });
    this.addBox(33.2, 1.6, 0.2, 0.12, 2.9, 12.5, this.materials.glass, false);
    this.createInteractable({
      id: 'executive_voice_log',
      kind: 'voice_log',
      label: 'play voice log',
      zoneId: 'executive',
      position: new THREE.Vector3(30.5, 0.95, -5.4),
      size: [0.55, 0.12, 0.35],
      material: this.materials.screen,
      holdTime: 2.8,
      soundRadius: 7,
      threat: 0.16,
      soundType: 'voice_log'
    });
  }

  createConferenceWing() {
    this.addGlassWall(23.5, 1.8, 11.2, 22, 2.8, 0.08);
    this.addBox(23.5, 0.8, 18.2, 12, 0.14, 2.5, this.materials.wood, true);
    for (let i = 0; i < 10; i++) {
      this.addChair(18.9 + i, 16.4 + (i % 2) * 0.15);
      this.addChair(18.9 + i, 20.1 - (i % 3) * 0.16);
    }
    this.addProjector(23.5, 23.6);
    this.addWhiteboard(33.6, 18.4, 'AGENDA: REDUCE INCIDENTAL SPEECH');
    this.createInteractable({
      id: 'conference_speakerphone',
      kind: 'speakerphone',
      label: 'silence speakerphone',
      zoneId: 'conference',
      position: new THREE.Vector3(23.5, 1, 18.2),
      size: [0.5, 0.12, 0.35],
      material: this.materials.dark,
      holdTime: 2,
      soundRadius: 8,
      threat: 0.18,
      soundType: 'speaker'
    });
  }

  createCafeteria() {
    for (let x = -32; x <= -16; x += 5) {
      for (let z = 14; z <= 24; z += 5) {
        this.addBox(x, 0.65, z, 2.2, 0.12, 1.3, this.materials.wood, true);
        this.addChair(x - 1.2, z - 0.8);
        this.addChair(x + 1.2, z + 0.8);
      }
    }
    this.addBox(-34.2, 1, 23.5, 1.2, 2, 0.7, this.materials.screen, true);
    this.addBox(-34.2, 1, 20.6, 1.2, 2, 0.7, this.materials.metal, true);
    this.addCounter(-24, 27.1);
    this.createInteractable({
      id: 'cafeteria_motion_sensor',
      kind: 'motion_sensor',
      label: 'reset vending sensor',
      zoneId: 'cafeteria',
      position: new THREE.Vector3(-33.6, 1.35, 23),
      size: [0.35, 0.35, 0.1],
      material: this.materials.dark,
      holdTime: 1.7,
      soundRadius: 6,
      threat: 0.12,
      soundType: 'sensor'
    });
  }

  createMaintenanceCorridor() {
    this.addWall(0, 1.7, -16, 22, 3.4, 0.12);
    this.addWall(0, 1.7, -34, 22, 3.4, 0.12);
    [-8, -3, 2, 7].forEach(x => {
      this.addBox(x, 3.1, -25, 0.08, 0.08, 15, this.materials.metal, false);
      this.addBox(x + 0.8, 2.6, -26.5, 0.06, 0.06, 11, this.materials.metal, false);
    });
    [ -8.5, -1.5, 5.5 ].forEach((x, index) => this.addUtilityLight(x, -30 + index * 4));
    this.createInteractable({
      id: 'maintenance_breaker',
      kind: 'breaker',
      label: 'hold breaker relay',
      zoneId: 'maintenance',
      position: new THREE.Vector3(9.7, 1.25, -24.5),
      size: [0.45, 0.85, 0.12],
      material: this.materials.metal,
      holdTime: 3.4,
      soundRadius: 9,
      threat: 0.24,
      soundType: 'breaker'
    });
  }

  createSecurityAndBasement() {
    this.addDesk(18, -30.5, 'security');
    this.addBox(23.2, 1.15, -29.5, 0.8, 2.2, 4.5, this.materials.screen, true);
    this.addWhiteboard(12.4, -28.5, 'CAMERA 03: AUDIO ONLY');
    [15, 22, 29, 34].forEach((x, index) => {
      this.addBox(x, 1.2, -14.5 - index * 1.8, 1.4, 2.4, 1.4, this.materials.concrete, true);
      this.addEmergencyStrip(x, -11.1 - index * 2.1, 2.4);
    });
    this.addBox(30.5, 0.55, -20.8, 3.4, 0.08, 1.7, this.materials.metal, true);
    this.addBox(31.4, 0.75, -20.8, 0.08, 0.4, 1.7, this.materials.glass, false);
    this.createInteractable({
      id: 'security_console',
      kind: 'security_console',
      label: 'cycle security console',
      zoneId: 'security',
      position: new THREE.Vector3(18, 1.15, -31.05),
      size: [1.1, 0.55, 0.16],
      material: this.materials.screen,
      holdTime: 3,
      soundRadius: 8,
      threat: 0.18,
      soundType: 'terminal'
    });
  }

  createLobby() {
    this.addBox(-3.2, 1.6, 27.8, 1.5, 3.2, 0.1, this.materials.metal, true);
    this.addBox(0, 1.6, 27.8, 1.5, 3.2, 0.1, this.materials.metal, true);
    this.addBox(3.2, 1.6, 27.8, 1.5, 3.2, 0.1, this.materials.metal, true);
    this.addBox(0, 0.05, 19.5, 9, 0.04, 4.5, this.materials.concrete, false);
    this.addDirectoryBoard(-6.4, 21.3);
    this.createInteractable({
      id: 'elevator_panel',
      kind: 'elevator_panel',
      label: 'press elevator panel',
      zoneId: 'lobby',
      position: new THREE.Vector3(4.45, 1.35, 27.65),
      size: [0.28, 0.5, 0.08],
      material: this.materials.screen,
      holdTime: 1.1,
      soundRadius: 7,
      threat: 0.12,
      soundType: 'elevator'
    });
  }

  createEnvironmentalStorytelling() {
    this.addSign('QUIET FLOOR', 0, 2.1, 29.88);
    this.addSign('HR INCIDENT: ROOM 17', 26, 2.1, 9.8);
    this.addSign('DO NOT ANSWER THE PHONES', -24, 2.1, 8.6);
    this.addSign('SERVER FANS MUST REMAIN ON', -24, 2.1, -10.2);
    this.addSign('STAIRWELL ACCESS - NO TALKING', -4.2, 2.1, -16.2);
    this.addMissingBoard(-8.5, 9.9);
    this.addClockCluster(8.4, 10);
  }

  addDoorFrame(x, y, z) {
    const isNorthSouth = Math.abs(z) > Math.abs(x);
    const width = isNorthSouth ? 1.6 : 0.12;
    const depth = isNorthSouth ? 0.12 : 1.6;
    this.addBox(x, y + 0.75, z, width, 0.12, depth, this.materials.metal, false);
    if (isNorthSouth) {
      this.addBox(x - 0.86, y, z, 0.08, 1.8, 0.12, this.materials.metal, false);
      this.addBox(x + 0.86, y, z, 0.08, 1.8, 0.12, this.materials.metal, false);
    } else {
      this.addBox(x, y, z - 0.86, 0.12, 1.8, 0.08, this.materials.metal, false);
      this.addBox(x, y, z + 0.86, 0.12, 1.8, 0.08, this.materials.metal, false);
    }
  }

  createStairwell(x, z) {
    this.addWall(x - 2.2, 1.6, z, 0.12, 3.2, 6.8);
    this.addWall(x + 2.2, 1.6, z, 0.12, 3.2, 6.8);
    for (let i = 0; i < 7; i++) {
      this.addBox(x, 0.1 + i * 0.12, z - 2.6 + i * 0.75, 3.4, 0.1, 0.48, this.materials.concrete, true);
    }
    this.addSign('B1 PARKING / MAINT', x, 2.2, z + 3.6);
  }

  addPrinterIsland(x, z) {
    this.addBox(x, 0.75, z, 1.35, 1.1, 0.85, this.materials.metal, true);
    this.addBox(x + 0.1, 1.35, z - 0.25, 1.05, 0.12, 0.42, this.materials.paper, false);
    this.addBox(x - 0.68, 1.05, z + 0.42, 0.08, 0.35, 0.2, this.materials.screen, false);
  }

  addPersonalTrace(x, z) {
    this.addBox(x, 0.96, z, 0.22, 0.18, 0.22, this.materials.warning, false);
    this.addBox(x + 0.28, 0.91, z - 0.18, 0.32, 0.02, 0.22, this.materials.paper, false);
  }

  addEmergencyStrip(x, z, y = 2.8) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.05, 0.08), this.materials.emergency);
    strip.position.set(x, y, z);
    this.scene.add(strip);
  }

  addGlassWall(x, y, z, width, height, depth) {
    const mesh = this.addBox(x, y, z, width, height, depth, this.materials.glass, false);
    const frameMaterial = this.materials.metal;
    if (width > depth) {
      this.addBox(x, y + height / 2, z, width, 0.05, depth + 0.03, frameMaterial, false);
      this.addBox(x, y - height / 2, z, width, 0.05, depth + 0.03, frameMaterial, false);
    } else {
      this.addBox(x, y + height / 2, z, width + 0.03, 0.05, depth, frameMaterial, false);
      this.addBox(x, y - height / 2, z, width + 0.03, 0.05, depth, frameMaterial, false);
    }
    return mesh;
  }

  addProjector(x, z) {
    this.addBox(x, 3.25, z, 0.65, 0.25, 0.42, this.materials.dark, false);
    this.addBox(x, 2.1, z - 0.4, 2.4, 1.25, 0.04, this.materials.screen, false);
  }

  addWhiteboard(x, z, text) {
    this.addBox(x, 2.05, z, 0.06, 1.2, 2.8, this.materials.paper, false);
    this.addSign(text, x - 0.04, 2.08, z);
  }

  addCounter(x, z) {
    this.addBox(x, 0.55, z, 9, 1.1, 0.9, this.materials.wood, true);
    this.addBox(x - 3.2, 1.2, z - 0.15, 0.8, 1.1, 0.35, this.materials.metal, true);
    this.addBox(x + 3.2, 1.2, z - 0.15, 0.8, 1.1, 0.35, this.materials.metal, true);
  }

  addUtilityLight(x, z) {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.2), new THREE.MeshBasicMaterial({ color: 0xbad7c9 }));
    light.position.set(x, 3.25, z);
    this.scene.add(light);
  }

  addDirectoryBoard(x, z) {
    this.addBox(x, 1.55, z, 0.12, 2.1, 1.5, this.materials.screen, true);
    this.addSign('12F DIRECTORY / B1 ACCESS DELAYED', x + 0.08, 1.8, z);
  }

  addMissingBoard(x, z) {
    this.addBox(x, 1.7, z, 3.2, 1.6, 0.08, this.materials.paper, false);
    ['NIGHT OPS', 'MARA V.', 'ELIAS R.', 'AUDIO TEAM'].forEach((name, index) => {
      this.addSign(name, x - 0.8 + index * 0.55, 1.35 + (index % 2) * 0.38, z + 0.06);
    });
  }

  addClockCluster(x, z) {
    for (let i = 0; i < 4; i++) {
      const clock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.04, 18),
        new THREE.MeshBasicMaterial({ color: i === 2 ? 0xffc247 : 0xd8fff4 })
      );
      clock.rotation.x = Math.PI / 2;
      clock.position.set(x + i * 0.72, 2.4, z);
      this.scene.add(clock);
    }
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

  fixedChance(x, z) {
    return Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
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
