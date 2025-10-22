/**
 * police.js - Police AI and chase mechanics
 */

class PoliceVehicle {
    constructor(scene, startPosition) {
        this.scene = scene;
        this.position = startPosition.clone();
        this.rotation = 0;
        this.speed = 0;
        this.targetSpeed = 30;
        this.maxSpeed = 50;
        this.acceleration = 20;
        
        // AI properties
        this.targetPosition = null;
        this.avoidanceRadius = 5;
        this.catchRadius = 3;
        
        // Create mesh
        this.mesh = this.createMesh();
        this.scene.add(this.mesh);
        
        // Bounding box
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
        
        // Siren effect
        this.sirenTime = 0;
        this.sirenLight = this.createSirenLight();
        this.mesh.add(this.sirenLight);
    }

    createMesh() {
        const group = new THREE.Group();
        
        // Police car body - black and white pattern
        const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        group.add(body);
        
        // White stripe
        const stripeGeometry = new THREE.BoxGeometry(2.1, 0.3, 4.1);
        const stripeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.y = 0.4;
        group.add(stripe);
        
        // Cabin
        const cabinGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
        const cabinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            opacity: 0.8,
            transparent: true
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.y = 1;
        cabin.position.z = 0.2;
        group.add(cabin);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        
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
        
        return group;
    }

    createSirenLight() {
        // Siren light on top
        const sirenGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.5);
        const sirenMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 1
        });
        const siren = new THREE.Mesh(sirenGeometry, sirenMaterial);
        siren.position.y = 1.5;
        return siren;
    }

    update(deltaTime, playerPosition, obstacles) {
        // Update target position to player
        this.targetPosition = playerPosition.clone();
        
        // Calculate direction to player
        const dx = this.targetPosition.x - this.position.x;
        const dz = this.targetPosition.z - this.position.z;
        const distanceToPlayer = Math.sqrt(dx * dx + dz * dz);
        
        // Calculate desired rotation
        const desiredRotation = Math.atan2(dx, dz);
        
        // Smoothly rotate towards player
        let rotationDiff = desiredRotation - this.rotation;
        rotationDiff = MathUtils.normalizeAngle(rotationDiff);
        this.rotation += rotationDiff * 3 * deltaTime;
        
        // Adjust speed based on distance and angle to player
        const angleDiff = Math.abs(rotationDiff);
        if (distanceToPlayer > 20) {
            this.targetSpeed = this.maxSpeed;
        } else if (distanceToPlayer > 10) {
            this.targetSpeed = this.maxSpeed * 0.7;
        } else {
            this.targetSpeed = this.maxSpeed * 0.5;
        }
        
        // Slow down when turning sharply
        if (angleDiff > Math.PI / 4) {
            this.targetSpeed *= 0.6;
        }
        
        // Smoothly accelerate/decelerate
        if (this.speed < this.targetSpeed) {
            this.speed += this.acceleration * deltaTime;
        } else {
            this.speed -= this.acceleration * 0.5 * deltaTime;
        }
        this.speed = MathUtils.clamp(this.speed, 0, this.maxSpeed);
        
        // Simple obstacle avoidance
        obstacles.forEach(obstacle => {
            const obstaclePos = obstacle.position;
            const odx = obstaclePos.x - this.position.x;
            const odz = obstaclePos.z - this.position.z;
            const obstacleDistance = Math.sqrt(odx * odx + odz * odz);
            
            if (obstacleDistance < this.avoidanceRadius) {
                // Steer away from obstacle
                const avoidAngle = Math.atan2(odx, odz);
                const angleDiffToObstacle = avoidAngle - this.rotation;
                
                // Turn away
                if (angleDiffToObstacle > 0) {
                    this.rotation -= 0.5 * deltaTime;
                } else {
                    this.rotation += 0.5 * deltaTime;
                }
            }
        });
        
        // Update position
        const moveX = Math.sin(this.rotation) * this.speed * deltaTime;
        const moveZ = Math.cos(this.rotation) * this.speed * deltaTime;
        
        this.position.x += moveX;
        this.position.z += moveZ;
        
        // Update mesh
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
        
        // Update bounding box
        this.updateBoundingBox();
        
        // Update siren animation
        this.sirenTime += deltaTime * 5;
        const sirenIntensity = (Math.sin(this.sirenTime) + 1) / 2;
        this.sirenLight.material.emissiveIntensity = sirenIntensity;
        this.sirenLight.material.color.setHex(sirenIntensity > 0.5 ? 0xff0000 : 0x0000ff);
        this.sirenLight.material.emissive.setHex(sirenIntensity > 0.5 ? 0xff0000 : 0x0000ff);
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    isNearPlayer(playerPosition, radius) {
        const dx = playerPosition.x - this.position.x;
        const dz = playerPosition.z - this.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < radius;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

// Police spawn and difficulty manager
class PoliceManager {
    constructor(scene) {
        this.scene = scene;
        this.policeVehicles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 10; // Spawn every 10 seconds initially
        this.maxPolice = 3;
        this.difficulty = 1;
    }

    update(deltaTime, playerPosition, obstacles, gameTime) {
        // Update difficulty based on game time
        this.difficulty = 1 + Math.floor(gameTime / 30); // Increase difficulty every 30 seconds
        this.maxPolice = Math.min(3 + Math.floor(this.difficulty / 2), 10);
        this.spawnInterval = Math.max(5, 10 - this.difficulty * 0.5);
        
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Spawn new police
        if (this.spawnTimer >= this.spawnInterval && this.policeVehicles.length < this.maxPolice) {
            this.spawnPolice(playerPosition);
            this.spawnTimer = 0;
        }
        
        // Update all police vehicles
        this.policeVehicles.forEach(police => {
            police.update(deltaTime, playerPosition, obstacles);
            
            // Increase police speed based on difficulty
            police.maxSpeed = 50 + this.difficulty * 2;
        });
        
        // Remove police that are too far behind
        this.policeVehicles = this.policeVehicles.filter(police => {
            const distance = MathUtils.distance2D(
                police.position.x, police.position.z,
                playerPosition.x, playerPosition.z
            );
            
            if (distance > 100) {
                police.destroy();
                return false;
            }
            return true;
        });
    }

    spawnPolice(playerPosition) {
        // Spawn behind or to the side of the player
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 20;
        
        const spawnX = playerPosition.x - Math.sin(angle) * distance;
        const spawnZ = playerPosition.z - Math.cos(angle) * distance;
        
        const spawnPosition = new THREE.Vector3(spawnX, 0.5, spawnZ);
        const police = new PoliceVehicle(this.scene, spawnPosition);
        this.policeVehicles.push(police);
        
        // Play siren sound
        audioManager.playSiren();
    }

    checkCollisions(playerBoundingBox) {
        for (let police of this.policeVehicles) {
            if (checkCollision(playerBoundingBox, police.boundingBox)) {
                return true;
            }
        }
        return false;
    }

    isPoliceNearby(playerPosition, radius = 15) {
        return this.policeVehicles.some(police => 
            police.isNearPlayer(playerPosition, radius)
        );
    }

    reset() {
        this.policeVehicles.forEach(police => police.destroy());
        this.policeVehicles = [];
        this.spawnTimer = 0;
        this.difficulty = 1;
    }

    getPoliceCount() {
        return this.policeVehicles.length;
    }
}
