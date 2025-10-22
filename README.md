# 🚗 Escape Road (Web) - Skeleton

A browser-based endless driving and police chase game inspired by “Escape Road”. This repo contains a working skeleton with basic movement, procedural road spawning, pickups, simple police AI, collisions, HUD, menus, and a garage/shop stub.

---

## 🎮 Run
- Open `index.html` directly in a modern desktop or mobile browser.
- Or serve locally for module support and better caching:

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

Controls:
- Accelerate: W or Up Arrow
- Brake/Reverse: S or Down Arrow
- Steer: A/D or Left/Right Arrows
- Mobile: On-screen buttons appear automatically

---

## 🧱 Folder Structure
```
assets/
  audio/           # audio placeholders
  images/          # UI / logo placeholders
  textures/        # texture placeholders
src/
  entities/        # Car, PoliceCar, Obstacle, Pickup
  game/            # Game boot, scenes, UI, services
    scenes/        # SceneRun, SceneGarage
    services/      # assets, audio, persistence
  systems/         # input, spawn, collision
index.html
styles.css
```

---

## 🧩 Tech Stack
- JavaScript (ES Modules)
- Three.js (CDN) for simple 3D
- Web Audio API for SFX placeholders
- LocalStorage for currency, unlocks, high score

---

## 🛠 Customization Guide

- Add/modify vehicles: edit `src/game/services/persistence.js` in `DEFAULT_VEHICLES`.
  - Fields: `id`, `name`, `maxSpeed`, `accel`, `brake`, `turnRate`, `price`, `unlocked`.
- Change selected vehicle: garage screen or set `selectedVehicleId` in local storage.
- Replace car visuals: edit `src/entities/car.js` to use your own geometry or GLTF model.
- Police tuning: `src/entities/police.js` (`maxSpeed`, `accel`, `turnRate`).
- Road/obstacles: `src/systems/spawn.js` (`roadWidth`, `segmentLength`, spawn counts, colors).
- Coin value: `sceneRun.js` updates `runMoney += 10` on collect.
- Score formula: `game/state.js` in `endRun` (distance multiplier + collected money).
- UI look: `styles.css`.
- Audio: replace placeholder synth with samples in `assets/audio` and load via `services/assets.js`.

---

## ✅ Implemented (Skeleton)
- Main menu, HUD, game over, and garage/shop stub
- Basic car controls (keyboard + touch)
- Endless road spawn with lane markings
- Random obstacles and coins
- Simple police chase and difficulty ramp
- Collision detection and game-over flow
- WebAudio placeholder sounds (engine, siren, collect, crash)
- LocalStorage persistence (money, unlocks, selected vehicle, high score)

---

## 🚧 Next Ideas
- Import real models (GLTF) for cars and buildings
- Better city generation (intersections, traffic)
- Smarter police tactics (blocking, boxing-in)
- Drift/handbrake handling
- Upgrades (engine, handling, durability)
- Achievements and online leaderboard
```
