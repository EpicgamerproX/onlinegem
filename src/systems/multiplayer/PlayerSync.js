import * as THREE from 'three';

export class PlayerSync {
  constructor() {
    this.scene = null;
    this.players = new Map();
  }

  init(scene) {
    this.scene = scene;
  }

  upsertPlayer(payload) {
    if (!payload?.user_id) return;

    let player = this.players.get(payload.user_id);
    if (!player) {
      player = this.createRemotePlayer(payload);
      this.players.set(payload.user_id, player);
      this.scene.add(player.group);
    }

    player.target.position.set(payload.x, 0.9, payload.z);
    player.target.yaw = payload.yaw || 0;
    player.zoneId = payload.zone_id || 'unknown';
    player.noiseCategory = payload.noise_category || 'silent';
    player.fearBand = payload.fear_band || 'low';
    player.distress = payload.distress || 0;
    player.lastSeen = performance.now();
  }

  removePlayer(userId) {
    const player = this.players.get(userId);
    if (!player) return;
    this.scene.remove(player.group);
    player.group.traverse(child => {
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) {
        child.material.forEach(material => material.dispose?.());
      } else {
        child.material?.dispose?.();
      }
    });
    this.players.delete(userId);
  }

  update(deltaTime) {
    this.players.forEach((player, userId) => {
      player.group.position.lerp(player.target.position, Math.min(1, deltaTime * 9));
      player.group.rotation.y = THREE.MathUtils.lerp(
        player.group.rotation.y,
        player.target.yaw,
        Math.min(1, deltaTime * 8)
      );

      if (performance.now() - player.lastSeen > 12000) {
        this.removePlayer(userId);
      }
      player.label.visible = !(player.fearBand === 'high' && Math.sin(performance.now() * 0.012) > 0.45);
    });
  }

  createRemotePlayer(payload) {
    const group = new THREE.Group();
    group.position.set(payload.x, 0.9, payload.z);

    const material = new THREE.MeshStandardMaterial({
      color: 0x182326,
      emissive: 0x0a1718,
      roughness: 0.86
    });
    const accent = new THREE.MeshBasicMaterial({ color: 0x73f4dd });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.05, 6, 12), material);
    body.position.y = 0;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), material);
    head.position.y = 0.76;
    head.castShadow = true;
    group.add(head);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.045, 0.025), accent);
    visor.position.set(0, 0.79, -0.2);
    group.add(visor);

    const label = this.createNameLabel(payload.display_name || payload.username || 'Player');
    label.position.y = 1.25;
    group.add(label);

    return {
      group,
      label,
      target: {
        position: new THREE.Vector3(payload.x, 0.9, payload.z),
        yaw: payload.yaw || 0
      },
      zoneId: payload.zone_id || 'unknown',
      noiseCategory: payload.noise_category || 'silent',
      fearBand: payload.fear_band || 'low',
      distress: payload.distress || 0,
      lastSeen: performance.now()
    };
  }

  getRemoteSnapshots() {
    return Array.from(this.players.entries()).map(([userId, player]) => ({
      userId,
      x: player.group.position.x,
      z: player.group.position.z,
      zoneId: player.zoneId,
      noiseCategory: player.noiseCategory,
      fearBand: player.fearBand,
      distress: player.distress
    }));
  }

  createNameLabel(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(0, 0, 0, 0.68)';
    context.fillRect(0, 8, 256, 42);
    context.fillStyle = '#d8fff4';
    context.font = '22px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name.slice(0, 24), 128, 29);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.45, 0.36, 1);
    return sprite;
  }
}
