// Entry point. Sets up engine, scenes, UI wiring.
import { Game } from './state.js';
import { SceneRun } from './scenes/sceneRun.js';
import { SceneGarage } from './scenes/sceneGarage.js';
import { setupUI } from './ui.js';
import { AssetStore } from './services/assets.js';
import { AudioBus } from './services/audio.js';
import { Persistence } from './services/persistence.js';

const canvas = document.getElementById('game-canvas');
const ui = setupUI();

// Global singletons
const assets = new AssetStore();
const audio = new AudioBus();
const persistence = new Persistence();

// Core Game State
const game = new Game({ canvas, ui, assets, audio, persistence });

// Register scenes
const sceneRun = new SceneRun(game);
const sceneGarage = new SceneGarage(game);

game.registerScene('run', sceneRun);
game.registerScene('garage', sceneGarage);

// UI navigation
ui.onPlay(() => game.switchTo('run'));
ui.onGarage(() => game.switchTo('garage'));
ui.onRestart(() => game.switchTo('run'));
ui.onStartFromGarage(() => game.switchTo('run'));
ui.onToGarage(() => game.switchTo('garage'));
ui.onBackMenu(() => game.returnToMenu());

// Boot
await game.boot();

game.showMainMenu();
