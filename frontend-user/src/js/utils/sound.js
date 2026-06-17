/**
 * 音效系统 - 使用 Web Audio API 生成简单音效（无音频文件）
 */
const SoundManager = {
    ctx: null,
    masterGain: null,
    muted: false,
    volume: 0.3,
    lastHitTime: 0,
    lastExplosionTime: 0,

    /** 懒加载 AudioContext（浏览器要求在用户交互后创建） */
    _ensureContext() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            this.ctx = new AC();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this._applyMuteState();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    },

    /** 将当前静音状态同步到 masterGain（控制所有正在播放与后续音效的音量） */
    _applyMuteState() {
        if (!this.masterGain || !this.ctx) return;
        const target = this.muted ? 0 : this.volume;
        this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
    },

    /** 生成白噪声 buffer */
    _createNoiseBuffer(ctx, duration) {
        const length = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    },

    /** 播放一个带包络的音调 */
    _playTone(freq, duration, type = 'sine', volume = 1, startOffset = 0) {
        const ctx = this.ctx;
        if (!ctx) return;
        const t0 = ctx.currentTime + startOffset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(volume, t0 + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t0);
        osc.stop(t0 + duration + 0.02);
    },

    /** 种植声 - 柔和的"啵"声 */
    playPlant() {
        if (this.muted) return;
        const ctx = this._ensureContext();
        if (!ctx) return;
        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t0);
        osc.frequency.exponentialRampToValueAtTime(140, t0 + 0.15);
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.6, t0 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t0);
        osc.stop(t0 + 0.2);
    },

    /** 收集阳光声 - 清脆的叮咚 */
    playSun() {
        if (this.muted) return;
        const ctx = this._ensureContext();
        if (!ctx) return;
        this._playTone(880, 0.12, 'sine', 0.5, 0);
        this._playTone(1320, 0.18, 'sine', 0.5, 0.08);
    },

    /** 击中声 - 短促的"啪"（带节流，避免同帧叠加） */
    playHit() {
        if (this.muted) return;
        const now = performance.now();
        if (now - this.lastHitTime < 30) return;
        this.lastHitTime = now;
        const ctx = this._ensureContext();
        if (!ctx) return;
        const t0 = ctx.currentTime;
        const noise = ctx.createBufferSource();
        noise.buffer = this._createNoiseBuffer(ctx, 0.08);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, t0);
        filter.Q.value = 1;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(t0);
        noise.stop(t0 + 0.1);
        this._playTone(180, 0.08, 'square', 0.3, 0);
    },

    /** 爆炸声 - 低沉的"轰"（带节流，避免多爆炸叠加） */
    playExplosion() {
        if (this.muted) return;
        const now = performance.now();
        if (now - this.lastExplosionTime < 120) return;
        this.lastExplosionTime = now;
        const ctx = this._ensureContext();
        if (!ctx) return;
        const t0 = ctx.currentTime;
        const noise = ctx.createBufferSource();
        noise.buffer = this._createNoiseBuffer(ctx, 0.4);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t0);
        filter.frequency.exponentialRampToValueAtTime(80, t0 + 0.4);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(t0);
        noise.stop(t0 + 0.42);
        this._playTone(90, 0.4, 'sine', 0.6, 0);
    },

    /** 切换静音，返回新的静音状态；同步 masterGain 使正在播放的音效立即静音/恢复 */
    toggleMute() {
        this.muted = !this.muted;
        this._applyMuteState();
        return this.muted;
    },

    isMuted() {
        return this.muted;
    }
};
