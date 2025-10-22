import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class Obstacle {
  constructor({ width = 1, height = 1, depth = 1, color = 0x444444 } = {}) {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.9 })
    );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }
}
