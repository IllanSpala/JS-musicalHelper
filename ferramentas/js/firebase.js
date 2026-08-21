// ============================================================
//  firebase.js — jojozelan Tools BaaS Core
//  Initializes Firebase and exposes auth, db, storage globals.
//
//  ► STEP 1: Go to https://console.firebase.google.com
//  ► STEP 2: Create a project → Add a Web App → copy the config below
//  ► STEP 3: Replace EVERY field marked with <YOUR_...> with your values
// ============================================================

// Import the functions you need from the SDKs you need

const firebaseConfig = {
    apiKey: "AIzaSyDQfBbrw_0uDRN24HbJ2SfxFwUUMoAhAYA",
    authDomain: "jojo-webtools.firebaseapp.com",
    projectId: "jojo-webtools",
    storageBucket: "jojo-webtools.firebasestorage.app",
    messagingSenderId: "627186261950",
    appId: "1:627186261950:web:b5903904b845ea40a9e3ef"
};

// --- Init ---
firebase.initializeApp(firebaseConfig);

window.fbAuth = firebase.auth();
window.fbDb = firebase.firestore();
// Firebase Storage is no longer used — files go to Cloudflare R2 via Worker
// window.fbStorage = firebase.storage();

// ── R2 Worker base URL ──────────────────────────────────────
// After deploying the worker, paste its URL here:
window.R2_WORKER_URL = 'https://jojozelan-r2-worker.illanspala.workers.dev';

// --- Google Auth Provider ---
window.fbGoogleProvider = new firebase.auth.GoogleAuthProvider();

// ============================================================
//  Auth State — updates header across ALL pages automatically
// ============================================================
window.fbAuth.onAuthStateChanged(user => {
    _updateAuthHeader(user);
    // Dispatch a custom event so page-specific scripts can react
    window.dispatchEvent(new CustomEvent('fbAuthChanged', { detail: { user } }));
});

function _updateAuthHeader(user) {
    const loginBtn = document.getElementById('auth-login-btn');
    const userChip = document.getElementById('auth-user-chip');
    const userAvatar = document.getElementById('auth-avatar');
    const userName = document.getElementById('auth-username');

    if (!loginBtn || !userChip) return; // Header not on page yet

    if (user) {
        loginBtn.classList.add('tp-hidden');
        userChip.classList.remove('tp-hidden');
        
        // 1. Coloca a foto/nome do Google temporariamente (enquanto o banco carrega)
        if (userAvatar) {
            userAvatar.src = user.photoURL || _defaultAvatar(user.displayName || user.email);
        }
        if (userName) {
            userName.textContent = user.displayName || 'Perfil';
        }

        // 2. Busca o Perfil Customizado no Firestore (Nome E Foto)
        _getFirestoreProfile(user.uid).then(profile => {
            if (profile) {
                // Atualiza com os dados do seu banco de dados
                if (userName && profile.username) {
                    userName.textContent = profile.username;
                }
                if (userAvatar && profile.avatarUrl) {
                    userAvatar.src = profile.avatarUrl;
                }
            }
        });

    } else {
        loginBtn.classList.remove('tp-hidden');
        userChip.classList.add('tp-hidden');
    }
}

// Substituímos a função antiga por esta, que traz o perfil inteiro (nome, bio e avatar)
async function _getFirestoreProfile(uid) {
    try {
        const doc = await window.fbDb.collection('users').doc(uid).get();
        return doc.exists ? doc.data() : null;
    } catch { return null; }
}

function _defaultAvatar(seed) {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed || 'user')}`;
}

// ============================================================
//  Helpers available globally
// ============================================================

/** Navigate to login page, preserving return destination */
window.fbGoToLogin = function (from) {
    const base = window.location.pathname.includes('/ferramentas/') ? '' : 'ferramentas/';
    window.location.href = `${base}login.html?from=${encodeURIComponent(from || window.location.href)}`;
};

/** Sign out and stay on current page */
window.fbSignOut = async function () {
    await window.fbAuth.signOut();
};

/** Save a tab entry: upload to R2, then save metadata to Firestore */
window.fbSaveTab = async function (fileName, file) {
    const user = window.fbAuth.currentUser;
    if (!user) {
        console.error('[R2] fbSaveTab: No user logged in — tab won\'t be saved');
        return null;
    }
    if (!file) return null;

    const docId = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
        // 1. Upload file to R2 via Worker
        const workerUrl = `${window.R2_WORKER_URL}/upload/${user.uid}/${docId}`;
        console.log('[R2] Uploading tab:', workerUrl);
        const uploadRes = await fetch(workerUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: file,
        });
        if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(() => ({}));
            throw new Error(`R2 upload failed: ${uploadRes.status} ${err.error || ''}`);
        }
        const { url } = await uploadRes.json();
        console.log('[R2] Upload OK, serving URL:', url);

        // 2. Save metadata to Firestore (preserves existing progress)
        const docRef = window.fbDb.collection('users').doc(user.uid).collection('tabs').doc(docId);
        const existing = await docRef.get();
        const learned = existing.exists && existing.data().learnedRanges ? existing.data().learnedRanges : [];
        const bars = existing.exists && existing.data().totalBars ? existing.data().totalBars : 0;

        await docRef.set({
            name: fileName,
            url: url,
            learnedRanges: learned ? learned.map(r => ({ s: r[0], e: r[1] })) : [],
            totalBars: bars,
            loadedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('[R2] Firestore metadata saved:', docId);

        return { docId, url, learnedRanges: learned, totalBars: bars };
    } catch (e) {
        console.error('[R2] *** ERROR saving tab ***', e.message, e);
        return null;
    }
};

/** Sync progress back to Firestore (unchanged — Firestore is free) */
window.fbUpdateTabProgress = async function (docId, learnedRanges, totalBars, tabMeta) {
    const user = window.fbAuth.currentUser;
    if (!user || !docId) return;
    try {
        const payload = {
            learnedRanges: learnedRanges ? learnedRanges.map(r => ({ s: r[0], e: r[1] })) : [],
            totalBars: totalBars
        };
        if (tabMeta) {
            payload.metadata = tabMeta;
        }
        await window.fbDb.collection('users').doc(user.uid).collection('tabs').doc(docId).update(payload);
    } catch (e) {
        console.error('[R2] *** Progress sync error ***', e.code, e.message);
    }
};

/** Delete tab: remove from R2 + Firestore */
window.fbDeleteTab = async function (docId) {
    const user = window.fbAuth.currentUser;
    if (!user || !docId) return;
    try {
        // Delete from R2
        await fetch(`${window.R2_WORKER_URL}/file/${user.uid}/${docId}`, {
            method: 'DELETE',
        }).catch(e => console.warn('[R2] Storage delete failed (file may not exist):', e));

        // Delete Firestore metadata
        await window.fbDb.collection('users').doc(user.uid).collection('tabs').doc(docId).delete();
    } catch (e) {
        console.warn('[R2] Delete error:', e);
    }
};
