export class ObjectiveState {
  constructor(definition, target, difficulty = 1) {
    this.id = `${definition.id}:${target.id}`;
    this.definitionId = definition.id;
    this.title = definition.title;
    this.description = definition.description;
    this.type = definition.type;
    this.targetId = target.id;
    this.targetLabel = target.label;
    this.zoneId = target.zoneId;
    this.completed = false;
    this.failed = false;
    this.progress = 0;
    this.difficulty = difficulty;
    this.timeLimit = definition.type === 'primary' ? 210 - difficulty * 18 : 260 - difficulty * 12;
    this.timeRemaining = Math.max(90, this.timeLimit);
    this.pressure = definition.pressure * difficulty;
    this.reward = definition.reward || {};
  }

  update(deltaTime) {
    if (this.completed || this.failed) return;
    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.failed = true;
    }
  }

  matchesInteraction(event) {
    return !this.completed && !this.failed && event?.interactableId === this.targetId;
  }

  complete() {
    this.completed = true;
    this.progress = 1;
  }
}
