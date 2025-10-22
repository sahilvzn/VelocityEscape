# 🚀 Quick Start Guide - Escape Road

## Instant Play (No Installation Required!)

### Option 1: Direct File Opening
1. Navigate to the `/workspace` folder
2. Double-click `index.html`
3. The game will open in your default browser
4. **Click "START GAME"** and start playing!

### Option 2: Local Server (Recommended)
For the best experience, run a local web server:

```bash
# Using Python 3 (most common)
cd /workspace
python3 -m http.server 8000

# Then open: http://localhost:8000
```

Or:
```bash
# Using Node.js
npx http-server /workspace

# Using PHP
php -S localhost:8000

# Using Ruby
ruby -run -ehttpd /workspace -p8000
```

## 🎮 First Time Playing?

1. **Main Menu** appears after loading
2. Click **"HOW TO PLAY"** to see controls
3. Click **"START GAME"** to begin your escape!
4. Use **WASD** or **Arrow Keys** to drive
5. Press **SPACE** to drift around corners
6. Collect **💰 money** while avoiding police and obstacles
7. Visit the **GARAGE** to unlock new vehicles with your earnings!

## 🎯 Your First Run

- You start with the **Basic Sedan** (free vehicle)
- Police will spawn behind you immediately
- Collect coins scattered on the road
- Avoid crashing into obstacles or police cars
- The longer you survive, the harder it gets!
- After game over, your money is saved permanently

## 💡 Pro Tips for Beginners

1. **Start Slow**: Get familiar with the controls first
2. **Practice Drifting**: Hold SPACE while turning for sharp corners
3. **Collect Money**: You need it to unlock better vehicles
4. **Watch the Minimap**: Police alert shows when they're nearby
5. **Upgrade Wisely**: Save up for the Sports Car (500💰) first

## 📱 Playing on Mobile?

- Touch controls appear automatically
- Use the on-screen buttons to drive
- Landscape mode works best
- Supports both iOS and Android browsers

## ⚡ Performance Tips

If the game runs slowly:
1. Close other browser tabs
2. Use Chrome or Firefox for best performance
3. Lower your browser's zoom level to 100%
4. Restart your browser
5. Make sure hardware acceleration is enabled

## 🎨 Visual Quality

The game uses:
- **3D Graphics** via WebGL/Three.js
- **Dynamic Lighting** for realistic shadows
- **Procedural Generation** for endless roads
- **Smooth Camera** following your vehicle

## 🔊 Audio

- Engine sounds adjust with your speed
- Police sirens when they're nearby
- Coin collection sound effects
- Crash sound on game over
- All sounds are generated procedurally (Web Audio API)

## 📊 Save System

Your progress is automatically saved:
- ✅ Total money earned
- ✅ Vehicles unlocked
- ✅ Best distance record
- ✅ Selected vehicle

**Note**: Data is stored in your browser's LocalStorage, so clearing browser data will reset your progress.

## 🎯 Unlocking Vehicles

| Vehicle | Cost | When to Buy |
|---------|------|-------------|
| Basic Sedan | FREE | Starting vehicle |
| Sports Car | 💰500 | First upgrade - balanced stats |
| Muscle Car | 💰750 | High acceleration |
| Heavy SUV | 💰1000 | Better durability |
| Supercar | 💰2000 | Maximum speed |
| Armored Tank | 💰5000 | Ultimate challenge |

## 🐛 Troubleshooting

**Game won't load?**
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check browser console for errors (F12)
- Try a local server instead of opening file directly

**Controls not working?**
- Click on the game canvas to focus it
- Check if another browser extension is interfering
- Refresh the page and try again

**Performance issues?**
- The game requires WebGL support
- Update your graphics drivers
- Try a different browser

**No sound?**
- Click anywhere on the page first (browsers block autoplay)
- Check browser sound permissions
- Unmute the browser tab

## 🎮 Game Modes

Currently Available:
- **Endless Mode**: Survive as long as possible (default)

Future Modes (Not Yet Implemented):
- Time Trial
- Checkpoint Race
- Police Escape Challenge

## 📈 Scoring

Your performance is measured by:
1. **Distance** - How far you traveled (in meters)
2. **Time** - How long you survived (in seconds)
3. **Money** - How many coins you collected

**Best Score** is determined by distance traveled.

## 🏆 Achievements (Goals to Aim For)

Try to achieve:
- [ ] Survive 60 seconds
- [ ] Travel 500 meters
- [ ] Collect 100 coins in one run
- [ ] Unlock all vehicles
- [ ] Escape 10 police cars
- [ ] Perfect drift around obstacles

## 🎓 Advanced Techniques

**Drifting**: Hold SPACE + turn for controlled slides
**Police Evasion**: Make sharp turns when police are close
**Coin Routes**: Plan your path to maximize money collection
**Obstacle Weaving**: Practice threading between traffic

## 📞 Need Help?

- Check the **README.md** for detailed documentation
- Review the **"HOW TO PLAY"** screen in-game
- Open browser console (F12) to see error messages
- Check that all files are in the correct folders

## 🎉 Have Fun!

The game gets progressively harder - can you beat your own high score? Good luck outrunning the police! 🚓💨

---

**Ready to play? Open `index.html` and start your escape!**
