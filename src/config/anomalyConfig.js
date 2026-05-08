export const anomalyConfig = {
  minInterval: 7,
  maxInterval: 16,
  fearThresholds: {
    ambient: 0.18,
    misleading: 0.38,
    personal: 0.62,
    collapse: 0.82
  },
  effects: [
    'phantom_steps',
    'keyboard_burst',
    'delayed_clack',
    'false_teammate',
    'shadow_crossing',
    'monitor_phrase',
    'fixture_attention'
  ]
};
