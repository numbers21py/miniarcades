// Settings Management
class Settings {
    constructor() {
        this.settings = {
            sound: true,
            haptic: true,
            animations: true
        };
        this.load();
    }

    load() {
        const saved = Storage.load('microarcade_settings', this.settings);
        this.settings = { ...this.settings, ...saved };
        this.applySettings();
    }

    save() {
        Storage.save('microarcade_settings', this.settings);
    }

    applySettings() {
        // Update toggle switches
        document.getElementById('sound-toggle').classList.toggle('active', this.settings.sound);
        document.getElementById('haptic-toggle').classList.toggle('active', this.settings.haptic);
        document.getElementById('animation-toggle').classList.toggle('active', this.settings.animations);
    }

    toggleSound() {
        this.settings.sound = !this.settings.sound;
        this.save();
        this.applySettings();
        Utils.playSound('click');
    }

    toggleHaptic() {
        this.settings.haptic = !this.settings.haptic;
        this.save();
        this.applySettings();
        Utils.vibrate([50]);
    }

    toggleAnimations() {
        this.settings.animations = !this.settings.animations;
        this.save();
        this.applySettings();
    }

    reset() {
        this.settings = {
            sound: true,
            haptic: true,
            animations: true
        };
        this.save();
        this.applySettings();
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            stats.reset();
            Utils.playSound('click');
            Utils.vibrate([100, 50, 100]);
        }
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.save();
        this.applySettings();
    }
}

// Global settings instance
const settings = new Settings();
