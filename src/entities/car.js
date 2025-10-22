import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class Car {
  constructor(params) {
    const { color = 0x55ccff } = params || {};
    this.group = new THREE.Group();
    this.group.castShadow = true;
    this.group.receiveShadow = false;

    const bodyGeo = new THREE.BoxGeometry(1.2, 0.5, 2.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.35;
    body.castShadow = true;
    this.group.add(body);

    // simple wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.1, roughness: 0.9 });
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.4, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wPos = [
      [-0.6, 0.2, -0.9], [0.6, 0.2, -0.9],
      [-0.6, 0.2, 0.9], [0.6, 0.2, 0.9],
    ];
    wPos.forEach(([x,y,z]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(x,y,z);
      w.castShadow = true;
      this.group.add(w);
    });

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = 0; // along +Z forward
    this.heading = 0; // radians, 0 means +Z

    this.params = {
      maxSpeed: 18,
      accel: 30,
      brake: 40,
      turnRate: 2.0,
    };
  }

  configureFromVehicle(def) {
    if (!def) return;
    this.params.maxSpeed = def.maxSpeed;
    this.params.accel = def.accel;
    this.params.brake = def.brake;
    this.params.turnRate = def.turnRate;
  }

  update(dt, input) {
    // Acceleration and braking
    const targetAccel = input.accel ? this.params.accel : 0;
    const targetBrake = input.brake ? this.params.brake : 0;
    if (input.reverse) {
      this.speed -= targetBrake * dt;
    } else {
      this.speed += targetAccel * dt;
      this.speed -= (this.speed > 0 ? 1 : -1) * 3.0 * dt; // drag
    }
    // Clamp speed
    this.speed = Math.max(-6, Math.min(this.speed, this.params.maxSpeed));

    // Steering scales with speed
    const steer = (input.left ? 1 : 0) * 1 + (input.right ? -1 : 0) * 1; // left positive
    const steerStrength = this.params.turnRate * (Math.abs(this.speed) / (this.params.maxSpeed || 1));
    this.heading += steer * steerStrength * dt;

    // Update position along heading
    const forward = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
    const delta = forward.multiplyScalar(this.speed * dt);
    this.group.position.add(delta);
    this.group.rotation.y = this.heading;
  }
}
