import * as THREE from 'three';

export class EntityBehavior {
  constructor() {
    this.state = 'dormant_pressure';
    this.stateTimer = 0;
    this.threat = 0.1;
    this.targetPosition = new THREE.Vector3(0, 1.2, -12);
    this.lastHeardPosition = new THREE.Vector3(0, 1.2, 0);
    this.manipulations = [];
    this.temperament = this.pickTemperament();
  }

  update(context) {
    const {
      noiseLevel = 0,
      noiseCategory = 'silent',
      deltaTime = 0,
      playerPosition,
      zoneContext,
      fearRatio = 0,
      missionState,
      soundEvents = [],
      remotePlayers = []
    } = context;

    this.stateTimer -= deltaTime;
    this.consumeSounds(soundEvents, playerPosition);

    const phase = missionState?.phase || 1;
    const zonePressure = zoneContext?.pressure || 1;
    const isolation = zoneContext?.isolationScore || 0;
    const noiseThreat = noiseLevel * (noiseCategory === 'very_loud' ? 2.4 : noiseCategory === 'loud' ? 1.7 : 1);
    this.threat = THREE.MathUtils.clamp(
      this.threat + (noiseThreat * 0.16 + fearRatio * 0.035 + phase * 0.012 + zonePressure * 0.01 + isolation * 0.025) * deltaTime,
      0,
      1
    );

    if (this.stateTimer <= 0) {
      this.chooseState({ noiseLevel, noiseCategory, fearRatio, phase, isolation, zonePressure, remotePlayers });
    }

    this.updateTarget(playerPosition, zoneContext, deltaTime);
    return {
      state: this.state,
      threat: this.threat,
      targetPosition: this.targetPosition,
      speedMultiplier: this.getSpeedMultiplier(noiseLevel, phase),
      visibilityBias: this.getVisibilityBias(fearRatio),
      manipulations: this.drainManipulations()
    };
  }

  consumeSounds(soundEvents, fallbackPosition) {
    soundEvents.forEach(event => {
      if (!event?.position && !fallbackPosition) return;
      const threat = event.threat || 0.08;
      if (threat < 0.06) return;
      const pos = event.position || fallbackPosition;
      this.lastHeardPosition.copy(pos);
      this.threat = Math.min(1, this.threat + threat);
      if (event.type === 'interaction_complete' || event.type === 'interaction_start' || event.type === 'pickup_complete') {
        this.state = 'investigating';
        this.stateTimer = 5 + threat * 12;
      }
      if (event.type === 'object_drop') {
        this.state = 'closing';
        this.stateTimer = 4 + threat * 8;
        this.manipulations.push({ type: 'pulse_light' });
      }
    });
  }

  chooseState({ noiseLevel, noiseCategory, fearRatio, phase, isolation, zonePressure, zoneContext }) {
    if (this.threat > 0.86 || fearRatio > 0.9) {
      this.state = 'closing';
      this.stateTimer = 5;
    } else if (zoneContext?.lightingState === 'blackout' && phase >= 3 && Math.random() < 0.4) {
      this.state = 'closing';
      this.stateTimer = 4 + Math.random() * 3;
    } else if (isolation > 0.55 && phase >= 3) {
      this.state = 'isolating';
      this.stateTimer = 6 + Math.random() * 4;
      this.manipulations.push({ type: 'suppress_light' });
    } else if (noiseCategory === 'loud' || noiseCategory === 'very_loud' || noiseLevel > 0.22) {
      this.state = 'investigating';
      this.stateTimer = 5 + Math.random() * 5;
    } else if (fearRatio > 0.58 || zonePressure > 1.2) {
      this.state = Math.random() > 0.45 ? 'stalking' : 'observing';
      this.stateTimer = 5 + Math.random() * 6;
    } else if (phase >= 2 && Math.random() > 0.62) {
      this.state = 'interfering';
      this.stateTimer = 3.5;
      this.manipulations.push({ type: 'pulse_light' });
    } else {
      this.state = 'listening';
      this.stateTimer = 4 + Math.random() * 4;
    }

    if (this.state === 'closing' && Math.random() < 0.18) {
      this.state = 'fake_retreat';
      this.stateTimer = 2.5;
      this.manipulations.push({ type: 'fake_retreat' });
    }
  }

  updateTarget(playerPosition, zoneContext, deltaTime) {
    if (!playerPosition) return;
    const offset = this.getStateOffset(playerPosition, zoneContext);
    const desired = new THREE.Vector3(
      playerPosition.x + offset.x,
      1.2,
      playerPosition.z + offset.z
    );

    if (this.state === 'investigating') desired.copy(this.lastHeardPosition).setY(1.2);
    this.targetPosition.lerp(desired, Math.min(1, deltaTime * 1.8));
  }

  getStateOffset(playerPosition, zoneContext) {
    const pressure = zoneContext?.pressure || 1;
    switch (this.state) {
      case 'listening':
        return { x: -8, z: -10 };
      case 'investigating':
        return { x: 0, z: 0 };
      case 'stalking':
        return { x: Math.sin(this.stateTimer) * 5, z: -6 / pressure };
      case 'observing':
        return { x: 3.5, z: -5.5 };
      case 'isolating':
        return { x: -2.2, z: -3.8 };
      case 'fake_retreat':
        return { x: 7, z: 9 };
      case 'interfering':
        return { x: -6, z: 4 };
      case 'closing':
        return { x: 0, z: -1.2 };
      default:
        return { x: 0, z: -14 };
    }
  }

  getSpeedMultiplier(noiseLevel, phase) {
    const stateSpeed = {
      dormant_pressure: 0.35,
      listening: 0.5,
      investigating: 1.15,
      stalking: 0.82,
      observing: 0.25,
      isolating: 1,
      fake_retreat: 1.35,
      interfering: 0.7,
      closing: 1.75
    }[this.state] || 1;
    return stateSpeed * this.temperament.speed * (1 + noiseLevel * 1.2 + phase * 0.08);
  }

  getVisibilityBias(fearRatio) {
    if (this.state === 'observing') return 0.5 + fearRatio * 0.25;
    if (this.state === 'stalking' || this.state === 'isolating') return 0.32 + fearRatio * 0.2;
    if (this.state === 'closing') return 0.75;
    if (this.state === 'fake_retreat') return 0.18;
    return 0.08;
  }

  drainManipulations() {
    const drained = this.manipulations;
    this.manipulations = [];
    return drained;
  }

  pickTemperament() {
    const temperaments = [
      { id: 'patient_stalker', speed: 0.85 },
      { id: 'aggressive_listener', speed: 1.08 },
      { id: 'isolating_manipulator', speed: 0.96 }
    ];
    return temperaments[Math.floor(Math.random() * temperaments.length)];
  }
}
