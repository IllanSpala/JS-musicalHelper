/**
 * fretboardMapper.js — Fretboard Calibration Engine
 * JS-musicalHelper | Mapeador de Escalas
 *
 * CALIBRAÇÃO POR 2 CLIQUES:
 *  1. Usuário clica no NUT (traste 0 — junto à cabeça do violão)
 *  2. Usuário clica no Traste 12 (onde ficam os dois pontos incrustados)
 *  → Sistema calcula todos os trastes automaticamente usando temperamento igual
 *
 * Não depende de hand-landmarks, funciona para qualquer posição ou instrumento.
 */

(function () {
    'use strict';

    const fretboardState = {
        isCalibrated:      false,
        wantsAutoCalibrate: false,
        showSkeleton:      true,
        numFrets:          24,
        strings:           ['E', 'A', 'D', 'G', 'B', 'e'],
        bounds: {
            nutTop:       { x: 0.08, y: 0.3 },
            nutBottom:    { x: 0.08, y: 0.7 },
            fret12Top:    { x: 0.90, y: 0.32 },
            fret12Bottom: { x: 0.90, y: 0.68 }
        }
    };

    let _canvas = null;

    // ── Calibração por clique ──────────────────────────────────────────────
    let _clickPoints  = [];
    let _clickMode    = false;   // true = aguardando cliques do usuário
    let _clickPhase   = 0;       // 0=aguardando NUT, 1=aguardando Fret12

    const CLICK_INSTRUCTIONS = [
        '📍 Clique no NUT do violão (entre a cabeça e o 1° traste)',
        '📍 Clique no Traste 12 (onde ficam os dois pontos do braço)'
    ];

    // ── 1. Matemática Principal ───────────────────────────────────────────

    function getStringPoint(s, isNut) {
        const n  = fretboardState.strings.length;
        const t  = s / (n - 1);
        const pT = isNut ? fretboardState.bounds.nutTop    : fretboardState.bounds.fret12Top;
        const pB = isNut ? fretboardState.bounds.nutBottom : fretboardState.bounds.fret12Bottom;
        return { x: pT.x + t * (pB.x - pT.x), y: pT.y + t * (pB.y - pT.y) };
    }

    function getFretRatio(fret) {
        return 2 * (1 - Math.pow(2, -fret / 12));
    }

    function getPoint(s, fret) {
        const nut = getStringPoint(s, true);
        const f12 = getStringPoint(s, false);
        const r   = getFretRatio(fret);
        return { x: nut.x + r * (f12.x - nut.x), y: nut.y + r * (f12.y - nut.y) };
    }

    function getNoteAtPosition(x, y) {
        if (!fretboardState.isCalibrated) return null;

        let bestString = -1, bestDist = Infinity, bestFret = -1;
        const n = fretboardState.strings.length;

        for (let s = 0; s < n; s++) {
            const nut = getStringPoint(s, true);
            const f12 = getStringPoint(s, false);
            const dx = f12.x - nut.x, dy = f12.y - nut.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            if (len === 0) continue;
            const ux = dx/len, uy = dy/len;
            const vx = x - nut.x, vy = y - nut.y;
            const proj = vx*ux + vy*uy;
            const perp = Math.abs(vx*uy - vy*ux);
            if (perp < bestDist) {
                bestDist = perp;
                bestString = s;
                const r = proj / len;
                const val = 1 - r/2;
                bestFret = (val > 0) ? -12 * Math.log2(val) : fretboardState.numFrets;
            }
        }

        if (bestDist > 0.12 || bestFret < -1 || bestFret > fretboardState.numFrets + 1) return null;
        return { stringIndex: bestString, stringName: fretboardState.strings[bestString],
                 fretFloat: bestFret, fretPressed: Math.max(0, Math.ceil(bestFret)) };
    }

    // ── 2. Desenho ────────────────────────────────────────────────────────

    function drawCalibrationOverlay(ctx, cw, ch) {
        if (!_clickMode) return;

        // Escurece levemente o canvas
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, cw, ch);

        // Instrução central
        const msg = CLICK_INSTRUCTIONS[_clickPhase] || '';
        ctx.font = 'bold 16px "Space Grotesk", sans-serif';
        const mw = ctx.measureText(msg).width;
        const bx = cw/2 - mw/2 - 16, by = ch/2 - 22, bw = mw + 32, bh = 40;

        ctx.fillStyle   = 'rgba(5,5,20,0.92)';
        ctx.strokeStyle = '#00FFB4';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#00FFB4';
        ctx.fillText(msg, bx + 16, by + 26);

        // Mostra ponto já clicado
        if (_clickPoints.length === 1) {
            const p = _clickPoints[0];
            ctx.beginPath();
            ctx.arc(p.x * cw, p.y * ch, 10, 0, Math.PI * 2);
            ctx.fillStyle   = '#00FFB4';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth   = 2;
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('NUT', p.x * cw + 14, p.y * ch + 4);
        }

        ctx.restore();
    }

    function drawGrid(ctx, cw, ch) {
        // Overlay de calibração por clique (tem prioridade)
        drawCalibrationOverlay(ctx, cw, ch);

        if (!fretboardState.isCalibrated) return;

        ctx.save();
        const numStrings = fretboardState.strings.length;
        const alpha = 0.55;

        // Cordas
        ctx.strokeStyle = `rgba(91, 80, 214, ${alpha})`;
        ctx.lineWidth   = 1.5;
        for (let s = 0; s < numStrings; s++) {
            const p0   = getPoint(s, 0);
            const pMax = getPoint(s, fretboardState.numFrets);
            ctx.beginPath();
            ctx.moveTo(p0.x * cw, p0.y * ch);
            ctx.lineTo(pMax.x * cw, pMax.y * ch);
            ctx.stroke();
        }

        // Trastes
        for (let f = 0; f <= fretboardState.numFrets; f++) {
            const isMarker = [0, 12].includes(f);
            ctx.strokeStyle = isMarker ? (f === 0 ? 'rgba(255,184,0,0.8)' : 'rgba(91,80,214,0.9)') : `rgba(255,255,255,${alpha * 0.5})`;
            ctx.lineWidth   = isMarker ? 2.5 : 1;
            const tp = getPoint(0, f);
            const bp = getPoint(numStrings - 1, f);
            ctx.beginPath();
            ctx.moveTo(tp.x * cw, tp.y * ch);
            ctx.lineTo(bp.x * cw, bp.y * ch);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawScaleBlocks(ctx, cw, ch, scaleIndices, rootIndex, activeTouches, midiBases) {
        if (!fretboardState.isCalibrated) return;

        ctx.save();
        const numStrings = fretboardState.strings.length;

        for (let s = 0; s < numStrings; s++) {
            for (let f = 1; f <= fretboardState.numFrets; f++) {
                const midi      = midiBases[s] + f;
                const noteIndex = midi % 12;
                if (!scaleIndices.includes(noteIndex)) continue;

                const isRoot    = (noteIndex === rootIndex);
                const isTouched = activeTouches.some(t => t.stringIndex === s && t.fretPressed === f);

                ctx.beginPath();
                for (let pass = 0; pass < 4; pass++) {
                    const sOff = (pass === 0 || pass === 3) ? -0.4 : 0.4;
                    const fOff = (pass === 0 || pass === 1) ? -0.95 : -0.05;
                    const safeS = Math.max(0, Math.min(numStrings - 1, s + sOff));
                    const safeF = Math.max(0, f + fOff);
                    const pt = getPoint(safeS, safeF);
                    if (pass === 0) ctx.moveTo(pt.x * cw, pt.y * ch);
                    else           ctx.lineTo(pt.x * cw, pt.y * ch);
                }
                ctx.closePath();

                if (isTouched) {
                    ctx.fillStyle   = 'rgba(0, 255, 180, 0.9)';
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth   = 2.5;
                    ctx.shadowColor = '#00FFB4';
                    ctx.shadowBlur  = 18;
                } else if (isRoot) {
                    ctx.fillStyle   = 'rgba(0, 255, 180, 0.45)';
                    ctx.strokeStyle = 'rgba(0, 255, 180, 0.7)';
                    ctx.lineWidth   = 1.5;
                    ctx.shadowBlur  = 0;
                } else {
                    ctx.fillStyle   = 'rgba(91, 80, 214, 0.35)';
                    ctx.strokeStyle = 'rgba(91, 80, 214, 0.6)';
                    ctx.lineWidth   = 1;
                    ctx.shadowBlur  = 0;
                }

                ctx.fill();
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // ── 3. Calibração por 2 Cliques ───────────────────────────────────────

    function startClickCalibration() {
        if (!_canvas) {
            console.warn('[fretboardMapper] Canvas não inicializado.');
            return;
        }
        _clickPoints = [];
        _clickPhase  = 0;
        _clickMode   = true;
        fretboardState.isCalibrated = false;
        localStorage.removeItem('jsMusicalHelper_fretboardCalib');

        _canvas.style.cursor = 'crosshair';
        _canvas.addEventListener('click', _handleCalibClick);
        console.log('[fretboardMapper] Calibração por clique iniciada. Aguardando NUT...');
    }

    function _handleCalibClick(e) {
        const rect   = _canvas.getBoundingClientRect();
        const scaleX = _canvas.width  / rect.width;
        const scaleY = _canvas.height / rect.height;
        const nx     = ((e.clientX - rect.left) * scaleX) / _canvas.width;
        const ny     = ((e.clientY - rect.top)  * scaleY) / _canvas.height;

        _clickPoints.push({ x: nx, y: ny });
        console.log(`[fretboardMapper] Clique ${_clickPoints.length}: (${nx.toFixed(3)}, ${ny.toFixed(3)})`);

        if (_clickPoints.length === 1) {
            _clickPhase = 1;
        } else if (_clickPoints.length >= 2) {
            _clickMode = false;
            _canvas.removeEventListener('click', _handleCalibClick);
            _canvas.style.cursor = '';
            _computeFromTwoClicks(_clickPoints[0], _clickPoints[1]);
        }
    }

    function _computeFromTwoClicks(nutPt, fret12Pt) {
        // Vetor NUT → Fret12 define a direção do braço
        const dx  = fret12Pt.x - nutPt.x;
        const dy  = fret12Pt.y - nutPt.y;
        const len = Math.hypot(dx, dy) || 0.01;

        // Perpendicular ao braço (largura)
        const perpX = -dy / len;
        const perpY =  dx / len;

        // Largura do braço ≈ 7% do comprimento nut→fret12 (que é metade da escala total)
        // Para violão de 650mm: escala total = 2*len, largura nut ≈ 43mm ≈ 6.6% de escala
        const halfW = len * 0.07;

        fretboardState.bounds = {
            nutTop:       { x: nutPt.x    + perpX * halfW,        y: nutPt.y    + perpY * halfW },
            nutBottom:    { x: nutPt.x    - perpX * halfW,        y: nutPt.y    - perpY * halfW },
            fret12Top:    { x: fret12Pt.x + perpX * halfW * 1.1,  y: fret12Pt.y + perpY * halfW * 1.1 },
            fret12Bottom: { x: fret12Pt.x - perpX * halfW * 1.1,  y: fret12Pt.y - perpY * halfW * 1.1 }
        };

        fretboardState.isCalibrated = true;
        saveCalibration();
        console.log('[fretboardMapper] ✅ Calibrado por 2 cliques:', fretboardState.bounds);
    }

    // ── 4. Storage ────────────────────────────────────────────────────────

    function saveCalibration() {
        localStorage.setItem('jsMusicalHelper_fretboardCalib', JSON.stringify(fretboardState.bounds));
    }

    function loadCalibration() {
        const saved = localStorage.getItem('jsMusicalHelper_fretboardCalib');
        if (saved) {
            try {
                fretboardState.bounds = JSON.parse(saved);
                fretboardState.isCalibrated = true;
                console.log('[fretboardMapper] Calibração restaurada do localStorage.');
            } catch(e) {}
        }
    }

    function resetCalibration() {
        localStorage.removeItem('jsMusicalHelper_fretboardCalib');
        fretboardState.isCalibrated = false;
        _clickPoints = [];
        _clickMode   = false;
        console.log('[fretboardMapper] Calibração resetada.');
    }

    // ── 5. Init UI ────────────────────────────────────────────────────────

    function initCalibrationUI(canvasElement) {
        _canvas = canvasElement;
        loadCalibration();

        // Botão de calibração por clique
        const calibBtn = document.getElementById('cam-autocalib-btn');
        if (calibBtn) {
            calibBtn.innerHTML = '📍 Calibrar Braço';
            calibBtn.addEventListener('click', () => {
                startClickCalibration();
                calibBtn.innerHTML = '⏳ Clique no NUT...';
                calibBtn.style.color = '#00FFB4';

                // Observar conclusão e atualizar botão
                const poll = setInterval(() => {
                    if (!_clickMode) {
                        clearInterval(poll);
                        if (fretboardState.isCalibrated) {
                            calibBtn.innerHTML = '✅ Braço Calibrado!';
                            calibBtn.style.color = '#00FFB4';
                        } else {
                            calibBtn.innerHTML = '📍 Calibrar Braço';
                            calibBtn.style.color = '';
                        }
                        setTimeout(() => {
                            calibBtn.innerHTML = '📍 Calibrar Braço';
                            calibBtn.style.color = '';
                        }, 3000);
                    }
                }, 300);
            });
        }

        // Toggle do esqueleto
        const skeletonToggle = document.getElementById('cam-skeleton-toggle');
        if (skeletonToggle) {
            fretboardState.showSkeleton = skeletonToggle.checked;
            skeletonToggle.addEventListener('change', e => {
                fretboardState.showSkeleton = e.target.checked;
            });
        }
    }

    // ── 6. Instrument config ──────────────────────────────────────────────

    function setInstrument(type) {
        if      (type === 'bass4')   fretboardState.strings = ['E', 'A', 'D', 'G'];
        else if (type === 'bass5')   fretboardState.strings = ['B', 'E', 'A', 'D', 'G'];
        else if (type === 'guitar7') fretboardState.strings = ['B', 'E', 'A', 'D', 'G', 'B', 'e'];
        else                         fretboardState.strings = ['E', 'A', 'D', 'G', 'B', 'e'];
    }

    // ── Expose API ────────────────────────────────────────────────────────
    window.fretboardMapper = {
        state:              fretboardState,
        initUI:             initCalibrationUI,
        drawGrid:           drawGrid,
        drawScaleBlocks:    drawScaleBlocks,
        getNoteAtPosition:  getNoteAtPosition,
        setNumFrets:        (n) => { fretboardState.numFrets = n; },
        setInstrument:      setInstrument,
        resetCalibration:   resetCalibration,
        startClickCalib:    startClickCalibration,
        // Mantido por compatibilidade — não faz nada crítico agora
        autoCalibrateFromHand: () => { console.log('[fretboardMapper] autoCalibrateFromHand desabilitado. Use startClickCalib().'); }
    };

})();
