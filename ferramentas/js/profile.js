// ============================================================
//  profile.js — Profile page logic
//  Depends on: firebase.js (window.fbAuth, window.fbDb, window.fbStorage)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── Wait for auth state ──
    window.addEventListener('fbAuthChanged', ({ detail: { user } }) => {
        if (!user) {
            window.fbGoToLogin(window.location.href);
            return;
        }
        _init(user);
    }, { once: true });

    // Fallback
    const currentUser = window.fbAuth ? window.fbAuth.currentUser : null;
    if (currentUser) _init(currentUser);
});

// ────────────────────────────────────────────────────────────
async function _init(user) {
    document.getElementById('profile-loading').style.display = 'none';
    document.getElementById('profile-content').classList.remove('tp-hidden');

    document.getElementById('display-email').textContent = user.email || '';

    // ── Load Firestore profile ──
    const userRef = window.fbDb.collection('users').doc(user.uid);
    let userData = {};
    try {
        const snap = await userRef.get();
        if (snap.exists) {
            userData = snap.data();
        } else {
            userData = { username: '', bio: '', avatarUrl: '' };
            await userRef.set({
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch(e) {
        console.warn('[profile] Firestore read error:', e);
    }

    const username  = userData.username || user.displayName || '';
    const bio       = userData.bio || '';
    const avatarUrl = userData.avatarUrl || user.photoURL
                      || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.uid)}`;

    document.getElementById('inp-username').value = username;
    document.getElementById('inp-bio').value      = bio;
    document.getElementById('display-username').textContent = username || '(sem nome)';
    _setAvatar(avatarUrl);

    // ── Load saved tabs ──
    await _loadTabs(user.uid);

    // ── Events ──
    document.getElementById('btn-save-profile').addEventListener('click', () => _saveProfile(user));
    document.getElementById('btn-logout').addEventListener('click', () => {
        window.fbSignOut().then(() => { window.location.href = '../index.html'; });
    });
    document.getElementById('avatar-file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) _uploadAvatar(file, user);
    });
}

// ────────────────────────────────────────────────────────────
function _setAvatar(url) {
    const img = document.getElementById('profile-avatar-img');
    img.src   = url;
    const headerAvatar = document.getElementById('auth-avatar');
    if (headerAvatar) headerAvatar.src = url;
}

// ────────────────────────────────────────────────────────────
async function _saveProfile(user) {
    const btn      = document.getElementById('btn-save-profile');
    const status   = document.getElementById('save-status');
    const username = document.getElementById('inp-username').value.trim();
    const bio      = document.getElementById('inp-bio').value.trim();

    btn.disabled = true;
    status.textContent = t('prof_saving');
    status.className   = 'save-status';

    try {
        await window.fbDb.collection('users').doc(user.uid).set(
            { username, bio, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
            { merge: true }
        );
        document.getElementById('display-username').textContent = username || '(sem nome)';
        const chipName = document.getElementById('auth-username');
        if (chipName) chipName.textContent = username || user.displayName || 'Perfil';

        status.textContent = t('prof_save_ok');
        status.className   = 'save-status ok';
        setTimeout(() => { status.textContent = ''; status.className = 'save-status'; }, 3000);
    } catch(e) {
        status.textContent = t('prof_save_err');
        status.className   = 'save-status err';
        console.error('[profile] Save error:', e);
    } finally {
        btn.disabled = false;
    }
}

// ────────────────────────────────────────────────────────────
async function _uploadAvatar(file, user) {
    const maxSize = 3 * 1024 * 1024; // Limite de 3MB
    if (file.size > maxSize) { alert('A imagem deve ter no máximo 3 MB.'); return; }

    const progressWrap = document.getElementById('upload-progress');
    const progressBar  = document.getElementById('upload-bar');
    progressWrap.style.display = 'block';
    
    // Como a API fetch() não tem um "onProgress" simples como o Firebase,
    // fazemos uma barra de progresso simulada até a resposta do R2 chegar.
    progressBar.style.width = '40%'; 

    try {
        // Pega a extensão do arquivo (ex: jpg, png)
        const ext = file.name.split('.').pop();
        // Cria um nome de arquivo para a foto de perfil
        const docId = `avatar_profile_${Date.now()}.${ext}`;

        // 1. Usa o SEU Cloudflare Worker para fazer o upload (Mesma lógica das Tabs)
        const workerUrl = `${window.R2_WORKER_URL}/upload/${user.uid}/${docId}`;
        
        const uploadRes = await fetch(workerUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file,
        });

        if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(() => ({}));
            throw new Error(`R2 upload failed: ${uploadRes.status} ${err.error || ''}`);
        }

        const { url } = await uploadRes.json();
        
        // Completa a barra de progresso
        progressBar.style.width = '100%';

        // 2. Atualiza a foto na tela
        _setAvatar(url);

        // 3. Salva a nova URL da foto no Firestore (Banco de dados)
        await window.fbDb.collection('users').doc(user.uid).set({ avatarUrl: url }, { merge: true });
        
        // Esconde a barra após 1 segundo
        setTimeout(() => { progressWrap.style.display = 'none'; }, 1000);

    } catch(e) {
        console.error('[profile] Avatar upload to R2 failed:', e);
        alert('Erro ao enviar imagem. Verifique se o Cloudflare Worker está online.');
        progressWrap.style.display = 'none';
    }
}
// ────────────────────────────────────────────────────────────
async function _loadTabs(uid) {
    const container = document.getElementById('tabs-list');
    container.innerHTML = '';

    try {
        const snap = await window.fbDb
            .collection('users').doc(uid)
            .collection('tabs')
            .orderBy('loadedAt', 'desc')
            .limit(50)
            .get();

        if (snap.empty) {
            container.innerHTML = `<p class="tabs-empty">${t('prof_empty')}</p>`;
            return;
        }

        snap.forEach(doc => {
            const data = doc.data();
            const meta = data.metadata || {};

            // ── Binary learned status (NaN-safe) ──
            let learnedCount = 0;
            if (data.learnedRanges) data.learnedRanges.forEach(r => {
                const s = r.s !== undefined ? r.s : (r[0] ?? 0);
                const e = r.e !== undefined ? r.e : (r[1] ?? 0);
                if (typeof s === 'number' && typeof e === 'number') {
                    learnedCount += (e - s + 1);
                }
            });
            const totalBars = (typeof data.totalBars === 'number' && data.totalBars > 0) ? data.totalBars : 0;
            const pct = totalBars > 0 ? Math.round((learnedCount / totalBars) * 100) : 0;

            // Status label
            let statusLabel, statusColor;
            if (totalBars === 0) {
                statusLabel = '—';
                statusColor = 'rgba(255,255,255,0.25)';
            } else if (pct >= 100) {
                statusLabel = t('prof_learned_all');
                statusColor = '#2ecc71';
            } else if (pct > 0) {
                statusLabel = t('prof_learned_partial');
                statusColor = '#f39c12';
            } else {
                statusLabel = t('prof_learned_none');
                statusColor = 'rgba(255,255,255,0.25)';
            }

            // Learned caption (subtle, like a photo caption)
            const learnedCaption = totalBars > 0
                ? `${learnedCount}/${totalBars} ${t('prof_learned_caption')}`
                : '';

            // Labels
            const title      = meta.title || data.name || doc.id;
            const artist     = meta.artist || '';
            const instrument = meta.instruments || '';
            const date       = data.loadedAt ? _fmtDate(data.loadedAt.toDate()) : '';

            const entry = document.createElement('div');
            entry.className = 'tab-entry';
            entry.dataset.tabId = doc.id;

            entry.innerHTML = `
                <!-- ── Summary Row (always visible) ── -->
                <div class="tab-summary" role="button" tabindex="0">
                    <div class="tab-summary-left">
                        <span class="tab-title">${_escHtml(title)}</span>
                        ${artist ? `<span class="tab-artist">${_escHtml(artist)}</span>` : ''}
                    </div>
                    <div class="tab-summary-right">
                        <span class="tab-status-badge" style="color:${statusColor}; font-size:0.72rem;">${statusLabel}</span>
                        <i class="fas fa-chevron-down tab-chevron"></i>
                    </div>
                </div>

                <!-- ── Expanded Detail (hidden) ── -->
                <div class="tab-detail">
                    <div class="tab-detail-meta">
                        ${artist     ? `<div class="tab-meta-row"><i class="fas fa-user"></i> <span>${_escHtml(artist)}</span></div>` : ''}
                        ${instrument ? `<div class="tab-meta-row"><i class="fas fa-guitar"></i> <span>${_escHtml(instrument)}</span></div>` : ''}
                        ${date       ? `<div class="tab-meta-row"><i class="fas fa-calendar-alt"></i> <span>${t('prof_last_access')} ${_escHtml(date)}</span></div>` : ''}
                        ${learnedCaption ? `<div class="tab-meta-row tab-learned-caption"><i class="fas fa-check-circle" style="color:${statusColor}"></i> <span style="color:rgba(255,255,255,0.45); font-style:italic;">${learnedCaption}</span></div>` : ''}
                    </div>

                    <div class="tab-detail-actions">
                        <a href="TabPlayer.html?tab=${doc.id}" class="tab-action-open">
                            <i class="fas fa-external-link-alt"></i> ${t('prof_open_player')}
                        </a>
                        <button class="tab-action-delete" data-id="${doc.id}">
                            <i class="fas fa-trash"></i> ${t('prof_delete')}
                        </button>
                    </div>
                </div>`;

            container.appendChild(entry);

            const summary = entry.querySelector('.tab-summary');
            const detail  = entry.querySelector('.tab-detail');
            const chevron = entry.querySelector('.tab-chevron');
            summary.addEventListener('click', () => {
                const open = detail.classList.toggle('open');
                chevron.style.transform = open ? 'rotate(180deg)' : '';
            });
            summary.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') summary.click();
            });
        });

        // Delete handlers
        container.querySelectorAll('.tab-action-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!confirm(t('prof_del_confirm'))) return;
                const tabId = btn.dataset.id;
                btn.disabled = true;
                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('prof_delete_spinner')}`;
                try {
                    if (window.fbDeleteTab) {
                        await window.fbDeleteTab(tabId);
                    } else {
                        await window.fbDb.collection('users').doc(uid).collection('tabs').doc(tabId).delete();
                    }
                    btn.closest('.tab-entry').remove();
                    if (container.children.length === 0) {
                        container.innerHTML = `<p class="tabs-empty">${t('prof_empty')}</p>`;
                    }
                } catch(err) {
                    console.error('[profile] Delete error:', err);
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fas fa-trash"></i> ${t('prof_delete')}`;
                }
            });
        });

    } catch(e) {
        container.innerHTML = `<p class="tabs-empty" style="color:#e74c3c;">${t('prof_err_load')}</p>`;
        console.error('[profile] Tabs load error:', e);
    }
}

// ── Helpers ──────────────────────────────────────────────────
function _fmtDate(d) {
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function _escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
