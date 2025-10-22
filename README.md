# Escape Road (Web Skeleton)

A browser-based endless driving and police chase prototype built with HTML5, CSS, JavaScript, and Three.js. Drive as far as you can, collect money, avoid obstacles, and get chased by police. Includes a minimal garage/shop stub with unlockable vehicles using localStorage.

---

## Run it
- Open `index.html` directly in a modern browser, or
- Serve the folder with any static server (for example):
```bash
# Python 3
python3 -m http.server 8080
# then open http://localhost:8080
```

No build step required.

---

## Controls
- Accelerate: W or Arrow Up
- Brake/Reverse: S or Arrow Down
- Steer: A/D or Left/Right arrows
- Mobile: on-screen Left/Right/Accelerate/Brake buttons appear automatically on small screens

---

## What’s included
- Main Run scene with:
  - Player car controller (accel, brake/reverse, steering, bounds)
  - Endless road via segment recycling
  - Random obstacles and coin pickups
  - Simple police AI chase with difficulty ramp
  - HUD (distance, money, speed) and Game Over screen
- Garage/Shop screen stub with unlockable vehicles (localStorage)
- WebAudio oscillator placeholders (pickup, crash, siren, engine ticks)
- Responsive UI with basic touch controls

---

## Project structure
```
/ (project root)
  index.html          # Canvas + UI overlays + script tags
  /css
    styles.css        # UI, HUD, screens, mobile controls
  /js
    game.js           # All core game logic (Run + Garage)
  /assets             # Placeholder for future models, textures, sounds
```

---

## Customize

### Add or edit vehicles
Edit `DEFAULT_VEHICLES` in `js/game.js` (id, name, price, maxSpeed, accel, turnRate, color). Example:
```js
{ id: 'sprinter', name: 'Sprinter', price: 200, maxSpeed: 80, accel: 32, turnRate: 2.8, color: 0x3a86ff }
```
- Unlocked vehicles are stored in `localStorage` under `escapeRoad.profile.v1`.
- The selected vehicle determines player handling and color.

### Change spawn rates / difficulty
- Obstacle and coin spawning occurs when road segments recycle in `updateRoad`.
- Police difficulty ramps in `updatePolice` (increasing count over time).
- Tweak probabilities and timers there to adjust the challenge.

### Adjust camera and feel
- Follow camera logic: `updateCamera` in `js/game.js`.
- Handling parameters come from the selected vehicle and `player` object.

### UI & screens
- Edit `index.html` overlay sections for Menu, HUD, Garage, Game Over.
- Styles in `css/styles.css`. Mobile buttons live under `#mobileControls`.

### Sounds
- Minimal oscillator-based placeholders in `Audio` (inside `js/game.js`).
- Replace with real assets by loading audio buffers and playing them on events (pickup, crash, siren, engine loop).

---

## Data & persistence
- Profile (`money`, `ownedVehicles`, `selectedVehicle`) is saved in `localStorage` (`escapeRoad.profile.v1`).
- Money awarded on Game Over: coins collected + distance bonus.

---

## Notes and next steps
- Replace box meshes with real models (cars, traffic, environment) and add materials.
- Add more enemy behaviors (boxing-in, ramming, road blocks) and traffic.
- Support drift/handbrake, nitro, upgrades.
- Add high score and optional online leaderboard.
- Improve performance (object pooling, InstancedMesh, tuned shadows).
