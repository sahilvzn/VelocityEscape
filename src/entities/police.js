import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class PoliceCar {
  constructor({ color = 0xffffff } = {}) {
    this.group = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(1.2, 0.5, 2.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.35;
    body.castShadow = true;
    this.group.add(body);

    const lightBarGeo = new THREE.BoxGeometry(0.8, 0.15, 0.3);
    const lightBarMat = new THREE.MeshStandardMaterial({ color: 0x2244ff, emissive: 0x4455ff, emissiveIntensity: 2.0 });
    const lightBar = new THREE.Mesh(lightBarGeo, lightBarMat);
    lightBar.position.set(0, 0.7, 0);
    this.group.add(lightBar);

    this.speed = 0;
    this.heading = 0;
    this.maxSpeed = 17;
    this.accel = 24;
    this.turnRate = 1.8;
  }

  update(dt, targetPos) {
    // Simple pursuit: steer toward player
    const toTarget = new THREE.Vector3().subVectors(targetPos, this.group.position);
    const desiredHeading = Math.atan2(toTarget.x, toTarget.z);
    let diff = desiredHeading - this.heading;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const turn = Math.max(-this.turnRate * dt, Math.min(this.turnRate * dt, diff));
    this.heading += turn;

    // Accelerate if far, slow if close
    const distance = toTarget.length();
    const targetSpeed = Math.min(this.maxSpeed, distance * 0.8);
    if (this.speed < targetSpeed) this.speed += this.accel * dt; else this.speed -= 8 * dt;
    this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed));

    const forward = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
    this.group.position.addScaledVector(forward, this.speed * dt);
    this.group.rotation.y = this.heading;
  }
}
