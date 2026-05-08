import * as THREE from 'three';
import { lightingConfig } from '../../config/lightingConfig.js';

export class LightingSystem {
  constructor() {
    this.scene = null;
    this.ambientLight = null;
    this.directionalLight = null;
    this.zoneLights = new Map();
    this.zoneStates = new Map();
    this.flickerTime = 0;
    this.blackoutTimer = lightingConfig.blackoutInterval;
    this.eventTimer = 0;
  }

  init(scene, zones = []) {
    this.scene = scene;

    this.ambientLight = new THREE.AmbientLight(0x9aa7a0, 0.18);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xbac6bd, 0.18);
    this.directionalLight.position.set(-4, 8, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.camera.far = 24;
    this.directionalLight.shadow.camera.left = -12;
    this.directionalLight.shadow.camera.right = 12;
    this.directionalLight.shadow.camera.top = 12;
    this.directionalLight.shadow.camera.bottom = -12;
    this.scene.add(this.directionalLight);

    zones.forEach((zone, index) => this.createZoneLight(zone, index));
  }

  createZoneLight(zone, index) {
    const bounds = zone.bounds;
    const x = (bounds.minX + bounds.maxX) / 2;
    const z = (bounds.minZ + bounds.maxZ) / 2;
    const color = zone.id === 'server' ? 0x78d8ff : zone.falseSafe ? 0xffe7bd : 0xd8fff4;
    const light = new THREE.PointLight(color, 0.48, 13, 2.15);
    light.position.set(x, 4.35, z);
    light.castShadow = index === 0;
    if (light.castShadow) {
      light.shadow.mapSize.width = 512;
      light.shadow.mapSize.height = 512;
    }
    this.scene.add(light);

    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.05, 0.55),
      new THREE.MeshStandardMaterial({
        color: 0xd8fff4,
        emissive: color,
        emissiveIntensity: 0.55,
        roughness: 0.7
      })
    );
    fixture.position.set(x, 4.88, z);
    this.scene.add(fixture);

    this.zoneLights.set(zone.id, { light, fixture, seed: 3.17 + index * 1.91, pulse: 0 });
    this.zoneStates.set(zone.id, { state: 'normal', timer: 0, nextState: null });
  }

  update(deltaTime, context = {}) {
    this.flickerTime += deltaTime;
    this.blackoutTimer -= deltaTime;
    this.eventTimer -= deltaTime;

    if (this.blackoutTimer <= 0) {
      this.blackoutTimer = lightingConfig.blackoutInterval + Math.random() * 24;
      const phase = context.missionState?.phase || 1;
      const failureType = phase >= 4 ? 'blackout' : 'unstable';
      this.randomFailure(failureType);
    }

    if (this.eventTimer <= 0 && Math.random() < 0.14) {
      this.triggerRandomTrailShutdown();
      this.eventTimer = lightingConfig.failureInterval;
    }

    this.zoneLights.forEach((entry, zoneId) => {
      const stateEntry = this.zoneStates.get(zoneId) || { state: 'normal', timer: 0 };
      if (stateEntry.timer > 0) {
        stateEntry.timer -= deltaTime;
        if (stateEntry.timer <= 0 && stateEntry.nextState) {
          stateEntry.state = stateEntry.nextState;
          stateEntry.nextState = null;
        }
      }

      const settings = lightingConfig.states[stateEntry.state] || lightingConfig.states.normal;
      const flicker = Math.sin(this.flickerTime * (8 + entry.seed)) * settings.flicker;
      const buzz = Math.sin(this.flickerTime * (23 + entry.seed * 2.7)) * settings.flicker * 0.45;
      entry.pulse = Math.max(0, entry.pulse - deltaTime * 1.8);
      entry.light.intensity = Math.max(0.02, settings.intensity * 0.58 + flicker + buzz + entry.pulse);
      entry.fixture.material.emissiveIntensity = Math.max(0.02, settings.emissive + flicker * 0.8 + entry.pulse);
    });

    this.directionalLight.intensity = 0.18 * (1 - Math.max(...Array.from(this.zoneStates.values()).map(item => item.state === 'blackout' ? 0.35 : item.state === 'red_lockdown' ? 0.2 : 0)));
    this.ambientLight.intensity = 0.18 * (1 - Math.max(...Array.from(this.zoneStates.values()).map(item => item.state === 'blackout' ? 0.45 : item.state === 'red_lockdown' ? 0.25 : 0)));
  }

  setZoneState(zoneId, state, options = {}) {
    const current = this.zoneStates.get(zoneId);
    if (!current) return;
    current.state = state;
    current.timer = options.duration || 0;
    current.nextState = options.nextState || null;
  }

  recoverZone(zoneId) {
    this.setZoneState(zoneId, 'startup', {
      duration: lightingConfig.startupDelay,
      nextState: 'normal'
    });
  }

  pulseZone(zoneId, amount = 0.55) {
    const entry = this.zoneLights.get(zoneId);
    if (entry) entry.pulse = amount;
  }

  randomFailure(state = 'unstable') {
    const ids = Array.from(this.zoneLights.keys());
    const zoneId = ids[Math.floor(Math.random() * ids.length)];
    const duration = state === 'blackout' ? 14 : state === 'red_lockdown' ? 18 : 18;
    const next = state === 'blackout' ? 'emergency' : 'normal';
    this.setZoneState(zoneId, state, { duration, nextState: next });
    if (Math.random() < 0.28 && state !== 'blackout') {
      this.triggerMonitorFlash(zoneId);
    }
    return zoneId;
  }

  triggerRandomTrailShutdown() {
    const ids = Array.from(this.zoneLights.keys());
    if (!ids.length) return;
    const pair = ids.sort(() => Math.random() - 0.5).slice(0, 2);
    pair.forEach((zoneId, index) => {
      this.setZoneState(zoneId, 'blackout', {
        duration: 7 + index * 2,
        nextState: 'red_lockdown'
      });
    });
  }

  triggerMonitorFlash(zoneId) {
    const entry = this.zoneLights.get(zoneId);
    if (!entry) return;
    entry.pulse = Math.max(entry.pulse, 0.8);
  }

  triggerRedLockdown(zoneId, duration = 16) {
    this.setZoneState(zoneId, 'red_lockdown', {
      duration,
      nextState: 'emergency'
    });
  }

  getZoneState(zoneId) {
    return this.zoneStates.get(zoneId)?.state || 'normal';
  }
}
