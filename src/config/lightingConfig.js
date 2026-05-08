export const lightingConfig = {
  states: {
    normal: { intensity: 1, emissive: 0.85, flicker: 0.025 },
    unstable: { intensity: 0.72, emissive: 0.55, flicker: 0.18 },
    recovering: { intensity: 0.45, emissive: 0.35, flicker: 0.28 },
    emergency: { intensity: 0.34, emissive: 0.28, flicker: 0.08 },
    blackout: { intensity: 0.05, emissive: 0.05, flicker: 0.02 }
  },
  blackoutInterval: 38,
  maxActiveShadowLights: 1,
  recoveryDelay: 5
};
