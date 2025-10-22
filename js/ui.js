/**
 * ui.js - UI management and screen transitions
 */

class UIManager {
    constructor() {
        // Screen elements
        this.screens = {
            loading: document.getElementById('loadingScreen'),
            mainMenu: document.getElementById('mainMenu'),
            howToPlay: document.getElementById('howToPlayScreen'),
            garage: document.getElementById('garageScreen'),
            gameOver: document.getElementById('gameOverScreen')
        };
        
        // HUD elements
        this.gameHUD = document.getElementById('gameHUD');
        this.distanceValue = document.getElementById('distanceValue');
        this.timeValue = document.getElementById('timeValue');
        this.moneyValue = document.getElementById('moneyValue');
        this.speedValue = document.getElementById('speedValue');
        this.policeAlert = document.getElementById('policeAlert');
        
        // Mobile controls
        this.mobileControls = document.getElementById('mobileControls');
        
        // Main menu elements
        this.totalMoneyDisplay = document.getElementById('totalMoney');
        this.bestDistanceDisplay = document.getElementById('bestDistance');
        
        // Game over elements
        this.finalDistance = document.getElementById('finalDistance');
        this.finalTime = document.getElementById('finalTime');
        this.finalMoney = document.getElementById('finalMoney');
        this.finalTotalMoney = document.getElementById('finalTotalMoney');
        
        // Loading
        this.loadingProgress = document.getElementById('loadingProgress');
        
        // Current screen
        this.currentScreen = 'loading';
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show mobile controls only on smaller screens or mobile
        const smallScreen = () => (isMobile() || window.innerWidth <= 820);
        if (smallScreen()) {
            this.showMobileControls();
        } else {
            this.hideMobileControls();
        }
        window.addEventListener('resize', () => {
            if (smallScreen()) this.showMobileControls(); else this.hideMobileControls();
        });
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.onStartGame();
        });
        
        document.getElementById('garageBtn').addEventListener('click', () => {
            this.showScreen('garage');
        });
        
        document.getElementById('howToPlayBtn').addEventListener('click', () => {
            this.showScreen('howToPlay');
        });
        
        // How to play
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Garage
        document.getElementById('backToMenuFromGarageBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Game over buttons
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.onStartGame();
        });
        
        document.getElementById('toGarageBtn').addEventListener('click', () => {
            this.showScreen('garage');
        });
        
        document.getElementById('toMenuBtn').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.remove('hidden');
            this.currentScreen = screenName;
        }
        
        // Hide HUD when not in game
        if (screenName !== 'game') {
            this.hideHUD();
        }
    }

    showHUD() {
        this.gameHUD.classList.remove('hidden');
    }

    hideHUD() {
        this.gameHUD.classList.add('hidden');
    }

    showMobileControls() {
        this.mobileControls.classList.remove('hidden');
    }

    hideMobileControls() {
        this.mobileControls.classList.add('hidden');
    }

    updateHUD(stats) {
        // Update distance
        if (stats.distance !== undefined) {
            this.distanceValue.textContent = formatDistance(stats.distance);
        }
        
        // Update time
        if (stats.time !== undefined) {
            this.timeValue.textContent = formatTime(stats.time);
        }
        
        // Update money
        if (stats.money !== undefined) {
            this.moneyValue.textContent = '💰 ' + stats.money;
        }
        
        // Update speed
        if (stats.speed !== undefined) {
            this.speedValue.textContent = Math.floor(stats.speed) + ' km/h';
        }
        
        // Update police alert
        if (stats.policeNearby !== undefined) {
            if (stats.policeNearby) {
                this.policeAlert.classList.add('active');
            } else {
                this.policeAlert.classList.remove('active');
            }
        }
    }

    updateMainMenu(totalMoney, bestDistance) {
        this.totalMoneyDisplay.textContent = totalMoney;
        this.bestDistanceDisplay.textContent = formatDistance(bestDistance);
    }

    showGameOver(stats) {
        this.finalDistance.textContent = formatDistance(stats.distance);
        this.finalTime.textContent = formatTime(stats.time);
        this.finalMoney.textContent = stats.moneyCollected;
        this.finalTotalMoney.textContent = stats.totalMoney;
        
        this.showScreen('gameOver');
    }

    updateLoadingProgress(progress) {
        this.loadingProgress.style.width = progress + '%';
    }

    // Callback functions (to be set by game)
    onStartGame() {
        console.log('Start game clicked');
    }

    onBackToMenu() {
        console.log('Back to menu clicked');
    }
}

// Create global UI manager instance
const uiManager = new UIManager();
