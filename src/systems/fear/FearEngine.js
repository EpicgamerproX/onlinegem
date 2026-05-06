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

  update(noiseLevel, entityDistance, deltaTime) {
    // Calculate fear level based on inputs
    let fearIncrease = 0;

    // Noise contribution
    fearIncrease += noiseLevel * 20;

    // Proximity contribution (inverse distance)
    const proximityFactor = Math.max(0, 1 - (entityDistance / 20));
    fearIncrease += proximityFactor * 30;

    // Time pressure
    fearIncrease += deltaTime * 5;

    this.fearLevel += fearIncrease * deltaTime;
    this.fearLevel = Math.min(this.maxFearLevel, this.fearLevel);

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
}
