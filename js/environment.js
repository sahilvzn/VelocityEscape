/**
 * environment.js - Procedural environment generation
 */

class Road {
    constructor(scene, position, width = 20, length = 50) {
        this.scene = scene;
        this.position = position;
        this.width = width;
        this.length = length;
        this.mesh = this.createMesh();
        this.scene.add(this.mesh);
    }

    createMesh() {
        const group = new THREE.Group();
        
        // Road surface
        const roadGeometry = new THREE.PlaneGeometry(this.width, this.length);
        const roadMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2d2d2d,
            side: THREE.DoubleSide
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        group.add(road);
        
        // Road markings
        const lineGeometry = new THREE.PlaneGeometry(0.3, this.length);
        const lineMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        
        // Center line (dashed)
        for (let z = -this.length / 2; z < this.length / 2; z += 5) {
            const line = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 2),
                lineMaterial
            );
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.01, z);
            group.add(line);
        }
        
        // Side lines
        const leftLine = new THREE.Mesh(lineGeometry, lineMaterial);
        leftLine.rotation.x = -Math.PI / 2;
        leftLine.position.set(-this.width / 2 + 0.5, 0.01, 0);
        group.add(leftLine);
        
        const rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
        rightLine.rotation.x = -Math.PI / 2;
        rightLine.position.set(this.width / 2 - 0.5, 0.01, 0);
        group.add(rightLine);
        
        group.position.copy(this.position);
        return group;
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

class Obstacle {
    constructor(scene, position, type = 'car') {
        this.scene = scene;
        this.position = position.clone();
        this.type = type;
        this.mesh = this.createMesh();
        this.scene.add(this.mesh);
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
    }

    createMesh() {
        let mesh;
        
        switch(this.type) {
            case 'car':
                mesh = this.createCar();
                break;
            case 'barrier':
                mesh = this.createBarrier();
                break;
            case 'building':
                mesh = this.createBuilding();
                break;
            case 'tree':
                mesh = this.createTree();
                break;
            default:
                mesh = this.createCar();
        }
        
        mesh.position.copy(this.position);
        return mesh;
    }

    createCar() {
        const group = new THREE.Group();
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf7b731, 0x5f27cd];
        const color = MathUtils.randomChoice(colors);
        
        const bodyGeometry = new THREE.BoxGeometry(1.8, 0.7, 3.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.35;
        group.add(body);
        
        const cabinGeometry = new THREE.BoxGeometry(1.6, 0.6, 1.8);
        const cabinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            opacity: 0.6,
            transparent: true
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.y = 0.8;
        group.add(cabin);
        
        return group;
    }

    createBarrier() {
        const group = new THREE.Group();
        
        const barrierGeometry = new THREE.BoxGeometry(3, 1, 0.5);
        const barrierMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6b6b,
            emissive: 0xff0000,
            emissiveIntensity: 0.2
        });
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.y = 0.5;
        group.add(barrier);
        
        // Add warning stripes
        const stripeGeometry = new THREE.BoxGeometry(0.4, 1.1, 0.6);
        const stripeMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        
        for (let i = -1; i <= 1; i++) {
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.position.set(i * 1.2, 0.5, 0);
            group.add(stripe);
        }
        
        return group;
    }

    createBuilding() {
        const height = MathUtils.random(5, 15);
        const width = MathUtils.random(4, 8);
        const depth = MathUtils.random(4, 8);
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x555555,
            flatShading: true
        });
        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        
        // Add windows
        const windowGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.1);
        const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffff99,
            emissive: 0xffff00,
            emissiveIntensity: 0.3
        });
        
        for (let y = 2; y < height; y += 2) {
            for (let x = -width / 2 + 1; x < width / 2; x += 1.5) {
                if (Math.random() > 0.3) {
                    const window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(x, y, depth / 2 + 0.05);
                    building.add(window);
                }
            }
        }
        
        return building;
    }

    createTree() {
        const group = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3f35 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        group.add(trunk);
        
        // Foliage
        const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5016 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 2.5;
        group.add(foliage);
        
        return group;
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

class Collectible {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();
        this.collected = false;
        this.rotation = 0;
        this.bobOffset = 0;
        this.mesh = this.createMesh();
        this.scene.add(this.mesh);
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
    }

    createMesh() {
        const group = new THREE.Group();
        
        // Coin shape
        const coinGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
        const coinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffd700,
            emissive: 0xffd700,
            emissiveIntensity: 0.5,
            shininess: 100
        });
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.rotation.x = Math.PI / 2;
        group.add(coin);
        
        // Dollar sign (decorative)
        const dollarGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.05);
        const dollarMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000
        });
        const dollar = new THREE.Mesh(dollarGeometry, dollarMaterial);
        dollar.position.z = 0.1;
        group.add(dollar);
        
        group.position.copy(this.position);
        return group;
    }

    update(deltaTime) {
        if (this.collected) return;
        
        // Rotate
        this.rotation += deltaTime * 2;
        this.mesh.rotation.y = this.rotation;
        
        // Bob up and down
        this.bobOffset += deltaTime * 3;
        this.mesh.position.y = this.position.y + Math.sin(this.bobOffset) * 0.3;
        
        this.updateBoundingBox();
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    collect() {
        this.collected = true;
        this.scene.remove(this.mesh);
    }

    destroy() {
        this.scene.remove(this.mesh);
    }
}

// Environment manager
class EnvironmentManager {
    constructor(scene) {
        this.scene = scene;
        this.roads = [];
        this.obstacles = [];
        this.collectibles = [];
        this.buildings = [];
        
        this.roadLength = 50;
        this.roadWidth = 20;
        this.lastRoadZ = 0;
        
        // Generate initial environment
        this.generateInitialEnvironment();
    }

    generateInitialEnvironment() {
        // Create initial roads
        for (let i = 0; i < 5; i++) {
            const position = new THREE.Vector3(0, 0, this.lastRoadZ);
            this.roads.push(new Road(this.scene, position, this.roadWidth, this.roadLength));
            this.lastRoadZ += this.roadLength;
        }
        
        // Create buildings along the sides
        for (let z = -50; z < 200; z += MathUtils.random(10, 20)) {
            // Left side
            const leftPos = new THREE.Vector3(
                -this.roadWidth / 2 - MathUtils.random(5, 15),
                0,
                z
            );
            const leftBuilding = new Obstacle(this.scene, leftPos, 'building');
            this.buildings.push(leftBuilding);
            
            // Right side
            const rightPos = new THREE.Vector3(
                this.roadWidth / 2 + MathUtils.random(5, 15),
                0,
                z
            );
            const rightBuilding = new Obstacle(this.scene, rightPos, 'building');
            this.buildings.push(rightBuilding);
        }
    }

    update(playerPosition) {
        // Generate new road segments ahead of player
        while (this.lastRoadZ < playerPosition.z + 150) {
            const position = new THREE.Vector3(0, 0, this.lastRoadZ);
            this.roads.push(new Road(this.scene, position, this.roadWidth, this.roadLength));
            this.lastRoadZ += this.roadLength;
            
            // Spawn obstacles on new road segment
            this.spawnObstacles(this.lastRoadZ - this.roadLength);
            
            // Spawn collectibles
            this.spawnCollectibles(this.lastRoadZ - this.roadLength);
            
            // Spawn buildings
            this.spawnBuildings(this.lastRoadZ - this.roadLength);
        }
        
        // Remove old road segments behind player
        this.roads = this.roads.filter(road => {
            if (road.position.z < playerPosition.z - 100) {
                road.destroy();
                return false;
            }
            return true;
        });
        
        // Remove old obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            if (obstacle.position.z < playerPosition.z - 100) {
                obstacle.destroy();
                return false;
            }
            return true;
        });
        
        // Update and remove collected collectibles
        this.collectibles.forEach(collectible => collectible.update(0.016));
        this.collectibles = this.collectibles.filter(collectible => {
            if (collectible.collected || collectible.position.z < playerPosition.z - 100) {
                if (!collectible.collected) collectible.destroy();
                return false;
            }
            return true;
        });
        
        // Remove old buildings
        this.buildings = this.buildings.filter(building => {
            if (building.position.z < playerPosition.z - 100) {
                building.destroy();
                return false;
            }
            return true;
        });
    }

    spawnObstacles(zPosition) {
        const numObstacles = MathUtils.randomInt(1, 3);
        
        for (let i = 0; i < numObstacles; i++) {
            const type = MathUtils.randomChoice(['car', 'car', 'barrier', 'tree']);
            const x = MathUtils.random(-this.roadWidth / 2 + 2, this.roadWidth / 2 - 2);
            const z = zPosition + MathUtils.random(5, 45);
            
            const position = new THREE.Vector3(x, 0, z);
            const obstacle = new Obstacle(this.scene, position, type);
            this.obstacles.push(obstacle);
        }
    }

    spawnCollectibles(zPosition) {
        const numCollectibles = MathUtils.randomInt(2, 5);
        
        for (let i = 0; i < numCollectibles; i++) {
            const x = MathUtils.random(-this.roadWidth / 2 + 2, this.roadWidth / 2 - 2);
            const z = zPosition + MathUtils.random(5, 45);
            const y = 1; // Floating above ground
            
            const position = new THREE.Vector3(x, y, z);
            const collectible = new Collectible(this.scene, position);
            this.collectibles.push(collectible);
        }
    }

    spawnBuildings(zPosition) {
        const numBuildings = MathUtils.randomInt(1, 2);
        
        for (let i = 0; i < numBuildings; i++) {
            // Left side
            if (Math.random() > 0.5) {
                const leftPos = new THREE.Vector3(
                    -this.roadWidth / 2 - MathUtils.random(5, 15),
                    0,
                    zPosition + MathUtils.random(0, this.roadLength)
                );
                const leftBuilding = new Obstacle(this.scene, leftPos, 'building');
                this.buildings.push(leftBuilding);
            }
            
            // Right side
            if (Math.random() > 0.5) {
                const rightPos = new THREE.Vector3(
                    this.roadWidth / 2 + MathUtils.random(5, 15),
                    0,
                    zPosition + MathUtils.random(0, this.roadLength)
                );
                const rightBuilding = new Obstacle(this.scene, rightPos, 'building');
                this.buildings.push(rightBuilding);
            }
        }
    }

    checkObstacleCollisions(playerBoundingBox) {
        for (let obstacle of this.obstacles) {
            if (checkCollision(playerBoundingBox, obstacle.boundingBox)) {
                return true;
            }
        }
        return false;
    }

    checkCollectibles(playerBoundingBox) {
        let collected = 0;
        this.collectibles.forEach(collectible => {
            if (!collectible.collected && checkCollision(playerBoundingBox, collectible.boundingBox)) {
                collectible.collect();
                collected++;
                audioManager.playCoin();
            }
        });
        return collected;
    }

    reset() {
        this.roads.forEach(road => road.destroy());
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.collectibles.forEach(collectible => collectible.destroy());
        this.buildings.forEach(building => building.destroy());
        
        this.roads = [];
        this.obstacles = [];
        this.collectibles = [];
        this.buildings = [];
        this.lastRoadZ = 0;
        
        this.generateInitialEnvironment();
    }

    getObstacles() {
        return this.obstacles;
    }
}
