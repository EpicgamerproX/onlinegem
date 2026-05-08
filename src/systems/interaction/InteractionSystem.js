import { RaycastHandler } from './RaycastHandler.js';

export class InteractionSystem {
  constructor() {
    this.raycastHandler = new RaycastHandler();
    this.interactables = [];
    this.activeTarget = null;
    this.holdProgress = 0;
    this.events = [];
    this.keys = {};
    this.prompt = null;
    this.currentInteractionId = null;
    this.boundKeyDown = event => this.onKeyDown(event);
    this.boundKeyUp = event => this.onKeyUp(event);
  }

  init({ interactables = [] } = {}) {
    this.interactables = interactables;
    this.raycastHandler.setTargets(interactables);
    this.createPrompt();
    document.addEventListener('keydown', this.boundKeyDown);
    document.addEventListener('keyup', this.boundKeyUp);
  }

  update(camera, deltaTime, context = {}) {
    this.activeTarget = this.raycastHandler.getTarget(camera);
    const isHolding = Boolean(this.keys.KeyE && this.activeTarget && !this.activeTarget.disabled);
    this.currentInteractionId = isHolding ? this.activeTarget.id : null;

    if (!this.activeTarget) {
      this.holdProgress = 0;
      this.updatePrompt(null);
      return;
    }

    const holdTime = this.activeTarget.holdTime || 1.2;
    if (isHolding) {
      this.holdProgress = Math.min(1, this.holdProgress + deltaTime / holdTime);
      if (!this.activeTarget.soundStarted) {
        this.activeTarget.soundStarted = true;
        this.events.push(this.createSoundEvent(this.activeTarget, context, 'interaction_start'));
      }
      if (this.holdProgress >= 1) {
        this.completeInteraction(this.activeTarget, context);
      }
    } else {
      if (this.holdProgress > 0.08) {
        this.events.push(this.createSoundEvent(this.activeTarget, context, 'interaction_cancel'));
      }
      this.holdProgress = Math.max(0, this.holdProgress - deltaTime * 2.5);
      this.activeTarget.soundStarted = false;
    }

    this.updatePrompt(this.activeTarget);
  }

  completeInteraction(target, context) {
    target.soundStarted = false;
    target.uses = (target.uses || 0) + 1;
    this.holdProgress = 0;
    const sound = this.createSoundEvent(target, context, 'interaction_complete');
    this.events.push(sound);
    this.events.push({
      type: 'interaction_complete',
      interactableId: target.id,
      kind: target.kind,
      zoneId: target.zoneId,
      label: target.label,
      sound
    });
  }

  createSoundEvent(target, context, type) {
    const multiplier = context.zoneContext?.soundPropagation || 1;
    return {
      type,
      soundType: target.soundType || 'mechanical',
      interactableId: target.id,
      zoneId: target.zoneId,
      position: target.mesh?.position?.clone?.() || null,
      radius: (target.soundRadius || 7) * multiplier,
      threat: target.threat || 0.12,
      duration: target.holdTime || 1,
      label: target.label
    };
  }

  drainEvents() {
    const drained = this.events;
    this.events = [];
    return drained;
  }

  getCurrentInteractionId() {
    return this.currentInteractionId;
  }

  onKeyDown(event) {
    if (event.code === 'KeyE') this.keys.KeyE = true;
  }

  onKeyUp(event) {
    if (event.code === 'KeyE') this.keys.KeyE = false;
  }

  createPrompt() {
    this.prompt = document.createElement('div');
    this.prompt.id = 'interaction-prompt';
    document.body.appendChild(this.prompt);
  }

  updatePrompt(target) {
    if (!this.prompt) return;
    if (!target) {
      this.prompt.textContent = '';
      this.prompt.classList.remove('is-visible');
      return;
    }
    const blocks = Math.round(this.holdProgress * 8);
    const meter = ''.padStart(blocks, '#').padEnd(8, '-');
    this.prompt.textContent = `E ${target.label} [${meter}]`;
    this.prompt.classList.add('is-visible');
  }
}
