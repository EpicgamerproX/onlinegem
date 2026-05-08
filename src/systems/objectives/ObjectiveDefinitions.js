export const objectiveDefinitions = [
  {
    id: 'restore_sector_power',
    title: 'Restore sector power',
    type: 'primary',
    interactionTypes: ['breaker'],
    zonePool: ['maintenance', 'archive', 'server'],
    description: 'Hold the breaker until the relay catches.',
    reward: { lighting: 'recover_zone', relief: 0.08 },
    pressure: 0.18
  },
  {
    id: 'reconnect_server_node',
    title: 'Reconnect server node',
    type: 'primary',
    interactionTypes: ['server_terminal'],
    zonePool: ['server'],
    description: 'Keep the terminal alive through the fan surge.',
    reward: { lighting: 'stabilize_random', relief: 0.07 },
    pressure: 0.22
  },
  {
    id: 'reactivate_emergency_lighting',
    title: 'Reactivate emergency lighting',
    type: 'primary',
    interactionTypes: ['security_console', 'breaker'],
    zonePool: ['security', 'maintenance'],
    description: 'Bring emergency strips online before the next blackout.',
    reward: { lighting: 'emergency_route', relief: 0.06 },
    pressure: 0.2
  },
  {
    id: 'access_restricted_meeting',
    title: 'Access restricted meeting room',
    type: 'primary',
    interactionTypes: ['security_console'],
    zonePool: ['conference', 'security'],
    description: 'Open the meeting wing without triggering every shutter.',
    reward: { unlock: 'conference', relief: 0.05 },
    pressure: 0.16
  },
  {
    id: 'recover_employee_file',
    title: 'Recover corrupted employee file',
    type: 'secondary',
    interactionTypes: ['file_box'],
    zonePool: ['archive', 'executive'],
    description: 'Pull one file before the shelves start answering.',
    reward: { lore: true, relief: 0.05 },
    pressure: 0.12
  },
  {
    id: 'investigate_sound_anomaly',
    title: 'Investigate sound anomaly',
    type: 'secondary',
    interactionTypes: ['speakerphone', 'motion_sensor'],
    zonePool: ['conference', 'cafeteria', 'cubicles'],
    description: 'Find the repeating sound and make it stop.',
    reward: { anomalyCooldown: 20, relief: 0.06 },
    pressure: 0.15
  },
  {
    id: 'recover_voice_log',
    title: 'Recover voice log',
    type: 'secondary',
    interactionTypes: ['voice_log'],
    zonePool: ['executive', 'security', 'archive'],
    description: 'Play the log quietly enough to remember it safely.',
    reward: { lore: true, relief: 0.04 },
    pressure: 0.14
  }
];
