// harmonic.js - Emotional Gravity Map integration
const NOTES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTES_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

const TUNINGS = {
    guitar: {
        'Standard (E A D G B E)': [40,45,50,55,59,64],
        'Drop D (D A D G B E)':   [38,45,50,55,59,64],
        'Half Step Down (Eb)':    [39,44,49,54,58,63],
        'Full Step Down (D)':     [38,43,48,53,57,62],
    },
    bass: {
        'Standard (E A D G)':     [28,33,38,43],
        'Drop D (D A D G)':       [26,33,38,43],
        '5-string (B E A D G)':   [23,28,33,38,43],
    }
};

const INTERVAL_DATA = [
    { id: 0,  degree: '1',  color: '#5b50d6', interval: 0,  hover: "Perfeito, completo, inteiro, resolvido, estável." },
    { id: 1,  degree: '5',  color: '#9c41f2', interval: 7,  hover: "Puro, claro, simples, neutro, aberto, expansivo." },
    { id: 2,  degree: '2',  color: '#d92bb8', interval: 2,  hover: "Limpo, placido, cristalino, versão amplificada do 5." },
    { id: 3,  degree: '6',  color: '#eb2f70', interval: 9,  hover: "Leveza, doçura, delicado, suave, tom pastel." },
    { id: 4,  degree: '3',  color: '#db3737', interval: 4,  hover: "Doçura, calor, brilho, vida, vitalidade." },
    { id: 5,  degree: '7',  color: '#cf7b38', interval: 11, hover: "Melancólico, tensão emocional, complexo, nostálgico." },
    { id: 6,  degree: '#4', color: '#d5db3b', interval: 6,  hover: "Mais forte, energizado, estranho, alienígena, intenso, espetado." },
    { id: 7,  degree: 'b2', color: '#85e838', interval: 1,  hover: "Sem esperança, desesperado, intenso, amargo, apimentado." },
    { id: 8,  degree: 'b6', color: '#40e637', interval: 8,  hover: "Trágico, desesperado, pesado, sombrio, sem alegria." },
    { id: 9,  degree: 'b3', color: '#43e888', interval: 3,  hover: "Sério, solene, escuro, melancólico, tristeza." },
    { id: 10, degree: 'b7', color: '#38e8d3', interval: 10, hover: "O menor mais leve, divertido, aterrado, poderoso, descontraído." },
    { id: 11, degree: '4',  color: '#4ca8e8', interval: 5,  hover: "Neutro, quadrado, plano, contração para dentro." }
];

// SVG Chord Box Library — CAGED + extended chord shapes
// offsets are relative to lowestFret; baseAttr is the open-string MIDI index used to find rootFret
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
    timbre: 'guitar'  // 'guitar' | 'piano'
};

// AUDIO
let audioCtx = null;
let sustainGainNode = null; 

function playNote(midiNote, duration = 1.7, isSustain = false) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const now  = audioCtx.currentTime;
    
    if (isSustain && sustainGainNode) {
        sustainGainNode.gain.cancelScheduledValues(now);
        sustainGainNode.gain.linearRampToValueAtTime(0.001, now + 0.1);
    }
    
    let mainGain = audioCtx.createGain();
    
    const isGuitar = state.timbre === 'guitar';
    // Guitar: sawtooth-ish rich harmonics with fast decay
    // Piano: triangle + sine, slower decay
    const harmonics = isGuitar
        ? [[1,0.5],[2,0.3],[3,0.15],[4,0.08],[5,0.04]]
        : [[1,0.6],[2,0.25],[3,0.08],[4,0.02]];
    const oscType = isGuitar ? 'sawtooth' : 'triangle';
    const decayMult = isGuitar ? 0.8 : 1.4;
    
    harmonics.forEach(([h, amp]) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = h === 1 ? oscType : 'sine';
        osc.frequency.value = freq * h;
        
        const d = duration * decayMult;
        if (isSustain) {
            gain.gain.setValueAtTime(amp * 0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + d);
        } else {
            gain.gain.setValueAtTime(amp, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + d - 0.1);
        }
        
        osc.connect(gain);
        gain.connect(mainGain);
        osc.start(now);
        osc.stop(now + d + 0.2);
    });
    
    mainGain.connect(audioCtx.destination);
    if (isSustain) sustainGainNode = mainGain;
}

function playArpeggio(midiNotes, delay = 0.12, duration = 1.8) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    midiNotes.forEach((note, i) => {
        setTimeout(() => playNote(note, duration), i * delay * 1000);
    });
}

// Full chord quality parser
// Returns { intervals: number[] } for any chord string like D#dim, Fmaj7, Gsus4, etc.
function parseFullChord(chordStr) {
    const match = chordStr.trim().match(/^([A-G][#b]?)(.*)$/);
    if (!match) return null;
    const rootStr = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    const quality = match[2].toLowerCase().trim();
    
    let rootIdx = NOTES_SHARP.indexOf(rootStr);
    if (rootIdx === -1) rootIdx = NOTES_FLAT.indexOf(rootStr);
    if (rootIdx === -1) return null;
    
    let intervals;
    if (quality === '' || quality === 'maj' || quality === 'major') intervals = [0,4,7];
    else if (quality === 'm' || quality === 'min' || quality === 'minor') intervals = [0,3,7];
    else if (quality === 'dim' || quality === 'diminished' || quality === 'o') intervals = [0,3,6];
    else if (quality === 'aug' || quality === '+') intervals = [0,4,8];
    else if (quality === 'sus2') intervals = [0,2,7];
    else if (quality === 'sus4' || quality === 'sus') intervals = [0,5,7];
    else if (quality === 'maj7') intervals = [0,4,7,11];
    else if (quality === '7') intervals = [0,4,7,10];
    else if (quality === 'm7') intervals = [0,3,7,10];
    else if (quality === 'm7b5' || quality === 'ø') intervals = [0,3,6,10];
    else if (quality === 'dim7' || quality === 'o7') intervals = [0,3,6,9];
    else if (quality === 'maj9') intervals = [0,4,7,11,14];
    else if (quality === '9') intervals = [0,4,7,10,14];
    else if (quality === 'm9') intervals = [0,3,7,10,14];
    else if (quality === '6') intervals = [0,4,7,9];
    else if (quality === 'm6') intervals = [0,3,7,9];
    else if (quality === 'add9') intervals = [0,4,7,14];
    else if (quality === '5') intervals = [0,7];
    else if (['maug','m+'].includes(quality)) intervals = [0,3,8];
    else intervals = [0,4,7]; // default major
    
    return { root: rootIdx, intervals };
}

function getQualityType(quality) {
    const q = (quality || '').toLowerCase().trim();
    if (q === '' || q === 'maj' || q === 'major') return 'major';
    if (['m','min','minor'].includes(q)) return 'minor';
    if (['dim','o','diminished'].includes(q)) return 'diminished';
    if (['7','9','add9','6'].includes(q)) return 'dominant7';
    if (['maj7','maj9'].includes(q)) return 'maj7';
    if (['m7','m9','m6'].includes(q)) return 'minor7';
    if (['m7b5','ø'].includes(q)) return 'm7b5';
    if (['dim7','o7'].includes(q)) return 'dim7';
    if (['aug','+','maug','m+'].includes(q)) return 'aug';
    if (['sus4','sus'].includes(q)) return 'sus4';
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
    const flatKeys = ['F','Bb','Eb','Ab','Db','Gb','D#','A#','G#','C#','F#'];
    return flatKeys.includes(state.root) ? NOTES_FLAT[((semitone % 12) + 12) % 12] : NOTES_SHARP[((semitone % 12) + 12) % 12];
}

function isMinorScale() {
    return state.chordType === 'minor' || document.getElementById('chord-input').value.includes('m');
}

function getChordNameForInterval(interval) {
    if (!state.isRootSet) return '';
    const baseName = getNoteName(getRootSemitone() + interval);
    const isMinorRoot = isMinorScale();
    
    if (!isMinorRoot) { 
        const majMap = {0:'', 1:'', 2:'m', 3:'', 4:'m', 5:'', 6:'dim', 7:'', 8:'', 9:'m', 10:'', 11:'dim'};
        return baseName + majMap[interval];
    } else {
        const minMap = {0:'m', 1:'', 2:'dim', 3:'', 4:'', 5:'m', 6:'', 7:'m', 8:'', 9:'dim', 10:'', 11:'dim'};
        return baseName + minMap[interval];
    }
}

function getChordOffsetsForInterval(interval) {
    const isMinorRoot = isMinorScale();
    const majOffsets = [0, 4, 7];
    const minOffsets = [0, 3, 7];
    const dimOffsets = [0, 3, 6];
    
    if (!isMinorRoot) { 
        if ([2,4,9].includes(interval)) return minOffsets;
        if ([6,11].includes(interval)) return dimOffsets;
        return majOffsets;
    } else {
        if ([0,5,7].includes(interval)) return minOffsets;
        if ([2,9,11].includes(interval)) return dimOffsets;
        return majOffsets;
    }
}

function playChordFromNode(node) {
    const rs = getRootSemitone();
    const baseMidi = 48 + rs + node.interval + (rs + node.interval > 55 ? -12 : 0);
    
    const offsets = getChordOffsetsForInterval(node.interval);
    offsets.forEach(off => {
        const m = baseMidi + off;
        playNote(m);
    });
    if (state.sustainMode) {
        playNote(baseMidi - 12, 10, true); 
    }
    
    const chordStr = getChordNameForInterval(node.interval);
    renderChordCardsForNode(node.interval, chordStr || state.root);
}

function renderWheel() {
    const wrapper = document.getElementById('harmonic-wheel');
    const svg = document.getElementById('harmonic-svg-lines');
    
    wrapper.querySelectorAll('.wheel-node').forEach(el => el.remove());
    
    const RADIUS = 130;
    const CENTER = 155;

    INTERVAL_DATA.forEach((node, i) => {
        const angleDeg = (i * 30) - 90;
        const angleRad = (Math.PI / 180) * angleDeg;
        const x = CENTER + RADIUS * Math.cos(angleRad);
        const y = CENTER + RADIUS * Math.sin(angleRad);
        
        const el = document.createElement('div');
        el.className = `wheel-node`;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
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
            el.style.transform = 'scale(1.15)';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
        });

        el.addEventListener('click', () => {
            if (state.isRootSet) {
                // Clear previous sustain highlight
                wrapper.querySelectorAll('.wheel-node.sustain-active').forEach(n => {
                    n.classList.remove('sustain-active');
                    n.style.backgroundColor = '#111';
                    n.style.boxShadow = '';
                });
                playChordFromNode(node);
                if (state.sustainMode) {
                    el.classList.add('sustain-active');
                    // Set CSS custom property for the glass color
                    el.style.setProperty('--sustain-color', node.color);
                }
            } else {
                document.getElementById('chord-input').focus();
            }
        });

        wrapper.appendChild(el);
    });

    svg.innerHTML = '';
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
        <strong style="color:${node.color}; font-size:18px;">Grau ${node.degree}${node.id===0 ? ' (Tônica)' : ''} ${chordStr ? '- ' + chordStr : ''}</strong><br/>
        <span style="opacity:0.8">${node.hover}</span>
        ${notesStr ? `<br/><span style="color:#cf7b38; font-size:15px; margin-top:8px; display:inline-block;">Notas do Acorde: <strong>${notesStr}</strong></span>` : ''}
    `;
    guide.classList.add('active');
}

// CHORD DIAGRAMS LOGIC API
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
    const spacing = 18;   // shrunk from 24
    const dotR = 8;       // shrunk from 10
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

    for(let i = 1; i <= numFrets; i++) {
        const y = padTop + i * spacing;
        svg += `<line x1="${padLeft}" y1="${y}" x2="${padLeft + width}" y2="${y}" stroke="#444" stroke-width="1"/>`;
    }
    
    for(let i = 0; i < numStrings; i++) {
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
            if(noteName) svg += `<text x="${x}" y="${padTop - 13}" fill="#aaa" font-size="6" text-anchor="middle" dominant-baseline="middle">${noteName}</text>`;
        } else {
            let visualFret = fret - minFret + 1;
            if (visualFret > 0 && visualFret <= numFrets) {
                const y = padTop + (visualFret - 0.5) * spacing;
                svg += `<circle cx="${x}" cy="${y}" r="${dotR}" fill="#5b50d6"/>`;
                if(noteName) svg += `<text x="${x}" y="${y}" fill="#fff" font-size="6.5" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${noteName}</text>`;
            }
        }
    });

    svg += `</svg>`;
    return svg;
}

// All supported chord qualities for the variation switcher
const CHORD_QUALITIES = [
    { label: 'Maior',  suffix: '',      shortLabel: 'M' },
    { label: 'Menor',  suffix: 'm',     shortLabel: 'm' },
    { label: 'Dim',    suffix: 'dim',   shortLabel: 'dim' },
    { label: 'Aug',    suffix: 'aug',   shortLabel: 'aug' },
    { label: 'Sus4',   suffix: 'sus4',  shortLabel: 'sus4' },
    { label: 'Sus2',   suffix: 'sus2',  shortLabel: 'sus2' },
    { label: '7',      suffix: '7',     shortLabel: '7' },
    { label: 'Maj7',   suffix: 'maj7',  shortLabel: 'maj7' },
    { label: 'm7',     suffix: 'm7',    shortLabel: 'm7' },
    { label: 'm7b5',   suffix: 'm7b5',  shortLabel: 'ø' },
    { label: 'Dim7',   suffix: 'dim7',  shortLabel: 'dim7' },
    { label: '9',      suffix: '9',     shortLabel: '9' },
    { label: 'm9',     suffix: 'm9',    shortLabel: 'm9' },
    { label: 'Add9',   suffix: 'add9',  shortLabel: 'add9' },
    { label: '6',      suffix: '6',     shortLabel: '6' },
    { label: 'm6',     suffix: 'm6',    shortLabel: 'm6' },
    { label: 'Power',  suffix: '5',     shortLabel: '5' },
];

function renderChordCardsForNode(nodeInterval, chordStr, overrideIntervals) {
    // Determine root from chordStr
    const rootMatch = chordStr.trim().match(/^([A-G][#b]?)/i);
    const rootStr = rootMatch ? rootMatch[1].charAt(0).toUpperCase() + rootMatch[1].slice(1) : state.root;
    const currentMatch = chordStr.trim().match(/^([A-G][#b]?)(.*)$/i);
    const currentSuffix = currentMatch ? currentMatch[2].toLowerCase() : '';

    _renderQualityTabs(rootStr, currentSuffix, nodeInterval);
    _renderCards(rootStr, currentSuffix, nodeInterval);
}

function _renderQualityTabs(rootStr, activeSuffix, nodeInterval) {
    // Inject or refresh the quality tabs bar in the left panel
    let tabBar = document.getElementById('chord-quality-tabs');
    if (!tabBar) {
        tabBar = document.createElement('div');
        tabBar.id = 'chord-quality-tabs';
        tabBar.style.cssText = 'display:flex; flex-wrap:wrap; gap:5px; margin-bottom:12px; flex-shrink:0; padding:0 5px;';
        const container = document.getElementById('chord-cards-container');
        container.parentNode.insertBefore(tabBar, container);
    }
    tabBar.innerHTML = CHORD_QUALITIES.map(q => {
        const isActive = q.suffix === activeSuffix;
        return `<button
            onclick="window._switchQuality('${rootStr}','${q.suffix}',${nodeInterval})"
            style="padding:3px 9px; font-size:0.75rem; border-radius:20px; border:1px solid rgba(255,255,255,${isActive ? '0.6' : '0.15'}); background:${isActive ? 'rgba(91,80,214,0.6)' : 'rgba(255,255,255,0.05)'}; color:${isActive ? '#fff' : '#aaa'}; cursor:pointer; white-space:nowrap;"
        >${rootStr}${q.shortLabel !== 'M' ? q.shortLabel : ''}</button>`;
    }).join('');
}

function _renderCards(rootStr, suffix, nodeInterval) {
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
            const hov = INTERVAL_DATA.find(d => d.interval === nodeInterval)?.hover || 'Variação';
            // Compute exact MIDI notes from this specific voicing/shape
            const exactMidi = absoluteFrets
                .map((fret, si) => {
                    if (fret === 'x') return null;
                    const open = tuningMidis[si];
                    return (open !== undefined) ? open + fret : null;
                })
                .filter(n => n !== null && n > 0)
                .sort((a, b) => a - b);
            e.dataTransfer.setData('text/plain', JSON.stringify({
                interval: nodeInterval,
                chordStr: fullChord,
                shapeName: shape.name,
                svgData,
                hover: hov,
                midiNotes: exactMidi   // ← exact voicing notes stored
            }));
            e.dataTransfer.effectAllowed = 'copy';
        });

        container.appendChild(card);
    });
}

// Global switch handler called from tab button onclick
window._switchQuality = function(rootStr, suffix, nodeInterval) {
    _renderQualityTabs(rootStr, suffix, nodeInterval);
    _renderCards(rootStr, suffix, nodeInterval);
};






function updateChordSuggestions() {
    const container = document.getElementById('chord-suggestions');
    container.innerHTML = '';
    // Always show a useful set of quick-access qualities
    const bases = ['', 'm', 'dim', 'aug', 'sus4', '7', 'maj7', 'm7'];
    const chordInput = document.getElementById('chord-input');
    
    let match = chordInput.value.trim().match(/^([A-G][#b]?)/i);
    let r = match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : 'C';
    
    bases.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'glass-btn small-btn';
        btn.style.cssText = 'font-size:0.75rem; padding:3px 8px;';
        btn.textContent = r + q;
        btn.onclick = () => {
            chordInput.value = btn.textContent;
            parseChordParams();
        };
        container.appendChild(btn);
    });
}

function parseChordParams() {
    const val = document.getElementById('chord-input').value.trim() || 'C';
    const parsed = parseFullChord(val);
    if (!parsed) return;
    
    // Resolve root name from index
    const flatRoots = ['F','Bb','Eb','Ab','Db','Gb'];
    const match = val.trim().match(/^([A-G][#b]?)(.*)$/i);
    if (!match) return;
    const rootRaw = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    state.root = rootRaw;
    state.isRootSet = true;
    
    const quality = match[2].toLowerCase();
    state.chordType = getQualityType(quality);
    
    renderWheel();
    renderChordCardsForNode(0, val, parsed.intervals);
}

// PROGRESSION BUILDER Logic
let progression = [];

function setupProgressionBuilder() {
    const dropzone = document.getElementById('progression-dropzone');
    dropzone.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            progression.push(data);
            renderProgression();
        } catch(e) {}
    });

    document.getElementById('btn-clear-progression').onclick = () => {
        progression = [];
        renderProgression();
    };

    document.getElementById('btn-play-progression').onclick = async () => {
        if(!audioCtx) playNote(60, 0.01);
        const stepDuration = 2.0;
        const arpeggioDelay = 0.10;
        for(let i = 0; i < progression.length; i++) {
            const item = progression[i];
            let notes;
            if (item.midiNotes && item.midiNotes.length > 0) {
                // Use exact stored voicing
                notes = item.midiNotes;
            } else {
                const parsed = parseFullChord(item.chordStr);
                if (!parsed) continue;
                const baseMidi = 48 + parsed.root;
                notes = parsed.intervals.map(off => baseMidi + off).sort((a,b) => a-b);
            }
            playArpeggio(notes, arpeggioDelay, stepDuration);
            await new Promise(r => setTimeout(r, stepDuration * 1000));
        }
    };

    document.getElementById('btn-export-midi').onclick = () => exportProgressionMIDI();
}

function renderProgression() {
    const dropzone = document.getElementById('progression-dropzone');
    const summary = document.getElementById('progression-summary');
    
    if (progression.length === 0) {
        dropzone.innerHTML = 'Arraste os graus da roda para cá';
        summary.style.display = 'none';
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


    summary.style.display = 'block';
    
    let narratives = [];
    progression.forEach(p => {
        narratives.push(`(${p.chordStr}) ${p.hover.split(',')[0].toLowerCase()}`);
    });

    summary.innerHTML = "<strong style='color:#fff;'>Mapa Emocional:</strong><br/>" + narratives.join(' → ');

    // Click on a progression card → arpeggio playback using exact stored notes
    dropzone.querySelectorAll('div[data-prog-idx]').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const idx = parseInt(card.dataset.progIdx);
            const item = progression[idx];
            if (!item) return;
            // Prefer exact stored voicing; fall back to name-based parse
            if (item.midiNotes && item.midiNotes.length > 0) {
                playArpeggio(item.midiNotes);
            } else {
                const parsed = parseFullChord(item.chordStr);
                if (!parsed) return;
                const baseMidi = 48 + parsed.root;
                playArpeggio(parsed.intervals.map(off => baseMidi + off).sort((a,b) => a-b));
            }
        });
    });
}


window.removeProgressionItem = function(index) {
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

    chordInput.addEventListener('input', () => {
        updateChordSuggestions();
        parseChordParams();
    });

    btnRandomRoot.onclick = () => {
        const randomNote = NOTES_SHARP[Math.floor(Math.random() * 12)];
        const randomQual = Math.random() > 0.5 ? 'm' : '';
        document.getElementById('chord-input').value = randomNote + randomQual;
        parseChordParams();
        playChordFromNode(INTERVAL_DATA[0]);
    };

    btnToggleSustain.onclick = () => {
        state.sustainMode = !state.sustainMode;
        btnToggleSustain.classList.toggle('active', state.sustainMode);
        btnToggleSustain.textContent = state.sustainMode ? 'On' : 'Off';
        if (!state.sustainMode && sustainGainNode) {
            sustainGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
            sustainGainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        }
    };

    // Timbre toggle (Violão / Piano)
    document.querySelectorAll('.instrument-btn[data-timbre]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.instrument-btn[data-timbre]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.timbre = btn.dataset.timbre;
        };
    });
}


// ─── MIDI Export ─────────────────────────────────────────────────────────────
// Encodes the progression as a standard MIDI Type-0 file and downloads it.
function exportProgressionMIDI() {
    if (progression.length === 0) {
        alert('Adicione acordes à progressão antes de exportar!');
        return;
    }

    const BPM         = 120;
    const PPQ         = 480;                          // ticks per quarter note
    const TEMPO       = Math.round(60_000_000 / BPM); // microseconds per beat
    const CHORD_TICKS = PPQ * 2;                      // 2 beats per chord
    const ARP_TICKS   = Math.round(PPQ / 8);          // stagger between notes
    const VELOCITY    = 80;
    const CHANNEL     = 0;
    const PROGRAM     = state.timbre === 'guitar' ? 25 : 0; // acoustic guitar / grand piano

    // ── helpers ──────────────────────────────────────────────────────────────
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

    // ── build raw events {tick, data[]} ──────────────────────────────────────
    const rawEvents = [];

    // Tempo meta-event at tick 0
    rawEvents.push({ tick: 0, data: [0xFF, 0x51, 0x03, (TEMPO >> 16) & 0xFF, (TEMPO >> 8) & 0xFF, TEMPO & 0xFF] });
    // Program change
    rawEvents.push({ tick: 0, data: [0xC0 | CHANNEL, PROGRAM] });

    let cursor = 0;
    progression.forEach(item => {
        const parsed = parseFullChord(item.chordStr);
        if (!parsed) { cursor += CHORD_TICKS; return; }

        const baseMidi = 48 + parsed.root;
        const notes = parsed.intervals.map(off => baseMidi + off).sort((a, b) => a - b);

        // Note Ons (staggered arpeggio)
        notes.forEach((note, i) => {
            rawEvents.push({ tick: cursor + i * ARP_TICKS, data: [0x90 | CHANNEL, note, VELOCITY] });
        });
        // Note Offs
        notes.forEach((note, i) => {
            rawEvents.push({ tick: cursor + CHORD_TICKS + i * ARP_TICKS, data: [0x80 | CHANNEL, note, 0] });
        });

        cursor += CHORD_TICKS + notes.length * ARP_TICKS;
    });

    // End-of-track meta
    rawEvents.push({ tick: cursor, data: [0xFF, 0x2F, 0x00] });

    // ── sort → convert to delta-time ─────────────────────────────────────────
    rawEvents.sort((a, b) => a.tick - b.tick);
    const trackBytes = [];
    let lastTick = 0;
    rawEvents.forEach(ev => {
        const delta = ev.tick - lastTick;
        lastTick = ev.tick;
        trackBytes.push(...varlen(delta), ...ev.data);
    });

    // ── assemble MIDI file bytes ──────────────────────────────────────────────
    // Header chunk
    const header = [
        0x4D, 0x54, 0x68, 0x64, // "MThd"
        ...uint32BE(6),          // length = 6
        ...uint16BE(0),          // format 0 (single track)
        ...uint16BE(1),          // 1 track
        ...uint16BE(PPQ)         // ticks per quarter note
    ];

    // Track chunk
    const track = [
        0x4D, 0x54, 0x72, 0x6B, // "MTrk"
        ...uint32BE(trackBytes.length),
        ...trackBytes
    ];

    // ── download ──────────────────────────────────────────────────────────────
    const bytes  = new Uint8Array([...header, ...track]);
    const blob   = new Blob([bytes], { type: 'audio/midi' });
    const url    = URL.createObjectURL(blob);
    const link   = document.createElement('a');
    const name   = progression.map(p => p.chordStr).join('-') + '.mid';
    link.href     = url;
    link.download  = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
}


document.addEventListener('DOMContentLoaded', () => {
    state.isRootSet = false;
    setupUI();
    setupProgressionBuilder();
    renderWheel();

    // Auto-hide guide when clicking outside wheel nodes
    document.addEventListener('click', (e) => {
        const guide = document.getElementById('wheel-guide');
        if (!e.target.closest('.wheel-node')) {
            guide.innerHTML = state.isRootSet
                ? `<strong style="color:white; font-size:16px;">Campo Harmonizado: ${document.getElementById('chord-input').value || state.root}</strong><br/><span style="opacity:0.6; font-size:0.9rem;">Passe o mouse ou clique num grau</span>`
                : `<strong style="color:white; font-size:18px;">Comece a explorar:</strong><br/>Escolha ou clique em uma tônica!`;
            guide.classList.remove('active');
        }
    });
});
