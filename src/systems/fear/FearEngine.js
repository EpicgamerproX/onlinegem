import * as THREE from 'three';
import { FearEffects } from './FearEffects.js';

export class FearEngine {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.fearEffects = new FearEffects();
    this.fearLevel = 0;
    this.maxFearLevel = 100;
    this.jumpScareTriggered = false;
  }

  init(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.fearEffects.init(scene, camera);
  }

  update(noiseLevel, entityDistance, deltaTime, context = {}) {
    // Calculate fear level based on inputs
    let fearIncrease = 0;

    // Noise contribution
    fearIncrease += noiseLevel * 20;

    // Proximity contribution (inverse distance)
    const proximityFactor = Math.max(0, 1 - (entityDistance / 20));
    fearIncrease += proximityFactor * 30;

    // Time pressure keeps collapse inevitable even when players stay quiet.
    fearIncrease += 3.2;

    const zoneContext = context.zoneContext || {};
    fearIncrease *= zoneContext.darknessMultiplier || 1;
    fearIncrease += (zoneContext.pressure || 1) * 2.2;
    fearIncrease += (zoneContext.isolationScore || 0) * 8;
    if (context.isInteracting) fearIncrease += 10;
    if (context.entityState?.state === 'observing') fearIncrease += 8;
    if (context.entityState?.state === 'isolating') fearIncrease += 11;

    this.fearLevel += fearIncrease * deltaTime;
    if (context.relief) this.fearLevel -= context.relief * this.maxFearLevel;
    this.fearLevel = Math.min(this.maxFearLevel, this.fearLevel);
    this.fearLevel = Math.max(0, this.fearLevel);

    // Apply effects
    const fearRatio = this.fearLevel / this.maxFearLevel;
    this.fearEffects.update(fearRatio, deltaTime);

    // Check for overload
    if (!this.jumpScareTriggered && (this.fearLevel >= this.maxFearLevel || entityDistance <= 2.45)) {
      this.jumpScareTriggered = true;
      this.fearEffects.triggerJumpScare();
    }
  }

  getFearLevel() {
    return this.fearLevel / this.maxFearLevel;
  }

  setFearLevel(fearRatio) {
    this.fearLevel = Math.max(0, Math.min(1, fearRatio || 0)) * this.maxFearLevel;
  }
}
