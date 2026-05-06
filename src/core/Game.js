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
    this.worldStateService = null;
    this.autosaveTimer = 0;
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
    await this.networkManager.init({ user: this.user, profile });
    this.installPersistenceHandlers();

    // Start game loop
    this.loop.start();
    console.log('Signal Lost: Office started - Scene objects:', this.sceneManager.scene.children.length);
  }

  tick(deltaTime) {
    this.deltaTime = deltaTime;

    // Update microphone analysis
    this.micAnalyzer.update();

    // Update entity based on noise
    this.entityController.update(this.micAnalyzer.getNoiseLevel(), deltaTime, this.cameraController.camera);

    // Update fear system
    this.fearEngine.update(this.micAnalyzer.getNoiseLevel(), this.entityController.getEntityDistance(), deltaTime);

    // Update environmental ambience
    this.sceneManager.update(deltaTime);

    // Update camera
    this.cameraController.update(deltaTime);

    this.networkManager.update(this.cameraController, deltaTime);
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
