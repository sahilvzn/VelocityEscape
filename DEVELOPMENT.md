# Development Guide - Escape Road

## 🏗️ Architecture Overview

The game uses a modular architecture with separate managers for different systems:

```
┌─────────────────────────────────────────────┐
│           game.js (Main Loop)               │
│  - State management                         │
│  - Update/render loop                       │
│  - Input handling                           │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐   ┌──────▼──────┐
│  Managers  │   │   Systems   │
└──────┬─────┘   └──────┬──────┘
       │                │
   ┌───┴───┬────────┬───┴────┬────────┐
   │       │        │        │        │
┌──▼───┐ ┌▼────┐ ┌─▼───┐ ┌──▼────┐ ┌─▼────┐
│ UI   │ │Shop │ │Audio│ │Police│ │Env.  │
│Manager│ │Mgr  │ │ Mgr │ │ Mgr  │ │Mgr   │
└──────┘ └─────┘ └─────┘ └──────┘ └──────┘
```

## 📦 Module Breakdown

### utils.js
**Purpose**: Shared utility functions
- Math helpers (lerp, clamp, random)
- Storage helpers (save/load)
- Collision detection
- Format helpers

**Key Functions**:
```javascript
MathUtils.lerp(start, end, t)
MathUtils.random(min, max)
StorageUtils.save(key, value)
checkCollision(box1, box2)
```

### audio.js
**Purpose**: Sound management
- Procedural sound generation
- Web Audio API wrapper
- Volume control

**Key Features**:
- Engine sound with speed modulation
- Police siren
- Crash/coin collection sounds

### vehicle.js
**Purpose**: Vehicle physics and rendering
- Car movement and physics
- Steering, acceleration, braking
- Vehicle database

**Key Classes**:
- `Vehicle`: Main vehicle controller
- `VEHICLE_DATABASE`: Array of vehicle configurations

### police.js
**Purpose**: Police AI and chase mechanics
- Police vehicle behavior
- Chase AI
- Spawn management

**Key Classes**:
- `PoliceVehicle`: Individual police car
- `PoliceManager`: Spawning and difficulty scaling

### environment.js
**Purpose**: Procedural world generation
- Road generation
- Obstacle spawning
- Collectible placement

**Key Classes**:
- `Road`: Road segment
- `Obstacle`: Traffic, barriers, buildings, trees
- `Collectible`: Money coins
- `EnvironmentManager`: Orchestrates all environment

### ui.js
**Purpose**: User interface management
- Screen transitions
- HUD updates
- Button handlers

**Key Class**:
- `UIManager`: Singleton managing all UI

### shop.js
**Purpose**: Vehicle unlock system
- Money management
- Vehicle purchasing
- Save/load progression

**Key Class**:
- `ShopManager`: Singleton managing shop

### game.js
**Purpose**: Main game loop
- Initialize Three.js
- Game state machine
- Update/render loop
- Input handling

**Key Class**:
- `Game`: Main game controller

## 🔧 Key Systems

### 1. Game Loop

```javascript
animate() {
    requestAnimationFrame(() => this.animate());
    const deltaTime = this.clock.getDelta();
    
    this.update(deltaTime);  // Update game logic
    this.renderer.render(this.scene, this.camera);  // Render
}
```

### 2. State Machine

States: `loading` → `menu` → `playing` → `gameOver` → `menu`

```javascript
this.state = 'playing';  // Current state
// Update logic only runs when state === 'playing'
```

### 3. Input System

```javascript
// Keyboard
this.keys = { 'w': true, 'a': false, ... };

// Mobile
this.mobileInput = { forward: true, left: false, ... };

// Combined in handleInput()
```

### 4. Collision Detection

Uses Three.js bounding boxes:
```javascript
const box1 = new THREE.Box3().setFromObject(mesh1);
const box2 = new THREE.Box3().setFromObject(mesh2);
const collision = checkCollision(box1, box2);
```

### 5. Procedural Generation

Environment generates ahead and despawns behind:
```javascript
// Generate new content ahead of player
if (playerZ > lastGeneratedZ - 150) {
    generateNewSegment();
}

// Cleanup old content
if (objectZ < playerZ - 100) {
    object.destroy();
}
```

## 🎨 Adding New Features

### Adding a New Vehicle

1. **Add to database** (`vehicle.js`):
```javascript
VEHICLE_DATABASE.push({
    id: 'monster_truck',
    name: 'Monster Truck',
    description: 'Crushes everything',
    price: 3000,
    maxSpeed: 50,
    acceleration: 15,
    braking: 30,
    handling: 0.9,
    color: 0x00ff00,
    unlocked: false
});
```

2. **Create custom mesh** (optional):
```javascript
createMonsterTruckMesh() {
    const group = new THREE.Group();
    // Add custom geometry
    return group;
}
```

3. **Test**: Money will auto-save, shop auto-updates

### Adding a New Obstacle Type

1. **Add to Obstacle class** (`environment.js`):
```javascript
case 'truck':
    mesh = this.createTruck();
    break;

createTruck() {
    // Create truck geometry
    const group = new THREE.Group();
    // ...
    return group;
}
```

2. **Add to spawn pool**:
```javascript
const type = MathUtils.randomChoice([
    'car', 'barrier', 'tree', 'truck'  // Add new type
]);
```

### Adding Power-ups

1. **Create Powerup class** (in `environment.js`):
```javascript
class Powerup extends Collectible {
    constructor(scene, position, type) {
        super(scene, position);
        this.type = type; // 'speed', 'shield', 'magnet'
    }
    
    activate(vehicle) {
        switch(this.type) {
            case 'speed':
                vehicle.maxSpeed *= 1.5;
                setTimeout(() => {
                    vehicle.maxSpeed /= 1.5;
                }, 5000);
                break;
        }
    }
}
```

2. **Add to environment manager**:
```javascript
spawnPowerups(zPosition) {
    if (Math.random() > 0.95) {  // 5% chance
        const powerup = new Powerup(
            this.scene, 
            new THREE.Vector3(x, y, z),
            'speed'
        );
        this.powerups.push(powerup);
    }
}
```

3. **Check collection in game loop**:
```javascript
this.environmentManager.checkPowerups(this.vehicle);
```

### Adding New Sound Effects

Using actual audio files:

1. **Create audio loader** (`audio.js`):
```javascript
loadSound(path) {
    return new Promise((resolve) => {
        const audio = new Audio(path);
        audio.addEventListener('canplaythrough', () => resolve(audio));
    });
}
```

2. **Load in init**:
```javascript
this.sounds.engine = await this.loadSound('sounds/engine.mp3');
```

3. **Play sound**:
```javascript
playEngineSound() {
    this.sounds.engine.play();
}
```

### Adding Multiple Game Modes

1. **Add mode selector to UI** (`index.html`):
```html
<div id="modeSelect">
    <button onclick="game.setMode('endless')">Endless</button>
    <button onclick="game.setMode('timed')">Time Trial</button>
</div>
```

2. **Add mode logic** (`game.js`):
```javascript
setMode(mode) {
    this.gameMode = mode;
    this.startGame();
}

update(deltaTime) {
    switch(this.gameMode) {
        case 'endless':
            this.updateEndlessMode(deltaTime);
            break;
        case 'timed':
            this.updateTimedMode(deltaTime);
            break;
    }
}
```

### Adding Particle Effects

Using Three.js particle system:

```javascript
class ParticleEffect {
    constructor(scene, position) {
        const geometry = new THREE.BufferGeometry();
        const particles = 100;
        const positions = new Float32Array(particles * 3);
        
        for(let i = 0; i < particles * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 2;
        }
        
        geometry.setAttribute('position', 
            new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1
        });
        
        this.mesh = new THREE.Points(geometry, material);
        this.mesh.position.copy(position);
        scene.add(this.mesh);
    }
    
    update(deltaTime) {
        // Update particle positions
    }
}
```

## 🧪 Testing

### Unit Testing Setup (Optional)

```html
<!-- Add to HTML -->
<script src="https://cdn.jsdelivr.net/npm/jest@29/dist/jest.min.js"></script>

<script>
// Test utility functions
test('MathUtils.clamp', () => {
    expect(MathUtils.clamp(5, 0, 10)).toBe(5);
    expect(MathUtils.clamp(-5, 0, 10)).toBe(0);
    expect(MathUtils.clamp(15, 0, 10)).toBe(10);
});
</script>
```

### Performance Profiling

```javascript
// In browser console
console.time('update');
game.update(0.016);
console.timeEnd('update');
```

### Memory Leak Detection

```javascript
// Check object counts
console.log('Obstacles:', game.environmentManager.obstacles.length);
console.log('Police:', game.policeManager.policeVehicles.length);
console.log('Collectibles:', game.environmentManager.collectibles.length);

// Should decrease as player moves forward
```

## 📊 Performance Optimization

### Best Practices

1. **Object Pooling**: Reuse objects instead of creating/destroying
```javascript
class ObjectPool {
    constructor(createFunc, initialSize = 10) {
        this.pool = [];
        this.createFunc = createFunc;
        
        for(let i = 0; i < initialSize; i++) {
            this.pool.push(createFunc());
        }
    }
    
    acquire() {
        return this.pool.pop() || this.createFunc();
    }
    
    release(obj) {
        this.pool.push(obj);
    }
}
```

2. **Frustum Culling**: Already handled by Three.js

3. **Level of Detail**: Simplify distant objects
```javascript
const distance = camera.position.distanceTo(object.position);
if (distance > 50) {
    object.material.wireframe = true;  // Simplified rendering
}
```

4. **Reduce Draw Calls**: Merge geometries
```javascript
const geometry = new THREE.BufferGeometry();
geometry.merge(geometry1);
geometry.merge(geometry2);
```

## 🐛 Debugging Tips

### Common Issues

**Game doesn't start**:
```javascript
// Check console for errors
// Verify Three.js loaded
console.log(typeof THREE);  // Should be 'object'
```

**Controls not responding**:
```javascript
// Check input state
console.log(game.keys);
console.log(game.vehicle.controls);
```

**Collisions not working**:
```javascript
// Visualize bounding boxes
const helper = new THREE.Box3Helper(boundingBox, 0xff0000);
scene.add(helper);
```

**Performance issues**:
```javascript
// Check object counts
console.log(scene.children.length);  // Should be < 500
```

## 📝 Code Style

### Naming Conventions
- **Classes**: PascalCase (`Vehicle`, `PoliceManager`)
- **Functions**: camelCase (`updateCamera`, `checkCollision`)
- **Constants**: UPPER_SNAKE_CASE (`VEHICLE_DATABASE`)
- **Private vars**: prefix with `_` (`this._internalState`)

### File Organization
```javascript
/**
 * filename.js - Brief description
 */

// Imports (if using modules)

// Constants
const CONFIG = {...};

// Classes
class MyClass {
    constructor() {...}
    publicMethod() {...}
    _privateMethod() {...}
}

// Global instances
const instance = new MyClass();
```

## 🚀 Deployment

### Production Build
1. Minify JavaScript:
```bash
npx terser js/*.js -o bundle.min.js
```

2. Optimize assets:
```bash
# Compress images
# Convert to WebP format
# Use texture atlases
```

3. Enable caching:
```html
<script src="bundle.min.js?v=1.0.0"></script>
```

### Hosting Options
- GitHub Pages (free)
- Netlify (free)
- Vercel (free)
- Your own server

## 📚 Resources

### Three.js
- [Official Docs](https://threejs.org/docs/)
- [Examples](https://threejs.org/examples/)

### Game Development
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

### Web Audio
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Happy Coding! 🎮💻**
