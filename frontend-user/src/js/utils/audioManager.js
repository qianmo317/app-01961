/**
 * 音效管理器 - 使用 Web Audio API 生成音效
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.muted = false;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.muted ? 0 : 0.3;
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    ensureContext() {
        if (!this.audioContext) {
            this.init();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    setMuted(muted) {
        this.muted = muted;
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : 0.3;
        }
    }

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.initialized || this.muted) return;
        this.ensureContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playPlant() {
        if (!this.initialized || this.muted) return;
        this.ensureContext();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);

        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.08);

        gain2.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc2.connect(gain2);
        gain2.connect(this.masterGain);

        osc2.start();
        osc2.stop(this.audioContext.currentTime + 0.1);
    }

    playSunCollect() {
        if (!this.initialized || this.muted) return;
        this.ensureContext();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.05);
        osc.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    playHit() {
        if (!this.initialized || this.muted) return;
        this.ensureContext();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.08);

        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);

        const noise = this.createNoiseBuffer(0.05);
        const noiseGain = this.audioContext.createGain();

        noiseGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        noise.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start();
        noise.stop(this.audioContext.currentTime + 0.05);
    }

    playExplosion() {
        if (!this.initialized || this.muted) return;
        this.ensureContext();

        const noise = this.createNoiseBuffer(0.3);
        const noiseGain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

        noiseGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start();
        noise.stop(this.audioContext.currentTime + 0.35);

        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.2);

        oscGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.25);
    }

    createNoiseBuffer(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        return source;
    }
}

const SoundManager = new AudioManager();
