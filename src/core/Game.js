import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { Renderer } from './Renderer.js';
import { CameraController } from './CameraController.js';
import { Loop } from './Loop.js';
import { MicAnalyzer } from '../systems/audio/MicAnalyzer.js';
import { FearEngine } from '../systems/fear/FearEngine.js';
import { EntityController } from '../systems/entity/EntityController.js';
import { AudioEngine } from '../systems/audio/AudioEngine.js';
import { gameConfig } from '../config/gameConfig.js';

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

    this.clock = new THREE.Clock();
    this.deltaTime = 0;
  }

  async start() {
    console.log('Initializing game...');

    // Initialize Three.js scene
    this.sceneManager.init();
    console.log('Scene manager initialized');

    this.cameraController.init();
    console.log('Camera initialized');

    this.renderer.init(this.sceneManager.scene, this.cameraController.camera);
    console.log('Renderer initialized');

    // Initialize systems
    await this.micAnalyzer.init();
    console.log('Mic analyzer initialized');

    this.fearEngine.init(this.sceneManager.scene, this.cameraController.camera);
    this.entityController.init(this.sceneManager.scene);
    this.audioEngine.init();

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

    // Update camera
    this.cameraController.update(deltaTime);
  }

  render() {
    this.renderer.render();
  }
}