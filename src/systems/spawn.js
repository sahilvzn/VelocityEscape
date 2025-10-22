import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { Obstacle } from '../entities/obstacle.js';
import { Pickup } from '../entities/pickup.js';

export class Spawner {
  constructor(scene) {
    this.scene = scene;
    this.roadWidth = 8;
    this.segmentLength = 30;
    this.bufferSegments = 8;
    this.spawnZ = 0;

    this.obstacles = [];
    this.pickups = [];

    this._roadSegments = [];
  }

  reset(playerZ) {
    this.spawnZ = Math.floor(playerZ / this.segmentLength) * this.segmentLength + this.segmentLength * 2;
    // clear existing
    [...this.obstacles, ...this.pickups, ...this._roadSegments].forEach(obj => {
      if (obj.mesh && obj.mesh.parent) obj.mesh.parent.remove(obj.mesh);
      if (obj.parent) obj.parent.remove(obj);
    });
    this.obstacles = [];
    this.pickups = [];
    this._roadSegments = [];
  }

  ensureAhead(playerZ) {
    const needed = playerZ + this.segmentLength * this.bufferSegments;
    while (this.spawnZ < needed) {
      this._spawnSegment(this.spawnZ);
      this.spawnZ += this.segmentLength;
    }
  }

  _spawnSegment(z) {
    // Road plane piece
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(this.roadWidth, 0.1, this.segmentLength),
      new THREE.MeshStandardMaterial({ color: 0x2b2f36, metalness: 0.0, roughness: 1.0 })
    );
    road.receiveShadow = true;
    road.position.set(0, -0.05, z + this.segmentLength * 0.5);
    this.scene.add(road);
    this._roadSegments.push(road);

    // Lines
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.02, this.segmentLength * 0.9),
      new THREE.MeshStandardMaterial({ color: 0xf7f7a1, emissive: 0x333300, emissiveIntensity: 0.8 })
    );
    line.position.set(0, 0.01, z + this.segmentLength * 0.5);
    this.scene.add(line);
    this._roadSegments.push(line);

    // Random obstacles and pickups
    const numOb = Math.floor(Math.random() * 3);
    for (let i = 0; i < numOb; i++) {
      const w = 0.6 + Math.random() * 1.6;
      const d = 0.6 + Math.random() * 1.2;
      const h = 0.6 + Math.random() * 1.5;
      const x = (Math.random() * 2 - 1) * (this.roadWidth * 0.5 - 1.0);
      const ob = new Obstacle({ width: w, height: h, depth: d, color: 0x3a3f48 });
      ob.mesh.position.set(x, h * 0.5, z + 2 + Math.random() * (this.segmentLength - 4));
      this.scene.add(ob.mesh);
      this.obstacles.push(ob);
    }

    const numCoins = Math.random() < 0.8 ? 1 + Math.floor(Math.random() * 3) : 0;
    for (let i = 0; i < numCoins; i++) {
      const coin = new Pickup();
      const x = (Math.random() * 2 - 1) * (this.roadWidth * 0.5 - 0.6);
      coin.mesh.position.set(x, 0.5, z + 2 + Math.random() * (this.segmentLength - 4));
      this.scene.add(coin.mesh);
      this.pickups.push(coin);
    }
  }

  update(dt) {
    this.pickups.forEach(p => p.update(dt));
  }
}
