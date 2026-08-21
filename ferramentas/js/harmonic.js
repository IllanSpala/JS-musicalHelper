// harmonic.js — Mapa de Intervalos | JoJoTools
const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const TUNINGS = {
    guitar: {
        'Standard (E A D G B E)': [40, 45, 50, 55, 59, 64],
        'Drop D (D A D G B E)': [38, 45, 50, 55, 59, 64],
        'Half Step Down (Eb)': [39, 44, 49, 54, 58, 63],
        'Full Step Down (D)': [38, 43, 48, 53, 57, 62],
    },
    bass: {
        'Standard (E A D G)': [28, 33, 38, 43],
        'Drop D (D A D G)': [26, 33, 38, 43],
        '5-string (B E A D G)': [23, 28, 33, 38, 43],
    }
};

const INTERVAL_DATA = [
    { id: 0, degree: '1', color: '#5b50d6', interval: 0, hover: "Perfeito, completo, inteiro, resolvido, estável." },
    { id: 1, degree: '5', color: '#9c41f2', interval: 7, hover: "Puro, claro, simples, neutro, aberto, expansivo." },
    { id: 2, degree: '2', color: '#d92bb8', interval: 2, hover: "Limpo, placido, cristalino, versão amplificada do 5." },
    { id: 3, degree: '6', color: '#eb2f70', interval: 9, hover: "Leveza, doçura, delicado, suave, tom pastel." },
    { id: 4, degree: '3', color: '#db3737', interval: 4, hover: "Doçura, calor, brilho, vida, vitalidade." },
    { id: 5, degree: '7', color: '#cf7b38', interval: 11, hover: "Melancólico, tensão emocional, complexo, nostálgico." },
    { id: 6, degree: '#4', color: '#d5db3b', interval: 6, hover: "Mais forte, energizado, estranho, alienígena, intenso, espetado." },
    { id: 7, degree: 'b2', color: '#85e838', interval: 1, hover: "Sem esperança, desesperado, intenso, amargo, apimentado." },
    { id: 8, degree: 'b6', color: '#40e637', interval: 8, hover: "Trágico, desesperado, pesado, sombrio, sem alegria." },
    { id: 9, degree: 'b3', color: '#43e888', interval: 3, hover: "Sério, solene, escuro, melancólico, tristeza." },
    { id: 10, degree: 'b7', color: '#38e8d3', interval: 10, hover: "O menor mais leve, divertido, aterrado, poderoso, descontraído." },
    { id: 11, degree: '4', color: '#4ca8e8', interval: 5, hover: "Neutro, quadrado, plano, contração para dentro." }
];

const CHORD_SHAPES = {
    major: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 2, 2, 1, 0, 0], name: 'E-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 2, 2, 2, 0], name: 'A-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 2, 3, 2], name: 'D-shape' },
        { baseAttr: 1, rootOffset: 3, offsets: ['x', 3, 2, 0, 1, 0], name: 'C-shape' },
        { baseAttr: 0, rootOffset: 3, offsets: [3, 2, 0, 0, 0, 3], name: 'G-shape' },
    ],
    minor: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 2, 2, 0, 0, 0], name: 'Em-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 2, 2, 1, 0], name: 'Am-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 2, 3, 1], name: 'Dm-shape' },
        { baseAttr: 1, rootOffset: 3, offsets: ['x', 3, 1, 0, 1, 3], name: 'Cm-shape' },
        { baseAttr: 0, rootOffset: 3, offsets: [3, 1, 0, 0, 3, 3], name: 'Gm-shape' },
    ],
    diminished: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 'x', 2, 3, 2, 'x'], name: 'Edim-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 1, 2, 1, 'x'], name: 'Adim-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 1, 0, 1], name: 'Ddim-shape' },
    ],
    dominant7: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 2, 0, 1, 0, 0], name: 'E7-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 2, 0, 2, 0], name: 'A7-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 2, 1, 2], name: 'D7-shape' },
        { baseAttr: 0, rootOffset: 3, offsets: [3, 2, 0, 0, 0, 1], name: 'G7-shape' },
    ],
    maj7: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 2, 1, 1, 0, 0], name: 'Emaj7-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 2, 1, 2, 0], name: 'Amaj7-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 2, 2, 2], name: 'Dmaj7-shape' },
        { baseAttr: 1, rootOffset: 3, offsets: ['x', 3, 2, 0, 0, 0], name: 'Cmaj7-shape' },
    ],
    minor7: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 2, 0, 0, 0, 0], name: 'Em7-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 2, 0, 1, 0], name: 'Am7-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 2, 1, 1], name: 'Dm7-shape' },
        { baseAttr: 1, rootOffset: 3, offsets: ['x', 3, 1, 0, 1, 1], name: 'Cm7-shape' },
    ],
    m7b5: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 'x', 2, 3, 3, 'x'], name: 'Eø-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 1, 2, 1, 2], name: 'Aø-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 1, 1, 1], name: 'Dø-shape' },
    ],
    dim7: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 'x', 2, 0, 2, 0], name: 'Edim7-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 1, 2, 1, 2], name: 'Adim7-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 1, 0, 1], name: 'Ddim7-shape' },
    ],
    aug: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 3, 2, 1, 1, 0], name: 'Eaug-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 3, 2, 2, 1], name: 'Aaug-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 3, 3, 2], name: 'Daug-shape' },
    ],
    sus4: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 2, 2, 2, 0, 0], name: 'Esus4-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 2, 2, 3, 0], name: 'Asus4-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 2, 3, 3], name: 'Dsus4-shape' },
    ],
    sus2: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 2, 4, 4, 0, 0], name: 'Esus2-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 2, 2, 0, 0], name: 'Asus2-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 2, 0, 0], name: 'Dsus2-shape' },
    ],
    power: [
        { baseAttr: 0, rootOffset: 0, offsets: [0, 2, 2, 'x', 'x', 'x'], name: 'E5-shape' },
        { baseAttr: 1, rootOffset: 0, offsets: ['x', 0, 2, 2, 'x', 'x'], name: 'A5-shape' },
        { baseAttr: 2, rootOffset: 0, offsets: ['x', 'x', 0, 2, 3, 'x'], name: 'D5-shape' },
    ],
};

let state = {
    instrument: 'guitar',
    tuningName: 'Standard (E A D G B E)',
    root: 'C',
    chordType: 'triad',
    isRootSet: false,
    sustainMode: false,
    timbre: 'guitar'
};

const _harmonicStore = (typeof JJStore === 'function') ? JJStore('harmonicMap') : null;

function _harmonicLoad() {
    if (!_harmonicStore) return;
    const s = _harmonicStore.get();
    if (s.root) state.root = s.root;
    if (s.chordType) state.chordType = s.chordType;
    if (s.sustainMode !== undefined) state.sustainMode = s.sustainMode;
    if (s.timbre) state.timbre = s.timbre;
    if (s.isRootSet) state.isRootSet = s.isRootSet;
    if (Array.isArray(s.progression)) progression = s.progression;
}

function _harmonicSave() {
    if (!_harmonicStore) return;
    _harmonicStore.set({
        root: state.root,
        chordType: state.chordType,
        sustainMode: state.sustainMode,
        timbre: state.timbre,
        isRootSet: state.isRootSet,
        progression: progression
    });
}

let audioCtx = null;
let masterGain = null;
let compressor = null;
let shimmerGain = null;
let shimmerConv = null;
let shimmerDelay = null;
let shimmerFbGain = null;
let shimmerHpf = null;
let shimmerOut = null;
let shimmerReady = false;

function createShimmerImpulse(ctx, durationSec = 4.5, decay = 2.2) {
    const sr = ctx.sampleRate;
    const length = Math.floor(sr * durationSec);
    const buf = ctx.createBuffer(2, length, sr);
    for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
    }
    return buf;
}

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -8;
        compressor.knee.value = 4;
        compressor.ratio.value = 10;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.30;
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.55;
        masterGain.connect(compressor);
        compressor.connect(audioCtx.destination);
        shimmerGain = audioCtx.createGain();
        shimmerGain.gain.value = 0.0;
        shimmerConv = audioCtx.createConvolver();
        shimmerConv.buffer = createShimmerImpulse(audioCtx, 4.5, 2.2);
        shimmerConv.normalize = true;
        shimmerHpf = audioCtx.createBiquadFilter();
        shimmerHpf.type = 'highpass';
        shimmerHpf.frequency.value = 1100;
        shimmerHpf.Q.value = 0.8;
        shimmerDelay = audioCtx.createDelay(1.0);
        shimmerDelay.delayTime.value = 0.18;
        shimmerFbGain = audioCtx.createGain();
        shimmerFbGain.gain.value = 0.82;
        shimmerOut = audioCtx.createGain();
        shimmerOut.gain.value = 0.45;
        shimmerGain.connect(shimmerConv);
        shimmerConv.connect(shimmerHpf);
        shimmerHpf.connect(shimmerDelay);
        shimmerDelay.connect(shimmerFbGain);
        shimmerFbGain.connect(shimmerDelay);
        shimmerDelay.connect(shimmerOut);
        shimmerOut.connect(masterGain);
        shimmerReady = true;
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function setShimmerActive(active) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    if (!shimmerGain) return;
    shimmerGain.gain.cancelScheduledValues(now);
    shimmerGain.gain.setValueAtTime(Math.max(0.0001, shimmerGain.gain.value), now);
    if (active) {
        shimmerGain.gain.linearRampToValueAtTime(0.55, now + 0.4);
    } else {
        shimmerGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    }
}

function playNote(midiNote, duration = 1.7, isSustain = false, startTime = null) {
    const ctx = getAudioContext();
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const now = Math.max(ctx.currentTime + 0.005, startTime !== null ? startTime : ctx.currentTime);
    const isGuitar = state.timbre === 'guitar';
    const harmonics = isGuitar
        ? [[1, 0.60], [2, 0.25], [3, 0.10], [4, 0.04], [5, 0.01]]
        : [[1, 0.55], [2, 0.22], [3, 0.07], [4, 0.02]];
    const getOscType = (h) => (h === 1 && !isGuitar) ? 'triangle' : 'sine';
    const getGuitarOscType = (h) => (h === 1) ? 'triangle' : 'sine';
    const decayMult = isGuitar ? 1.0 : 1.6;
    const totalAmp = harmonics.reduce((s, [, a]) => s + a, 0);
    const voiceScale = 0.55 / Math.max(1, totalAmp);
    const submix = ctx.createGain();
    submix.gain.value = 1.0;
    submix.connect(masterGain);
    if (state.sustainMode && shimmerReady && shimmerGain) {
        const shimmerSend = ctx.createGain();
        shimmerSend.gain.value = 0.40;
        submix.connect(shimmerSend);
        shimmerSend.connect(shimmerGain);
        setTimeout(() => {
            try { shimmerSend.disconnect(); } catch (_) { }
        }, (duration * decayMult + 0.5) * 1000);
    }
    const d = duration * decayMult;
    harmonics.forEach(([h, amp]) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.type = isGuitar ? getGuitarOscType(h) : getOscType(h);
        osc.frequency.value = freq * h;
        const targetAmp = amp * voiceScale;
        const attackTime = isGuitar ? 0.008 : 0.020;
        gn.gain.setValueAtTime(0.0001, now);
        gn.gain.linearRampToValueAtTime(targetAmp, now + attackTime);
        gn.gain.exponentialRampToValueAtTime(0.0001, now + d);
        if (isGuitar) {
            const lpf = ctx.createBiquadFilter();
            lpf.type = 'lowpass';
            lpf.Q.value = 1.2;
            lpf.frequency.setValueAtTime(3500, now);
            lpf.frequency.exponentialRampToValueAtTime(650, now + d);
            osc.connect(gn);
            gn.connect(lpf);
            lpf.connect(submix);
            osc.onended = () => { osc.disconnect(); gn.disconnect(); lpf.disconnect(); };
        } else {
            osc.connect(gn);
            gn.connect(submix);
            osc.onended = () => { osc.disconnect(); gn.disconnect(); };
        }
        osc.start(now);
        osc.stop(now + d + 0.05);
    });
    if (isGuitar) {
        const pluck = ctx.createOscillator();
        const pluckGain = ctx.createGain();
        const pluckLpf = ctx.createBiquadFilter();
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
    }
    return submix;
}

function playArpeggio(midiNotes, delay = 0.10, duration = 1.8, startAt = null) {
    const ctx = getAudioContext();
    const origin = startAt !== null ? startAt : ctx.currentTime;
    midiNotes.forEach((note, i) => {
        playNote(note, duration, false, origin + i * delay);
    });
}

function parseFullChord(chordStr) {
    const match = chordStr.trim().match(/^([A-G][#b]?)(.*)$/);
    if (!match) return null;
    const rootStr = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    const quality = match[2].toLowerCase().trim();

    let rootIdx = NOTES_SHARP.indexOf(rootStr);
    if (rootIdx === -1) rootIdx = NOTES_FLAT.indexOf(rootStr);
    if (rootIdx === -1) return null;

    let intervals;
    if (quality === '' || quality === 'maj' || quality === 'major') intervals = [0, 4, 7];
    else if (quality === 'm' || quality === 'min' || quality === 'minor') intervals = [0, 3, 7];
    else if (quality === 'dim' || quality === 'diminished' || quality === 'o') intervals = [0, 3, 6];
    else if (quality === 'aug' || quality === '+') intervals = [0, 4, 8];
    else if (quality === 'sus2') intervals = [0, 2, 7];
    else if (quality === 'sus4' || quality === 'sus') intervals = [0, 5, 7];
    else if (quality === 'maj7') intervals = [0, 4, 7, 11];
    else if (quality === '7') intervals = [0, 4, 7, 10];
    else if (quality === 'm7') intervals = [0, 3, 7, 10];
    else if (quality === 'm7b5' || quality === 'ø') intervals = [0, 3, 6, 10];
    else if (quality === 'dim7' || quality === 'o7') intervals = [0, 3, 6, 9];
    else if (quality === 'maj9') intervals = [0, 4, 7, 11, 14];
    else if (quality === '9') intervals = [0, 4, 7, 10, 14];
    else if (quality === 'm9') intervals = [0, 3, 7, 10, 14];
    else if (quality === '6') intervals = [0, 4, 7, 9];
    else if (quality === 'm6') intervals = [0, 3, 7, 9];
    else if (quality === 'add9') intervals = [0, 4, 7, 14];
    else if (quality === '5') intervals = [0, 7];
    else if (['maug', 'm+'].includes(quality)) intervals = [0, 3, 8];
    else intervals = [0, 4, 7];

    return { root: rootIdx, intervals };
}

function transposeNote(noteStr, semitones) {
    let idx = NOTES_SHARP.indexOf(noteStr);
    let isFlat = false;
    if (idx === -1) {
        idx = NOTES_FLAT.indexOf(noteStr);
        isFlat = true;
    }
    if (idx === -1) return noteStr;
    const newIdx = ((idx + semitones) % 12 + 12) % 12;
    return isFlat ? NOTES_FLAT[newIdx] : NOTES_SHARP[newIdx];
}

function getFunctionalSuggestions(chordStr) {
    const match = chordStr.trim().match(/^([A-G][#b]?)(.*)$/i);
    if (!match) return [];
    const root = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    const quality = match[2].toLowerCase().trim();
    let suggestions = [];
    if (quality === '' || quality === 'maj' || quality === 'maj7') {
        suggestions.push(
            transposeNote(root, 2) + 'm7', transposeNote(root, 7) + '7', root + (quality === 'maj7' ? 'maj7' : ''),
            transposeNote(root, 5) + (quality === 'maj7' ? 'maj7' : ''), transposeNote(root, 9) + 'm' + (quality === 'maj7' ? '7' : '')
        );
    } else if (quality === 'm' || quality === 'min' || quality === 'm7') {
        suggestions.push(
            transposeNote(root, 2) + 'm7b5', transposeNote(root, 7) + '7', root + (quality === 'm7' ? 'm7' : 'm'),
            transposeNote(root, 5) + 'm' + (quality === 'm7' ? '7' : ''), transposeNote(root, 8) + (quality === 'm7' ? 'maj7' : '')
        );
    } else if (quality === '7' || quality === '9') {
        suggestions.push(transposeNote(root, 5) + 'maj7', transposeNote(root, 5) + 'm7', transposeNote(root, 6) + '7');
    } else if (quality === 'dim' || quality === 'dim7' || quality === 'm7b5' || quality === 'ø') {
        suggestions.push(transposeNote(root, 1) + 'm7', transposeNote(root, 1) + 'maj7');
    } else if (quality === 'sus4' || quality === 'sus2') {
        suggestions.push(root, root + 'm');
    } else {
        suggestions.push(transposeNote(root, 5), transposeNote(root, 7));
    }
    return [...new Set(suggestions)];
}

function getQualityType(quality) {
    const q = (quality || '').toLowerCase().trim();
    if (q === '' || q === 'maj' || q === 'major') return 'major';
    if (['m', 'min', 'minor'].includes(q)) return 'minor';
    if (['dim', 'o', 'diminished'].includes(q)) return 'diminished';
    if (['7', '9', 'add9', '6'].includes(q)) return 'dominant7';
    if (['maj7', 'maj9'].includes(q)) return 'maj7';
    if (['m7', 'm9', 'm6'].includes(q)) return 'minor7';
    if (['m7b5', 'ø'].includes(q)) return 'm7b5';
    if (['dim7', 'o7'].includes(q)) return 'dim7';
    if (['aug', '+', 'maug', 'm+'].includes(q)) return 'aug';
    if (['sus4', 'sus'].includes(q)) return 'sus4';
    if (['sus2'].includes(q)) return 'sus2';
    if (['5'].includes(q)) return 'power';
    return 'major';
}

function getRootSemitone() {
    let si = NOTES_SHARP.indexOf(state.root);
    if (si === -1) si = NOTES_FLAT.indexOf(state.root);
    return si;
}

function getNoteName(semitone) {
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'D#', 'A#', 'G#', 'C#', 'F#'];
    return flatKeys.includes(state.root) ? NOTES_FLAT[((semitone % 12) + 12) % 12] : NOTES_SHARP[((semitone % 12) + 12) % 12];
}

function isMinorScale() {
    return state.chordType === 'minor' || state.chordType === 'minor7' || state.chordType === 'm7b5' || state.chordType === 'diminished' || state.chordType === 'dim7';
}

function getChordNameForInterval(interval) {
    if (!state.isRootSet) return '';
    const baseName = getNoteName(getRootSemitone() + interval);
    const isMinorRoot = isMinorScale();
    if (!isMinorRoot) {
        const majMap = { 0: '', 1: '', 2: 'm', 3: '', 4: 'm', 5: '', 6: 'dim', 7: '', 8: '', 9: 'm', 10: '', 11: 'dim' };
        return baseName + majMap[interval];
    } else {
        const minMap = { 0: 'm', 1: '', 2: 'dim', 3: '', 4: '', 5: 'm', 6: '', 7: 'm', 8: '', 9: 'dim', 10: '', 11: 'dim' };
        return baseName + minMap[interval];
    }
}

function getChordOffsetsForInterval(interval) {
    const isMinorRoot = isMinorScale();
    const majOffsets = [0, 4, 7];
    const minOffsets = [0, 3, 7];
    const dimOffsets = [0, 3, 6];
    if (!isMinorRoot) {
        if ([2, 4, 9].includes(interval)) return minOffsets;
        if ([6, 11].includes(interval)) return dimOffsets;
        return majOffsets;
    } else {
        if ([0, 5, 7].includes(interval)) return minOffsets;
        if ([2, 9, 11].includes(interval)) return dimOffsets;
        return majOffsets;
    }
}

// MODIFICADO: Toca o acorde da roda mas NÃO atualiza a pesquisa nem os shapes
function playChordFromNode(node) {
    if (!state.isRootSet) return;
    const rs = getRootSemitone();
    const baseMidi = 48 + rs + node.interval + (rs + node.interval > 55 ? -12 : 0);
    const offsets = getChordOffsetsForInterval(node.interval);
    const midiNotes = offsets.map(off => baseMidi + off).sort((a, b) => a - b);
    playArpeggio(midiNotes, 0.04, 1.8);
}

function renderWheel() {
    const wrapper = document.getElementById('harmonic-wheel');
    const svg = document.getElementById('harmonic-svg-lines');

    wrapper.querySelectorAll('.wheel-node').forEach(el => el.remove());

    const radiusPct = 42;

    INTERVAL_DATA.forEach((node, i) => {
        const angleDeg = (i * 30) - 90;
        const angleRad = (Math.PI / 180) * angleDeg;
        
        const x = 50 + radiusPct * Math.cos(angleRad);
        const y = 50 + radiusPct * Math.sin(angleRad);

        const el = document.createElement('div');
        el.className = `wheel-node`;
        el.style.left = x + '%';
        el.style.top = y + '%';
        el.style.borderColor = node.color;
        el.style.backgroundColor = '#111';
        el.style.color = node.color;

        const chordStr = getChordNameForInterval(node.interval);

        el.innerHTML = `
            <span class="wheel-node-degree">${node.degree}</span>
            ${chordStr ? `<span class="wheel-node-note" style="font-size:10px; font-weight:600; opacity:0.8;">${chordStr}</span>` : ''}
        `;

        el.dataset.interval = node.interval;
        el.setAttribute('data-color', node.color);

        el.addEventListener('mouseenter', () => {
            updateGuide(node);
            el.style.transform = 'translate(-50%, -50%) scale(1.15)';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        el.addEventListener('click', () => {
            if (!state.isRootSet) return;

            wrapper.querySelectorAll('.wheel-node.sustain-active').forEach(n => {
                n.classList.remove('sustain-active');
                n.style.backgroundColor = '#111';
                n.style.boxShadow = '';
            });
            playChordFromNode(node); // Apenas toca o audio, sem tocar nos cards de pesquisa
            if (state.sustainMode) {
                el.classList.add('sustain-active');
                el.style.setProperty('--sustain-color', node.color);
            }
        });

        wrapper.appendChild(el);
    });

    if (svg) svg.innerHTML = '';
}

function getNotesForInterval(interval) {
    const rs = getRootSemitone();
    const baseMidi = 48 + rs + interval + (rs + interval > 55 ? -12 : 0);
    const offsets = getChordOffsetsForInterval(interval);
    const notes = offsets.map(off => {
        const m = baseMidi + off;
        return getNoteName(m % 12);
    });
    return notes.join(' - ');
}

function updateGuide(node) {
    const guide = document.getElementById('wheel-guide');
    const chordStr = getChordNameForInterval(node.interval);
    const notesStr = state.isRootSet ? getNotesForInterval(node.interval) : '';

    guide.innerHTML = `
        <strong style="color:${node.color}; font-size:18px;">Grau ${node.degree}${node.id === 0 ? ' (Tônica)' : ''} ${chordStr ? '- ' + chordStr : ''}</strong><br/>
        <span style="opacity:0.8">${node.hover}</span>
        ${notesStr ? `<br/><span style="color:#cf7b38; font-size:15px; margin-top:8px; display:inline-block;">Notas do Acorde: <strong>${notesStr}</strong></span>` : ''}
    `;
    guide.classList.add('active');
}

function findFretOnString(openMidi, targetSemi) {
    let currentSemi = openMidi % 12;
    let fret = 0;
    while (currentSemi !== targetSemi) {
        currentSemi = (currentSemi + 1) % 12;
        fret++;
    }
    return fret;
}

function generateSVGDiagram(frets, noteNames) {
    let playedFrets = frets.filter(f => f !== 'x' && f > 0);
    let minFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 1;
    if (minFret > 1) minFret -= 1;

    const numStrings = frets.length;
    const numFrets = 5;
    const spacing = 18;
    const dotR = 8;
    const width = (numStrings - 1) * spacing;
    const height = numFrets * spacing;
    const padTop = 26;
    const padLeft = 18;
    const svgW = width + padLeft * 2;
    const svgH = height + padTop + 18;

    let svg = `<svg class="chord-svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`;

    if (minFret <= 1) {
        svg += `<line x1="${padLeft}" y1="${padTop}" x2="${padLeft + width}" y2="${padTop}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
    } else {
        svg += `<text x="4" y="${padTop + spacing * 0.7}" fill="#ccc" font-size="10" dominant-baseline="middle">${minFret}</text>`;
        svg += `<line x1="${padLeft}" y1="${padTop}" x2="${padLeft + width}" y2="${padTop}" stroke="#666" stroke-width="1"/>`;
    }

    for (let i = 1; i <= numFrets; i++) {
        const y = padTop + i * spacing;
        svg += `<line x1="${padLeft}" y1="${y}" x2="${padLeft + width}" y2="${y}" stroke="#444" stroke-width="1"/>`;
    }

    for (let i = 0; i < numStrings; i++) {
        const x = padLeft + i * spacing;
        svg += `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + height}" stroke="#999" stroke-width="1.2"/>`;
    }

    frets.forEach((fret, stringIdx) => {
        const x = padLeft + stringIdx * spacing;
        const noteName = noteNames ? noteNames[stringIdx] : '';
        if (fret === 'x') {
            svg += `<text x="${x}" y="${padTop - 10}" fill="#ff5555" font-size="11" text-anchor="middle" font-weight="bold">×</text>`;
        } else if (fret === 0) {
            svg += `<circle cx="${x}" cy="${padTop - 13}" r="4" fill="none" stroke="#aaa" stroke-width="1.5"/>`;
            if (noteName) svg += `<text x="${x}" y="${padTop - 13}" fill="#aaa" font-size="6" text-anchor="middle" dominant-baseline="middle">${noteName}</text>`;
        } else {
            let visualFret = fret - minFret + 1;
            if (visualFret > 0 && visualFret <= numFrets) {
                const y = padTop + (visualFret - 0.5) * spacing;
                svg += `<circle cx="${x}" cy="${y}" r="${dotR}" fill="#5b50d6"/>`;
                if (noteName) svg += `<text x="${x}" y="${y}" fill="#fff" font-size="6.5" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${noteName}</text>`;
            }
        }
    });

    svg += `</svg>`;
    return svg;
}

const CHORD_QUALITIES = [
    { label: 'Maior', suffix: '', shortLabel: 'M' },
    { label: 'Menor', suffix: 'm', shortLabel: 'm' },
    { label: 'Dim', suffix: 'dim', shortLabel: 'dim' },
    { label: 'Aug', suffix: 'aug', shortLabel: 'aug' },
    { label: 'Sus4', suffix: 'sus4', shortLabel: 'sus4' },
    { label: 'Sus2', suffix: 'sus2', shortLabel: 'sus2' },
    { label: '7', suffix: '7', shortLabel: '7' },
    { label: 'Maj7', suffix: 'maj7', shortLabel: 'maj7' },
    { label: 'm7', suffix: 'm7', shortLabel: 'm7' },
    { label: 'm7b5', suffix: 'm7b5', shortLabel: 'ø' },
    { label: 'Dim7', suffix: 'dim7', shortLabel: 'dim7' },
    { label: '9', suffix: '9', shortLabel: '9' },
    { label: 'm9', suffix: 'm9', shortLabel: 'm9' },
    { label: 'Add9', suffix: 'add9', shortLabel: 'add9' },
    { label: '6', suffix: '6', shortLabel: '6' },
    { label: 'm6', suffix: 'm6', shortLabel: 'm6' },
    { label: 'Power', suffix: '5', shortLabel: '5' },
];

// ─── Dicionário de Teoria dos Acordes ────────────────────────────────────────
// Chaves = sufixos de CHORD_QUALITIES. Alimenta a .hm-theory-box dinâmica.
const CHORD_THEORY_DICT = {
    '': {
        formula: '1 — 3 — 5',
        description: 'Tríade maior. A terça maior cria calor e brilho, a quinta perfeita estabiliza. Som resolvido, claro e afirmativo — o ponto de repouso da tonalidade maior.'
    },
    'm': {
        formula: '1 — b3 — 5',
        description: 'Tríade menor. A terça bemol abaixa meio tom, entregando seriedade e introspecção. Soa melancólico e sólido sem ser instável — fundação das progressões menores.'
    },
    'dim': {
        formula: '1 — b3 — b5',
        description: 'Diminuto. Ambas as terças são menores, criando um trítono entre raiz e quinta. Máxima tensão, urgência e inquietação — resolve tipicamente meio tom acima.'
    },
    'aug': {
        formula: '1 — 3 — #5',
        description: 'Aumentado. Empilha duas terças maiores. A quinta aumentada cria um efeito etéreo, suspenso e sonhador — muito usado em transições e progressões cromáticas.'
    },
    'sus4': {
        formula: '1 — 4 — 5',
        description: 'Suspenso de quarta. Substitui a terça pela quarta justa, removendo a definição maior/menor. Som aberto, esperando — geralmente resolve para o acorde maior.'
    },
    'sus2': {
        formula: '1 — 2 — 5',
        description: 'Suspenso de segunda. A segunda maior no lugar da terça gera amplidão e transparência. Muito usado em texturas abertas e progressões cinematográficas.'
    },
    '7': {
        formula: '1 — 3 — 5 — b7',
        description: 'Dominante sétima. A sétima menor sobre uma tríade maior cria a tensão mais clássica da harmonia tonal — clama por resolução na tônica uma quarta acima.'
    },
    'maj7': {
        formula: '1 — 3 — 5 — 7',
        description: 'Maior com sétima maior. A sétima natural acrescenta suavidade e sofisticação sem tensão. Som luxuoso, impressionista, associado ao jazz e à bossa nova.'
    },
    'm7': {
        formula: '1 — b3 — 5 — b7',
        description: 'Menor sétima. Combina a tríade menor com a sétima dominante. É o acorde menor mais fluído e jazzístico — suave, introspectivo e muito comum como ii° em progressões ii-V-I.'
    },
    'm7b5': {
        formula: '1 — b3 — b5 — b7',
        description: 'Meio-diminuto (ø). Diminuto com sétima menor em vez de diminuta. Menos agressivo que o dim7, com uma tensão mais sofisticada — típico do grau VII em escala maior e ii° em menor.'
    },
    'dim7': {
        formula: '1 — b3 — b5 — bb7',
        description: 'Diminuto total. Quatro notas simétricas separadas por terças menores. Som máximo de tensão e ambiguidade tonal — pode resolver em quatro tonalidades diferentes.'
    },
    '9': {
        formula: '1 — 3 — 5 — b7 — 9',
        description: 'Dominante nona. Estende o acorde de 7ª com a nona maior. Adiciona cor e riqueza ao acorde dominante sem perder a tensão — essencial no funk, soul e jazz.'
    },
    'm9': {
        formula: '1 — b3 — 5 — b7 — 9',
        description: 'Menor nona. A nona maior sobre o acorde menor sétima. Eleva a expressividade emocional sem adicionar tensão — fluído, melancólico e elegante.'
    },
    'add9': {
        formula: '1 — 3 — 5 — 9',
        description: 'Maior com nona adicionada (sem sétima). Abre o som da tríade com a nona, mantendo leveza. Menos denso que o maj9 — muito usado no rock alternativo e pop moderno.'
    },
    '6': {
        formula: '1 — 3 — 5 — 6',
        description: 'Maior com sexta. A sexta maior sobre a tríade maior resulta em leveza e nostalgia. Não cria tensão — soa doce e retrô, muito explorado no jazz dos anos 40–60.'
    },
    'm6': {
        formula: '1 — b3 — 5 — 6',
        description: 'Menor com sexta. A sexta maior sobre a tríade menor cria um contraste expressivo e inesperado — soa profundo, misterioso e com uma leve ironia emocional.'
    },
    '5': {
        formula: '1 — 5',
        description: 'Power chord (quinta). Apenas raiz e quinta perfeita, sem terça. Sem definição maior/menor — neutro, poderoso e perfeito para distorção intensa no rock e metal.'
    },
};

// ─── Injeção/atualização da .hm-theory-box ───────────────────────────────────
function _updateTheoryBox(suffix) {
    let box = document.getElementById('hm-theory-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'hm-theory-box';
        box.className = 'hm-theory-box';
        // Insere entre a tab-bar e o #chord-cards-container
        const tabBar = document.getElementById('chord-quality-tabs');
        const container = document.getElementById('chord-cards-container');
        if (tabBar && container) {
            tabBar.parentNode.insertBefore(box, container);
        } else if (container) {
            container.parentNode.insertBefore(box, container);
        }
    }

    const theory = CHORD_THEORY_DICT[suffix] || CHORD_THEORY_DICT[''];
    box.innerHTML = `
        <span class="hm-theory-formula">${theory.formula}</span>
        <p class="hm-theory-desc">${theory.description}</p>
    `;
}

// MODIFICADO: Função dedicada à renderização de cards que independe da Roda
function renderChordCards(chordStr) {
    const rootMatch = chordStr.trim().match(/^([A-G][#b]?)/i);
    const rootStrParsed = rootMatch ? rootMatch[1].charAt(0).toUpperCase() + rootMatch[1].slice(1) : 'C';
    const currentMatch = chordStr.trim().match(/^([A-G][#b]?)(.*)$/i);
    const currentSuffix = currentMatch ? currentMatch[2].toLowerCase() : '';

    _renderQualityTabs(rootStrParsed, currentSuffix);
    _renderCards(rootStrParsed, currentSuffix);
}

function _renderQualityTabs(rootStr, activeSuffix) {
    let tabBar = document.getElementById('chord-quality-tabs');
    if (!tabBar) {
        tabBar = document.createElement('div');
        tabBar.id = 'chord-quality-tabs';
        tabBar.className = 'hm-quality-tab-bar';
        const container = document.getElementById('chord-cards-container');
        container.parentNode.insertBefore(tabBar, container);
    }
    tabBar.innerHTML = '';
    CHORD_QUALITIES.forEach(q => {
        const isActive = q.suffix === activeSuffix;
        const btn = document.createElement('button');
        btn.className = 'hm-quality-pill';
        btn.type = 'button';
        btn.textContent = `${rootStr}${q.shortLabel !== 'M' ? q.shortLabel : ''}`;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('draggable', 'false');

        btn.addEventListener('click', () => {
            window._switchQuality(rootStr, q.suffix);
        });
        attachChordTooltip(btn, rootStr + q.suffix);
        tabBar.appendChild(btn);
    });

    // Atualiza o contexto teórico sempre que as tabs são renderizadas
    _updateTheoryBox(activeSuffix);
}

function _renderCards(rootStr, suffix) {
    const container = document.getElementById('chord-cards-container');
    container.innerHTML = '';

    const fullChord = rootStr + suffix;
    const parsed = parseFullChord(fullChord);
    if (!parsed) {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:#888;">Acorde não reconhecido.</div>';
        return;
    }

    const match = fullChord.trim().match(/^([A-G][#b]?)(.*)$/i);
    const quality = match ? match[2].toLowerCase() : '';
    const type = getQualityType(quality);
    const targetSemi = parsed.root;
    const tuningMidis = [...TUNINGS[state.instrument][state.tuningName]];

    if (state.instrument !== 'guitar') {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">Diagramas disponíveis apenas para Guitarra C.A.G.E.D.</div>';
        return;
    }

    const shapes = CHORD_SHAPES[type] || CHORD_SHAPES.major;
    shapes.forEach(shape => {
        const baseStringMidi = tuningMidis[shape.baseAttr];
        let rootFret = findFretOnString(baseStringMidi, targetSemi);
        let lowestFret = rootFret - shape.rootOffset;

        if (lowestFret > 12) lowestFret -= 12;
        else if (lowestFret < 0) lowestFret += 12;

        const absoluteFrets = shape.offsets.map(off => off === 'x' ? 'x' : lowestFret + off);

        const perStringNotes = absoluteFrets.map((fret, si) => {
            if (fret === 'x') return null;
            const open = tuningMidis[si];
            return open !== undefined ? getNoteName((open + fret) % 12) : null;
        });

        const svgData = generateSVGDiagram(absoluteFrets, perStringNotes);

        const card = document.createElement('div');
        card.className = 'chord-diagram-card';
        card.setAttribute('draggable', 'true');
        card.style.cssText = 'cursor:grab; user-select:none;';
        card.innerHTML = `
            <h4 style="margin:0 0 8px; font-size:1rem; color:#fff; text-align:center;">${fullChord}
                <span style="font-size:0.7em; opacity:0.5; color:#aaa; display:block;">${shape.name}</span>
            </h4>
            <div style="overflow:hidden; display:flex; justify-content:center;">${svgData}</div>
        `;

        card.addEventListener('click', () => {
            const midiNotes = absoluteFrets
                .map((fret, si) => {
                    if (fret === 'x') return null;
                    const open = tuningMidis[si];
                    return (open !== undefined) ? open + fret : null;
                })
                .filter(n => n !== null && n > 0)
                .sort((a, b) => a - b);
            playArpeggio(midiNotes);
        });

        card.addEventListener('dragstart', (e) => {
            const exactMidi = absoluteFrets
                .map((fret, si) => {
                    if (fret === 'x') return null;
                    const open = tuningMidis[si];
                    return (open !== undefined) ? open + fret : null;
                })
                .filter(n => n !== null && n > 0)
                .sort((a, b) => a - b);
            e.dataTransfer.setData('text/plain', JSON.stringify({
                chordStr: fullChord,
                shapeName: shape.name,
                svgData,
                hover: 'Acorde CAGED',
                midiNotes: exactMidi
            }));
            e.dataTransfer.effectAllowed = 'copy';
        });

        attachChordTooltip(card, fullChord);
        container.appendChild(card);
    });
}

function getChordNoteName(semitone, rootName) {
    const flatRootNames = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'D#', 'A#', 'G#', 'C#', 'F#'];
    const names = flatRootNames.includes(rootName) ? NOTES_FLAT : NOTES_SHARP;
    return names[((semitone % 12) + 12) % 12];
}

function attachChordTooltip(element, getChordStr) {
    let tooltipEl = null;
    let hideTimer = null;

    const removeTooltipDOM = () => {
        if (tooltipEl) {
            tooltipEl.remove();
            tooltipEl = null;
        }
        document.querySelectorAll('.chord-hover-tooltip').forEach(el => el.remove());
    };

    const scheduleHide = (delay = 350) => {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            removeTooltipDOM();
        }, delay);
    };

    const cancelHide = () => {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
    };

    const showTooltip = () => {
        cancelHide();
        const fullChord = typeof getChordStr === 'function' ? getChordStr() : getChordStr;
        if (!fullChord) return;
        const parsed = parseFullChord(fullChord);
        if (!parsed) return;

        if (tooltipEl && tooltipEl.dataset.chord === fullChord) {
            return;
        }

        removeTooltipDOM();

        const rect = element.getBoundingClientRect();
        const rootMatch = fullChord.trim().match(/^([A-G][#b]?)/i);
        const rootName = rootMatch ? rootMatch[1].charAt(0).toUpperCase() + rootMatch[1].slice(1) : 'C';

        const noteNames = parsed.intervals.map(off => getChordNoteName(parsed.root + off, rootName));
        const notesHtml = noteNames.map(n => `<span class="tooltip-note-badge">${n}</span>`).join('');
        const suggestions = getFunctionalSuggestions(fullChord);
        const suggestionsHtml = suggestions.length > 0
            ? suggestions.map(s => `<button class="tooltip-suggestion-badge" data-chord="${s}" draggable="true" title="Clique para arpegiar ou arraste">${s}</button>`).join('')
            : '<span style="font-size:0.8rem; color:#888;">Nenhuma sugestão</span>';

        tooltipEl = document.createElement('div');
        tooltipEl.className = 'chord-hover-tooltip';
        tooltipEl.dataset.chord = fullChord;
        tooltipEl.innerHTML = `
            <h3>${fullChord}</h3>
            <div class="tooltip-section">
                <span class="tooltip-label">Notas do Acorde</span>
                <div class="tooltip-notes">${notesHtml}</div>
            </div>
            <div class="tooltip-section" style="margin-bottom:0;">
                <span class="tooltip-label">Próximos Sugeridos</span>
                <div class="tooltip-suggestions">${suggestionsHtml}</div>
            </div>
        `;
        document.body.appendChild(tooltipEl);

        tooltipEl.addEventListener('mouseenter', cancelHide);
        tooltipEl.addEventListener('mouseleave', () => scheduleHide(300));

        tooltipEl.querySelectorAll('.tooltip-suggestion-badge').forEach(badge => {
            const sugChord = badge.dataset.chord;
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                const p = parseFullChord(sugChord);
                if (p) {
                    const baseMidi = 48 + p.root;
                    const midiNotes = p.intervals.map(off => baseMidi + off).sort((a, b) => a - b);
                    playArpeggio(midiNotes, 0.07, 1.6);
                }
            });
            badge.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', sugChord);
                e.dataTransfer.effectAllowed = 'copy';
                const wheelIndicator = document.getElementById('wheel-dropzone');
                if (wheelIndicator) wheelIndicator.classList.add('dragging');
                scheduleHide(0);
            });
        });

        const ttWidth = tooltipEl.offsetWidth || 270;
        const ttHeight = tooltipEl.offsetHeight || 140;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = rect.right + 14;
        if (left + ttWidth > viewportWidth - 10) {
            left = rect.left - ttWidth - 14;
        }
        if (left < 10) {
            left = Math.max(10, Math.min(rect.left, viewportWidth - ttWidth - 10));
        }

        let top = rect.top + (rect.height / 2) - (ttHeight / 2);
        if (top < 10) top = 10;
        if (top + ttHeight > viewportHeight - 10) top = viewportHeight - ttHeight - 10;

        tooltipEl.style.position = 'fixed';
        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.zIndex = '999999';

        requestAnimationFrame(() => {
            if (tooltipEl) tooltipEl.classList.add('show');
        });
    };

    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', () => scheduleHide(350));
    element.addEventListener('dragstart', () => scheduleHide(0));
}

window._switchQuality = function (rootStr, suffix) {
    const fullChord = rootStr + suffix;
    renderChordCards(fullChord); // Desenha novos diagramas sem mexer na roda

    // Atualiza o contexto teórico para a qualidade selecionada
    _updateTheoryBox(suffix);

    const chordInput = document.getElementById('chord-input');
    if (chordInput) {
        chordInput.value = fullChord;
    }

    const parsed = parseFullChord(fullChord);
    if (parsed) {
        const baseMidi = 48 + parsed.root;
        const midiNotes = parsed.intervals
            .map(off => baseMidi + off)
            .sort((a, b) => a - b);
        playArpeggio(midiNotes, 0.07, 1.6);
    }
};

function updateChordSuggestions() {
    const container = document.getElementById('chord-suggestions');
    if (!container) return;
    container.innerHTML = '';
    const bases = ['', 'm', 'dim', 'aug', 'sus4', '7', 'maj7', 'm7'];
    const chordInput = document.getElementById('chord-input');
    if (!chordInput) return;

    let match = chordInput.value.trim().match(/^([A-G][#b]?)/i);
    let r = match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : 'C';

    bases.forEach(q => {
        const chordName = r + q;
        const btn = document.createElement('button');
        btn.className = 'hm-quality-pill';
        btn.style.cssText = 'text-transform: uppercase; cursor:grab;';
        btn.textContent = chordName;
        btn.setAttribute('draggable', 'true');

        btn.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', chordName);
            e.dataTransfer.effectAllowed = 'copy';
        });

        attachChordTooltip(btn, chordName);

        // ATUALIZADO: Clicar na sugestão agora reflete na barra, desenha os cards e toca a nota sem afetar a roda central.
        btn.onclick = () => {
            if (chordInput) chordInput.value = chordName;
            
            const parsed = parseFullChord(chordName);
            if (parsed) {
                renderChordCards(chordName);
                const baseMidi = 48 + parsed.root;
                const midiNotes = parsed.intervals
                    .map(off => baseMidi + off)
                    .sort((a, b) => a - b);
                playArpeggio(midiNotes, 0.07, 1.6);
            }
        };
        container.appendChild(btn);
    });
}

let progression = [];

function setupProgressionBuilder() {
    const dropzone = document.getElementById('progression-dropzone');
    if (!dropzone) return;
    dropzone.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        try {
            const raw = e.dataTransfer.getData('text/plain');
            let data;
            try { data = JSON.parse(raw); } catch (err) { data = { chordStr: raw, hover: 'Acorde' }; }
            progression.push(data);
            renderProgression();
        } catch (e) { }
    });

    const btnClear = document.getElementById('btn-clear-progression');
    if (btnClear) {
        btnClear.onclick = () => {
            progression = [];
            renderProgression();
        };
    }

    const btnPlay = document.getElementById('btn-play-progression');
    if (btnPlay) {
        btnPlay.onclick = async () => {
            if (!audioCtx) playNote(60, 0.01);
            const stepDuration = 2.0;
            const arpeggioDelay = 0.10;
            for (let i = 0; i < progression.length; i++) {
                const item = progression[i];
                let notes;
                if (item.midiNotes && item.midiNotes.length > 0) {
                    notes = item.midiNotes;
                } else {
                    const parsed = parseFullChord(item.chordStr);
                    if (!parsed) continue;
                    const baseMidi = 48 + parsed.root;
                    notes = parsed.intervals.map(off => baseMidi + off).sort((a, b) => a - b);
                }
                playArpeggio(notes, arpeggioDelay, stepDuration);
                await new Promise(r => setTimeout(r, stepDuration * 1000));
            }
        };
    }

    const btnExport = document.getElementById('btn-export-midi');
    if (btnExport) btnExport.onclick = () => exportProgressionMIDI();
}

function renderProgression() {
    const dropzone = document.getElementById('progression-dropzone');
    const summary = document.getElementById('progression-summary');
    if (!dropzone) return;

    if (progression.length === 0) {
        dropzone.innerHTML = 'Arraste os graus da roda para cá';
        if (summary) summary.style.display = 'none';
        return;
    }

    dropzone.innerHTML = progression.map((p, i) => `
        <div data-prog-idx="${i}" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:10px; display:flex; align-items:center; gap:15px; position:relative; cursor:pointer;" title="Clique para arpegiar">
            <div style="flex:1;">
                <strong style="color:#d92bb8; font-size:1.1rem; display:block;">${p.chordStr}</strong>
                <span style="font-size:0.7rem; color:#888;">${p.shapeName || 'Básico'}</span>
            </div>
            <div style="transform:scale(0.5); transform-origin:right center; height: 60px; overflow:hidden; display:flex; align-items:center;">
                ${p.svgData || ''}
            </div>
            <button onclick="window.removeProgressionItem(${i})" style="position:absolute; top:5px; right:5px; background:none; border:none; color:red; cursor:pointer;"><i class="fas fa-times"></i></button>
        </div>
    `).join('');

    if (summary) summary.style.display = 'block';

    let narratives = [];
    progression.forEach((p, i) => {
        const hoverTxt = (p.hover || '').split(',')[0].toLowerCase();
        narratives.push(`(${p.chordStr}) ${hoverTxt}`);
        const cardEl = dropzone.children[i];
        if (cardEl) {
            attachChordTooltip(cardEl, p.chordStr);
        }
    });

    _harmonicSave();

    if (summary) summary.innerHTML = "<strong style='color:#fff;'>Mapa Emocional:</strong><br/>" + narratives.join(' → ');

    dropzone.querySelectorAll('div[data-prog-idx]').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const idx = parseInt(card.dataset.progIdx);
            const item = progression[idx];
            if (!item) return;
            if (item.midiNotes && item.midiNotes.length > 0) {
                playArpeggio(item.midiNotes);
            } else {
                const parsed = parseFullChord(item.chordStr);
                if (!parsed) return;
                const baseMidi = 48 + parsed.root;
                playArpeggio(parsed.intervals.map(off => baseMidi + off).sort((a, b) => a - b));
            }
        });
    });
}

window.removeProgressionItem = function (index) {
    progression.splice(index, 1);
    renderProgression();
};

function setupUI() {
    const chordInput = document.getElementById('chord-input');
    const btnToggleSustain = document.getElementById('toggle-sustain-btn');
    const btnRandomRoot = document.getElementById('btn-random-root');
    const btnInfo = document.getElementById('btn-info');
    const btnCloseInfo = document.getElementById('btn-close-info');
    const infoModal = document.getElementById('info-modal');

    if (btnInfo && infoModal) btnInfo.onclick = () => infoModal.classList.add('active');
    if (btnCloseInfo && infoModal) btnCloseInfo.onclick = () => infoModal.classList.remove('active');

    updateChordSuggestions();

    if (chordInput) {
        // FALHA 1 CORRIGIDA: Live Search desacoplado da roda.
        // O listener 'input' faz parse em tempo real e renderiza os cards independentemente.
        chordInput.addEventListener('input', () => {
            updateChordSuggestions();
            const val = chordInput.value.trim();
            if (val.length >= 1) {
                const parsed = parseFullChord(val);
                if (parsed) {
                    renderChordCards(val); // Renderiza shapes sem alterar a roda
                }
            }
        });

        // Enter ainda toca o acorde além de renderizar os cards
        chordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = chordInput.value.trim();
                const parsed = parseFullChord(val);
                if (parsed) {
                    renderChordCards(val);
                    const baseMidi = 48 + parsed.root;
                    const midiNotes = parsed.intervals.map(off => baseMidi + off).sort((a, b) => a - b);
                    playArpeggio(midiNotes, 0.07, 1.6);
                }
            }
        });

        chordInput.addEventListener('drop', (e) => {
            const raw = e.dataTransfer.getData('text/plain');
            if (raw) {
                e.preventDefault();
                chordInput.value = raw.trim();
                updateChordSuggestions();
                const parsed = parseFullChord(raw.trim());
                if (parsed) {
                    renderChordCards(raw.trim());
                    const baseMidi = 48 + parsed.root;
                    const midiNotes = parsed.intervals.map(off => baseMidi + off).sort((a, b) => a - b);
                    playArpeggio(midiNotes, 0.07, 1.6);
                }
            }
        });
    }

    const dragSource = document.getElementById('chord-drag-source');
    const dragHandle = document.getElementById('chord-drag-handle');
    const wheelDropzoneContainer = document.getElementById('harmonic-wheel');
    const wheelDropzoneIndicator = document.getElementById('wheel-dropzone');

    const handleDragStart = (e) => {
        const val = chordInput ? (chordInput.value.trim() || 'C') : 'C';
        e.dataTransfer.setData('text/plain', val);
        e.dataTransfer.effectAllowed = 'copy';
        if (wheelDropzoneIndicator) wheelDropzoneIndicator.classList.add('dragging');
    };

    const handleDragEnd = () => {
        if (wheelDropzoneIndicator) wheelDropzoneIndicator.classList.remove('dragging');
    };

    if (dragHandle) {
        dragHandle.addEventListener('dragstart', handleDragStart);
        dragHandle.addEventListener('dragend', handleDragEnd);
    }

    if (dragSource) {
        dragSource.addEventListener('dragstart', (e) => {
            if (e.target.id === 'chord-input') {
                e.preventDefault();
                return;
            }
            handleDragStart(e);
        });
        dragSource.addEventListener('dragend', handleDragEnd);
    }

    // ATUALIZADO: Dropzone da roda passa a ser a interface exclusiva de alterar a própria roda.
    if (wheelDropzoneContainer) {
        wheelDropzoneContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            if (wheelDropzoneIndicator) wheelDropzoneIndicator.classList.add('drag-over');
        });

        wheelDropzoneContainer.addEventListener('dragleave', () => {
            if (wheelDropzoneIndicator) wheelDropzoneIndicator.classList.remove('drag-over');
        });

        wheelDropzoneContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (wheelDropzoneIndicator) wheelDropzoneIndicator.classList.remove('drag-over');

            let rawData = e.dataTransfer.getData('text/plain');
            if (!rawData) return;
            rawData = rawData.trim();

            let chordStr = rawData;
            try {
                const jsonObj = JSON.parse(rawData);
                if (jsonObj && jsonObj.chordStr) chordStr = jsonObj.chordStr;
            } catch (err) { }

            if (!chordStr || chordStr.toLowerCase() === 'drag') return;
            
            // Aqui atualizamos A RODA baseada no drop
            const parsed = parseFullChord(chordStr);
            if (parsed) {
                const match = chordStr.trim().match(/^([A-G][#b]?)(.*)$/i);
                state.root = match[1].charAt(0).toUpperCase() + match[1].slice(1);
                state.chordType = getQualityType(match[2].toLowerCase());
                state.isRootSet = true;
                _harmonicSave();
                renderWheel();
            }
        });
    }

    if (btnRandomRoot) {
        // FALHA 4 CORRIGIDA: O botão aleatório atua EXCLUSIVAMENTE na roda central.
        // O input de pesquisa permanece intocado.
        btnRandomRoot.onclick = () => {
            const roots = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
            // Sorteia: maior (major) ou menor (minor)
            const randomRoot = roots[Math.floor(Math.random() * roots.length)];
            const randomChordType = Math.random() < 0.5 ? 'major' : 'minor';

            // Atualiza APENAS o estado da roda — sem tocar no chordInput
            state.root = randomRoot;
            state.chordType = randomChordType;
            state.isRootSet = true;
            _harmonicSave();
            renderWheel();

            // Feedback sonoro: toca o arpejo da tônica sorteada
            const rs = getRootSemitone();
            const baseMidi = 48 + rs + (rs > 55 ? -12 : 0);
            const offsets = getChordOffsetsForInterval(0);
            const midiNotes = offsets.map(off => baseMidi + off).sort((a, b) => a - b);
            playArpeggio(midiNotes, 0.07, 1.8);
        };
    }

    // FALHA 2 CORRIGIDA: Listener para o select de afinações gerado no HTML.
    const tuningSelect = document.getElementById('tuning-select');
    if (tuningSelect) {
        tuningSelect.addEventListener('change', () => {
            const [instrument, tuningName] = JSON.parse(tuningSelect.value);
            state.instrument = instrument;
            state.tuningName = tuningName;
            // Re-renderiza os cards com a nova afinação se houver acorde no input
            const chordInput = document.getElementById('chord-input');
            const val = chordInput ? chordInput.value.trim() : '';
            if (val) {
                const parsed = parseFullChord(val);
                if (parsed) renderChordCards(val);
            } else {
                renderChordCards('C');
            }
        });
    }

    if (btnToggleSustain) {
        btnToggleSustain.onclick = () => {
            state.sustainMode = !state.sustainMode;
            btnToggleSustain.classList.toggle('active', state.sustainMode);
            btnToggleSustain.setAttribute('aria-pressed', state.sustainMode);
            btnToggleSustain.textContent = state.sustainMode ? '✦ On' : 'Off';

            setShimmerActive(state.sustainMode);

            if (state.sustainMode) {
                btnToggleSustain.style.boxShadow = '0 0 18px rgba(91,80,214,0.7), inset 0 0 10px rgba(91,80,214,0.25)';
                btnToggleSustain.style.borderColor = 'rgba(91,80,214,0.8)';
            } else {
                btnToggleSustain.style.boxShadow = '';
                btnToggleSustain.style.borderColor = '';
            }
            _harmonicSave();
        };
    }

    document.querySelectorAll('.hm-toggle-btn[data-timbre]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.hm-toggle-btn[data-timbre]').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
            state.timbre = btn.dataset.timbre;
            _harmonicSave();
        };
    });

    document.addEventListener('click', () => getAudioContext(), { once: true });
}

function exportProgressionMIDI() {
    if (progression.length === 0) {
        alert('Adicione acordes à progressão antes de exportar!');
        return;
    }

    const BPM = 120;
    const PPQ = 480;
    const TEMPO = Math.round(60_000_000 / BPM);
    const CHORD_TICKS = PPQ * 2;
    const ARP_TICKS = Math.round(PPQ / 8);
    const VELOCITY = 80;
    const CHANNEL = 0;
    const PROGRAM = state.timbre === 'guitar' ? 25 : 0;

    function varlen(n) {
        const buf = [];
        buf.unshift(n & 0x7F);
        n >>= 7;
        while (n > 0) { buf.unshift((n & 0x7F) | 0x80); n >>= 7; }
        return buf;
    }

    function uint32BE(n) {
        return [(n >> 24) & 0xFF, (n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF];
    }

    function uint16BE(n) { return [(n >> 8) & 0xFF, n & 0xFF]; }

    const rawEvents = [];

    rawEvents.push({ tick: 0, data: [0xFF, 0x51, 0x03, (TEMPO >> 16) & 0xFF, (TEMPO >> 8) & 0xFF, TEMPO & 0xFF] });
    rawEvents.push({ tick: 0, data: [0xC0 | CHANNEL, PROGRAM] });

    let cursor = 0;
    progression.forEach(item => {
        const parsed = parseFullChord(item.chordStr);
        if (!parsed) { cursor += CHORD_TICKS; return; }

        const baseMidi = 48 + parsed.root;
        const notes = parsed.intervals.map(off => baseMidi + off).sort((a, b) => a - b);

        notes.forEach((note, i) => {
            rawEvents.push({ tick: cursor + i * ARP_TICKS, data: [0x90 | CHANNEL, note, VELOCITY] });
        });
        notes.forEach((note, i) => {
            rawEvents.push({ tick: cursor + CHORD_TICKS + i * ARP_TICKS, data: [0x80 | CHANNEL, note, 0] });
        });

        cursor += CHORD_TICKS + notes.length * ARP_TICKS;
    });

    rawEvents.push({ tick: cursor, data: [0xFF, 0x2F, 0x00] });

    rawEvents.sort((a, b) => a.tick - b.tick);
    const trackBytes = [];
    let lastTick = 0;
    rawEvents.forEach(ev => {
        const delta = ev.tick - lastTick;
        lastTick = ev.tick;
        trackBytes.push(...varlen(delta), ...ev.data);
    });

    const header = [
        0x4D, 0x54, 0x68, 0x64,
        ...uint32BE(6),
        ...uint16BE(0),
        ...uint16BE(1),
        ...uint16BE(PPQ)
    ];

    const track = [
        0x4D, 0x54, 0x72, 0x6B,
        ...uint32BE(trackBytes.length),
        ...trackBytes
    ];

    const bytes = new Uint8Array([...header, ...track]);
    const blob = new Blob([bytes], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const name = progression.map(p => p.chordStr).join('-') + '.mid';
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    _harmonicLoad();

    if (state.isRootSet === undefined || state.isRootSet === false) {
        state.isRootSet = false;
        state.root = 'C';
        state.chordType = 'triad';
        const chordInput = document.getElementById('chord-input');
        if (chordInput) chordInput.value = '';
    } else {
        const chordInput = document.getElementById('chord-input');
        if (chordInput) {
            const tQual = state.chordType === 'm7' ? 'm' : (state.chordType === 'min' ? 'm' : '');
            chordInput.value = state.root + (state.chordType === 'triad' ? '' : tQual);
        }
    }

    setupUI();
    setupProgressionBuilder();
    
    // Inicia os shapes iniciais de acordes se houver algo válido no input, senão usa C.
    const chordInput = document.getElementById('chord-input');
    if (chordInput && chordInput.value.trim() !== '') {
        renderChordCards(chordInput.value);
    } else {
        renderChordCards('C');
    }

    requestAnimationFrame(() => renderWheel());

    let _resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(() => renderWheel(), 120);
    });

    if (state.sustainMode) {
        const btnToggleSustain = document.getElementById('toggle-sustain-btn');
        if (btnToggleSustain) {
            btnToggleSustain.classList.add('active');
            btnToggleSustain.setAttribute('aria-pressed', 'true');
            btnToggleSustain.textContent = '✦ On';
            btnToggleSustain.style.boxShadow = '0 0 18px rgba(91,80,214,0.7), inset 0 0 10px rgba(91,80,214,0.25)';
            btnToggleSustain.style.borderColor = 'rgba(91,80,214,0.8)';
            setShimmerActive(true);
        }
    }

    const activeTimbreBtn = document.querySelector(`.hm-toggle-btn[data-timbre="${state.timbre}"]`);
    if (activeTimbreBtn) {
        document.querySelectorAll('.hm-toggle-btn[data-timbre]').forEach(b => {
            b.classList.remove('active'); b.setAttribute('aria-checked', 'false');
        });
        activeTimbreBtn.classList.add('active'); activeTimbreBtn.setAttribute('aria-checked', 'true');
    }

    document.addEventListener('click', (e) => {
        const guide = document.getElementById('wheel-guide');
        if (!e.target.closest('.wheel-node')) {
            guide.innerHTML = state.isRootSet
                ? `<strong style="color:white; font-size:16px;">Campo Harmonizado: ${state.root}${state.chordType === 'minor' ? 'm' : ''}</strong><br/><span style="opacity:0.6; font-size:0.9rem;">Passe o mouse ou clique num grau</span>`
                : `<strong style="color:white; font-size:18px;">Comece a explorar:</strong><br/>Escolha ou arraste uma tônica para o centro!`;
            guide.classList.remove('active');
        }
    });
});
