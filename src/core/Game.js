import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { Renderer } from './Renderer.js';
import { CameraController } from './CameraController.js';
import { Loop } from './Loop.js';
import { MicAnalyzer } from '../systems/audio/MicAnalyzer.js';
import { FearEngine } from '../systems/fear/FearEngine.js';
import { EntityController } from '../systems/entity/EntityController.js';
import { AudioEngine } from '../systems/audio/AudioEngine.js';
import { NetworkManager } from '../systems/multiplayer/NetworkManager.js';
import { PlayerSync } from '../systems/multiplayer/PlayerSync.js';
import { WorldStateService } from '../services/WorldStateService.js';
import { InteractionSystem } from '../systems/interaction/InteractionSystem.js';
import { MissionSystem } from '../systems/objectives/MissionSystem.js';
import { AnomalySystem } from '../systems/environment/AnomalySystem.js';

export class Game {
  constructor() {
    this.sceneManager = new SceneManager();
    this.renderer = new Renderer();
    this.cameraController = new CameraController();
    this.loop = new Loop(this.tick.bind(this), this.render.bind(this));
    this.micAnalyzer = new MicAnalyzer();
    this.fearEngine = new FearEngine();
    this.entityController = new EntityController();
    this.audioEngine = new AudioEngine();
    this.playerSync = new PlayerSync();
    this.networkManager = new NetworkManager(this.playerSync);
    this.interactionSystem = new InteractionSystem();
    this.missionSystem = new MissionSystem();
    this.anomalySystem = new AnomalySystem();
    this.worldStateService = null;
    this.autosaveTimer = 0;
    this.pendingSoundEvents = [];
    this.pendingRelief = 0;
    this.zoneContext = null;
    this.user = null;
    this.profile = null;

    this.clock = new THREE.Clock();
    this.deltaTime = 0;
  }

  async start({ session, profile }) {
    console.log('Initializing game...');
    this.user = session.user;
    this.profile = profile;
    this.worldStateService = new WorldStateService(this.user.id);
    const savedState = await this.worldStateService.load();

    // Initialize Three.js scene
    this.sceneManager.init();
    console.log('Scene manager initialized');

    this.cameraController.init({
      spawn: savedState,
      bounds: this.sceneManager.officeMap.getNavigationBounds(),
      colliders: this.sceneManager.officeMap.getCollisionBoxes()
    });
    console.log('Camera initialized');

    this.renderer.init(this.sceneManager.scene, this.cameraController.camera);
    console.log('Renderer initialized');

    // Initialize systems
    await this.micAnalyzer.init();
    console.log('Mic analyzer initialized');

    this.fearEngine.init(this.sceneManager.scene, this.cameraController.camera);
    this.fearEngine.setFearLevel(savedState.fear_level || 0);
    this.entityController.init(this.sceneManager.scene);
    this.audioEngine.init();
    this.playerSync.init(this.sceneManager.scene);
    this.interactionSystem.init({
      interactables: this.sceneManager.officeMap.getInteractables()
    });
    this.missionSystem.init({
      interactables: this.sceneManager.officeMap.getInteractables()
    });
    this.anomalySystem.init(this.sceneManager.scene, this.cameraController.camera, this.audioEngine);
    await this.networkManager.init({ user: this.user, profile });
    this.installPersistenceHandlers();

    // Start game loop
    this.loop.start();
    console.log('Signal Lost: Office started - Scene objects:', this.sceneManager.scene.children.length);
  }

  tick(deltaTime) {
    this.deltaTime = deltaTime;

    this.micAnalyzer.update();
    this.cameraController.update(deltaTime);

    const remotePlayers = this.networkManager.getRemotePlayers();
    this.zoneContext = this.sceneManager.zoneManager.update(this.cameraController.camera.position, remotePlayers);

    this.interactionSystem.update(this.cameraController.camera, deltaTime, {
      zoneContext: this.zoneContext
    });
    this.consumeInteractionEvents();

    this.missionSystem.update(deltaTime);
    this.consumeMissionEvents();

    const soundEvents = this.pendingSoundEvents;
    this.pendingSoundEvents = [];

    this.entityController.update(this.micAnalyzer.getNoiseLevel(), deltaTime, this.cameraController.camera, {
      noiseCategory: this.micAnalyzer.getNoiseCategory(),
      zoneContext: this.zoneContext,
      missionState: this.missionSystem.getState(),
      fearRatio: this.fearEngine.getFearLevel(),
      soundEvents,
      remotePlayers
    });
    this.consumeEntityManipulations();

    this.fearEngine.update(this.micAnalyzer.getNoiseLevel(), this.entityController.getEntityDistance(), deltaTime, {
      zoneContext: this.zoneContext,
      isInteracting: Boolean(this.interactionSystem.getCurrentInteractionId()),
      entityState: this.entityController.getState(),
      relief: this.pendingRelief
    });
    this.pendingRelief = 0;

    this.anomalySystem.update(deltaTime, {
      zoneContext: this.zoneContext,
      missionState: this.missionSystem.getState(),
      fearRatio: this.fearEngine.getFearLevel(),
      entityState: this.entityController.getState()
    });
    this.consumeAnomalyEvents();

    this.sceneManager.update(deltaTime, {
      zoneContext: this.zoneContext,
      missionState: this.missionSystem.getState(),
      entityState: this.entityController.getState()
    });

    this.networkManager.update(this.cameraController, deltaTime, this.createNetworkState());
    this.updateAutosave(deltaTime);
  }

  render() {
    this.renderer.render();
  }

  getWorldSnapshot() {
    const pose = this.cameraController.getPose();
    return {
      ...pose,
      fearLevel: this.fearEngine.getFearLevel()
    };
  }

  updateAutosave(deltaTime) {
    this.autosaveTimer += deltaTime;
    if (this.autosaveTimer < 5) return;
    this.autosaveTimer = 0;
    this.saveWorldState('autosave');
  }

  saveWorldState(reason) {
    if (!this.worldStateService || !this.cameraController.camera) return;
    return this.worldStateService.save(this.getWorldSnapshot(), reason);
  }

  consumeInteractionEvents() {
    this.interactionSystem.drainEvents().forEach(event => {
      if (event.soundType) {
        this.pendingSoundEvents.push(event);
        this.audioEngine.playTransient({
          type: event.soundType,
          intensity: Math.min(0.22, 0.05 + event.threat),
          duration: Math.min(2.4, event.duration || 1)
        });
      }
      if (event.type === 'interaction_complete') {
        this.missionSystem.consumeInteraction(event);
      }
    });
  }

  consumeMissionEvents() {
    this.missionSystem.drainEvents().forEach(event => {
      this.sceneManager.applyWorldEvent(event);
      if (event.relief) this.pendingRelief += event.relief;
      if (event.pressure) {
        this.pendingSoundEvents.push({
          type: 'objective_pressure',
          zoneId: event.objective?.zoneId,
          threat: event.pressure,
          position: this.cameraController.camera.position.clone()
        });
      }
    });
  }

  consumeEntityManipulations() {
    this.entityController.drainManipulations().forEach(manipulation => {
      this.sceneManager.applyWorldEvent({
        type: 'entity_manipulation',
        action: manipulation.type,
        zoneId: this.zoneContext?.id
      });
      if (manipulation.type === 'fake_retreat') {
        this.audioEngine.playTransient({ type: 'steps', intensity: 0.12, duration: 0.8 });
      }
    });
  }

  consumeAnomalyEvents() {
    this.anomalySystem.drainEvents().forEach(event => {
      if (event.type === 'lighting_pulse') this.sceneManager.applyWorldEvent(event);
      if (event.type === 'entity_interest') {
        this.pendingSoundEvents.push({
          type: 'anomaly_interest',
          threat: event.amount,
          zoneId: event.zoneId,
          position: this.cameraController.camera.position.clone()
        });
      }
    });
  }

  createNetworkState() {
    const fear = this.fearEngine.getFearLevel();
    return {
      zoneId: this.zoneContext?.id,
      noiseCategory: this.micAnalyzer.getNoiseCategory(),
      fearBand: fear > 0.72 ? 'high' : fear > 0.38 ? 'medium' : 'low',
      objectiveInteractionId: this.interactionSystem.getCurrentInteractionId(),
      distress: Number(fear.toFixed(2))
    };
  }

  installPersistenceHandlers() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveWorldState('hidden');
      }
    });

    window.addEventListener('pagehide', () => {
      this.saveWorldState('quit');
      this.networkManager.destroy();
    });

    window.addEventListener('beforeunload', () => {
      this.saveWorldState('quit');
    });
  }
}
