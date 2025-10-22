import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class Pickup {
  constructor() {
    const geo = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 6);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x775500, emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.3 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  update(dt) {
    this.mesh.rotation.z += dt * 3;
  }
}
