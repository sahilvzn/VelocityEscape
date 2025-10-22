const STORAGE_KEY = 'escape-road-save-v1';

const DEFAULT_VEHICLES = [
  { id: 'starter', name: 'Compact', maxSpeed: 18, accel: 30, brake: 35, turnRate: 2.0, price: 0, unlocked: true },
  { id: 'sport', name: 'Sport', maxSpeed: 24, accel: 38, brake: 34, turnRate: 2.2, price: 500, unlocked: false },
  { id: 'suv', name: 'SUV', maxSpeed: 20, accel: 28, brake: 40, turnRate: 1.8, price: 400, unlocked: false },
  { id: 'armored', name: 'Armored', maxSpeed: 16, accel: 22, brake: 45, turnRate: 1.4, price: 800, unlocked: false },
];

export class Persistence {
  constructor() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.vehicles && saved.version === 1) {
      this.state = saved;
    } else {
      this.state = {
        version: 1,
        totalMoney: 0,
        selectedVehicleId: 'starter',
        vehicles: DEFAULT_VEHICLES,
        highScoreDistance: 0,
      };
      this._save();
    }
  }

  _save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); }

  getTotalMoney() { return this.state.totalMoney; }
  setTotalMoney(v) { this.state.totalMoney = v; this._save(); }

  unlockVehicle(id) { const v = this.state.vehicles.find(x => x.id === id); if (v) { v.unlocked = true; this._save(); } }
  getAllVehicles() { return [...this.state.vehicles]; }
  getSelectedVehicleId() { return this.state.selectedVehicleId; }
  setSelectedVehicleId(id) { this.state.selectedVehicleId = id; this._save(); }

  getVehicle(id) { return this.state.vehicles.find(x => x.id === id) || this.state.vehicles[0]; }
  getHighScore() { return this.state.highScoreDistance || 0; }
  setHighScore(d) { this.state.highScoreDistance = Math.max(this.state.highScoreDistance || 0, d); this._save(); }
}
