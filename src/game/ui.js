export function setupUI() {
  const el = (id) => document.getElementById(id);

  const mainMenu = el('main-menu');
  const btnPlay = el('btn-play');
  const btnGarage = el('btn-garage');

  const hud = el('hud');
  const hudDistance = el('hud-distance');
  const hudMoney = el('hud-money');
  const hudTotalMoney = el('hud-total-money');

  const gameOver = el('game-over');
  const overDistance = el('over-distance');
  const overMoney = el('over-money');
  const overTotalMoney = el('over-total-money');
  const btnRestart = el('btn-restart');
  const btnToGarage = el('btn-to-garage');

  const garage = el('garage');
  const vehicleList = el('vehicle-list');
  const btnBackMenu = el('btn-back-menu');
  const btnStartFromGarage = el('btn-start-from-garage');

  const touch = {
    left: el('btn-left'), right: el('btn-right'), accel: el('btn-accel'), brake: el('btn-brake'),
    root: el('touch-controls')
  };

  const api = {
    showMainMenu() { mainMenu.classList.remove('hidden'); mainMenu.classList.add('visible'); },
    hideMainMenu() { mainMenu.classList.add('hidden'); mainMenu.classList.remove('visible'); },

    showHUD() { hud.classList.remove('hidden'); },
    hideHUD() { hud.classList.add('hidden'); },

    showGameOver() { gameOver.classList.remove('hidden'); },
    hideGameOver() { gameOver.classList.add('hidden'); },

    showGarage() { garage.classList.remove('hidden'); },
    hideGarage() { garage.classList.add('hidden'); },

    updateHUD({ distance, runMoney, totalMoney }) {
      if (distance !== undefined) hudDistance.textContent = distance.toFixed(1);
      if (runMoney !== undefined) hudMoney.textContent = String(runMoney);
      if (totalMoney !== undefined) hudTotalMoney.textContent = String(totalMoney);
    },

    updateTotalMoney(total) { hudTotalMoney.textContent = String(total); },

    updateGameOver({ distance, collected, total }) {
      overDistance.textContent = distance.toFixed(1);
      overMoney.textContent = String(collected);
      overTotalMoney.textContent = String(total);
    },

    populateGarage(persistence) {
      vehicleList.innerHTML = '';
      const vehicles = persistence.getAllVehicles();
      const selected = persistence.getSelectedVehicleId();
      vehicles.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.innerHTML = `
          <div class="name">${v.name}</div>
          <div class="stats">Speed: ${v.maxSpeed.toFixed(1)} | Handling: ${v.turnRate.toFixed(1)}</div>
          <div class="status">${v.unlocked ? 'Unlocked' : 'Locked ($' + v.price + ')'}</div>
          <button>${selected === v.id ? 'Selected' : v.unlocked ? 'Select' : 'Unlock'}</button>
        `;
        const button = card.querySelector('button');
        button.addEventListener('click', () => {
          if (v.unlocked) {
            persistence.setSelectedVehicleId(v.id);
            api.populateGarage(persistence);
          } else {
            const total = persistence.getTotalMoney();
            if (total >= v.price) {
              persistence.setTotalMoney(total - v.price);
              persistence.unlockVehicle(v.id);
              api.populateGarage(persistence);
            } else {
              alert('Not enough money');
            }
          }
        });
        vehicleList.appendChild(card);
      });
    },

    onPlay(fn) { btnPlay.addEventListener('click', fn); },
    onGarage(fn) { btnGarage.addEventListener('click', fn); },
    onRestart(fn) { btnRestart.addEventListener('click', fn); },
    onToGarage(fn) { btnToGarage.addEventListener('click', fn); },
    onBackMenu(fn) { btnBackMenu.addEventListener('click', fn); },
    onStartFromGarage(fn) { btnStartFromGarage.addEventListener('click', fn); },

    touch,
  };

  btnToGarage.addEventListener('click', () => {
    api.hideGameOver();
    api.showGarage();
  });

  // Mobile: show touch controls if small screen or touch support
  const updateTouchVisibility = () => {
    const shouldShow = ('ontouchstart' in window) || window.innerWidth < 720;
    if (shouldShow) touch.root.classList.remove('hidden');
    else touch.root.classList.add('hidden');
  };
  updateTouchVisibility();
  window.addEventListener('resize', updateTouchVisibility);

  return api;
}
