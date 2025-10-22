import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { Car } from '../../entities/car.js';
import { PoliceCar } from '../../entities/police.js';
import { Spawner } from '../../systems/spawn.js';
import { Input } from '../../systems/input.js';
import { aabbIntersect, getBoxFromObject } from '../../systems/collision.js';

export class SceneRun {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.camera = game.camera;

    this.input = new Input(game.ui);

    this.player = null;
    this.police = [];
    this.spawner = new Spawner(this.scene);

    this.elapsed = 0;
    this.distance = 0;
    this.runMoney = 0;

    this.stopEngine = null;
    this.stopSiren = null;

    this.difficultyTimer = 0;
  }

  async onEnter() {
    // Player
    this.player = new Car();
    this.player.configureFromVehicle(this.game.persistence.getVehicle(this.game.selectedVehicleId));
    this.player.group.position.set(0, 0, 0);
    this.scene.add(this.player.group);

    // Police start behind
    this.police = [];
    const p1 = new PoliceCar();
    p1.group.position.set(0, 0, -12);
    this.scene.add(p1.group);
    this.police.push(p1);

    // Spawner
    this.spawner.reset(this.player.group.position.z);

    this.elapsed = 0;
    this.distance = 0;
    this.runMoney = 0;
    this.game.ui.updateHUD({ distance: this.distance, runMoney: this.runMoney, totalMoney: this.game.persistence.getTotalMoney() });

    // audio
    this.stopEngine = this.game.audio.playEngine?.();
    this.stopSiren = this.game.audio.playSiren?.();
  }

  async onExit() {
    if (this.stopEngine) this.stopEngine();
    if (this.stopSiren) this.stopSiren();
  }

  update(dt) {
    if (!this.player) return;
    this.elapsed += dt;

    // Difficulty ramp
    this.difficultyTimer += dt;
    if (this.difficultyTimer > 8 && this.police.length < 3) {
      this.difficultyTimer = 0;
      const p = new PoliceCar();
      const offset = (Math.random() * 2 - 1) * 2;
      p.group.position.set(offset, 0, this.player.group.position.z - 10 - Math.random() * 10);
      this.scene.add(p.group);
      this.police.push(p);
    }

    // Update car
    const input = this.input.get();
    this.player.update(dt, input);

    // Keep player within road
    const halfRoad = this.spawner.roadWidth * 0.5 - 0.6;
    this.player.group.position.x = Math.max(-halfRoad, Math.min(halfRoad, this.player.group.position.x));

    // Move camera behind player
    const camTarget = new THREE.Vector3(this.player.group.position.x, 2.8, this.player.group.position.z - 7);
    this.camera.position.lerp(camTarget, 0.08);
    const lookAt = new THREE.Vector3(this.player.group.position.x, 0.8, this.player.group.position.z + 8);
    this.camera.lookAt(lookAt);

    // Spawn road ahead
    this.spawner.ensureAhead(this.player.group.position.z);
    this.spawner.update(dt);

    // Update police
    this.police.forEach(p => p.update(dt, this.player.group.position));

    // Distance
    this.distance = Math.max(this.distance, this.player.group.position.z);
    this.game.ui.updateHUD({ distance: this.distance, runMoney: this.runMoney, totalMoney: this.game.persistence.getTotalMoney() });

    // Collisions
    const playerBox = getBoxFromObject(this.player.group);

    // Obstacle collision = game over
    for (const ob of this.spawner.obstacles) {
      const geomParams = ob.mesh.geometry?.parameters || {};
      const half = {
        x: (geomParams.width || 1) * 0.5,
        y: (geomParams.height || 1) * 0.5,
        z: (geomParams.depth || 1) * 0.5,
      };
      const obBox = {
        minX: ob.mesh.position.x - half.x,
        maxX: ob.mesh.position.x + half.x,
        minY: ob.mesh.position.y - half.y,
        maxY: ob.mesh.position.y + half.y,
        minZ: ob.mesh.position.z - half.z,
        maxZ: ob.mesh.position.z + half.z,
      };
      if (aabbIntersect(playerBox, obBox)) {
        this.game.audio.playCrash?.();
        this._end('crash');
        return;
      }
    }

    // Police collision = game over
    for (const p of this.police) {
      const pBox = getBoxFromObject(p.group);
      if (aabbIntersect(playerBox, pBox)) {
        this.game.audio.playCrash?.();
        this._end('caught');
        return;
      }
    }

    // Pickups
    for (const coin of this.spawner.pickups) {
      const cBox = getBoxFromObject(coin.mesh, { x: 0.3, y: 0.3, z: 0.3 });
      if (!coin._collected && aabbIntersect(playerBox, cBox)) {
        coin._collected = true;
        this.runMoney += 10;
        this.game.audio.playCollect?.();
        if (coin.mesh.parent) coin.mesh.parent.remove(coin.mesh);
      }
    }
    // Remove collected coins from list
    this.spawner.pickups = this.spawner.pickups.filter(c => !c._collected);
  }

  _end(reason) {
    const distance = this.distance;
    const collectedMoney = this.runMoney;
    this.game.persistence.setHighScore(distance);
    this.game.endRun({ distance, collectedMoney, reason });
  }
}
