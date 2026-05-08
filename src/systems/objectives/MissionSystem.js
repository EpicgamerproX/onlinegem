import { missionConfig } from '../../config/missionConfig.js';
import { objectiveDefinitions } from './ObjectiveDefinitions.js';
import { ObjectiveState } from './ObjectiveState.js';

export class MissionSystem {
  constructor() {
    this.interactables = [];
    this.activePrimary = null;
    this.activeSecondary = null;
    this.completed = [];
    this.failed = [];
    this.events = [];
    this.phase = 1;
    this.elapsed = 0;
    this.objectiveIndex = 0;
    this.seed = Math.floor(Math.random() * 100000);
    this.hud = null;
  }

  init({ interactables = [] } = {}) {
    this.interactables = interactables;
    this.activePrimary = this.createObjective('primary');
    this.activeSecondary = this.createObjective('secondary');
    this.createHud();
    this.updateHud();
  }

  update(deltaTime) {
    this.elapsed += deltaTime;
    this.phase = this.calculatePhase();
    this.updateObjective(this.activePrimary, 'primary', deltaTime);
    this.updateObjective(this.activeSecondary, 'secondary', deltaTime);
    this.updateHud();
  }

  updateObjective(objective, type, deltaTime) {
    if (!objective) return;
    objective.update(deltaTime);
    if (!objective.failed) return;
    this.failed.push(objective);
    this.events.push({
      type: 'objective_failed',
      objective,
      pressure: missionConfig.failurePressure + objective.pressure
    });
    if (type === 'primary') this.activePrimary = this.createObjective('primary');
    else this.activeSecondary = this.createObjective('secondary');
  }

  consumeInteraction(event) {
    if (!event || event.type !== 'interaction_complete') return;
    const objective = [this.activePrimary, this.activeSecondary].find(item => item?.matchesInteraction(event));
    if (!objective) return;

    objective.complete();
    this.completed.push(objective);
    this.events.push({
      type: 'objective_completed',
      objective,
      reward: objective.reward,
      relief: objective.reward.relief || missionConfig.completionRelief
    });

    if (objective.type === 'primary') {
      this.objectiveIndex += 1;
      this.activePrimary = this.createObjective('primary');
    } else {
      this.activeSecondary = this.createObjective('secondary');
    }
  }

  createObjective(type) {
    const definitions = objectiveDefinitions.filter(definition => definition.type === type);
    const definition = this.pick(definitions, this.objectiveIndex + (type === 'secondary' ? 7 : 0));
    const candidates = this.interactables.filter(interactable => {
      return definition.interactionTypes.includes(interactable.kind) && definition.zonePool.includes(interactable.zoneId);
    });
    const target = this.pick(candidates, this.objectiveIndex + this.phase);
    if (!target) return null;
    return new ObjectiveState(definition, target, this.phase);
  }

  calculatePhase() {
    if (this.elapsed > missionConfig.phaseDurations[3] || this.completed.length >= 7) return 4;
    if (this.elapsed > missionConfig.phaseDurations[2] || this.completed.length >= 5) return 3;
    if (this.elapsed > missionConfig.phaseDurations[1] || this.completed.length >= 2) return 2;
    return 1;
  }

  drainEvents() {
    const drained = this.events;
    this.events = [];
    return drained;
  }

  getState() {
    return {
      phase: this.phase,
      elapsed: this.elapsed,
      completedCount: this.completed.length,
      failedCount: this.failed.length,
      primary: this.activePrimary,
      secondary: this.activeSecondary
    };
  }

  getCurrentInteractionId() {
    return this.activePrimary?.targetId || this.activeSecondary?.targetId || null;
  }

  pick(items, salt = 0) {
    if (!items.length) return null;
    const index = Math.abs(Math.floor(Math.sin(this.seed + salt * 19.19) * 10000)) % items.length;
    return items[index];
  }

  createHud() {
    this.hud = document.createElement('div');
    this.hud.id = 'mission-hud';
    this.hud.innerHTML = `
      <div class="mission-phase"></div>
      <div class="mission-primary"></div>
      <div class="mission-secondary"></div>
    `;
    document.body.appendChild(this.hud);
  }

  updateHud() {
    if (!this.hud) return;
    const phaseNames = ['Orientation', 'Interference', 'Isolation', 'Collapse'];
    this.hud.querySelector('.mission-phase').textContent = `Phase ${this.phase}: ${phaseNames[this.phase - 1]}`;
    this.hud.querySelector('.mission-primary').textContent = this.formatObjective(this.activePrimary, 'Primary');
    this.hud.querySelector('.mission-secondary').textContent = this.formatObjective(this.activeSecondary, 'Optional');
  }

  formatObjective(objective, label) {
    if (!objective) return `${label}: signal unavailable`;
    const seconds = Math.max(0, Math.ceil(objective.timeRemaining));
    return `${label}: ${objective.title} - ${objective.targetLabel} (${seconds}s)`;
  }
}
