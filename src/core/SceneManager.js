import * as THREE from 'three';
import { OfficeMap } from '../world/OfficeMap.js';
import { LightingSystem } from '../systems/environment/LightingSystem.js';
import { ZoneManager } from '../systems/environment/ZoneManager.js';

export class SceneManager {
  constructor() {
    this.scene = null;
    this.officeMap = new OfficeMap();
    this.lightingSystem = new LightingSystem();
    this.zoneManager = new ZoneManager();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050707);
    this.scene.fog = new THREE.FogExp2(0x050707, 0.055);

    // Initialize map
    this.officeMap.init(this.scene);
    this.zoneManager.init();

    // Initialize lighting
    this.lightingSystem.init(this.scene, this.zoneManager.getZones());
  }

  update(deltaTime, context = {}) {
    this.lightingSystem.update(deltaTime, context);
    this.zoneManager.getZones().forEach(zone => {
      this.zoneManager.setLightingState(zone.id, this.lightingSystem.getZoneState(zone.id));
    });
  }

  applyWorldEvent(event) {
    if (!event) return;
    if (event.type === 'objective_completed') {
      const objective = event.objective;
      if (event.reward?.lighting === 'recover_zone') this.lightingSystem.recoverZone(objective.zoneId);
      if (event.reward?.lighting === 'stabilize_random') this.lightingSystem.randomFailure('recovering');
      if (event.reward?.lighting === 'emergency_route') this.lightingSystem.setZoneState(objective.zoneId, 'emergency', { duration: 20, nextState: 'normal' });
    }
    if (event.type === 'objective_failed') this.lightingSystem.randomFailure('blackout');
    if (event.type === 'lighting_pulse') this.lightingSystem.pulseZone(event.zoneId);
    if (event.type === 'entity_manipulation') {
      if (event.action === 'pulse_light') this.lightingSystem.pulseZone(event.zoneId);
      if (event.action === 'suppress_light') this.lightingSystem.setZoneState(event.zoneId, 'blackout', { duration: 8, nextState: 'emergency' });
    }
  }
}
