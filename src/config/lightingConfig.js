export const lightingConfig = {
  states: {
    normal: { intensity: 1, emissive: 0.85, flicker: 0.025 },
    unstable: { intensity: 0.72, emissive: 0.55, flicker: 0.18 },
    recovering: { intensity: 0.45, emissive: 0.35, flicker: 0.28 },
    emergency: { intensity: 0.34, emissive: 0.28, flicker: 0.08 },
    blackout: { intensity: 0.05, emissive: 0.05, flicker: 0.02 },
    red_lockdown: { intensity: 0.22, emissive: 0.45, flicker: 0.22 },
    startup: { intensity: 0.18, emissive: 0.18, flicker: 0.14 }
  },
  blackoutInterval: 38,
  failureInterval: 24,
  maxActiveShadowLights: 1,
  recoveryDelay: 5,
  startupDelay: 1.8,
  trailShutdownChance: 0.18
};
