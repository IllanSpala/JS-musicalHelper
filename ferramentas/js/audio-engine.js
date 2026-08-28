const JJAudio = {
    ctx: null,
    masterGain: null,
    compressor: null,
    shimmerGain: null,
    shimmerConv: null,
    shimmerDelay: null,
    shimmerFbGain: null,
    shimmerHpf: null,
    shimmerOut: null,
    shimmerReady: false,
    activeOscs: [],
    
    // Configurações globais (fallback se window.state não existir)
    state: {
        timbre: 'guitar', // 'guitar' ou 'synth'
        sustainMode: false
    },

    createShimmerImpulse: function(durationSec = 4.5, decay = 2.2) {
        const sr = this.ctx.sampleRate;
        const length = Math.floor(sr * durationSec);
        const buf = this.ctx.createBuffer(2, length, sr);
        for (let ch = 0; ch < 2; ch++) {
            const data = buf.getChannelData(ch);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }
        return buf;
    },

    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.value = -8;
            this.compressor.knee.value = 4;
            this.compressor.ratio.value = 10;
            this.compressor.attack.value = 0.003;
            this.compressor.release.value = 0.30;
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.55;
            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.ctx.destination);
            
            this.shimmerGain = this.ctx.createGain();
            this.shimmerGain.gain.value = 0.0;
            
            this.shimmerConv = this.ctx.createConvolver();
            this.shimmerConv.buffer = this.createShimmerImpulse(4.5, 2.2);
            this.shimmerConv.normalize = true;
            
            this.shimmerHpf = this.ctx.createBiquadFilter();
            this.shimmerHpf.type = 'highpass';
            this.shimmerHpf.frequency.value = 1100;
            this.shimmerHpf.Q.value = 0.8;
            
            this.shimmerDelay = this.ctx.createDelay(1.0);
            this.shimmerDelay.delayTime.value = 0.18;
            
            this.shimmerFbGain = this.ctx.createGain();
            this.shimmerFbGain.gain.value = 0.82;
            
            this.shimmerOut = this.ctx.createGain();
            this.shimmerOut.gain.value = 0.45;
            
            this.shimmerGain.connect(this.shimmerConv);
            this.shimmerConv.connect(this.shimmerHpf);
            this.shimmerHpf.connect(this.shimmerDelay);
            this.shimmerDelay.connect(this.shimmerFbGain);
            this.shimmerFbGain.connect(this.shimmerDelay);
            this.shimmerDelay.connect(this.shimmerOut);
            this.shimmerOut.connect(this.masterGain);
            
            this.shimmerReady = true;
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    },

    setShimmerActive: function(active) {
        this.init();
        const now = this.ctx.currentTime;
        if (!this.shimmerGain) return;
        this.shimmerGain.gain.cancelScheduledValues(now);
        this.shimmerGain.gain.setValueAtTime(Math.max(0.0001, this.shimmerGain.gain.value), now);
        if (active) {
            this.shimmerGain.gain.linearRampToValueAtTime(0.55, now + 0.4);
        } else {
            this.shimmerGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
        }
    },

    playNote: function(midiNote, duration = 1.7, isSustain = false, startTime = null) {
        this.init();
        const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
        const now = Math.max(this.ctx.currentTime + 0.005, startTime !== null ? startTime : this.ctx.currentTime);
        
        const isGuitar = (window.state) 
            ? ((window.state.timbre === 'guitar') || (window.state.instrument === 'guitar'))
            : this.state.timbre === 'guitar';
            
        const isSustainActive = (window.state && window.state.sustainMode !== undefined)
            ? window.state.sustainMode
            : this.state.sustainMode;
            
        const harmonics = isGuitar
            ? [[1, 0.60], [2, 0.25], [3, 0.10], [4, 0.04], [5, 0.01]]
            : [[1, 0.55], [2, 0.22], [3, 0.07], [4, 0.02]];
            
        const getOscType = (h) => (h === 1 && !isGuitar) ? 'triangle' : 'sine';
        const getGuitarOscType = (h) => (h === 1) ? 'triangle' : 'sine';
        
        const decayMult = isGuitar ? 1.0 : 1.6;
        const totalAmp = harmonics.reduce((s, [, a]) => s + a, 0);
        const voiceScale = 0.55 / Math.max(1, totalAmp);
        
        const submix = this.ctx.createGain();
        submix.gain.value = 1.0;
        submix.connect(this.masterGain);
        
        if (isSustainActive && this.shimmerReady && this.shimmerGain) {
            const shimmerSend = this.ctx.createGain();
            shimmerSend.gain.value = 0.40;
            submix.connect(shimmerSend);
            shimmerSend.connect(this.shimmerGain);
            setTimeout(() => {
                try { shimmerSend.disconnect(); } catch (_) { }
            }, (duration * decayMult + 0.5) * 1000);
        }
        
        const d = duration * decayMult;
        
        // Remove inactive oscs from tracking array
        this.activeOscs = this.activeOscs.filter(o => o.endTime > this.ctx.currentTime);
        
        harmonics.forEach(([h, amp]) => {
            const osc = this.ctx.createOscillator();
            const gn = this.ctx.createGain();
            osc.type = isGuitar ? getGuitarOscType(h) : getOscType(h);
            osc.frequency.value = freq * h;
            
            const targetAmp = amp * voiceScale;
            const attackTime = isGuitar ? 0.008 : 0.020;
            
            gn.gain.setValueAtTime(0.0001, now);
            gn.gain.linearRampToValueAtTime(targetAmp, now + attackTime);
            gn.gain.exponentialRampToValueAtTime(0.0001, now + d);
            
            if (isGuitar) {
                const lpf = this.ctx.createBiquadFilter();
                lpf.type = 'lowpass';
                lpf.Q.value = 1.2;
                lpf.frequency.setValueAtTime(3500, now);
                lpf.frequency.exponentialRampToValueAtTime(650, now + d);
                osc.connect(gn);
                gn.connect(lpf);
                lpf.connect(submix);
                osc.onended = () => { try { osc.disconnect(); gn.disconnect(); lpf.disconnect(); } catch(e){} };
            } else {
                osc.connect(gn);
                gn.connect(submix);
                osc.onended = () => { try { osc.disconnect(); gn.disconnect(); } catch(e){} };
            }
            osc.start(now);
            osc.stop(now + d + 0.05);
            
            this.activeOscs.push({ osc, gn, endTime: now + d + 0.05 });
        });
        
        if (isGuitar) {
            const pluck = this.ctx.createOscillator();
            const pluckGain = this.ctx.createGain();
            const pluckLpf = this.ctx.createBiquadFilter();
            
            pluck.type = 'sawtooth';
            pluck.frequency.value = freq * 1.5;
            
            pluckLpf.type = 'lowpass';
            pluckLpf.frequency.value = 2000;
            
            pluckGain.gain.setValueAtTime(voiceScale * 0.18, now);
            pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
            
            pluck.connect(pluckGain);
            pluckGain.connect(pluckLpf);
            pluckLpf.connect(submix);
            
            pluck.start(now);
            pluck.stop(now + 0.06);
            pluck.onended = () => {
                try { pluck.disconnect(); pluckGain.disconnect(); pluckLpf.disconnect(); } catch (_) { }
            };
            this.activeOscs.push({ osc: pluck, gn: pluckGain, endTime: now + 0.06 });
        }
        return submix;
    },

    playArpeggio: function(midiNotes, delay = 0.10, duration = 1.8, startAt = null) {
        this.init();
        const origin = startAt !== null ? startAt : this.ctx.currentTime;
        midiNotes.forEach((note, i) => {
            this.playNote(note, duration, false, origin + i * delay);
        });
    },

    stopAllNotes: function() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.activeOscs.forEach(({ osc, gn }) => {
            try {
                gn.gain.cancelScheduledValues(now);
                gn.gain.setTargetAtTime(0, now, 0.015);
                osc.stop(now + 0.05);
            } catch (e) {}
        });
        this.activeOscs = [];
    }
};

window.JJAudio = JJAudio;
window.playNote = JJAudio.playNote.bind(JJAudio);
window.playArpeggio = JJAudio.playArpeggio.bind(JJAudio);
window.getAudioContext = JJAudio.init.bind(JJAudio);
window.setShimmerActive = JJAudio.setShimmerActive.bind(JJAudio);
window.createShimmerImpulse = JJAudio.createShimmerImpulse.bind(JJAudio);
window.stopAllNotes = JJAudio.stopAllNotes.bind(JJAudio);
