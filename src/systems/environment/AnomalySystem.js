import * as THREE from 'three';
import { anomalyConfig } from '../../config/anomalyConfig.js';

export class AnomalySystem {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.audioEngine = null;
    this.timer = 5;
    this.events = [];
    this.shadow = null;
    this.monitorPhraseCooldown = 0;
  }

  init(scene, camera, audioEngine = null) {
    this.scene = scene;
    this.camera = camera;
    this.audioEngine = audioEngine;
    this.createShadow();
  }

  update(deltaTime, context) {
    this.timer -= deltaTime;
    this.monitorPhraseCooldown = Math.max(0, this.monitorPhraseCooldown - deltaTime);
    if (this.shadow) this.shadow.visible = false;
    if (this.timer > 0) return;

    const fear = context.fearRatio || 0;
    const phase = context.missionState?.phase || 1;
    const zone = context.zoneContext;
    const pressure = (zone?.pressure || 1) * (phase * 0.2 + 0.8);
    const chance = Math.min(0.86, fear * 0.58 + pressure * 0.12);
    this.timer = this.nextInterval(fear, phase);
    if (Math.random() > chance) return;

    const effect = this.pickEffect(fear, phase);
    this.trigger(effect, context);
  }

  trigger(effect, context) {
    switch (effect) {
      case 'phantom_steps':
        this.audioEngine?.playTransient?.({ type: 'steps', intensity: 0.18, duration: 0.8 });
        this.events.push({ type: 'sound', label: 'phantom_steps', threat: 0.08 });
        break;
      case 'keyboard_burst':
        this.audioEngine?.playTransient?.({ type: 'keyboard', intensity: 0.15, duration: 0.55 });
        break;
      case 'delayed_clack':
        this.audioEngine?.playTransient?.({ type: 'metal', intensity: 0.2, duration: 0.6 });
        this.events.push({ type: 'entity_interest', amount: 0.08 });
        break;
      case 'false_teammate':
        this.events.push({ type: 'radio_interference', amount: 0.2 });
        this.audioEngine?.playTransient?.({ type: 'voice_fragment', intensity: 0.12, duration: 1.1 });
        break;
      case 'shadow_crossing':
        this.showShadow(context);
        break;
      case 'monitor_phrase':
        if (this.monitorPhraseCooldown <= 0) {
          this.monitorPhraseCooldown = 20;
          this.events.push({ type: 'monitor_phrase', text: 'QUIET FLOOR ACTIVE' });
        }
        break;
      case 'fixture_attention':
        this.events.push({ type: 'lighting_pulse', zoneId: context.zoneContext?.id });
        break;
      default:
        break;
    }
  }

  showShadow(context) {
    if (!this.shadow || !this.camera) return;
    const yaw = this.camera.rotation.y + Math.PI * 0.5;
    this.shadow.position.set(
      this.camera.position.x + Math.sin(yaw) * 3.2,
      1.4,
      this.camera.position.z + Math.cos(yaw) * 3.2
    );
    this.shadow.lookAt(this.camera.position.x, 1.4, this.camera.position.z);
    this.shadow.visible = true;
    this.events.push({ type: 'entity_interest', amount: 0.04, zoneId: context.zoneContext?.id });
  }

  createShadow() {
    const material = new THREE.MeshBasicMaterial({
      color: 0x020303,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 2.8), material);
    this.shadow.visible = false;
    this.scene.add(this.shadow);
  }

  drainEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }

  nextInterval(fear, phase) {
    const min = anomalyConfig.minInterval / Math.max(1, phase * 0.7);
    const max = anomalyConfig.maxInterval / Math.max(1, fear + 0.6);
    return min + Math.random() * Math.max(2, max - min);
  }

  pickEffect(fear, phase) {
    if (phase >= 4 || fear >= anomalyConfig.fearThresholds.collapse) {
      return this.random(['false_teammate', 'shadow_crossing', 'fixture_attention', 'delayed_clack']);
    }
    if (fear >= anomalyConfig.fearThresholds.personal) {
      return this.random(['false_teammate', 'shadow_crossing', 'monitor_phrase', 'delayed_clack']);
    }
    if (fear >= anomalyConfig.fearThresholds.misleading) {
      return this.random(['phantom_steps', 'keyboard_burst', 'fixture_attention', 'monitor_phrase']);
    }
    return this.random(['phantom_steps', 'keyboard_burst']);
  }

  random(items) {
    return items[Math.floor(Math.random() * items.length)];
  }
}
