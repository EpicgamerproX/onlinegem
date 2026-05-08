import { zoneConfig, zoneDefinitions } from '../../config/zoneConfig.js';

export class ZoneManager {
  constructor() {
    this.zones = zoneDefinitions;
    this.currentZone = this.zones.find(zone => zone.id === zoneConfig.defaultZoneId);
    this.previousZone = this.currentZone;
    this.currentPosition = null;
    this.lightingStates = new Map(this.zones.map(zone => [zone.id, 'normal']));
  }

  init(zones = zoneDefinitions) {
    this.zones = zones.map(zone => ({
      ...zone,
      centerX: (zone.bounds.minX + zone.bounds.maxX) / 2,
      centerZ: (zone.bounds.minZ + zone.bounds.maxZ) / 2
    }));
    this.currentZone = this.zones.find(zone => zone.id === zoneConfig.defaultZoneId) || this.zones[0];
    this.previousZone = this.currentZone;
    this.lightingStates = new Map(this.zones.map(zone => [zone.id, 'normal']));
  }

  update(position, remotePlayers = []) {
    this.previousZone = this.currentZone;
    this.currentPosition = position;
    this.currentZone = this.getZoneAtPosition(position) || this.currentZone;
    return this.getCurrentContext(remotePlayers);
  }

  getZoneAtPosition(position) {
    if (!position) return this.currentZone;
    return this.zones.find(zone => {
      const { bounds } = zone;
      return position.x >= bounds.minX && position.x <= bounds.maxX && position.z >= bounds.minZ && position.z <= bounds.maxZ;
    }) || null;
  }

  getZoneById(zoneId) {
    return this.zones.find(zone => zone.id === zoneId) || this.currentZone;
  }

  setLightingState(zoneId, state) {
    if (!zoneId) return;
    this.lightingStates.set(zoneId, state);
  }

  getLightingState(zoneId = this.currentZone?.id) {
    return this.lightingStates.get(zoneId) || 'normal';
  }

  getCurrentContext(remotePlayers = []) {
    const lightingState = this.getLightingState();
    return {
      ...this.currentZone,
      lightingState,
      darknessMultiplier: zoneConfig.darknessFearMultiplier[lightingState] || 1,
      isolationScore: this.getIsolationScore(remotePlayers),
      changed: this.previousZone?.id !== this.currentZone?.id
    };
  }

  getIsolationScore(remotePlayers = []) {
    if (!remotePlayers.length) return 0.35;
    const origin = this.currentPosition || { x: this.currentZone?.centerX || 0, z: this.currentZone?.centerZ || 0 };
    const nearby = remotePlayers.some(player => {
      const dx = player.x - origin.x;
      const dz = player.z - origin.z;
      return Math.sqrt(dx * dx + dz * dz) <= zoneConfig.isolationRadius;
    });
    return nearby ? 0.05 : 0.75;
  }

  getZones() {
    return this.zones;
  }
}
