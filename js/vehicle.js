/**
 * vehicle.js - Vehicle physics and controller
 */

class Vehicle {
    constructor(scene, vehicleData) {
        this.scene = scene;
        this.data = vehicleData;
        
        // Physics properties
        this.position = new THREE.Vector3(0, 0.5, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = 0; // Y-axis rotation
        this.speed = 0;
        this.acceleration = 0;
        this.steering = 0;
        
        // Vehicle characteristics (from vehicleData)
        this.maxSpeed = vehicleData.maxSpeed;
        this.accelerationForce = vehicleData.acceleration;
        this.brakeForce = vehicleData.braking;
        this.turnSpeed = vehicleData.handling;
        this.driftFactor = 0.95;
        
        // Control state
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            drift: false
        };
        
        // Create 3D model
        this.mesh = this.createMesh();
        this.scene.add(this.mesh);
        
        // Bounding box for collision
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
    }

    createMesh() {
        // Create a simple car shape using boxes
        const group = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: this.data.color,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        group.add(body);
        
        // Cabin (top part)
        const cabinGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
        const cabinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            opacity: 0.7,
            transparent: true
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.y = 1;
        cabin.position.z = 0.2;
        group.add(cabin);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        const wheelPositions = [
            { x: 1, z: 1.2 },
            { x: -1, z: 1.2 },
            { x: 1, z: -1.2 },
            { x: -1, z: -1.2 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.2, pos.z);
            group.add(wheel);
        });
        
        // Headlights
        const lightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const lightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        
        const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
        leftLight.position.set(0.7, 0.4, 2.05);
        group.add(leftLight);
        
        const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
        rightLight.position.set(-0.7, 0.4, 2.05);
        group.add(rightLight);
        
        return group;
    }

    update(deltaTime) {
        // Apply acceleration/braking
        if (this.controls.forward) {
            this.acceleration = this.accelerationForce;
        } else if (this.controls.backward) {
            if (this.speed > 0) {
                this.acceleration = -this.brakeForce;
            } else {
                this.acceleration = -this.accelerationForce * 0.5; // Reverse at half speed
            }
        } else {
            // Natural deceleration (friction)
            this.acceleration = -this.speed * 0.5;
        }
        
        // Update speed
        this.speed += this.acceleration * deltaTime;
        this.speed = MathUtils.clamp(this.speed, -this.maxSpeed * 0.5, this.maxSpeed);
        
        // Apply steering
        if (Math.abs(this.speed) > 0.5) {
            if (this.controls.left) {
                this.steering = -1;
            } else if (this.controls.right) {
                this.steering = 1;
            } else {
                this.steering = 0;
            }
            
            // Apply drift
            const driftMultiplier = this.controls.drift ? 1.5 : 1.0;
            const turnRate = this.steering * this.turnSpeed * driftMultiplier * deltaTime;
            this.rotation += turnRate * (this.speed / this.maxSpeed);
        }
        
        // Update position based on velocity
        const moveX = Math.sin(this.rotation) * this.speed * deltaTime;
        const moveZ = Math.cos(this.rotation) * this.speed * deltaTime;
        
        this.position.x += moveX;
        this.position.z += moveZ;
        
        // Apply slight drift effect
        if (this.controls.drift && Math.abs(this.speed) > 5) {
            const driftX = Math.cos(this.rotation) * this.steering * 0.5 * deltaTime;
            const driftZ = -Math.sin(this.rotation) * this.steering * 0.5 * deltaTime;
            this.position.x += driftX;
            this.position.z += driftZ;
        }
        
        // Update mesh position and rotation
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
        
        // Add slight tilt when turning
        const tiltAngle = this.steering * 0.1 * (this.speed / this.maxSpeed);
        this.mesh.rotation.z = MathUtils.lerp(this.mesh.rotation.z, tiltAngle, 0.1);
        
        // Update bounding box
        this.updateBoundingBox();
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    setControl(control, value) {
        if (this.controls.hasOwnProperty(control)) {
            this.controls[control] = value;
        }
    }

    reset(position = new THREE.Vector3(0, 0.5, 0)) {
        this.position.copy(position);
        this.velocity.set(0, 0, 0);
        this.speed = 0;
        this.acceleration = 0;
        this.rotation = 0;
        this.steering = 0;
        this.mesh.position.copy(this.position);
        this.mesh.rotation.set(0, 0, 0);
    }

    getPosition() {
        return this.position.clone();
    }

    getSpeed() {
        return Math.abs(this.speed);
    }

    getBoundingBox() {
        return this.boundingBox;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

// Vehicle database with different vehicle types
const VEHICLE_DATABASE = [
    {
        id: 'sedan',
        name: 'Basic Sedan',
        description: 'A standard getaway vehicle',
        price: 0,
        maxSpeed: 60,
        acceleration: 15,
        braking: 20,
        handling: 1.5,
        color: 0x3498db,
        unlocked: true
    },
    {
        id: 'sports',
        name: 'Sports Car',
        description: 'Fast and agile',
        price: 500,
        maxSpeed: 80,
        acceleration: 25,
        braking: 25,
        handling: 2.0,
        color: 0xe74c3c,
        unlocked: false
    },
    {
        id: 'muscle',
        name: 'Muscle Car',
        description: 'Raw power',
        price: 750,
        maxSpeed: 75,
        acceleration: 30,
        braking: 20,
        handling: 1.3,
        color: 0xf39c12,
        unlocked: false
    },
    {
        id: 'suv',
        name: 'Heavy SUV',
        description: 'Durable and tough',
        price: 1000,
        maxSpeed: 55,
        acceleration: 18,
        braking: 25,
        handling: 1.2,
        color: 0x2c3e50,
        unlocked: false
    },
    {
        id: 'supercar',
        name: 'Supercar',
        description: 'Ultimate speed machine',
        price: 2000,
        maxSpeed: 100,
        acceleration: 35,
        braking: 30,
        handling: 2.5,
        color: 0x9b59b6,
        unlocked: false
    },
    {
        id: 'tank',
        name: 'Armored Tank',
        description: 'Nothing can stop you',
        price: 5000,
        maxSpeed: 40,
        acceleration: 12,
        braking: 15,
        handling: 0.8,
        color: 0x27ae60,
        unlocked: false
    }
];
