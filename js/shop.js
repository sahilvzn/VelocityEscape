/**
 * shop.js - Shop/Garage system with vehicle unlocks
 */

class ShopManager {
    constructor() {
        this.vehicleList = document.getElementById('vehicleList');
        this.garageMoneyDisplay = document.getElementById('garageMoney');
        
        // Load saved data
        this.totalMoney = StorageUtils.load('totalMoney', 0);
        this.unlockedVehicles = StorageUtils.load('unlockedVehicles', ['sedan']);
        this.selectedVehicle = StorageUtils.load('selectedVehicle', 'sedan');
        
        // Ensure at least the basic sedan is unlocked
        if (!this.unlockedVehicles.includes('sedan')) {
            this.unlockedVehicles.push('sedan');
        }
        
        this.renderVehicles();
    }

    renderVehicles() {
        this.vehicleList.innerHTML = '';
        
        VEHICLE_DATABASE.forEach(vehicle => {
            const card = this.createVehicleCard(vehicle);
            this.vehicleList.appendChild(card);
        });
        
        this.updateMoneyDisplay();
    }

    createVehicleCard(vehicle) {
        const isUnlocked = this.unlockedVehicles.includes(vehicle.id);
        const isSelected = this.selectedVehicle === vehicle.id;
        const canAfford = this.totalMoney >= vehicle.price;
        
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        
        if (isSelected) {
            card.classList.add('selected');
        }
        
        if (!isUnlocked) {
            card.classList.add('locked');
        }
        
        // Vehicle name
        const name = document.createElement('div');
        name.className = 'vehicle-name';
        name.textContent = vehicle.name;
        card.appendChild(name);
        
        // Vehicle description
        const description = document.createElement('p');
        description.textContent = vehicle.description;
        description.style.color = '#b2bec3';
        description.style.fontSize = '0.9rem';
        description.style.margin = '10px 0';
        card.appendChild(description);
        
        // Vehicle stats
        const stats = document.createElement('div');
        stats.className = 'vehicle-stats';
        
        const statBars = [
            { label: 'Speed', value: vehicle.maxSpeed / 100 },
            { label: 'Acceleration', value: vehicle.acceleration / 35 },
            { label: 'Braking', value: vehicle.braking / 30 },
            { label: 'Handling', value: vehicle.handling / 2.5 }
        ];
        
        statBars.forEach(stat => {
            const statDiv = document.createElement('div');
            statDiv.className = 'vehicle-stat';
            
            const label = document.createElement('span');
            label.textContent = stat.label;
            statDiv.appendChild(label);
            
            const barContainer = document.createElement('div');
            barContainer.className = 'stat-bar';
            
            const barFill = document.createElement('div');
            barFill.className = 'stat-fill';
            barFill.style.width = (stat.value * 100) + '%';
            
            barContainer.appendChild(barFill);
            statDiv.appendChild(barContainer);
            stats.appendChild(statDiv);
        });
        
        card.appendChild(stats);
        
        // Price or status
        const price = document.createElement('div');
        price.className = 'vehicle-price';
        
        if (isUnlocked) {
            if (isSelected) {
                price.textContent = '✓ SELECTED';
                price.style.color = '#2ed573';
            } else {
                price.textContent = 'OWNED';
                price.style.color = '#ffa502';
            }
        } else {
            price.textContent = '💰 ' + vehicle.price;
            price.classList.add('locked');
            
            if (!canAfford) {
                price.style.color = '#ff4757';
            } else {
                price.style.color = '#2ed573';
            }
        }
        
        card.appendChild(price);
        
        // Click handler
        card.addEventListener('click', () => {
            if (isUnlocked) {
                this.selectVehicle(vehicle.id);
            } else if (canAfford) {
                this.purchaseVehicle(vehicle);
            }
        });
        
        return card;
    }

    selectVehicle(vehicleId) {
        this.selectedVehicle = vehicleId;
        StorageUtils.save('selectedVehicle', vehicleId);
        this.renderVehicles();
    }

    purchaseVehicle(vehicle) {
        if (this.totalMoney >= vehicle.price) {
            this.totalMoney -= vehicle.price;
            this.unlockedVehicles.push(vehicle.id);
            
            StorageUtils.save('totalMoney', this.totalMoney);
            StorageUtils.save('unlockedVehicles', this.unlockedVehicles);
            
            // Auto-select newly purchased vehicle
            this.selectVehicle(vehicle.id);
            
            this.renderVehicles();
        }
    }

    addMoney(amount) {
        this.totalMoney += amount;
        StorageUtils.save('totalMoney', this.totalMoney);
        this.updateMoneyDisplay();
    }

    getTotalMoney() {
        return this.totalMoney;
    }

    updateMoneyDisplay() {
        this.garageMoneyDisplay.textContent = this.totalMoney;
    }

    getSelectedVehicleData() {
        return VEHICLE_DATABASE.find(v => v.id === this.selectedVehicle) || VEHICLE_DATABASE[0];
    }

    getBestDistance() {
        return StorageUtils.load('bestDistance', 0);
    }

    saveBestDistance(distance) {
        const current = this.getBestDistance();
        if (distance > current) {
            StorageUtils.save('bestDistance', distance);
        }
    }
}

// Create global shop manager instance
const shopManager = new ShopManager();
