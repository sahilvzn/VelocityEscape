/**
 * utils.js - Utility functions and helpers
 */

// Math utilities
const MathUtils = {
    // Linear interpolation
    lerp: (start, end, t) => {
        return start + (end - start) * t;
    },

    // Clamp value between min and max
    clamp: (value, min, max) => {
        return Math.max(min, Math.min(max, value));
    },

    // Random number between min and max
    random: (min, max) => {
        return Math.random() * (max - min) + min;
    },

    // Random integer between min and max (inclusive)
    randomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random choice from array
    randomChoice: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Distance between two points (2D)
    distance2D: (x1, z1, x2, z2) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dz * dz);
    },

    // Angle between two points
    angleBetween: (x1, z1, x2, z2) => {
        return Math.atan2(z2 - z1, x2 - x1);
    },

    // Normalize angle to -PI to PI range
    normalizeAngle: (angle) => {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }
};

// Local storage utilities
const StorageUtils = {
    save: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },

    load: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return defaultValue;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    }
};

// Format time from seconds to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format distance in meters
function formatDistance(meters) {
    return Math.floor(meters) + ' m';
}

// Detect if device is mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Create a simple 3D box mesh with Three.js
function createBox(width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({ color: color });
    return new THREE.Mesh(geometry, material);
}

// Create a simple ground plane
function createGroundPlane(width, depth, color) {
    const geometry = new THREE.PlaneGeometry(width, depth);
    const material = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    return plane;
}

// Check collision between two bounding boxes
function checkCollision(box1, box2) {
    return (
        box1.min.x <= box2.max.x &&
        box1.max.x >= box2.min.x &&
        box1.min.y <= box2.max.y &&
        box1.max.y >= box2.min.y &&
        box1.min.z <= box2.max.z &&
        box1.max.z >= box2.min.z
    );
}

// Simple easing functions
const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
};
