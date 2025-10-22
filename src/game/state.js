import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createRendererAndScene, createCamera } from './threeInit.js';

export class Game {
  constructor({ canvas, ui, assets, audio, persistence }) {
    this.canvas = canvas;
    this.ui = ui;
    this.assets = assets;
    this.audio = audio;
    this.persistence = persistence;

    this.renderer = null;
    this.scene = null;
    this.camera = null;

    this.activeScene = null; // current scene controller
    this.scenes = new Map();

    this.clock = new THREE.Clock();
    this._boundTick = this._tick.bind(this);

    this.runStats = { distance: 0, runMoney: 0 };

    this.selectedVehicleId = null;
  }

  async boot() {
    const { renderer, scene } = createRendererAndScene(this.canvas);
    this.renderer = renderer;
    this.scene = scene;
    this.camera = createCamera();

    const resizeWithOverlay = () => {
      // Optional: show a brief resize overlay (non-blocking)
      this._onResize();
    };
    window.addEventListener('resize', resizeWithOverlay);
    this._onResize();
    // Resize overlay element
    this.resizeOverlay = document.getElementById('resize-overlay');
    this.resizeTimeout = null;

    // Handle window resize and orientation change
    const resizeHandler = () => this._onResize();
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', () => {
      // Delay to allow the viewport to settle
      setTimeout(resizeHandler, 100);
    });
    
    this._onResize(); // Initial size

    await this.assets.loadPlaceholders();
    await this.audio.init();

    this.selectedVehicleId = this.persistence.getSelectedVehicleId() || 'starter';
    this.ui.updateTotalMoney(this.persistence.getTotalMoney());

    requestAnimationFrame(this._boundTick);
  }

  registerScene(name, sceneController) {
    this.scenes.set(name, sceneController);
  }

  async switchTo(name) {
    // Base UI state for scene switch
    this.ui.hideMainMenu();
    this.ui.hideGarage();
    this.ui.hideGameOver();
    if (name === 'run') this.ui.showHUD(); else this.ui.hideHUD();

    if (this.activeScene && this.activeScene.onExit) {
      await this.activeScene.onExit();
    }

    this.clearScene();

    this.activeScene = this.scenes.get(name);
    if (!this.activeScene) throw new Error(`Unknown scene: ${name}`);

    if (this.activeScene.onEnter) {
      await this.activeScene.onEnter();
    }
  }

  showMainMenu() {
    this.ui.showMainMenu();
    this.ui.hideHUD();
    this.ui.hideGarage();
    this.ui.hideGameOver();
  }

  showGarage() {
    this.ui.hideMainMenu();
    this.ui.hideHUD();
    this.ui.populateGarage(this.persistence);
    this.ui.showGarage();
  }

  clearScene() {
    // Remove all objects from scene
    if (!this.scene) return;
    const toRemove = [];
    this.scene.traverse(obj => {
      if (obj !== this.camera) toRemove.push(obj);
    });
    toRemove.forEach(obj => {
      if (obj.parent) obj.parent.remove(obj);
    });
  }

  endRun({ distance, collectedMoney, reason }) {
    const totalBefore = this.persistence.getTotalMoney();
    const earned = Math.floor(distance * 0.05) + collectedMoney; // simple formula
    const newTotal = totalBefore + earned;
    this.persistence.setTotalMoney(newTotal);

    this.ui.updateGameOver({ distance, collected: collectedMoney, total: newTotal });
    this.ui.showGameOver();
    this.ui.hideHUD();
    // Stop updating scene after game over
    this.activeScene = null;
  }

  _onResize() {
    if (!this.renderer || !this.camera) return;
    
    // Show resize overlay during adjustment
    if (this.resizeOverlay && this.activeScene) {
      this.resizeOverlay.classList.remove('hidden');
    }
    
    // Clear existing timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    // Get actual viewport dimensions
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Ensure canvas element matches CSS size
    if (this.canvas) {
      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
    }
    
    // Set canvas size to match viewport
    this.canvas.width = w;
    this.canvas.height = h;
    
    // Update renderer with device pixel ratio for crisp rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    
    // Update camera aspect ratio and projection
    if (this.camera.isPerspectiveCamera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    
    // Notify active scene of resize if needed
    if (this.activeScene && this.activeScene.onResize) {
      this.activeScene.onResize(w, h);
    }
    
    // Hide resize overlay after a short delay
    this.resizeTimeout = setTimeout(() => {
      if (this.resizeOverlay) {
        this.resizeOverlay.classList.add('hidden');
      }
    }, 300);
  }

  _tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (this.activeScene && this.activeScene.update) {
      this.activeScene.update(dt);
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._boundTick);
  }

  async returnToMenu() {
    if (this.activeScene && this.activeScene.onExit) {
      await this.activeScene.onExit();
    }
    this.clearScene();
    this.activeScene = null;
    this.showMainMenu();
  }
}
