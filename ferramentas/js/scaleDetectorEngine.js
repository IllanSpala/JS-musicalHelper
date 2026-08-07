/**
 * scaleDetectorEngine.js — Reconhecimento de Notas e Destaque da Escala
 * JS-musicalHelper | v4 — Calibração por 2 cliques
 *
 * Não tenta mais calibrar pelo hand landmark.
 * A calibração é feita pelo usuário via 2 cliques no canvas.
 * O engine aqui só processa notas DEPOIS que o mapper estiver calibrado.
 */

(function () {
    'use strict';

    const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const FLAT_TO_SHARP = { 'Db':'C#', 'Eb':'D#', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#' };

    const INSTRUMENT_MIDI_BASES = {
        'guitar6': [40, 45, 50, 55, 59, 64],
        'guitar7': [35, 40, 45, 50, 55, 59, 64],
        'bass4':   [28, 33, 38, 43],
        'bass5':   [23, 28, 33, 38, 43]
    };

    const SCALES_MAP = {
        'Major (Ionian)':    [0,2,4,5,7,9,11],
        'Natural Minor':     [0,2,3,5,7,8,10],
        'Pentatonic Major':  [0,2,4,7,9],
        'Pentatonic Minor':  [0,3,5,7,10],
        'Blues':             [0,3,5,6,7,10],
        'Harmonic Minor':    [0,2,3,5,7,8,11],
        'Melodic Minor':     [0,2,3,5,7,9,11],
        'Dorian':            [0,2,3,5,7,9,10],
        'Phrygian':          [0,1,3,5,7,8,10],
        'Lydian':            [0,2,4,6,7,9,11],
        'Mixolydian':        [0,2,4,5,7,9,10],
        'Locrian':           [0,1,3,5,6,8,10],
        'Diminished (HW)':   [0,1,3,4,6,7,9,10],
        'Whole Tone':        [0,2,4,6,8,10]
    };

    // ── Áudio com onset detection ──────────────────────────────────────────
    let audioCtx = null;
    let prevTouchKeys = new Set();

    function playFeedbackSound(midiNote) {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const now  = audioCtx.currentTime;
            const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
            const osc  = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.55);
        } catch(e) {}
    }

    let activeGlowElements = [];
    function clearFretboardGlows() {
        activeGlowElements.forEach(el => el.classList.remove('cam-glow-active'));
        activeGlowElements = [];
    }

    // HUD simples no canvas
    function drawHUD(ctx, cw, ch, msg, color) {
        ctx.save();
        ctx.font = 'bold 13px "Space Grotesk", sans-serif';
        const pw = ctx.measureText(msg).width + 24;
        const x  = cw / 2 - pw / 2;
        const y  = 12;
        ctx.fillStyle   = 'rgba(5,5,20,0.88)';
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, pw, 28, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fillText(msg, x + 12, y + 19);
        ctx.restore();
    }

    // ── Loop principal ────────────────────────────────────────────────────
    function processNotes(ctx, landmarksList, isMirrored, canvasWidth, canvasHeight) {
        if (!window.fretboardMapper) return;

        const isCalibrated = window.fretboardMapper.state.isCalibrated;

        if (!isCalibrated) {
            drawHUD(ctx, canvasWidth, canvasHeight,
                '📍 Clique em "Calibrar Braço" e marque o NUT e o Traste 12', '#FFB800');
            return;
        }

        // ── Escala ativa ─────────────────────────────────────────────────
        const rootSel  = document.getElementById('cam-modal-root-select');
        const typeSel  = document.getElementById('cam-modal-scale-select');
        if (!rootSel || !typeSel) return;

        const activeRoot = rootSel.value;
        const activeType = typeSel.value;
        const rootNorm   = FLAT_TO_SHARP[activeRoot] || activeRoot;
        const rootIndex  = NOTES.indexOf(rootNorm);
        const intervals  = SCALES_MAP[activeType] || SCALES_MAP['Major (Ionian)'];
        const scaleIdxs  = intervals.map(i => (rootIndex + i) % 12);

        clearFretboardGlows();

        const instSel      = document.getElementById('cam-modal-inst-select');
        const activeInst   = instSel ? instSel.value : 'guitar6';
        const midiBases    = INSTRUMENT_MIDI_BASES[activeInst] || INSTRUMENT_MIDI_BASES['guitar6'];
        const audioToggle  = document.getElementById('cam-audio-toggle');
        const soundEnabled = audioToggle && audioToggle.checked;

        // ── Detecção de toques ────────────────────────────────────────────
        const activeTouches   = [];
        const currentTouchKeys = new Set();

        for (const hand of landmarksList) {
            for (const tipIdx of [8, 12, 16, 20]) { // Indicador, Médio, Anelar, Mínimo
                const pt = hand[tipIdx];
                if (!pt) continue;

                const x      = isMirrored ? (1 - pt.x) : pt.x;
                const mapped = window.fretboardMapper.getNoteAtPosition(x, pt.y);
                if (!mapped) continue;

                const midi      = midiBases[mapped.stringIndex] + mapped.fretPressed;
                const noteIndex = midi % 12;
                const isInScale = scaleIdxs.includes(noteIndex);
                const key       = `${mapped.stringIndex}_${mapped.fretPressed}`;

                currentTouchKeys.add(key);
                activeTouches.push({ ...mapped, midi, isInScale });

                if (isInScale) {
                    const cell = document.querySelector(`.note-dot[data-midi="${midi}"]`);
                    if (cell) { cell.classList.add('cam-glow-active'); activeGlowElements.push(cell); }

                    // Som apenas no onset (quando ENTRA na zona, não ao passar)
                    if (soundEnabled && !prevTouchKeys.has(key)) playFeedbackSound(midi);
                }
            }
        }

        prevTouchKeys = currentTouchKeys;

        // ── Render AR blocks ──────────────────────────────────────────────
        if (window.fretboardMapper.drawScaleBlocks) {
            window.fretboardMapper.drawScaleBlocks(
                ctx, canvasWidth, canvasHeight, scaleIdxs, rootIndex, activeTouches, midiBases
            );
        }
    }

    window.scaleDetectorEngine = { processNotes };

})();
