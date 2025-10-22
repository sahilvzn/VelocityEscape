# Escape Road - Endless Police Chase Game

A browser-based 3D endless car chase game inspired by "Escape Road". Outrun the police, collect money, avoid obstacles, and unlock new vehicles in this thrilling escape adventure!

![Game Preview](https://via.placeholder.com/800x400/87ceeb/000000?text=Escape+Road+Game)

## 🎮 Game Features

### Core Gameplay
- **Endless Chase**: Drive as far as you can while being pursued by police
- **Dynamic Difficulty**: Police spawn rate and speed increase over time
- **Procedural Environment**: Infinitely generated roads, obstacles, and buildings
- **Vehicle Physics**: Realistic car movement with steering, acceleration, braking, and drifting
- **Collision System**: Crash detection with obstacles and police vehicles
- **Currency System**: Collect money during runs to unlock new vehicles

### Game Elements
- **Player Vehicle**: Choose from 6 different vehicles with unique stats
- **Police AI**: Intelligent chase mechanics with avoidance and pursuit behaviors
- **Obstacles**: Traffic cars, barriers, trees, and buildings
- **Collectibles**: Money pickups scattered throughout the environment
- **Multiple Screens**: Main menu, how to play, garage/shop, and game over

### Visual & Audio
- **3D Graphics**: Built with Three.js for smooth WebGL rendering
- **Dynamic Camera**: Third-person view that follows the player
- **Police Sirens**: Flashing lights and sound effects
- **Procedural City**: Buildings and environment elements
- **Sound Effects**: Engine sounds, crash effects, and coin collection (placeholders using Web Audio API)

## 🚗 Vehicle Database

| Vehicle | Price | Max Speed | Acceleration | Braking | Handling | Description |
|---------|-------|-----------|--------------|---------|----------|-------------|
| Basic Sedan | Free | 60 | 15 | 20 | 1.5 | A standard getaway vehicle |
| Sports Car | 💰500 | 80 | 25 | 25 | 2.0 | Fast and agile |
| Muscle Car | 💰750 | 75 | 30 | 20 | 1.3 | Raw power |
| Heavy SUV | 💰1000 | 55 | 18 | 25 | 1.2 | Durable and tough |
| Supercar | 💰2000 | 100 | 35 | 30 | 2.5 | Ultimate speed machine |
| Armored Tank | 💰5000 | 40 | 12 | 15 | 0.8 | Nothing can stop you |

## 🎯 Controls

### Desktop (Keyboard)
- **W / ↑** - Accelerate
- **S / ↓** - Brake / Reverse
- **A / ←** - Turn Left
- **D / →** - Turn Right
- **SPACE** - Handbrake / Drift

### Mobile (Touch)
- **On-screen buttons** for movement (automatically shown on mobile devices)
- **Left/Right arrows** - Steering
- **Up arrow** - Accelerate
- **Down arrow** - Brake
- **DRIFT button** - Handbrake

## 📁 Project Structure

```
/workspace/
├── index.html              # Main HTML file
├── styles.css              # All CSS styling
├── js/
│   ├── game.js            # Main game loop and state management
│   ├── vehicle.js         # Vehicle physics and controller
│   ├── police.js          # Police AI and chase mechanics
│   ├── environment.js     # Procedural environment generation
│   ├── ui.js              # UI management and screens
│   ├── shop.js            # Garage/shop system
│   ├── audio.js           # Audio manager
│   └── utils.js           # Utility functions and helpers
├── README.md              # This file
└── LICENSE                # License file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required - runs directly in the browser!

### Installation & Running

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd workspace
   ```

2. **Open the game**
   - Simply open `index.html` in your web browser
   - Or use a local web server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Python 2
     python -m SimpleHTTPServer 8000
     
     # Node.js (with http-server)
     npx http-server
     ```
   - Then navigate to `http://localhost:8000`

3. **Start playing!**
   - Click "START GAME" to begin
   - Use keyboard or on-screen controls to drive
   - Collect money and avoid police!

## 🎨 Customization Guide

### Adding New Vehicles

Edit `js/vehicle.js` and add a new entry to the `VEHICLE_DATABASE` array:

```javascript
{
    id: 'your_vehicle_id',
    name: 'Vehicle Name',
    description: 'Description here',
    price: 1500,              // Cost in game currency
    maxSpeed: 70,             // Top speed
    acceleration: 20,         // Acceleration rate
    braking: 22,              // Braking power
    handling: 1.8,            // Turn rate
    color: 0xff5733,          // Hex color
    unlocked: false           // Start locked?
}
```

### Modifying Difficulty

Edit `js/police.js` in the `PoliceManager.update()` method:

```javascript
// Change difficulty scaling
this.difficulty = 1 + Math.floor(gameTime / 30); // Increase every 30 seconds

// Change max police count
this.maxPolice = Math.min(3 + Math.floor(this.difficulty / 2), 10);

// Change spawn interval
this.spawnInterval = Math.max(5, 10 - this.difficulty * 0.5);
```

### Adding New Obstacle Types

Edit `js/environment.js` in the `Obstacle` class. Add a new case in `createMesh()`:

```javascript
case 'your_obstacle':
    mesh = this.createYourObstacle();
    break;
```

Then implement the creation method:

```javascript
createYourObstacle() {
    const group = new THREE.Group();
    // Add your 3D geometry here
    return group;
}
```

### Changing Visual Style

**Colors**: Edit `styles.css` to change the UI color scheme
```css
/* Primary accent color */
.btn-primary {
    background: linear-gradient(135deg, #your-color 0%, #your-color 100%);
}
```

**3D Models**: Replace the simple box geometries in vehicle and obstacle creation methods with custom geometries or loaded models

**Environment**: Modify `environment.js` to change road width, building density, or add new environment features

### Sound Effects

Replace placeholder sounds in `js/audio.js`. The current implementation uses Web Audio API oscillators. To use actual audio files:

```javascript
playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.volume = this.sfxVolume;
    audio.play();
}

// Usage
playSound('sounds/engine.mp3');
```

## 🎯 Game Mechanics

### Scoring System
- **Distance**: Every meter traveled counts toward your score
- **Time**: Survive as long as possible
- **Money**: Collect coins to unlock vehicles

### Police Behavior
- Police spawn behind the player at regular intervals
- They follow the player using pathfinding AI
- Police speed increases with game difficulty
- More police spawn as you survive longer

### Collision Detection
- Bounding box collision system
- Hitting obstacles or police ends the game
- Visual and audio feedback on crash

### Progression System
- Money earned during runs is permanent
- Unlock better vehicles with collected money
- Each vehicle has unique stats affecting gameplay
- Best distance is saved locally

## 🔧 Technical Details

### Technologies Used
- **Three.js (r128)**: 3D rendering engine
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **CSS3**: Modern styling with gradients and animations
- **Web Audio API**: Procedural sound generation
- **LocalStorage**: Save game progress

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Optimization
- Object pooling for obstacles and collectibles
- Frustum culling (only render visible objects)
- Efficient collision detection (bounding boxes)
- Limited draw distance with fog
- Mobile-optimized controls and rendering

## 📱 Mobile Support

The game automatically detects mobile devices and:
- Shows on-screen touch controls
- Adjusts UI scaling for smaller screens
- Optimizes rendering performance
- Supports both portrait and landscape modes

## 🐛 Known Issues & Limitations

1. **Placeholder Audio**: Uses Web Audio API oscillators instead of actual sound files
2. **Simple Graphics**: Uses basic Three.js geometries (boxes, cylinders) instead of detailed models
3. **No Multiplayer**: Single-player only
4. **No Backend**: All data stored locally in browser

## 🚀 Future Enhancements

Potential features to add:
- [ ] Real 3D models for vehicles and obstacles
- [ ] Multiple environment types (desert, snow, night city)
- [ ] Power-ups (speed boost, invincibility, magnet)
- [ ] Vehicle upgrades (engine, handling, durability)
- [ ] Online leaderboard
- [ ] Daily challenges
- [ ] Achievement system
- [ ] Particle effects (smoke, sparks, dust)
- [ ] More sophisticated police AI
- [ ] Weather effects
- [ ] Day/night cycle

## 📝 License

This project is open source. See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 🎮 Gameplay Tips

1. **Drifting**: Hold SPACE while turning to drift around corners
2. **Money Route**: Plan your path to collect maximum coins
3. **Police Evasion**: Sharp turns can shake off pursuing police
4. **Vehicle Choice**: Fast vehicles are harder to control but can outrun police
5. **Save Money**: Don't buy every vehicle - save for the expensive ones
6. **Practice**: Learn the obstacle patterns to survive longer

## 📞 Support

For issues, questions, or suggestions, please open an issue on the repository.

## 🙏 Credits

- Inspired by "Escape Road" game
- Built with Three.js
- Created as a browser-based HTML5 game

---

**Enjoy the chase! 🚓💨**
