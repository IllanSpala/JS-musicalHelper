'use strict';
document.addEventListener('DOMContentLoaded', () => {

/* ── STATE ── */
const S = {
    mainChord: null, history: [], nodes: [], edges: [],
    nextId: 0, audioCtx: null, bpm: 90, quality: 'maj7',
    root: 'C', mode: 'major',
    routes: { resolution: true, tension: true, voice: true },
    simRunning: false, simHandle: null,
    pan: { x: 0, y: 0 }, zoom: 1,
    drag: { active: false, startX: 0, startY: 0, originX: 0, originY: 0 },
    cagedIdx: 0, cagedShapes: [], hoverNode: null,
    strumHandle: null, activeNotes: [],
};

/* ── DOM REFS ── */
const $canvas   = document.getElementById('ce-canvas-area');
const $vp       = document.getElementById('ce-viewport');
const $svg      = document.getElementById('ce-svg-layer');
const $graph    = document.getElementById('ce-graph-container');
const $hint     = document.getElementById('ce-start-hint');
const $bpmVal   = document.getElementById('ce-bpm-value');
const $histList = document.getElementById('ce-history-list');
const $tooltip  = document.getElementById('ce-caged-tooltip');
const $ttChord  = document.getElementById('ce-tt-chord');
const $ttNotes  = document.getElementById('ce-tt-notes');
const $ttRoute  = document.getElementById('ce-tt-route');
const $ttVl     = document.getElementById('ce-tt-vl');
const $cagedSvg = document.getElementById('ce-caged-svg');
const $cagedLet = document.getElementById('ce-caged-letter');
const $modal    = document.getElementById('ce-modal');
const $sidebar  = document.getElementById('ce-sidebar');
const $collapser= document.getElementById('ce-collapser');

/* ── WEBAUDIO ── */
function ctx() {
    if (!S.audioCtx) S.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (S.audioCtx.state === 'suspended') S.audioCtx.resume();
    return S.audioCtx;
}

/* Stop all currently playing notes with a quick fade-out */
function stopAllNotes() {
    if (!S.audioCtx) return;
    const now = S.audioCtx.currentTime;
    S.activeNotes.forEach(({ osc, env }) => {
        try {
            env.gain.cancelScheduledValues(now);
            env.gain.setTargetAtTime(0, now, 0.015);
            osc.stop(now + 0.1);
        } catch (e) {}
    });
    S.activeNotes = [];
}

/* ADSR note — triangle + slight detuning for warmth */
function playNote(pc, oct, startAt, dur = 3.5, vol = 0.14) {
    const c = ctx(), t = startAt;
    const freq = MT.pcToFreq(pc, oct);
    ['triangle', 'sine'].forEach((type, i) => {
        const osc = c.createOscillator();
        const env = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq * (i === 1 ? 1.003 : 1), t);
        const v = vol * (i === 1 ? 0.4 : 1);
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(v, t + 0.012);   // attack
        env.gain.setValueAtTime(v * 0.75, t + 0.15);      // decay
        env.gain.setValueAtTime(v * 0.65, t + dur - 1.8); // sustain hold
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur); // release
        osc.connect(env); env.connect(c.destination);
        osc.start(t); osc.stop(t + dur + 0.05);
        S.activeNotes.push({ osc, env });
    });
}

/* Arpejo hover: grave→agudo, 50ms gap, ADSR longo */
function arpeggiate(chord, dur = 3.2) {
    if (!chord) return;
    stopAllNotes(); // Impede o "stack" de acordes ao hoverar rapidamente
    const c = ctx(), now = c.currentTime;
    chord.pcs.forEach((pc, i) => {
        const oct = i === 0 ? 3 : (i < 3 ? 4 : 5);
        playNote(pc, oct, now + i * 0.052, dur, 0.13);
    });
}

/* Strumming pattern: D D U U D (down=low→high, up=high→low) */
const STRUM = [1, 1, -1, -1, 1]; // 1=down -1=up
function strumChord(chord, beatSec, accentFactor = 1) {
    if (!chord) return;
    stopAllNotes(); // Clear audio from previous chord before strumming new one
    const c = ctx(), now = c.currentTime;
    
    // Assign octaves BEFORE reversing for upstrums, so the voicing stays musically identical
    const voicings = chord.pcs.map((pc, i) => ({
        pc, oct: i === 0 ? 3 : (i < 3 ? 4 : 5)
    }));

    STRUM.forEach((dir, si) => {
        const ordered = dir === 1 ? [...voicings] : [...voicings].reverse();
        const tStrum  = now + si * (beatSec / STRUM.length);
        const vel     = (si === 0 ? 0.16 : 0.10) * accentFactor;
        ordered.forEach((v, ni) => {
            playNote(v.pc, v.oct, tStrum + ni * 0.018, beatSec * 1.8, vel);
        });
    });
}

function playProgression() {
    if (S.strumHandles) {
        S.strumHandles.forEach(h => clearTimeout(h));
    }
    S.strumHandles = [];
    stopAllNotes(); // Immediate silence if clicked rapidly

    const mainNode = S.nodes.find(n => n.type === 'main');
    const all = [...S.history, mainNode].filter(Boolean);
    if (!all.length) return;
    const beatSec = (60 / S.bpm) * 2;
    all.forEach((nd, i) => {
        const h = setTimeout(() => strumChord(nd.chord, beatSec), i * beatSec * 1000);
        S.strumHandles.push(h);
    });
}

/* ── PAN / ZOOM ── */
function applyTransform() {
    $vp.style.transform = `translate(${S.pan.x}px,${S.pan.y}px) scale(${S.zoom})`;
}

$canvas.addEventListener('mousedown', e => {
    if (e.target !== $canvas && e.target !== $vp &&
        e.target !== $svg && e.target !== $graph) return;
    S.drag = { active: true, startX: e.clientX, startY: e.clientY, originX: S.pan.x, originY: S.pan.y };
    $canvas.classList.add('dragging');
});
window.addEventListener('mousemove', e => {
    if (!S.drag.active) return;
    S.pan.x = S.drag.originX + (e.clientX - S.drag.startX);
    S.pan.y = S.drag.originY + (e.clientY - S.drag.startY);
    applyTransform();
});
window.addEventListener('mouseup', () => { S.drag.active = false; $canvas.classList.remove('dragging'); });

$canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    S.zoom = Math.min(3, Math.max(0.25, S.zoom * delta));
    applyTransform();
}, { passive: false });

document.getElementById('ce-zoom-in').onclick    = () => { S.zoom = Math.min(3, S.zoom * 1.2); applyTransform(); };
document.getElementById('ce-zoom-out').onclick   = () => { S.zoom = Math.max(.25, S.zoom / 1.2); applyTransform(); };
document.getElementById('ce-zoom-reset').onclick = () => { S.zoom = 1; S.pan = { x: 0, y: 0 }; applyTransform(); };

/* ── FORCE-DIRECTED SIMULATION ──────────────────────────────────
   Analogia: cada nó é uma partícula carregada positivamente.
   • Repulsão (Coulomb): F = k / d²  — afasta todos os pares.
   • Atração (mola): F = k_s * (d - rest)  — puxa arestas conectadas.
   • Damping: v *= 0.82  — dissipa energia até o sistema parar.
   Resultado: após ~60 frames, os nós chegam em equilíbrio sem sobreposição.
──────────────────────────────────────────────────────────────── */
const SIM = { K_REP: 18000, K_SPR: 0.04, REST: 220, DAMP: 0.80, MIN_V: 0.3 };

function runSimStep() {
    const n = S.nodes;
    if (n.length < 2) { S.simRunning = false; return; }

    let maxV = 0;

    // Init forces
    n.forEach(nd => { nd.fx = 0; nd.fy = 0; nd.vx = nd.vx || 0; nd.vy = nd.vy || 0; });

    // Repulsion between all pairs — O(n²), acceptable for n≤30
    for (let i = 0; i < n.length; i++) {
        for (let j = i + 1; j < n.length; j++) {
            const dx = n[j].x - n[i].x, dy = n[j].y - n[i].y;
            const dist = Math.max(Math.sqrt(dx*dx + dy*dy), 1);
            const f    = SIM.K_REP / (dist * dist);
            const ux   = dx / dist, uy = dy / dist;
            n[i].fx -= ux * f; n[i].fy -= uy * f;
            n[j].fx += ux * f; n[j].fy += uy * f;
        }
    }

    // Spring attraction along edges
    S.edges.forEach(e => {
        const a = n.find(nd => nd.id === e.fromId);
        const b = n.find(nd => nd.id === e.toId);
        if (!a || !b) return;
        const dx   = b.x - a.x, dy = b.y - a.y;
        const dist = Math.max(Math.sqrt(dx*dx + dy*dy), 1);
        const f    = SIM.K_SPR * (dist - SIM.REST);
        const ux   = dx / dist, uy = dy / dist;
        a.fx += ux * f; a.fy += uy * f;
        b.fx -= ux * f; b.fy -= uy * f;
    });

    // Integrate + damp (pin 'main' and 'history' nodes)
    n.forEach(nd => {
        if (nd.type === 'main') return; // nó principal fixo no centro
        nd.vx = (nd.vx + nd.fx) * SIM.DAMP;
        nd.vy = (nd.vy + nd.fy) * SIM.DAMP;
        nd.x += nd.vx; nd.y += nd.vy;
        const speed = Math.sqrt(nd.vx*nd.vx + nd.vy*nd.vy);
        if (speed > maxV) maxV = speed;
        if (nd.el) { nd.el.style.left = `${nd.x}px`; nd.el.style.top = `${nd.y}px`; }
    });

    refreshSvgEdges();

    // Continue until kinetic energy dies
    if (maxV > SIM.MIN_V) {
        S.simHandle = requestAnimationFrame(runSimStep);
    } else {
        S.simRunning = false;
    }
}

function startSim() {
    if (S.simRunning) cancelAnimationFrame(S.simHandle);
    S.simRunning = true;
    S.simHandle  = requestAnimationFrame(runSimStep);
}

/* ── SVG EDGES ── */
const ROUTE_COLOR = { resolution:'#22c55e', tension:'#f97316', voice:'#38bdf8' };

function refreshSvgEdges() {
    $svg.innerHTML = '';
    S.edges.forEach(e => {
        const a = S.nodes.find(n => n.id === e.fromId);
        const b = S.nodes.find(n => n.id === e.toId);
        if (!a || !b) return;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1',a.x); line.setAttribute('y1',a.y);
        line.setAttribute('x2',b.x); line.setAttribute('y2',b.y);
        line.setAttribute('stroke-linecap','round');

        if (e.isHistory) {
            line.setAttribute('stroke', '#a78bfa');
            line.setAttribute('stroke-width', '4');
            line.setAttribute('stroke-opacity', '0.7');
        } else {
            const cfg = { smooth:{w:3.5,d:'none',o:.8}, moderate:{w:2,d:'none',o:.5}, rough:{w:1.5,d:'6,4',o:.35} }[e.vlClass] || {w:1.5,d:'6,4',o:.35};
            line.setAttribute('stroke', ROUTE_COLOR[e.route] || '#fff');
            line.setAttribute('stroke-width', cfg.w);
            line.setAttribute('stroke-opacity', cfg.o);
            if (cfg.d !== 'none') line.setAttribute('stroke-dasharray', cfg.d);
        }
        $svg.appendChild(line);
    });
}

/* ── CAGED FRETBOARD SVG RENDERER ── */
function drawCagedSvg(shape) {
    if (!shape) return;
    const W=160, H=130, STRINGS=6, FRETS=5;
    const ml=28, mr=8, mt=24, mb=10;
    const fw = W - ml - mr, fh = H - mt - mb;
    const xs = i => ml + i * (fw / (STRINGS - 1));
    const yf = f => mt + f * (fh / FRETS);
    const ns = `http://www.w3.org/2000/svg`;

    $cagedSvg.innerHTML = '';
    $cagedSvg.setAttribute('width', W); $cagedSvg.setAttribute('height', H);

    const mk = (tag, attrs) => {
        const el = document.createElementNS(ns, tag);
        Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
        return el;
    };

    // Fret lines
    for (let f = 0; f <= FRETS; f++) {
        $cagedSvg.appendChild(mk('line', {
            x1: ml, y1: yf(f), x2: ml+fw, y2: yf(f),
            stroke: f === 0 ? '#888' : 'rgba(255,255,255,0.15)', 'stroke-width': f === 0 ? 2.5 : 1
        }));
    }

    // String lines
    for (let s = 0; s < STRINGS; s++) {
        $cagedSvg.appendChild(mk('line', {
            x1: xs(s), y1: mt, x2: xs(s), y2: mt+fh,
            stroke: 'rgba(255,255,255,0.25)', 'stroke-width': 1
        }));
    }

    // Capo label
    if (shape.capoFret > 1) {
        const t = mk('text', { x: ml - 20, y: yf(0.5) + 4, fill: '#a78bfa', 'font-size': '9', 'font-family': 'Space Grotesk,sans-serif' });
        t.textContent = `${shape.capoFret}fr`;
        $cagedSvg.appendChild(t);
    }

    // Barre
    if (shape.barre) {
        const { strFrom, strTo, fret } = shape.barre;
        const relFret = fret - shape.capoFret;
        if (relFret >= 0) {
            const x1 = xs(STRINGS - strTo), x2 = xs(STRINGS - strFrom);
            const yc  = yf(relFret) + (fh / FRETS) / 2;
            $cagedSvg.appendChild(mk('rect', { x: x1, y: yc - 6, width: x2-x1, height: 12, rx: 6, fill: 'rgba(167,139,250,0.5)' }));
        }
    }

    // Dots
    const tuning = { 1: 4, 2: 11, 3: 7, 4: 2, 5: 9, 6: 4 };
    shape.dots.forEach(([str, absFret]) => {
        const sx = xs(STRINGS - str);
        const noteName = MT.pcToName((tuning[str] + absFret) % 12);
        
        if (absFret === 0) {
            // Open string — circle above nut
            $cagedSvg.appendChild(mk('circle', { cx: sx, cy: mt - 8, r: 5, fill: '#1e1e2e', stroke: '#a78bfa', 'stroke-width': 1.5 }));
            const text = mk('text', { x: sx, y: mt - 5, fill: '#a78bfa', 'font-size': '7', 'font-family': 'Space Grotesk,sans-serif', 'text-anchor': 'middle' });
            text.textContent = noteName;
            $cagedSvg.appendChild(text);
        } else {
            const relFret = absFret - shape.capoFret;
            if (relFret < 0 || relFret >= FRETS) return;
            const yc = yf(relFret) + (fh / FRETS) / 2;
            $cagedSvg.appendChild(mk('circle', { cx: sx, cy: yc, r: 8, fill: '#a78bfa' }));
            const text = mk('text', { x: sx, y: yc + 3, fill: '#111', 'font-size': '8', 'font-family': 'Space Grotesk,sans-serif', 'text-anchor': 'middle', 'font-weight': 'bold' });
            text.textContent = noteName;
            $cagedSvg.appendChild(text);
        }
    });

    // Muted strings
    shape.muted.forEach(str => {
        const sx = xs(STRINGS - str);
        $cagedSvg.appendChild(mk('text', { x: sx, y: mt - 4, 'text-anchor': 'middle', fill: '#f87171', 'font-size': '11', 'font-family': 'sans-serif' })).textContent = '×';
    });

    $cagedLet.textContent = shape.cagedLetter;
}

/* ── TOOLTIP ── */
let tooltipTimer = null;

function showTooltip(nd) {
    clearTimeout(tooltipTimer);
    S.hoverNode = nd;
    S.cagedIdx  = 0;
    S.cagedShapes = MT.getCagedShapes(nd.chord.root, nd.chord.quality);

    $ttChord.textContent = nd.chord.name;
    $ttNotes.innerHTML   = nd.chord.notes.map(n => `<span class="ce-tooltip-note-badge">${n}</span>`).join('');

    const rl = { resolution:'🟢 Resolução', tension:'🟠 Tensão/Empréstimo', voice:'🔵 Retenção de Voz' };
    $ttRoute.textContent  = rl[nd.route] || '';
    $ttRoute.style.color  = ROUTE_COLOR[nd.route] || '#fff';
    $ttVl.innerHTML       = nd.vlScore !== undefined
        ? `VL Score: <strong>${nd.vlScore}</strong> · Notas comuns: <strong>${nd.common ?? 0}</strong>`
        : '';

    drawCagedSvg(S.cagedShapes[0]);
    $tooltip.classList.add('show');
    placeTooltip(nd);
}

/**
 * Tooltip placement: fixed position relative to the node's center.
 * This guarantees the tooltip won't appear under the cursor and block clicks.
 */
function placeTooltip(nd) {
    if (!nd || !nd.el) return;
    const rect = nd.el.getBoundingClientRect();
    const nodeCX = rect.left + rect.width / 2;
    const nodeCY = rect.top + rect.height / 2;

    const PAD = 12; // must match CSS padding on .ce-caged-tooltip
    const cardW = 256, cardH = 310;
    
    // Distância mínima do CENTRO do acorde até a borda visual do card.
    // Raio do nó + 16px (o padding de 12px da deadzone cobre a maior parte desse gap)
    const safeDist = (rect.width / 2) + 16; 

    // Tentativa inicial: colocar à direita do nó
    let cx = nodeCX + safeDist;
    let cy = nodeCY - (cardH / 2);

    // Se vazar na direita, joga para a esquerda do nó
    if (cx + cardW > window.innerWidth - 8) {
        cx = nodeCX - safeDist - cardW;
    }

    // Clamp vertical para não vazar a tela
    if (cy + cardH > window.innerHeight - 8) cy = window.innerHeight - cardH - 8;
    if (cy < 8) cy = 8;

    // Aplica a posição com o offset do padding (deadzone)
    $tooltip.style.left = `${cx - PAD}px`;
    $tooltip.style.top  = `${cy - PAD}px`;
}

function hideTooltip() {
    tooltipTimer = setTimeout(() => $tooltip.classList.remove('show'), 200);
}

// CAGED carousel
document.getElementById('ce-caged-prev').addEventListener('click', () => {
    if (!S.cagedShapes.length) return;
    S.cagedIdx = (S.cagedIdx - 1 + S.cagedShapes.length) % S.cagedShapes.length;
    drawCagedSvg(S.cagedShapes[S.cagedIdx]);
});
document.getElementById('ce-caged-next').addEventListener('click', () => {
    if (!S.cagedShapes.length) return;
    S.cagedIdx = (S.cagedIdx + 1) % S.cagedShapes.length;
    drawCagedSvg(S.cagedShapes[S.cagedIdx]);
});
// Keep tooltip alive when mouse is over it (deadzone = tooltip interior)
$tooltip.addEventListener('mouseenter', () => clearTimeout(tooltipTimer));
$tooltip.addEventListener('mouseleave', hideTooltip);
$tooltip.addEventListener('mousemove',  e => e.stopPropagation());

/* ── NODE CREATION ── */
function createNode(nd) {
    const el = document.createElement('div');
    el.className = `ce-node ce-node--${nd.type} ce-node-entering`;
    el.id = `ce-node-${nd.id}`;
    el.setAttribute('tabindex','0');
    el.setAttribute('role','button');
    el.setAttribute('aria-label', `Acorde ${nd.chord.name}`);
    el.style.left = `${nd.x}px`; el.style.top = `${nd.y}px`;
    el.innerHTML = `<span class="ce-node-chord">${nd.chord.name}</span>${nd.label ? `<span class="ce-node-route-badge">${nd.label}</span>` : ''}`;
    el.addEventListener('animationend', () => el.classList.remove('ce-node-entering'), { once:true });

    if (nd.type !== 'history') {
        el.addEventListener('mouseenter', () => { arpeggiate(nd.chord); showTooltip(nd); });
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('click', () => nd.type === 'main' ? promptMain() : expandToMain(nd));
        el.addEventListener('keydown', e => { if (e.key === 'Enter'||e.key===' ') { e.preventDefault(); el.click(); } });
    }

    $graph.appendChild(el);
    nd.el = el;
}

/* ── GRAPH LOGIC ── */
function canvasCenter() {
    const r = $canvas.getBoundingClientRect();
    // Convert to viewport coords accounting for pan/zoom
    return { x: (r.width/2 - S.pan.x) / S.zoom, y: (r.height/2 - S.pan.y) / S.zoom };
}

function initGraph() {
    cancelAnimationFrame(S.simHandle); S.simRunning = false;
    $graph.innerHTML = ''; $svg.innerHTML = '';
    S.nodes = []; S.edges = []; S.history = []; S.nextId = 0;
    $hint.classList.add('ce-hidden');

    const chord = MT.buildChord(S.root, S.quality);
    if (!chord) return;
    S.mainChord = chord;

    const c = canvasCenter();
    const mn = { id: S.nextId++, x: c.x, y: c.y, vx:0, vy:0, chord, type:'main', route:null, label:null, vlScore:0, vlClass:'smooth', common:chord.pcs.length };
    S.nodes.push(mn); createNode(mn);
    updateHistory();
    spawnSuggestions(mn);
    setTimeout(() => arpeggiate(chord, 2.5), 80);
}

function spawnSuggestions(parent) {
    const suggs = MT.expandChord(parent.chord, S.quality, {
        showResolution: S.routes.resolution,
        showTension:    S.routes.tension,
        showVoice:      S.routes.voice,
    });
    if (!suggs.length) return;

    // Place children randomly around parent to let physics resolve positions
    const R = 240;
    suggs.forEach((sug, i) => {
        const angle = (i / suggs.length) * Math.PI * 2;
        const jitter = (Math.random() - .5) * 40;
        const nd = {
            id: S.nextId++,
            x: parent.x + (R + jitter) * Math.cos(angle),
            y: parent.y + (R + jitter) * Math.sin(angle),
            vx: 0, vy: 0,
            chord: sug.chord, type: sug.route, route: sug.route,
            label: sug.label, vlScore: sug.vlScore, vlClass: sug.vlClass, common: sug.common,
            parentId: parent.id,
        };
        S.nodes.push(nd); createNode(nd);
        S.edges.push({ fromId: parent.id, toId: nd.id, vlClass: sug.vlClass, route: sug.route });
    });

    refreshSvgEdges();
    startSim(); // physics resolves overlaps
}

function expandToMain(nd) {
    arpeggiate(nd.chord, 2.8);
    
    const prevMain = S.nodes.find(n => n.type === 'main');
    if (prevMain) S.history.push(prevMain);

    // Demote nodes instead of deleting them to create a growing procedural web
    S.nodes.forEach(n => {
        if (n.id === nd.id) return;
        
        if (n.type === 'main') {
            n.type = 'history';
            n.isPath = true; // Mark as part of the selected historical path
            if (n.el) {
                n.el.classList.remove('ce-node--main');
                n.el.classList.add('ce-node--history-active');
            }
        } else if (!n.isPath) {
            // Only demote to inactive history if it's an unexplored branch
            n.type = 'history';
            if (n.el) {
                n.el.classList.remove('ce-node--resolution', 'ce-node--tension', 'ce-node--voice');
                n.el.classList.add('ce-node--history');
            }
        }
    });

    // Highlight the edge connecting to the new center
    S.edges.forEach(e => {
        if (e.toId === nd.id) e.isHistory = true;
    });

    // Instead of teleporting the node to the center (which breaks physics),
    // we PAN the camera to center the newly selected node.
    const c = canvasCenter();
    S.pan.x = c.x - (nd.x * S.zoom);
    S.pan.y = c.y - (nd.y * S.zoom);
    applyTransform();

    nd.type = 'main'; 
    nd.route = null; 
    nd.label = null;
    S.mainChord = nd.chord;

    // Rebuild main node element so it gets the glowing 'main' styling
    const oldEl = document.getElementById(`ce-node-${nd.id}`);
    if (oldEl) oldEl.remove(); nd.el = null;
    createNode(nd);

    refreshSvgEdges();
    updateHistory();
    spawnSuggestions(nd);
}

function promptMain() {
    const input = prompt('Digite a cifra do acorde:\n(ex: Cmaj7, F#m7, Bb7)', S.mainChord?.name || 'Cmaj7');
    if (!input) return;
    const p = MT.parseChordString(input);
    if (!p) { alert('Cifra inválida.'); return; }
    S.root = p.root; S.quality = p.quality;
    document.getElementById('ce-root-select').value    = S.root;
    document.getElementById('ce-quality-select').value = S.quality;
    initGraph();
}

function updateHistory() {
    const mainNode = S.nodes.find(n => n.type === 'main');
    const all = [...S.history, mainNode].filter(Boolean);
    
    // Update counter
    const counter = document.getElementById('ce-node-counter');
    if (counter) counter.textContent = `${all.length} acorde${all.length > 1 ? 's' : ''}`;

    if (!all.length) { $histList.innerHTML = '<p class="ce-history-empty">Nenhum acorde ainda.</p>'; return; }
    
    $histList.innerHTML = '';
    all.forEach((nd, i) => {
        if (i > 0) {
            const arrow = document.createElement('span');
            arrow.className = 'ce-chip-arrow';
            arrow.textContent = '→';
            $histList.appendChild(arrow);
        }
        const chip = document.createElement('div');
        chip.className = 'ce-history-chip';
        chip.textContent = nd.chord.name;
        
        chip.addEventListener('mouseenter', () => {
            arpeggiate(nd.chord);
            // Use chip as the positioning anchor for the tooltip
            showTooltip({ ...nd, el: chip });
        });
        chip.addEventListener('mouseleave', hideTooltip);
        
        $histList.appendChild(chip);
    });
}

/* ── CONTROLS ── */
const $root    = document.getElementById('ce-root-select');
const $mode    = document.getElementById('ce-mode-select');
const $bpm     = document.getElementById('ce-bpm-slider');
const $qual    = document.getElementById('ce-quality-select');
const $chkRes  = document.getElementById('ce-route-resolution');
const $chkTen  = document.getElementById('ce-route-tension');
const $chkVoi  = document.getElementById('ce-route-voice');

$root.addEventListener('change', () => { S.root = $root.value; });
$mode.addEventListener('change', () => { S.mode = $mode.value; });
$qual.addEventListener('change', () => { S.quality = $qual.value; });
$chkRes.addEventListener('change', () => { S.routes.resolution = $chkRes.checked; });
$chkTen.addEventListener('change', () => { S.routes.tension    = $chkTen.checked; });
$chkVoi.addEventListener('change', () => { S.routes.voice      = $chkVoi.checked; });

$bpm.addEventListener('input', () => {
    S.bpm = +$bpm.value; $bpmVal.textContent = S.bpm;
    const p = ((S.bpm-40)/(240-40)*100).toFixed(1);
    $bpm.style.setProperty('--slider-pct', `${p}%`);
});

document.getElementById('ce-btn-play').addEventListener('click', playProgression);
document.getElementById('ce-btn-reset').addEventListener('click', () => {
    S.root = $root.value; S.quality = $qual.value; initGraph();
});

// Randomize base settings
document.getElementById('ce-btn-random').addEventListener('click', () => {
    const roots = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const modes = ['major','minor','dorian','mixolydian','lydian','phrygian','locrian'];
    const qualities = ['maj7','7','m7','m7b5','dim7','maj','min'];

    const rand = arr => arr[Math.floor(Math.random() * arr.length)];
    
    S.root = rand(roots);
    S.mode = rand(modes);
    S.quality = rand(qualities);
    
    $root.value = S.root;
    $mode.value = S.mode;
    $qual.value = S.quality;
    
    initGraph();
});

// Sidebar collapse (desktop)
$collapser && $collapser.addEventListener('click', () => {
    $sidebar.classList.toggle('collapsed');
});

// Mobile toggle — with overlay close
const $mobileToggle  = document.getElementById('ce-mobile-toggle');
const $mobileOverlay = document.getElementById('ce-mobile-overlay');

function openMobileSidebar()  { $sidebar.classList.add('mobile-open');    $mobileOverlay && $mobileOverlay.classList.add('active'); }
function closeMobileSidebar() { $sidebar.classList.remove('mobile-open'); $mobileOverlay && $mobileOverlay.classList.remove('active'); }

$mobileToggle  && $mobileToggle.addEventListener('click', () => {
    $sidebar.classList.contains('mobile-open') ? closeMobileSidebar() : openMobileSidebar();
});
$mobileOverlay && $mobileOverlay.addEventListener('click', closeMobileSidebar);

// Help modal
document.getElementById('ce-help-btn').addEventListener('click', () => $modal.classList.add('active'));
document.getElementById('ce-modal-close').addEventListener('click', () => $modal.classList.remove('active'));
$modal.addEventListener('click', e => { if (e.target === $modal) $modal.classList.remove('active'); });

/* ── INIT ── */
const initPct = ((90-40)/(240-40)*100).toFixed(1);
$bpm.style.setProperty('--slider-pct', `${initPct}%`);
setTimeout(initGraph, 180);
});
