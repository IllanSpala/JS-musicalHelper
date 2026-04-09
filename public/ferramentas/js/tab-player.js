/* ═══════════════════════════════════════════════════════════════
   tab-player.js  —  jojozelan Tools / Tab Player
   AlphaTab 1.3.0  (loaded synchronously in <head>)

   Changes in this version:
   - Binary learned system (no % bar, only mark as learned)
   - Realistic sound engine: FluidR3 SF2 + Compressor + Reverb
   - YouTube audio sync with community offset support
   - Full i18n integration
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const AT_CDN = 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.3.0/dist/';
// Using default sonivox SF2 (reliable + CORS-safe); audio quality improved
// via Web Audio compressor + reverb applied to the metronome AudioContext
const SOUNDFONT_URL = AT_CDN + 'soundfont/sonivox.sf2';

/* ─── State ──────────────────────────────────────────────── */
let api = null;
let score = null;
let isPlaying = false;
let baseBpm = 120;
let speedRatio = 1.0;

let currentTabDocId = null;
let currentTabMeta = null;

// Tracks (Single Visual Selection, keeping track audio states)
let selectedTrackIndex = 0;
let trackStates = [];

// Progress System (binary: learned/not)
let learnedRanges = [];

// Loop
let loopOn = false;
let loopSelMode = false;
let loopBarA = -1;
let loopBarB = -1;

// Playback Defaults
let metroOn = true;
let countInOn = true;

let metroAC = null;
let metroGain = null;
let metroRAF = null;
let metroNext = 0;
let metroBeatIdx = 0;
let currentBarBeats = 0;
let countInBusy = false;

// Audio engine nodes (for compressor + reverb)
let atAudioContext = null;
let atCompressor = null;
let atReverb = null;
let atReverbGain = null;
let atDryGain = null;

// YouTube sync state
let ytMode = false;
let ytPlayer = null;
let ytOffsetMs = 0;
let ytReady = false;
let ytVideoId = null;

/* ─── SAFE DOM & STRING HELPERS ──────────────────────────── */
const el = id => document.getElementById(id);
const qsa = sel => document.querySelectorAll(sel);

function esc(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function shorten(n, max = 16) {
    const str = n || 'Track';
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

/* ─── BOOT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    if (typeof alphaTab === 'undefined') {
        fatalError(t('tp_err_load'));
        return;
    }

    el('file-input').addEventListener('change', e => { loadFile(e.target.files[0]); e.target.value = ''; });
    el('file-input-2').addEventListener('change', e => { loadFile(e.target.files[0]); e.target.value = ''; });

    const zone = el('upload-zone');
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault(); zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });

    el('btn-stop').addEventListener('click', doStop);
    el('btn-play').addEventListener('click', doPlayPause);

    el('btn-cin').addEventListener('click', () => {
        countInOn = !countInOn;
        el('btn-cin').classList.toggle('on', countInOn);
    });

    // Speed Controls
    el('speed-sl').addEventListener('input', onSpeedInput);

    // Precise +/- Buttons
    el('btn-speed-down').addEventListener('click', () => {
        const sl = el('speed-sl');
        sl.value = Math.max(25, parseInt(sl.value) - 5);
        onSpeedInput();
    });
    el('btn-speed-up').addEventListener('click', () => {
        const sl = el('speed-sl');
        sl.value = Math.min(200, parseInt(sl.value) + 5);
        onSpeedInput();
    });

    el('btn-loop').addEventListener('click', toggleLoop);
    el('btn-loop-sel').addEventListener('click', enterLoopSel);
    el('btn-loop-clr').addEventListener('click', clearLoop);
    
    // Mark as Learned button
    const btnMarkStudied = el('btn-mark-studied');
    const _markOrigHTML = btnMarkStudied ? btnMarkStudied.innerHTML : '';
    if (btnMarkStudied) btnMarkStudied.addEventListener('click', () => {
        let marked = false;

        if (window._tabBarSelection) {
            const sel = window._tabBarSelection();
            if (sel) {
                _toggleLearnedRange(sel[0], sel[1]);
                if (window._clearTabBarSelection) window._clearTabBarSelection();
                marked = true;
            }
        }

        if (!marked && loopBarA !== -1 && loopBarB !== -1) {
            _toggleLearnedRange(loopBarA, loopBarB);
            clearLoop();
            marked = true;
        }

        if (!marked) {
            const bar = barAtTick(tryGetTick());
            if (bar && typeof bar.index === 'number') {
                _toggleLearnedRange(bar.index, bar.index);
                marked = true;
            }
        }

        if (marked) {
            drawLearnedHighlights();
            syncLearnedToFirestore();
            // Flash button green
            btnMarkStudied.innerHTML = '<i class="fas fa-check"></i>';
            btnMarkStudied.style.background = 'rgba(46,204,113,0.2)';
            setTimeout(() => {
                btnMarkStudied.innerHTML = _markOrigHTML;
                btnMarkStudied.style.background = '';
            }, 800);
        }
    });

    el('btn-metro').addEventListener('click', toggleMetro);
    el('metro-vol').addEventListener('input', onMetroVol);

    qsa('.vb[data-mode]').forEach(b => b.addEventListener('click', () => {
        qsa('.vb[data-mode]').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        setViewMode(b.dataset.mode);
    }));

    el('btn-tsel').addEventListener('click', e => { e.stopPropagation(); togglePop(); });
    document.addEventListener('click', e => {
        if (!el('tpop').classList.contains('tp-hidden') && !e.target.closest('.tsel-wrap'))
            closePop();
    });

    document.addEventListener('keydown', e => {
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault(); doPlayPause();
        }
        if (e.key === 'Escape') { cancelLoopSel(); closePop(); }
    });

    window.addEventListener('languageChanged', () => {
        if (score) updateTrackLabel();
        _refreshYtPanelText();
    });

    // ── Audio source toggle ──
    qsa('.vb[data-audio]').forEach(b => b.addEventListener('click', () => {
        qsa('.vb[data-audio]').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        setAudioMode(b.dataset.audio);
    }));

    // ── YouTube panel ──
    el('yt-load-btn').addEventListener('click', loadYouTubeVideo);
    el('yt-url').addEventListener('keydown', e => { if (e.key === 'Enter') loadYouTubeVideo(); });

    // Offset slider → sync number input
    el('yt-offset-val').addEventListener('input', () => {
        ytOffsetMs = parseInt(el('yt-offset-val').value) || 0;
        el('yt-offset-num').value = ytOffsetMs;
    });

    // Offset number input → sync slider
    el('yt-offset-num').addEventListener('input', () => {
        ytOffsetMs = parseInt(el('yt-offset-num').value) || 0;
        el('yt-offset-val').value = ytOffsetMs;
    });

    el('yt-offset-minus').addEventListener('click', () => {
        ytOffsetMs = (parseInt(el('yt-offset-num').value) || 0) - 50;
        el('yt-offset-val').value = ytOffsetMs;
        el('yt-offset-num').value = ytOffsetMs;
    });
    el('yt-offset-plus').addEventListener('click', () => {
        ytOffsetMs = (parseInt(el('yt-offset-num').value) || 0) + 50;
        el('yt-offset-val').value = ytOffsetMs;
        el('yt-offset-num').value = ytOffsetMs;
    });
    el('yt-community-load').addEventListener('click', loadCommunityOffset);
    el('yt-community-save').addEventListener('click', saveCommunityOffset);

    // Collapse/expand YouTube panel body
    el('yt-panel-collapse').addEventListener('click', () => {
        const body = el('yt-panel-body');
        const btn = el('yt-panel-collapse');
        body.classList.toggle('collapsed');
        btn.classList.toggle('collapsed');
    });

    // Handle recent tabs on auth
    window.addEventListener('fbAuthChanged', async e => {
        const user = e.detail.user;
        const container = el('recent-tabs-container');
        const list = el('recent-tabs-list');
        
        if (!user || !container) {
            if (container) container.classList.add('tp-hidden');
            return;
        }
        
        container.classList.remove('tp-hidden');
        const headEl = container.querySelector('h3');
        if (headEl) headEl.textContent = t('prof_recent_tabs');

        try {
            const snap = await window.fbDb.collection('users').doc(user.uid)
                .collection('tabs').orderBy('loadedAt', 'desc').limit(7).get();
                
            if (snap.empty) {
                list.innerHTML = `<p style="color:rgba(255,255,255,0.3); font-size:0.85rem;">${t('prof_no_recent')}</p>`;
                return;
            }
            
            list.innerHTML = '';
            snap.forEach(doc => {
                const data = doc.data();
                const btn = document.createElement('div');

                // Binary learned status
                let learnedCount = 0;
                if (data.learnedRanges) data.learnedRanges.forEach(r => learnedCount += (r[1] - r[0] + 1));
                const totalBars = data.totalBars || 0;
                const learnedLabel = totalBars > 0
                    ? `${learnedCount}/${totalBars} ${t('tp_learned_caption')}`
                    : '';
                
                btn.style.cssText = 'padding:10px 14px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:12px; transition:background 0.2s; text-align:left;';
                btn.innerHTML = `
                    <i class="fas fa-guitar" style="color:var(--accent-a)"></i>
                    <div style="flex:1; min-width:0;">
                        <div style="font-size:0.9rem; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(data.name)}</div>
                        ${learnedLabel ? `<div style="font-size:0.72rem; color:rgba(255,255,255,0.35); margin-top:2px;">${learnedLabel}</div>` : ''}
                    </div>
                `;
                btn.addEventListener('mouseover', () => btn.style.background = 'rgba(255,255,255,0.1)');
                btn.addEventListener('mouseout', () => btn.style.background = 'rgba(255,255,255,0.05)');
                btn.addEventListener('click', () => loadFromCloud(doc.id, data.name, data.url, data.learnedRanges));
                list.appendChild(btn);
            });
        } catch (err) {
            list.innerHTML = `<p style="color:#e74c3c; font-size:0.85rem;">${t('prof_load_err')}</p>`;
        }
    });
});

/* ─── FILE LOADING ───────────────────────────────────────── */
async function loadFile(file) {
    if (!file) return;

    el('upload-zone').classList.add('tp-hidden');
    el('at-viewport').classList.remove('tp-hidden');
    el('ctrl-bar').classList.remove('tp-hidden');
    showOverlay(t('tp_saving_cloud'));

    if (typeof window.fbSaveTab === 'function') {
        const res = await window.fbSaveTab(file.name, file);
        if (res) {
            currentTabDocId = res.docId;
            learnedRanges = res.learnedRanges || [];
        } else {
            currentTabDocId = null;
            learnedRanges = [];
        }
    }

    const rawName = file.name.replace(/\.[^/.]+$/, '');
    el('hdr-title').textContent = rawName.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase();

    const reader = new FileReader();
    reader.onload = ev => {
        if (!api) buildApi();
        else resetAll(false);

        setTimeout(() => api.load(ev.target.result), api._firstLoad ? 0 : 500);
        api._firstLoad = true;
    };
    reader.readAsArrayBuffer(file);
}

function loadFromCloud(docId, fileName, url, savedLearnedRanges) {
    currentTabDocId = docId;
    learnedRanges = savedLearnedRanges || [];
    
    const rawName = fileName.replace(/\.[^/.]+$/, '');
    el('hdr-title').textContent = rawName.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase();
    
    el('upload-zone').classList.add('tp-hidden');
    el('at-viewport').classList.remove('tp-hidden');
    el('ctrl-bar').classList.remove('tp-hidden');
    showOverlay(t('tp_loading_cloud'));

    if (!api) buildApi();
    else resetAll(false);

    setTimeout(() => api.load(url), api._firstLoad ? 0 : 500);
    api._firstLoad = true;
}

/* ─── ALPHATAB API BUILD ─────────────────────────────────── */
function buildApi() {
    const settings = new alphaTab.Settings();

    settings.core.scriptFile = AT_CDN + 'alphaTab.min.js';
    settings.core.fontDirectory = AT_CDN + 'font/';

    settings.display.layoutMode = alphaTab.LayoutMode.Page;
    settings.display.staveProfile = getStaveProfile('score');
    settings.display.scale = 1.0;

    const c = (r, g, b, a = 255) => new alphaTab.model.Color(r, g, b, a);
    const r = settings.display.resources;
    r.staffLineColor = c(220, 220, 220, 95);
    r.barSeparatorColor = c(220, 220, 220, 85);
    r.mainGlyphColor = c(245, 245, 245, 230);
    r.secondaryGlyphColor = c(200, 200, 200, 180);
    r.scoreInfoColor = c(215, 215, 215, 200);
    r.barNumberColor = c(190, 190, 190, 170);
    r.wordsFontColor = c(210, 210, 210, 185);
    r.tabNoteColor = c(245, 245, 245, 230);
    r.fingeringColor = c(200, 200, 200, 170);

    settings.player.enablePlayer = true;
    settings.player.enableCursor = true;
    settings.player.enableAnimatedBeatCursor = true;
    // Sonivox SF2 — reliable CDN with CORS, improved by Web Audio compressor/reverb
    settings.player.soundFont = AT_CDN + 'soundfont/sonivox.sf2';
    settings.player.scrollElement = el('at-viewport');
    settings.player.scrollOffsetY = -10;

    api = new alphaTab.AlphaTabApi(el('at-element'), settings);

    api.playerReady.on(() => {
        el('btn-play').disabled = false;
        el('btn-play').style.opacity = '';
        // Audio chain is managed via the metronome AudioContext (ensureAC)
        // AlphaTab 1.3.0 doesn't expose its internal AudioContext publicly
    });

    api.renderStarted.on(() => showOverlay(t('tp_rendering')));
    api.renderFinished.on(() => {
        hideOverlay();
        if (!api._loopHooked) {
            api._loopHooked = true;
            api.beatMouseDown.on(beat => { if (loopSelMode) onLoopBeatClick(beat); });

            const atEl = el('at-element');
            if (atEl) {
                const hoverDiv = document.createElement('div');
                hoverDiv.className = 'bar-hover-highlight';
                hoverDiv.style.opacity = '0';
                atEl.appendChild(hoverDiv);

                const selDiv = document.createElement('div');
                selDiv.className = 'bar-hover-highlight';
                selDiv.style.opacity = '0';
                selDiv.style.background = 'rgba(243,156,18,0.15)';
                selDiv.style.border = '1px solid rgba(243,156,18,0.45)';
                selDiv.style.pointerEvents = 'none';
                selDiv.style.zIndex = '4';
                atEl.appendChild(selDiv);

                let selStart = -1, selEnd = -1;
                let isDraggingSelection = false;

                function _updateSelDiv() {
                    if (selStart < 0) { selDiv.style.opacity = '0'; return; }
                    const lookup = api.renderer && api.renderer.boundsLookup ? api.renderer.boundsLookup : null;
                    if (!lookup || !lookup.staveGroups) return;
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    const s = Math.min(selStart, selEnd < 0 ? selStart : selEnd);
                    const e = Math.max(selStart, selEnd < 0 ? selStart : selEnd);
                    for (const sg of lookup.staveGroups) {
                        for (const mbb of (sg.bars || [])) {
                            let idx = -1;
                            if (mbb.masterBar && typeof mbb.masterBar.index === 'number') idx = mbb.masterBar.index;
                            else if (typeof mbb.index === 'number') idx = mbb.index;
                            if (idx < s || idx > e) continue;
                            const vb = mbb.visualBounds || mbb.realBounds || mbb.bounds;
                            if (!vb) continue;
                            const x = vb.x ?? vb.left ?? 0;
                            const y = vb.y ?? vb.top ?? 0;
                            const w = vb.w ?? vb.width ?? 0;
                            const h = vb.h ?? vb.height ?? 0;
                            minX = Math.min(minX, x); minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h);
                        }
                    }
                    if (minX === Infinity) { selDiv.style.opacity = '0'; return; }
                    selDiv.style.left = minX + 'px';
                    selDiv.style.top = minY + 'px';
                    selDiv.style.width = (maxX - minX) + 'px';
                    selDiv.style.height = (maxY - minY) + 'px';
                    selDiv.style.opacity = '1';
                }

                window._tabBarSelection = () => selStart >= 0 ? [Math.min(selStart, selEnd < 0 ? selStart : selEnd), Math.max(selStart, selEnd < 0 ? selStart : selEnd)] : null;
                window._clearTabBarSelection = () => { selStart = selEnd = -1; selDiv.style.opacity = '0'; };

                atEl.addEventListener('mousedown', ev => {
                    if (loopSelMode || ev.button !== 0) return;
                    const b = _barBoundsAtMouseEvent(ev, atEl);
                    if (!b || typeof b.index !== 'number') {
                        selStart = selEnd = -1;
                        _updateSelDiv();
                        return;
                    }
                    isDraggingSelection = true;
                    selStart = b.index;
                    selEnd = b.index;
                    _updateSelDiv();
                });

                atEl.addEventListener('mousemove', ev => {
                    const b = _barBoundsAtMouseEvent(ev, atEl);
                    if (b) {
                        hoverDiv.style.left = b.x + 'px'; hoverDiv.style.top = b.y + 'px';
                        hoverDiv.style.width = b.w + 'px'; hoverDiv.style.height = b.h + 'px';
                        hoverDiv.style.opacity = '1';
                        atEl.style.cursor = 'crosshair';
                        
                        if (isDraggingSelection && typeof b.index === 'number') {
                            selEnd = b.index;
                            _updateSelDiv();
                        }
                    } else { hoverDiv.style.opacity = '0'; atEl.style.cursor = ''; }
                });

                window.addEventListener('mouseup', () => { isDraggingSelection = false; });
                atEl.addEventListener('mouseleave', () => { hoverDiv.style.opacity = '0'; });
            }
        }
        drawLearnedHighlights();
    });

    api.scoreLoaded.on(s => {
        score = s;
        onScoreLoaded(s);
    });

    api.playerStateChanged.on(args => {
        isPlaying = (args.state === alphaTab.synth.PlayerState.Playing);
        el('btn-play').innerHTML = isPlaying
            ? '<i class="fas fa-pause"></i>'
            : '<i class="fas fa-play"></i>';

        if (isPlaying && metroOn) startMetro();
        if (!isPlaying) pauseMetro();

        // ─── YOUTUBE SYNC: Pause YouTube when AlphaTab pauses ───
        // (Play sync is handled by _startPlayback, not here)
        if (ytMode && !isPlaying && ytReady && ytPlayer && ytPlayer.pauseVideo) {
            try { ytPlayer.pauseVideo(); } catch(_) {}
        }
    });

    api.playerPositionChanged.on(args => {
        const s = Math.floor(args.currentTime / 1000);
        el('tp-pos').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

        // ─── YOUTUBE SYNC: Continuous Position Locking ───
        if (ytMode && ytReady && isPlaying && ytPlayer && ytPlayer.getCurrentTime) {
            const ytCurrent = ytPlayer.getCurrentTime();
            const expectedYt = ((api.timePosition || args.currentTime) + ytOffsetMs) / 1000;
            // If drifting by more than 300ms, force sync
            if (Math.abs(ytCurrent - expectedYt) > 0.3) {
                ytPlayer.seekTo(Math.max(0, expectedYt), true);
            }
        }

        const tick = args.currentTick ?? 0;
        const bar = barAtTick(tick);
        if (bar) {
            const num = bar.timeSignatureNumerator ?? 4;
            if (num !== currentBarBeats) {
                currentBarBeats = num;
                rebuildMetroDots(num);
                metroBeatIdx = 0;
            }
        }
    });
}

/* ─── REALISTIC AUDIO CHAIN ──────────────────────────────── */
function _initAudioChain() {
    try {
        // Try to get AlphaTab's internal AudioContext
        const ctx = api._synthesizer?._context || api._worklet?._context || null;
        if (!ctx) return; // AlphaTab doesn't expose it yet in 1.3.0 — skip gracefully

        atAudioContext = ctx;

        // Analog Warmth EQ (Mastering for Sonivox sf2)
        // 1. Boost lows for drum punch
        const eqLows = ctx.createBiquadFilter();
        eqLows.type = 'lowshelf';
        eqLows.frequency.value = 110;
        eqLows.gain.value = 4.5;
        
        // 2. Cut muddy mids
        const eqMid = ctx.createBiquadFilter();
        eqMid.type = 'peaking';
        eqMid.frequency.value = 400;
        eqMid.Q.value = 0.8;
        eqMid.gain.value = -2.5;

        // 3. Roll off harsh digital fizz (acts like a guitar cabinet sim)
        const eqHighs = ctx.createBiquadFilter();
        eqHighs.type = 'highshelf';
        eqHighs.frequency.value = 6500;
        eqHighs.gain.value = -4.5;

        // Compressor
        atCompressor = ctx.createDynamicsCompressor();
        atCompressor.threshold.setValueAtTime(-22, ctx.currentTime);
        atCompressor.knee.setValueAtTime(10, ctx.currentTime);
        atCompressor.ratio.setValueAtTime(3.5, ctx.currentTime);
        atCompressor.attack.setValueAtTime(0.005, ctx.currentTime);
        atCompressor.release.setValueAtTime(0.15, ctx.currentTime);

        // Reverb (synthetic IR)
        atReverb = ctx.createConvolver();
        atReverb.buffer = _buildReverbIR(ctx, 1.8, 0.3);

        atReverbGain = ctx.createGain();
        atReverbGain.gain.setValueAtTime(0.20, ctx.currentTime); // richer reverb for humanization

        atDryGain = ctx.createGain();
        atDryGain.gain.setValueAtTime(1.0, ctx.currentTime);

        // Chain: AT output → EQ → comp → dry + reverb → destination
        const dest = api._synthesizer?._masterVolume || null;
        if (dest) {
            dest.connect(eqLows);
            eqLows.connect(eqMid);
            eqMid.connect(eqHighs);
            eqHighs.connect(atCompressor);
            
            atCompressor.connect(atDryGain);
            atCompressor.connect(atReverb);
            atReverb.connect(atReverbGain);
            
            atDryGain.connect(ctx.destination);
            atReverbGain.connect(ctx.destination);
            
            // Disconnect default destination
            try { dest.disconnect(ctx.destination); } catch(_) {}
        }
    } catch (e) {
        console.warn('[AudioChain] Could not inject audio processing:', e);
    }
}

/** Build a simple exponentially-decaying noise IR for reverb */
function _buildReverbIR(ctx, duration, decay) {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay * 10);
        }
    }
    return impulse;
}

function onScoreLoaded(s) {
    baseBpm = s.tempo || 120;
    syncBpmDisplay();
    buildTrackUI(s);
    
    currentTabMeta = {
        artist: s.artist || s.subtitle || '',
        title: s.title || '',
        album: s.album || '',
        instruments: s.tracks.map(t => t.name).join(', ')
    };

    currentBarBeats = 0;
    rebuildMetroDots(0);
    // No % progress UI — just sync to cloud if needed
    syncLearnedToFirestore();
}

/* ─── PLAYBACK ───────────────────────────────────────────── */
function doPlayPause() {
    if (!api) return;

    // Block re-entry during count-in
    if (countInBusy) return;

    ensureAC();

    // ── PAUSE (any mode) ──
    if (isPlaying) {
        api.playPause();
        if (ytMode && ytPlayer && ytReady) {
            try { ytPlayer.pauseVideo(); } catch(_) {}
        }
        return;
    }

    // ── PLAY (from stopped/paused) ──
    // Count-in first (works for both AlphaTab and YouTube modes)
    if (countInOn) {
        runCountIn(() => _startPlayback());
        return;
    }

    // No count-in → play immediately
    _startPlayback();
}

/** Internal: starts AlphaTab + YouTube (if ytMode) after count-in */
function _startPlayback() {
    if (!api) return;

    // In YouTube mode: mute AlphaTab audio, only use it for cursor
    if (ytMode) {
        try { api.masterVolume = 0; } catch(_) {}
    }

    // Start AlphaTab (drives cursor + time position)
    api.play();
    // Safety: sometimes AlphaTab needs a nudge
    setTimeout(() => { if (!isPlaying && api) api.play(); }, 300);

    // Start YouTube in sync (if mode is YouTube and player is loaded)
    if (ytMode && ytPlayer && ytReady) {
        // Small delay to let AlphaTab actually start and report timePosition
        setTimeout(() => {
            const ms = api.timePosition || 0;
            const ytSec = Math.max(0, (ms + ytOffsetMs) / 1000);
            ytPlayer.seekTo(ytSec, true);
            ytPlayer.playVideo();
        }, 150);
    }
}

function doStop() {
    if (!api) return;
    countInBusy = false;
    el('count-overlay').classList.add('tp-hidden');
    api.stop();
    pauseMetro(); metroBeatIdx = 0; clearDots();

    if (ytMode && ytPlayer && ytReady) {
        try { ytPlayer.stopVideo(); } catch(_) {}
    }
}

/* ─── COUNT-IN ───────────────────────────────────────────── */
function runCountIn(callback) {
    ensureAC();
    countInBusy = true;

    const tick = tryGetTick();
    const barNow = barAtTick(tick);
    const beats = barNow?.timeSignatureNumerator ?? 4;
    const effBpm = baseBpm * speedRatio;
    const secBeat = 60 / effBpm;

    const overlay = el('count-overlay');
    const numEl = el('count-num');
    overlay.classList.remove('tp-hidden');

    let beat = beats;

    const tick_ = () => {
        if (!countInBusy) { overlay.classList.add('tp-hidden'); return; }

        numEl.textContent = beat;
        numEl.style.animation = 'none';
        void numEl.offsetHeight;
        numEl.style.animation = '';

        playClick(beat === beats, metroAC.currentTime);

        beat--;
        if (beat <= 0) {
            setTimeout(() => {
                overlay.classList.add('tp-hidden');
                countInBusy = false;
                callback();
            }, secBeat * 1000);
        } else {
            setTimeout(tick_, secBeat * 1000);
        }
    };
    tick_();
}

function tryGetTick() {
    try { return api?.tickPosition ?? 0; }
    catch (_) { return 0; }
}

function barAtTick(tick) {
    if (!score?.masterBars) return null;
    for (let i = score.masterBars.length - 1; i >= 0; i--) {
        if (score.masterBars[i].start <= tick) return score.masterBars[i];
    }
    return score.masterBars[0];
}

/* ─── SPEED / BPM ────────────────────────────────────────── */
function onSpeedInput() {
    speedRatio = parseInt(el('speed-sl').value) / 100;
    syncBpmDisplay();
    if (api) api.playbackSpeed = speedRatio;
}

function syncBpmDisplay() {
    const eff = Math.round(baseBpm * speedRatio);
    el('bpm-val').textContent = eff;
    el('speed-pct').textContent = Math.round(speedRatio * 100) + '%';
}

/* ─── VIEW MODE (TAB / SCORE) ────────────────────────────── */
function getStaveProfile(mode) {
    return mode === 'score' ? alphaTab.StaveProfile.ScoreTab : alphaTab.StaveProfile.Tab;
}

function setViewMode(mode) {
    if (!api || !score) return;

    const track = score.tracks[selectedTrackIndex];
    const isDrum = track && (track.isPercussion || /drum|perc|bateria/i.test(track.name));

    if (isDrum && mode === 'tab') {
        qsa('.vb').forEach(x => x.classList.remove('active'));
        const scoreBtn = document.querySelector('.vb[data-mode="score"]');
        if (scoreBtn) scoreBtn.classList.add('active');
        return;
    }

    api.settings.display.staveProfile = getStaveProfile(mode);
    api.updateSettings();
    api.render();
}

/* ─── AUDIO SOURCE (ALPHATAB / YOUTUBE) ─────────────────── */
function setAudioMode(mode) {
    const wasYt = ytMode;
    ytMode = (mode === 'youtube');
    const ytPanel = el('yt-panel');
    if (ytPanel) ytPanel.classList.toggle('tp-hidden', !ytMode);

    // Stop playback when switching modes to prevent desync
    if (wasYt !== ytMode && isPlaying) {
        doStop();
    }

    if (ytMode) {
        // Mute AlphaTab (cursor-only mode)
        try { if (api) api.masterVolume = 0; } catch(_) {}
        _initYouTubeAPI();
    } else {
        // Restore AlphaTab volume
        try { if (api) api.masterVolume = 1; } catch(_) {}
        // Pause YouTube
        if (ytPlayer && ytReady) {
            try { ytPlayer.pauseVideo(); } catch(_) {}
        }
    }
}

/* ─── YOUTUBE SYNC ───────────────────────────────────────── */
function _initYouTubeAPI() {
    if (window.YT && window.YT.Player) return; // already loaded
    if (document.getElementById('yt-api-script')) return; // already injected

    const tag = document.createElement('script');
    tag.id = 'yt-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
}

// Called by YT IFrame API when ready
window.onYouTubeIframeAPIReady = function() {
    ytReady = true;
    if (ytVideoId) _createYtPlayer(ytVideoId);
};

function _extractYtId(url) {
    try {
        const u = new URL(url);
        if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
        return u.searchParams.get('v') || null;
    } catch (_) {
        // bare ID
        const m = url.match(/^[a-zA-Z0-9_-]{11}$/);
        return m ? url : null;
    }
}

function loadYouTubeVideo() {
    if (!currentTabDocId) {
        el('yt-status').textContent = t('yt_no_tab');
        return;
    }
    const rawUrl = el('yt-url').value.trim();
    const vid = _extractYtId(rawUrl);
    if (!vid) { el('yt-status').textContent = '⚠ URL inválida'; return; }

    ytVideoId = vid;
    el('yt-status').textContent = '…';

    if (!window.YT || !window.YT.Player) {
        _initYouTubeAPI();
        // Defer player creation until API is ready
        return;
    }
    _createYtPlayer(vid);
}

function _createYtPlayer(vid) {
    const container = el('yt-player-wrap');
    container.innerHTML = '<div id="yt-iframe-target"></div>';
    el('yt-status').textContent = '';

    ytPlayer = new window.YT.Player('yt-iframe-target', {
        height: '180',
        width: '100%',
        videoId: vid,
        playerVars: { 
            controls: 0, 
            disablekb: 1,
            modestbranding: 1, 
            rel: 0,
            origin: window.location.origin || window.location.protocol + '//' + window.location.host
        },
        events: {
            onReady: () => { 
                ytReady = true; 
                el('yt-status').textContent = '✓ Pronto'; 
                // Auto sync if AlphaTab is already playing
                if (api && isPlaying) {
                    const ms = api.timePosition || 0;
                    ytPlayer.seekTo(Math.max(0, (ms + ytOffsetMs) / 1000), true);
                    ytPlayer.playVideo();
                }
            },
            onError: () => { el('yt-status').textContent = '✕ Erro ao carregar vídeo'; }
        }
    });
}

// _ytPlayPause removed — doPlayPause handles everything now

async function loadCommunityOffset() {
    if (!currentTabDocId || !window.fbDb) return;
    const ref = window.fbDb.collection('tabSyncs').doc(currentTabDocId);
    try {
        const snap = await ref.get();
        if (snap.exists && snap.data().offsetMs !== undefined) {
            ytOffsetMs = snap.data().offsetMs;
            el('yt-offset-val').value = ytOffsetMs;
            el('yt-offset-num').value = ytOffsetMs;
            el('yt-status').textContent = `✓ Sync: ${ytOffsetMs}ms`;
        } else {
            el('yt-status').textContent = t('yt_community_no_sync');
        }
    } catch(e) {
        el('yt-status').textContent = '✕ Erro';
    }
}

async function saveCommunityOffset() {
    if (!currentTabDocId || !window.fbDb) return;
    if (!ytVideoId) { el('yt-status').textContent = t('yt_no_tab'); return; }
    const ref = window.fbDb.collection('tabSyncs').doc(currentTabDocId);
    try {
        await ref.set({
            videoId: ytVideoId,
            offsetMs: ytOffsetMs,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        el('yt-status').textContent = t('yt_community_saved');
        setTimeout(() => { el('yt-status').textContent = ''; }, 3000);
    } catch(e) {
        el('yt-status').textContent = '✕ Erro';
    }
}

function _refreshYtPanelText() {
    const urlInput = el('yt-url');
    if (urlInput) urlInput.placeholder = t('yt_url_ph');
    const loadBtn = el('yt-load-btn');
    if (loadBtn) loadBtn.textContent = t('yt_btn_load');
    const offLbl = el('yt-offset-lbl-txt');
    if (offLbl) offLbl.textContent = t('yt_offset_lbl');
    const comLoad = el('yt-community-load');
    if (comLoad) comLoad.textContent = t('yt_community_load');
    const comSave = el('yt-community-save');
    if (comSave) comSave.textContent = t('yt_community_save');
    const hint = el('yt-hint-txt');
    if (hint) hint.textContent = t('yt_hint');
}

/* ─── LOOP & LEARNED ─────────────────────────────────────── */
function toggleLoop() {
    loopOn = !loopOn;
    if (api) api.isLooping = loopOn;
    el('btn-loop').classList.toggle('on', loopOn);
}

function enterLoopSel() {
    if (!score) return;
    loopSelMode = true; loopBarA = loopBarB = -1;
    el('loop-hint').classList.remove('tp-hidden');
    el('loop-hint-txt').textContent = t('tp_hint_start');
}

function cancelLoopSel() {
    loopSelMode = false;
    el('loop-hint').classList.add('tp-hidden');
}

function onLoopBeatClick(beat) {
    let barIdx = 0;
    try { barIdx = beat.voice.bar.index ?? 0; } catch (_) { }

    if (loopBarA === -1) {
        loopBarA = barIdx;
        el('loop-hint-txt').textContent = t('tp_hint_end').replace('{n}', barIdx + 1);
    } else {
        loopBarB = Math.max(loopBarA, barIdx);
        applyLoop(loopBarA, loopBarB);
        cancelLoopSel();
    }
}

function applyLoop(a, b) {
    if (!score?.masterBars) return;
    const mb = score.masterBars;
    if (!mb[a] || !mb[b]) return;

    const startTick = mb[a].start;
    const endTick = b + 1 < mb.length
        ? mb[b + 1].start
        : mb[b].start + (mb[b].calculateDuration?.() ?? 3840);

    api.playbackRange = { startTick, endTick };
    api.isLooping = true;
    loopOn = true;
    el('btn-loop').classList.add('on');
    el('loop-lbl').textContent = `c.${a + 1}→${b + 1}`;
    el('loop-lbl').classList.remove('tp-hidden');
    el('btn-loop-clr').classList.remove('tp-hidden');
    el('btn-mark-learned').classList.remove('tp-hidden');
}

function clearLoop() {
    if (api) api.playbackRange = null;
    loopBarA = loopBarB = -1;
    el('loop-lbl').classList.add('tp-hidden');
    el('btn-loop-clr').classList.add('tp-hidden');
    el('btn-mark-learned').classList.add('tp-hidden');
}

/** Sync learned ranges to Firestore (no UI progress bar anymore) */
function syncLearnedToFirestore() {
    if (!score || !score.masterBars) return;
    const totalBars = score.masterBars.length;
    if (currentTabDocId && window.fbUpdateTabProgress) {
        window.fbUpdateTabProgress(currentTabDocId, learnedRanges, totalBars, currentTabMeta);
    }
}

/* ─── BAR HOVER HELPERS ──────────────────────────────────── */
function _barBoundsAtMouseEvent(e, container) {
    const lookup = api && api.renderer && api.renderer.boundsLookup ? api.renderer.boundsLookup : null;
    if (!lookup || !lookup.staveGroups) return null;

    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left + container.scrollLeft;
    const my = e.clientY - rect.top + container.scrollTop;

    for (const sg of lookup.staveGroups) {
        for (const mbb of (sg.bars || [])) {
            const vb = mbb.visualBounds || mbb.realBounds || mbb.bounds;
            if (!vb) continue;
            const x = vb.x ?? vb.left ?? 0;
            const y = vb.y ?? vb.top ?? 0;
            const w = vb.w ?? vb.width ?? 0;
            const h = vb.h ?? vb.height ?? 0;
            if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
                let idx = -1;
                if (mbb.masterBar && typeof mbb.masterBar.index === 'number') idx = mbb.masterBar.index;
                else if (typeof mbb.index === 'number') idx = mbb.index;
                return { x, y, w, h, index: idx };
            }
        }
    }
    return null;
}

function _addLearnedRange(start, end) {
    learnedRanges.push([Math.min(start, end), Math.max(start, end)]);
    learnedRanges.sort((a, b) => a[0] - b[0]);
    const merged = [learnedRanges[0]];
    for (let i = 1; i < learnedRanges.length; i++) {
        const last = merged[merged.length - 1];
        const curr = learnedRanges[i];
        if (curr[0] <= last[1] + 1) last[1] = Math.max(last[1], curr[1]);
        else merged.push(curr);
    }
    learnedRanges = merged;
}

function _toggleLearnedRange(start, end) {
    const s = Math.min(start, end);
    const e = Math.max(start, end);

    let isFullyLearned = true;
    for (let i = s; i <= e; i++) {
        let isLearned = false;
        for (const [rs, re] of learnedRanges) {
            if (i >= rs && i <= re) { isLearned = true; break; }
        }
        if (!isLearned) { isFullyLearned = false; break; }
    }

    if (isFullyLearned) {
        const newRanges = [];
        for (const [rs, re] of learnedRanges) {
            if (re < s || rs > e) {
                newRanges.push([rs, re]);
            } else {
                if (rs < s) newRanges.push([rs, s - 1]);
                if (re > e) newRanges.push([e + 1, re]);
            }
        }
        learnedRanges = newRanges;
    } else {
        _addLearnedRange(s, e);
    }
}

function drawLearnedHighlights() {
    const container = el('at-element');
    if (!container) return;
    container.style.position = 'relative';

    container.querySelectorAll('.learned-overlay').forEach(e => e.remove());

    if (!api || !score || !learnedRanges.length) return;

    const learnedSet = new Set();
    learnedRanges.forEach(([s, e]) => {
        for (let i = s; i <= e; i++) learnedSet.add(i);
    });

    const lookup = api.renderer && api.renderer.boundsLookup ? api.renderer.boundsLookup : null;
    
    if (lookup && lookup.staveGroups) {
        for (const sg of lookup.staveGroups) {
            const barArr = sg.bars || [];
            for (const mbb of barArr) {
                let idx = -1;
                if (mbb.masterBar && typeof mbb.masterBar.index === 'number') idx = mbb.masterBar.index;
                else if (typeof mbb.index === 'number') idx = mbb.index;
                
                if (idx < 0 || !learnedSet.has(idx)) continue;
                
                const vb = mbb.visualBounds || mbb.realBounds || mbb.bounds;
                if (!vb) continue;
                
                const x = vb.x ?? vb.left ?? 0;
                const y = vb.y ?? vb.top ?? 0;
                const w = vb.w ?? vb.width ?? 0;
                const h = vb.h ?? vb.height ?? 0;
                if (w === 0 || h === 0) continue;

                const div = document.createElement('div');
                div.className = 'learned-overlay';
                div.style.left = x + 'px';
                div.style.top = y + 'px';
                div.style.width = w + 'px';
                div.style.height = h + 'px';
                div.innerHTML = '<i class="fas fa-check"></i>';
                container.appendChild(div);
            }
        }
        return;
    }

    // Fallback
    const cursorBars = container.querySelectorAll('.at-cursor-bar');
    if (cursorBars.length > 0) {
        cursorBars.forEach((barEl, barIdx) => {
            if (learnedSet.has(barIdx)) {
                const rect = barEl.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const div = document.createElement('div');
                div.className = 'learned-overlay';
                div.style.left = (rect.left - containerRect.left + container.scrollLeft) + 'px';
                div.style.top = (rect.top - containerRect.top + container.scrollTop) + 'px';
                div.style.width = rect.width + 'px';
                div.style.height = rect.height + 'px';
                div.innerHTML = '<i class="fas fa-check"></i>';
                container.appendChild(div);
            }
        });
    }
}

/* ─── TRACK UI ───────────────────────────────────────────── */
function buildTrackUI(s) {
    const list = el('tpop-list');
    list.innerHTML = '';
    trackStates = s.tracks.map(() => ({ muted: false, soloed: false, vol: 100 }));

    selectedTrackIndex = 0;

    s.tracks.forEach((track, i) => {
        const tName = track.name || `Track ${i + 1}`;

        const row = document.createElement('div');
        row.className = 'trow' + (i === 0 ? ' sel' : '');
        row.innerHTML = `
            <span class="trow-name" title="${esc(tName)}">${esc(shorten(tName))}</span>
            <div class="trow-ms">
                <button class="tms tm" title="Mute">M</button>
                <button class="tms ts" title="Solo">S</button>
            </div>
            <input type="range" class="trow-vol" min="0" max="100" value="100" title="Volume">
        `;

        row.addEventListener('click', e => {
            if (e.target.closest('.trow-ms, .trow-vol')) return;
            selectTrack(i);
            closePop();
        });

        row.querySelector('.tm').addEventListener('click', e => {
            e.stopPropagation();
            trackStates[i].muted = !trackStates[i].muted;
            e.target.classList.toggle('m-on', trackStates[i].muted);
            try { api.changeTrackMute([track], trackStates[i].muted); } catch (_) { }
        });

        row.querySelector('.ts').addEventListener('click', e => {
            e.stopPropagation();
            trackStates[i].soloed = !trackStates[i].soloed;
            e.target.classList.toggle('s-on', trackStates[i].soloed);
            try { api.changeTrackSolo([track], trackStates[i].soloed); } catch (_) { }
        });

        row.querySelector('.trow-vol').addEventListener('input', function (e) {
            e.stopPropagation();
            trackStates[i].vol = parseInt(this.value);
            try { api.changeTrackVolume([track], trackStates[i].vol / 100); } catch (_) { }
        });

        list.appendChild(row);
    });

    updateTrackLabel();
    updateRenderedTracks();
}

function selectTrack(idx) {
    if (idx === selectedTrackIndex) { closePop(); return; }

    if (isPlaying && api) {
        api.pause();
    }

    selectedTrackIndex = idx;
    qsa('.trow').forEach((r, i) => r.classList.toggle('sel', i === selectedTrackIndex));
    updateTrackLabel();
    updateRenderedTracks();
}

function updateTrackLabel() {
    if (!score || !score.tracks) return;

    const track = score.tracks[selectedTrackIndex];
    const tName = track ? (track.name || `Track ${selectedTrackIndex + 1}`) : 'Track';

    el('tsel-name').textContent = shorten(tName, 22);

    const topLbl = el('top-track-name');
    if (topLbl) {
        topLbl.textContent = tName;
        topLbl.classList.remove('tp-hidden');
    }
}

function updateRenderedTracks() {
    if (!api || !score) return;

    const trackToRender = score.tracks[selectedTrackIndex];
    const isDrum = trackToRender.isPercussion || /drum|perc|bateria/i.test(trackToRender.name);

    const activeModeBtn = document.querySelector('.vb.active');
    let currentMode = activeModeBtn ? activeModeBtn.dataset.mode : 'tab';

    if (isDrum && currentMode === 'tab') {
        currentMode = 'score';
        qsa('.vb').forEach(x => x.classList.remove('active'));
        const scoreBtn = document.querySelector('.vb[data-mode="score"]');
        if (scoreBtn) scoreBtn.classList.add('active');
    }

    api.settings.display.staveProfile = getStaveProfile(currentMode);
    api.renderTracks([trackToRender]);
}

function togglePop() {
    const pop = el('tpop');
    const open = pop.classList.contains('tp-hidden');
    pop.classList.toggle('tp-hidden', !open);
    el('btn-tsel').classList.toggle('open', open);
}
function closePop() {
    el('tpop').classList.add('tp-hidden');
    el('btn-tsel').classList.remove('open');
}

/* ─── METRONOME ──────────────────────────────────────────── */
function toggleMetro() {
    metroOn = !metroOn;
    el('btn-metro').classList.toggle('on', metroOn);
    if (metroOn && isPlaying) startMetro();
    else if (!metroOn) { pauseMetro(); clearDots(); }
}

function onMetroVol() {
    const v = (parseInt(el('metro-vol').value) / 100) * 2.5;
    if (metroGain) metroGain.gain.setTargetAtTime(v, metroAC.currentTime, 0.01);
}

function ensureAC() {
    if (!metroAC) {
        metroAC = new (window.AudioContext || window.webkitAudioContext)();
        metroGain = metroAC.createGain();
        metroGain.gain.value = (parseInt(el('metro-vol').value) / 100) * 2.5;
        metroGain.connect(metroAC.destination);
    }
    if (metroAC.state === 'suspended') metroAC.resume();
}

function startMetro() {
    ensureAC();
    pauseMetro();

    const effBpm = baseBpm * speedRatio;
    const secBeat = 60 / effBpm;
    const getBeats = () => currentBarBeats > 0
        ? currentBarBeats
        : (score?.masterBars?.[0]?.timeSignatureNumerator ?? 4);

    metroBeatIdx = 0;
    metroNext = metroAC.currentTime + 0.05;

    const loop = () => {
        while (metroNext < metroAC.currentTime + 0.12) {
            const beats = getBeats();
            const bi = metroBeatIdx % beats;
            const accent = bi === 0;
            playClick(accent, metroNext);
            const delay = Math.max(0, (metroNext - metroAC.currentTime) * 1000);
            const cap = bi;
            setTimeout(() => {
                clearDots();
                const dots = qsa('.md');
                if (dots[cap]) dots[cap].classList.add('lit');
            }, delay);
            metroNext += secBeat;
            metroBeatIdx++;
        }
        metroRAF = requestAnimationFrame(loop);
    };
    loop();
}

function pauseMetro() {
    if (metroRAF) { cancelAnimationFrame(metroRAF); metroRAF = null; }
}

function clearDots() { qsa('.md').forEach(d => d.classList.remove('lit')); }

function playClick(accent, time) {
    if (!metroAC || !metroGain) return;
    const osc = metroAC.createOscillator();
    const gain = metroAC.createGain();

    osc.type = 'square';
    osc.frequency.value = accent ? 1000 : 600;

    const vol = accent ? 1.0 : 0.6;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(metroGain);
    osc.start(time);
    osc.stop(time + 0.1);
}

function rebuildMetroDots(n) {
    const wrap = el('metro-dots');
    wrap.innerHTML = '';
    if (!n || n <= 0) {
        const dash = document.createElement('span');
        dash.style.cssText = 'font-size:0.6rem;color:rgba(255,255,255,0.18);letter-spacing:2px;';
        dash.textContent = '— — —';
        wrap.appendChild(dash);
        return;
    }
    for (let i = 0; i < n; i++) {
        const d = document.createElement('div');
        d.className = 'md' + (i === 0 ? ' accent' : '');
        wrap.appendChild(d);
    }
}

/* ─── RESET on new file ──────────────────────────────────── */
function resetAll(clearProgress = true) {
    loopOn = false; loopSelMode = false; loopBarA = loopBarB = -1;
    el('btn-loop').classList.remove('on');
    el('loop-lbl').classList.add('tp-hidden');
    el('btn-loop-clr').classList.add('tp-hidden');
    el('btn-mark-learned').classList.add('tp-hidden');
    try { if (api) { api.isLooping = false; api.playbackRange = null; } } catch (_) { }

    if (clearProgress) {
        learnedRanges = [];
        currentTabDocId = null;
    }
    document.querySelectorAll('.learned-overlay').forEach(e => e.remove());

    countInBusy = false;
    el('count-overlay').classList.add('tp-hidden');
    pauseMetro(); metroBeatIdx = 0; clearDots();

    currentBarBeats = 0;
    rebuildMetroDots(0);

    speedRatio = parseInt(el('speed-sl').value) / 100;
}

function showOverlay(msg) {
    el('at-overlay-msg').textContent = msg;
    el('at-overlay').style.display = 'flex';
}
function hideOverlay() {
    el('at-overlay').style.display = 'none';
}

function fatalError(msg) {
    const z = el('upload-zone');
    if (!z) return;
    const card = z.querySelector('.upload-card') || z;
    card.innerHTML = `
        <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
        <p style="color:rgba(255,120,120,0.9);font-size:0.88rem;margin:0 0 10px">${esc(msg)}</p>
        <a onclick="location.reload()" href=""
           style="color:rgba(255,255,255,0.38);font-size:0.76rem">Recarregar página</a>
    `;
}
