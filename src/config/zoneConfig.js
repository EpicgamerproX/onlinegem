export const zoneDefinitions = [
  {
    id: 'lobby',
    name: 'Elevator Lobby',
    bounds: { minX: -7, maxX: 7, minZ: 12, maxZ: 28 },
    pressure: 0.65,
    lightingGroup: 'lobby',
    ambientProfile: 'distant_elevator',
    soundPropagation: 1.05,
    falseSafe: false
  },
  {
    id: 'cubicles',
    name: 'Cubicle Maze',
    bounds: { minX: -11, maxX: 11, minZ: -11, maxZ: 11 },
    pressure: 0.95,
    lightingGroup: 'cubicles',
    ambientProfile: 'fluorescent_buzz',
    soundPropagation: 1.15,
    falseSafe: false
  },
  {
    id: 'executive',
    name: 'Executive Offices',
    bounds: { minX: 12, maxX: 35, minZ: -8, maxZ: 10 },
    pressure: 0.75,
    lightingGroup: 'executive',
    ambientProfile: 'glass_creak',
    soundPropagation: 0.82,
    falseSafe: true
  },
  {
    id: 'conference',
    name: 'Conference Wing',
    bounds: { minX: 12, maxX: 35, minZ: 11, maxZ: 28 },
    pressure: 0.9,
    lightingGroup: 'conference',
    ambientProfile: 'speaker_static',
    soundPropagation: 1,
    falseSafe: false
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    bounds: { minX: -35, maxX: -12, minZ: 9, maxZ: 28 },
    pressure: 0.72,
    lightingGroup: 'cafeteria',
    ambientProfile: 'vending_hum',
    soundPropagation: 1.2,
    falseSafe: true
  },
  {
    id: 'archive',
    name: 'Archive Room',
    bounds: { minX: -35, maxX: -12, minZ: -9, maxZ: 8 },
    pressure: 1.25,
    lightingGroup: 'archive',
    ambientProfile: 'paper_shift',
    soundPropagation: 0.72,
    falseSafe: false
  },
  {
    id: 'server',
    name: 'Server Room',
    bounds: { minX: -35, maxX: -12, minZ: -34, maxZ: -10 },
    pressure: 1.45,
    lightingGroup: 'server',
    ambientProfile: 'server_fans',
    soundPropagation: 1.35,
    falseSafe: false
  },
  {
    id: 'maintenance',
    name: 'Maintenance Corridor',
    bounds: { minX: -11, maxX: 11, minZ: -34, maxZ: -16 },
    pressure: 1.35,
    lightingGroup: 'maintenance',
    ambientProfile: 'pipe_knock',
    soundPropagation: 1.25,
    falseSafe: false
  },
  {
    id: 'security',
    name: 'Security Room',
    bounds: { minX: 12, maxX: 24, minZ: -34, maxZ: -24 },
    pressure: 0.85,
    lightingGroup: 'security',
    ambientProfile: 'camera_relay',
    soundPropagation: 0.9,
    falseSafe: true
  },
  {
    id: 'basement',
    name: 'Parking Basement',
    bounds: { minX: 12, maxX: 35, minZ: -23, maxZ: -10 },
    pressure: 1.5,
    lightingGroup: 'basement',
    ambientProfile: 'concrete_echo',
    soundPropagation: 1.45,
    falseSafe: false
  }
];

export const zoneConfig = {
  defaultZoneId: 'cubicles',
  darknessFearMultiplier: {
    normal: 1,
    unstable: 1.08,
    recovering: 1.12,
    emergency: 1.22,
    blackout: 1.42
  },
  isolationRadius: 7.5
};
