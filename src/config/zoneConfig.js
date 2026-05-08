export const zoneDefinitions = [
  {
    id: 'lobby',
    name: 'Elevator Lobby',
    bounds: { minX: -6, maxX: 6, minZ: 15, maxZ: 24 },
    pressure: 0.65,
    lightingGroup: 'lobby',
    ambientProfile: 'distant_elevator',
    soundPropagation: 1.05,
    falseSafe: false
  },
  {
    id: 'cubicles',
    name: 'Cubicle Maze',
    bounds: { minX: -10, maxX: 10, minZ: -7, maxZ: 8 },
    pressure: 0.95,
    lightingGroup: 'cubicles',
    ambientProfile: 'fluorescent_buzz',
    soundPropagation: 1.15,
    falseSafe: false
  },
  {
    id: 'executive',
    name: 'Executive Offices',
    bounds: { minX: 11, maxX: 27, minZ: -8, maxZ: 9 },
    pressure: 0.75,
    lightingGroup: 'executive',
    ambientProfile: 'glass_creak',
    soundPropagation: 0.82,
    falseSafe: true
  },
  {
    id: 'conference',
    name: 'Conference Wing',
    bounds: { minX: 10, maxX: 27, minZ: 10, maxZ: 23 },
    pressure: 0.9,
    lightingGroup: 'conference',
    ambientProfile: 'speaker_static',
    soundPropagation: 1,
    falseSafe: false
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    bounds: { minX: -27, maxX: -11, minZ: 8, maxZ: 23 },
    pressure: 0.72,
    lightingGroup: 'cafeteria',
    ambientProfile: 'vending_hum',
    soundPropagation: 1.2,
    falseSafe: true
  },
  {
    id: 'archive',
    name: 'Archive Room',
    bounds: { minX: -27, maxX: -11, minZ: -8, maxZ: 7 },
    pressure: 1.25,
    lightingGroup: 'archive',
    ambientProfile: 'paper_shift',
    soundPropagation: 0.72,
    falseSafe: false
  },
  {
    id: 'server',
    name: 'Server Room',
    bounds: { minX: -27, maxX: -11, minZ: -25, maxZ: -9 },
    pressure: 1.45,
    lightingGroup: 'server',
    ambientProfile: 'server_fans',
    soundPropagation: 1.35,
    falseSafe: false
  },
  {
    id: 'maintenance',
    name: 'Maintenance Corridor',
    bounds: { minX: -10, maxX: 10, minZ: -25, maxZ: -15 },
    pressure: 1.35,
    lightingGroup: 'maintenance',
    ambientProfile: 'pipe_knock',
    soundPropagation: 1.25,
    falseSafe: false
  },
  {
    id: 'security',
    name: 'Security Room',
    bounds: { minX: 11, maxX: 27, minZ: -25, maxZ: -14 },
    pressure: 0.85,
    lightingGroup: 'security',
    ambientProfile: 'camera_relay',
    soundPropagation: 0.9,
    falseSafe: true
  },
  {
    id: 'basement',
    name: 'Parking Basement',
    bounds: { minX: 11, maxX: 27, minZ: -13, maxZ: -9 },
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
