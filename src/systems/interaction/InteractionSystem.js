import { RaycastHandler } from './RaycastHandler.js';
import { CarrySystem } from './CarrySystem.js';

export class InteractionSystem {
  constructor() {
    this.raycastHandler = new RaycastHandler();
    this.carrySystem = new CarrySystem();
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

  init({ interactables = [], camera = null, scene = null } = {}) {
    this.interactables = interactables;
    this.carrySystem.init(camera, scene);
    this.refreshTargets();
    this.createPrompt();
    document.addEventListener('keydown', this.boundKeyDown);
    document.addEventListener('keyup', this.boundKeyUp);
  }

  refreshTargets() {
    this.raycastHandler.setTargets(this.interactables.filter(item => !item.mesh.userData.carried));
  }

  update(camera, deltaTime, context = {}) {
    this.carrySystem.update(deltaTime);
    this.activeTarget = this.raycastHandler.getTarget(camera);
    const holdingObject = this.carrySystem.hasHeldItem();
    const isHoldingAction = Boolean(this.keys.KeyE && this.activeTarget && !holdingObject && !this.activeTarget.disabled);
    this.currentInteractionId = isHoldingAction ? this.activeTarget.id : null;

    if (holdingObject) {
      this.holdProgress = 0;
      this.updatePrompt({ label: this.carrySystem.heldItem.label, isHolding: true });
      return;
    }

    if (!this.activeTarget) {
      this.holdProgress = 0;
      this.updatePrompt(null);
      return;
    }

    const holdTime = this.activeTarget.holdTime || (this.activeTarget.pickupable ? 0.9 : 1.2);
    if (isHoldingAction) {
      this.holdProgress = Math.min(1, this.holdProgress + deltaTime / holdTime);
      if (!this.activeTarget.soundStarted) {
        this.activeTarget.soundStarted = true;
        this.events.push(this.createSoundEvent(this.activeTarget, context, 'interaction_start'));
      }
      if (this.holdProgress >= 1) {
        this.completeInteraction(this.activeTarget, context);
      }
    } else {
      if (this.holdProgress > 0.08 && this.activeTarget.soundStarted) {
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
    if (target.pickupable) {
      const carried = this.carrySystem.pickup(target);
      this.refreshTargets();
      this.events.push(this.createSoundEvent(target, context, 'pickup_complete'));
      this.events.push({
        type: 'pickup_complete',
        interactableId: target.id,
        kind: target.kind,
        zoneId: target.zoneId,
        label: target.label,
        carried
      });
      return;
    }

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

  dropHeldObject(context = {}) {
    if (!this.carrySystem.hasHeldItem()) return;
    const dropped = this.carrySystem.drop();
    if (!dropped) return;
    this.refreshTargets();
    this.events.push({
      ...dropped,
      position: this.carrySystem.camera.position.clone(),
      radius: dropped.radius,
      duration: dropped.duration
    });
  }

  toggleInspect() {
    return this.carrySystem.toggleInspect();
  }

  createSoundEvent(target, context, type) {
    const multiplier = context.zoneContext?.soundPropagation || 1;
    const baseThreat = target.threat || 0.12;
    const weightPenalty = target.weight ? Math.min(0.24, target.weight * 0.04) : 0;
    return {
      type,
      soundType: target.soundType || 'mechanical',
      interactableId: target.id,
      zoneId: target.zoneId,
      position: target.mesh?.position?.clone?.() || null,
      radius: (target.soundRadius || 7) * multiplier + (target.weight || 0) * 1.4,
      threat: Math.min(0.82, baseThreat + weightPenalty),
      duration: Math.max(0.8, (target.holdTime || 1) * 0.9),
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

  getCarryPenalty() {
    return this.carrySystem.getCarryPenalty();
  }

  onKeyDown(event) {
    if (event.code === 'KeyE') {
      if (this.carrySystem.hasHeldItem()) {
        this.dropHeldObject();
        return;
      }
      this.keys.KeyE = true;
    }
    if (event.code === 'KeyR') {
      this.toggleInspect();
    }
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
      if (this.carrySystem.hasHeldItem()) {
        const held = this.carrySystem.heldItem;
        this.prompt.textContent = `E drop ${held.label} · R inspect`;
        this.prompt.classList.add('is-visible');
        return;
      }
      this.prompt.textContent = '';
      this.prompt.classList.remove('is-visible');
      return;
    }

    const blocks = Math.round(this.holdProgress * 8);
    const meter = ''.padStart(blocks, '#').padEnd(8, '-');
    const action = target.pickupable ? 'pick up' : 'interact with';
    this.prompt.textContent = `E ${action} ${target.label} [${meter}]`;
    this.prompt.classList.add('is-visible');
  }
}
