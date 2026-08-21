/**
 * jj-store.js — JoJoTools State Persistence Engine
 * ─────────────────────────────────────────────────
 * Thin, zero-dependency wrapper around localStorage.
 * Each tool gets its own namespace key so states never
 * bleed into each other.
 *
 * Usage:
 *   const store = JJStore('scaleMachine');
 *   store.set({ root: 'A', scaleName: 'Dorian' });   // merge-write
 *   store.get()                                        // → { root:'A', scaleName:'Dorian' }
 *   store.clear()                                      // wipe this tool's state
 *
 * Namespace keys used:
 *   jj_scaleMachine   — ScaleMachine
 *   jj_harmonicMap    — HarmonicMap
 *   jj_polyMetro      — PolyMetro (Metronome)
 *   jj_tabPlayer      — TabPlayer
 */

function JJStore(namespace) {
    const KEY = 'jj_' + namespace;

    function get() {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (_) {
            return {};
        }
    }

    function set(partial) {
        try {
            const merged = Object.assign(get(), partial);
            localStorage.setItem(KEY, JSON.stringify(merged));
        } catch (_) {
            // localStorage full or unavailable — fail silently
        }
    }

    function clear() {
        try { localStorage.removeItem(KEY); } catch (_) {}
    }

    return { get, set, clear };
}

// Export as global for vanilla-JS tool pages
window.JJStore = JJStore;
