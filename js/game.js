/**
 * game.js - Main game loop and state management
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Game state
        this.state = 'loading'; // loading, menu, playing, paused, gameOver
        this.gameTime = 0;
        this.distance = 0;
        this.moneyCollected = 0;
        
        // Game objects
        this.vehicle = null;
        this.policeManager = null;
        this.environmentManager = null;
        
        // Input
        this.keys = {};
        this.mobileInput = {
            left: false,
            right: false,
            forward: false,
            backward: false,
            drift: false
        };
        
        // Initialize
        this.init();
    }

    async init() {
        // Setup Three.js
        this.setupThreeJS();
        this.setupLights();
        this.setupEventListeners();
        
        // Simulate loading
        await this.simulateLoading();
        
        // Show main menu
        this.showMainMenu();
        
        // Start render loop
        this.animate();
    }

    setupThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, -10);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
        
        // Hemisphere light for better ambient
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x2d2d2d, 0.4);
        this.scene.add(hemiLight);
    }

    setupEventListeners() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Handle special keys
            if (e.key === ' ') {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Mobile controls
        if (isMobile()) {
            this.setupMobileControls();
        }
        
        // UI callbacks
        uiManager.onStartGame = () => this.startGame();
    }

    setupMobileControls() {
        const addTouchListener = (elementId, input, value) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.mobileInput[input] = value;
                });
                element.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.mobileInput[input] = !value;
                });
            }
        };
        
        addTouchListener('leftBtn', 'left', true);
        addTouchListener('rightBtn', 'right', true);
        addTouchListener('accelerateBtn', 'forward', true);
        addTouchListener('brakeBtn', 'backward', true);
        addTouchListener('driftBtn', 'drift', true);
    }

    async simulateLoading() {
        // Simulate asset loading
        for (let i = 0; i <= 100; i += 10) {
            uiManager.updateLoadingProgress(i);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    showMainMenu() {
        this.state = 'menu';
        uiManager.showScreen('mainMenu');
        uiManager.updateMainMenu(shopManager.getTotalMoney(), shopManager.getBestDistance());
    }

    startGame() {
        this.state = 'playing';
        
        // Hide all screens, show HUD
        uiManager.showScreen('none');
        uiManager.showHUD();
        
        if (isMobile()) {
            uiManager.showMobileControls();
        }
        
        // Reset game state
        this.gameTime = 0;
        this.distance = 0;
        this.moneyCollected = 0;
        
        // Initialize audio
        audioManager.init();
        audioManager.playMusic();
        
        // Create player vehicle
        const vehicleData = shopManager.getSelectedVehicleData();
        this.vehicle = new Vehicle(this.scene, vehicleData);
        
        // Create police manager
        this.policeManager = new PoliceManager(this.scene);
        
        // Create environment
        this.environmentManager = new EnvironmentManager(this.scene);
        
        // Reset clock
        this.clock.getDelta(); // Reset delta time
    }

    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        // Update game time
        this.gameTime += deltaTime;
        
        // Handle input
        this.handleInput();
        
        // Update vehicle
        if (this.vehicle) {
            this.vehicle.update(deltaTime);
            
            // Update distance (how far the player has traveled in Z direction)
            this.distance = Math.max(this.distance, this.vehicle.position.z);
            
            // Play engine sound
            audioManager.playEngine(this.vehicle.getSpeed());
        }
        
        // Update police
        if (this.policeManager && this.vehicle) {
            this.policeManager.update(
                deltaTime,
                this.vehicle.getPosition(),
                this.environmentManager.getObstacles(),
                this.gameTime
            );
        }
        
        // Update environment
        if (this.environmentManager && this.vehicle) {
            this.environmentManager.update(this.vehicle.getPosition());
            
            // Check collectibles
            const coinsCollected = this.environmentManager.checkCollectibles(
                this.vehicle.getBoundingBox()
            );
            this.moneyCollected += coinsCollected;
        }
        
        // Update camera to follow vehicle
        this.updateCamera();
        
        // Check collisions
        this.checkCollisions();
        
        // Update HUD
        const policeNearby = this.policeManager ? 
            this.policeManager.isPoliceNearby(this.vehicle.getPosition()) : false;
        
        uiManager.updateHUD({
            distance: this.distance,
            time: this.gameTime,
            money: this.moneyCollected,
            speed: this.vehicle ? this.vehicle.getSpeed() * 3.6 : 0, // Convert to km/h
            policeNearby: policeNearby
        });
    }

    handleInput() {
        if (!this.vehicle) return;
        
        // Check keyboard input
        const forward = this.keys['w'] || this.keys['arrowup'] || this.mobileInput.forward;
        const backward = this.keys['s'] || this.keys['arrowdown'] || this.mobileInput.backward;
        const left = this.keys['a'] || this.keys['arrowleft'] || this.mobileInput.left;
        const right = this.keys['d'] || this.keys['arrowright'] || this.mobileInput.right;
        const drift = this.keys[' '] || this.mobileInput.drift;
        
        this.vehicle.setControl('forward', forward);
        this.vehicle.setControl('backward', backward);
        this.vehicle.setControl('left', left);
        this.vehicle.setControl('right', right);
        this.vehicle.setControl('drift', drift);
    }

    updateCamera() {
        if (!this.vehicle) return;
        
        const vehiclePos = this.vehicle.getPosition();
        const vehicleRot = this.vehicle.rotation;
        
        // Camera follows behind and above the vehicle
        const cameraDistance = 15;
        const cameraHeight = 8;
        
        const targetX = vehiclePos.x - Math.sin(vehicleRot) * cameraDistance;
        const targetY = vehiclePos.y + cameraHeight;
        const targetZ = vehiclePos.z - Math.cos(vehicleRot) * cameraDistance;
        
        // Smooth camera movement
        this.camera.position.x = MathUtils.lerp(this.camera.position.x, targetX, 0.1);
        this.camera.position.y = MathUtils.lerp(this.camera.position.y, targetY, 0.1);
        this.camera.position.z = MathUtils.lerp(this.camera.position.z, targetZ, 0.1);
        
        // Look at vehicle with slight offset forward
        const lookAtX = vehiclePos.x + Math.sin(vehicleRot) * 5;
        const lookAtZ = vehiclePos.z + Math.cos(vehicleRot) * 5;
        this.camera.lookAt(lookAtX, vehiclePos.y + 1, lookAtZ);
    }

    checkCollisions() {
        if (!this.vehicle) return;
        
        const playerBox = this.vehicle.getBoundingBox();
        
        // Check obstacle collisions
        if (this.environmentManager.checkObstacleCollisions(playerBox)) {
            this.gameOver('You crashed into an obstacle!');
            return;
        }
        
        // Check police collisions
        if (this.policeManager.checkCollisions(playerBox)) {
            this.gameOver('You were caught by the police!');
            return;
        }
    }

    gameOver(reason = '') {
        if (this.state !== 'playing') return;
        
        console.log('Game Over:', reason);
        this.state = 'gameOver';
        
        // Stop audio
        audioManager.stopEngine();
        audioManager.playCrash();
        
        // Award money to shop
        shopManager.addMoney(this.moneyCollected);
        shopManager.saveBestDistance(this.distance);
        
        // Show game over screen
        uiManager.showGameOver({
            distance: this.distance,
            time: this.gameTime,
            moneyCollected: this.moneyCollected,
            totalMoney: shopManager.getTotalMoney()
        });
        
        // Clean up game objects
        this.cleanup();
    }

    cleanup() {
        if (this.vehicle) {
            this.vehicle.destroy();
            this.vehicle = null;
        }
        
        if (this.policeManager) {
            this.policeManager.reset();
            this.policeManager = null;
        }
        
        if (this.environmentManager) {
            this.environmentManager.reset();
            this.environmentManager = null;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update game
        this.update(deltaTime);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
});
