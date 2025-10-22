/**
 * audio.js - Audio Manager for game sounds and music
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.enabled = true;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        
        // Initialize audio context
        this.context = null;
        this.initialized = false;
    }

    // Initialize audio context (must be called after user interaction)
    init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio initialized');
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    // Create placeholder sound effects using oscillators
    createPlaceholderSound(type) {
        if (!this.context) return null;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        switch(type) {
            case 'engine':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 100;
                gainNode.gain.value = 0.1;
                break;
            case 'siren':
                oscillator.type = 'sine';
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.2;
                break;
            case 'crash':
                oscillator.type = 'square';
                oscillator.frequency.value = 50;
                gainNode.gain.value = 0.3;
                break;
            case 'coin':
                oscillator.type = 'sine';
                oscillator.frequency.value = 1000;
                gainNode.gain.value = 0.2;
                break;
        }

        return { oscillator, gainNode };
    }

    // Play engine sound (continuous)
    playEngine(speed) {
        if (!this.enabled || !this.context) return;

        if (!this.sounds.engine) {
            const sound = this.createPlaceholderSound('engine');
            if (sound) {
                this.sounds.engine = sound;
                sound.oscillator.start();
            }
        }

        // Modulate frequency based on speed
        if (this.sounds.engine) {
            const freq = 80 + speed * 2;
            this.sounds.engine.oscillator.frequency.value = freq;
            this.sounds.engine.gainNode.gain.value = 0.05 + (speed / 200) * 0.15;
        }
    }

    // Stop engine sound
    stopEngine() {
        if (this.sounds.engine) {
            try {
                this.sounds.engine.oscillator.stop();
                this.sounds.engine = null;
            } catch (e) {
                // Oscillator already stopped
            }
        }
    }

    // Play siren sound effect
    playSiren() {
        if (!this.enabled || !this.context) return;

        const sound = this.createPlaceholderSound('siren');
        if (sound) {
            sound.oscillator.start();
            sound.oscillator.stop(this.context.currentTime + 0.2);
            
            // Frequency sweep for siren effect
            sound.oscillator.frequency.setValueAtTime(800, this.context.currentTime);
            sound.oscillator.frequency.linearRampToValueAtTime(1000, this.context.currentTime + 0.1);
            sound.oscillator.frequency.linearRampToValueAtTime(800, this.context.currentTime + 0.2);
        }
    }

    // Play crash sound effect
    playCrash() {
        if (!this.enabled || !this.context) return;

        const sound = this.createPlaceholderSound('crash');
        if (sound) {
            sound.oscillator.start();
            sound.gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            sound.gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
            sound.oscillator.stop(this.context.currentTime + 0.5);
        }
    }

    // Play coin collection sound
    playCoin() {
        if (!this.enabled || !this.context) return;

        const sound = this.createPlaceholderSound('coin');
        if (sound) {
            sound.oscillator.start();
            sound.oscillator.frequency.setValueAtTime(1000, this.context.currentTime);
            sound.oscillator.frequency.linearRampToValueAtTime(1500, this.context.currentTime + 0.1);
            sound.gainNode.gain.setValueAtTime(0.2, this.context.currentTime);
            sound.gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
            sound.oscillator.stop(this.context.currentTime + 0.15);
        }
    }

    // Play background music (placeholder)
    playMusic() {
        // Placeholder - in a real implementation, you would load and play an audio file
        console.log('Background music playing (placeholder)');
    }

    // Stop background music
    stopMusic() {
        if (this.music) {
            // this.music.pause();
        }
    }

    // Toggle audio on/off
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopEngine();
            this.stopMusic();
        }
        return this.enabled;
    }

    // Set volumes
    setMusicVolume(volume) {
        this.musicVolume = MathUtils.clamp(volume, 0, 1);
    }

    setSFXVolume(volume) {
        this.sfxVolume = MathUtils.clamp(volume, 0, 1);
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();
