/**
 * camModal.js — Camera Practice Modal UI, Blurred Background Preview & Live Stream Controller
 * JS-musicalHelper | Mapeador de Escalas
 */

(function () {
    'use strict';

    // ── State ────────────────────────────────────────────────────────────
    const camState = {
        resolution: '720p',
        mirrorView: true,
        camAvailable: null, // null=unknown, true=ok, false=error
        activeStream: null,
        isTrackingActive: false
    };

    // ── Wait for DOM ─────────────────────────────────────────────────────
    function init() {
        createCameraButtonUI();
        bindModalEvents();
        updateToggleLabel();
        populateModalScaleSelectors();
    }

    // ── 1. createCameraButtonUI ──────────────────────────────────────────
    // DEV BUILD: camera access is disabled until the feature is released.
    // The button is intentionally not shown, even though the feature code
    // (createCameraButtonUI / openCameraModal) is kept intact below.
    const CAMERA_FEATURE_ENABLED = false;

    function createCameraButtonUI() {
        if (!CAMERA_FEATURE_ENABLED) return;

        let openBtn = document.getElementById('open-cam-modal-btn');
        const controlsGroup = document.querySelector('.controls-bar .control-group:last-child');

        // If button doesn't exist, create it dynamically
        if (!openBtn && controlsGroup) {
            openBtn = document.createElement('button');
            openBtn.id = 'open-cam-modal-btn';
            openBtn.title = 'Praticar com Câmera — Rastreamento de Mão';
            openBtn.innerHTML = '<i class="fas fa-camera"></i> Praticar com Câmera';
            controlsGroup.appendChild(openBtn);
        }

        if (openBtn) {
            openBtn.removeEventListener('click', openCameraModal);
            openBtn.addEventListener('click', openCameraModal);
        }
    }

    // ── Bind Modal UI Events ─────────────────────────────────────────────
    function bindModalEvents() {
        const modal          = document.getElementById('camPracticeModal');
        const closeBtn       = document.getElementById('cam-modal-close');
        const startBtn       = document.getElementById('cam-start-btn');
        const mirrorToggle   = document.getElementById('cam-mirror-toggle');
        const resPills       = document.querySelectorAll('.cam-res-pill');
        const toggleHelpBtn  = document.getElementById('cam-toggle-help-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeCameraModal);
        }

        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeCameraModal();
            });
        }

        // Global key listeners (ESC closes modal, Q stops stream)
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && modal.classList.contains('cam-modal-open')) {
                closeCameraModal();
            }
            if ((e.key === 'q' || e.key === 'Q') && camState.activeStream) {
                stopCameraStream();
            }
        });

        // Resolution pills
        resPills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                resPills.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                camState.resolution = this.dataset.res;
                updateToggleLabel();
                if (camState.activeStream) {
                    startCameraStream(camState.resolution, camState.mirrorView);
                }
            });
        });

        // Mirror toggle
        if (mirrorToggle) {
            mirrorToggle.addEventListener('change', function () {
                camState.mirrorView = this.checked;
                updateToggleLabel();
                applyMirrorToVideo();
            });
        }

        // Start / Toggle button
        if (startBtn) {
            startBtn.addEventListener('click', handleStartCamera);
        }

        // Dicas Toggle Button when Active
        if (toggleHelpBtn) {
            toggleHelpBtn.addEventListener('click', function() {
                const onboardingContent = document.getElementById('cam-onboarding-content');
                if (onboardingContent) {
                    onboardingContent.classList.toggle('cam-hidden');
                }
            });
        }
    }

    // ── Scale Selectors Synchronization ──────────────────────────────────
    function populateModalScaleSelectors() {
        const rootSelect    = document.getElementById('root-select');
        const scaleSelect   = document.getElementById('scale-select');
        const modalRootSel  = document.getElementById('cam-modal-root-select');
        const modalScaleSel = document.getElementById('cam-modal-scale-select');

        if (!modalRootSel || !modalScaleSel) return;

        // Copy root options if empty or out of sync
        if (rootSelect && (modalRootSel.options.length === 0 || modalRootSel.options.length !== rootSelect.options.length)) {
            modalRootSel.innerHTML = '';
            Array.from(rootSelect.options).forEach(opt => {
                const newOpt = document.createElement('option');
                newOpt.value = opt.value;
                newOpt.text = opt.text;
                modalRootSel.appendChild(newOpt);
            });
            modalRootSel.value = rootSelect.value || 'C';
        }

        // Copy scale options if empty or out of sync
        if (scaleSelect && (modalScaleSel.options.length === 0 || modalScaleSel.options.length !== scaleSelect.options.length)) {
            modalScaleSel.innerHTML = '';
            Array.from(scaleSelect.options).forEach(opt => {
                const newOpt = document.createElement('option');
                newOpt.value = opt.value;
                newOpt.text = opt.text;
                modalScaleSel.appendChild(newOpt);
            });
            modalScaleSel.value = scaleSelect.value || 'major';
        }

        // Bind sync events once
        if (!modalRootSel.dataset.bound) {
            modalRootSel.dataset.bound = 'true';
            modalRootSel.addEventListener('change', function() {
                if (rootSelect) {
                    rootSelect.value = this.value;
                    rootSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
                updateActiveScaleBadge();
            });
        }

        if (!modalScaleSel.dataset.bound) {
            modalScaleSel.dataset.bound = 'true';
            modalScaleSel.addEventListener('change', function() {
                if (scaleSelect) {
                    scaleSelect.value = this.value;
                    scaleSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
                updateActiveScaleBadge();
            });
        }

        const modalFretsSel = document.getElementById('cam-modal-frets-select');
        if (modalFretsSel && !modalFretsSel.dataset.bound) {
            modalFretsSel.dataset.bound = 'true';
            modalFretsSel.addEventListener('change', function() {
                if (window.fretboardMapper) {
                    window.fretboardMapper.setNumFrets(parseInt(this.value, 10));
                }
            });
        }
        const modalInstSel = document.getElementById('cam-modal-inst-select');
        if (modalInstSel && !modalInstSel.dataset.bound) {
            modalInstSel.dataset.bound = 'true';
            modalInstSel.addEventListener('change', function() {
                if (window.fretboardMapper) {
                    window.fretboardMapper.setInstrument(this.value);
                }
            });
        }
    }

    function updateActiveScaleBadge() {
        const modalRootSel  = document.getElementById('cam-modal-root-select');
        const modalScaleSel = document.getElementById('cam-modal-scale-select');
        const liveScaleTxt  = document.getElementById('cam-live-scale-txt');

        if (liveScaleTxt && modalRootSel && modalScaleSel) {
            const rootVal  = modalRootSel.value || 'C';
            const scaleOpt = modalScaleSel.options[modalScaleSel.selectedIndex];
            const scaleVal = scaleOpt ? scaleOpt.text : 'Maior';
            liveScaleTxt.textContent = `${rootVal} ${scaleVal}`;
        }
    }

    // ── 2. openCameraModal ───────────────────────────────────────────────
    function openCameraModal() {
        const modal = document.getElementById('camPracticeModal');
        if (!modal) return;

        modal.classList.add('cam-modal-open');
        document.body.style.overflow = 'hidden';

        // Always re-populate scale selectors when modal opens
        populateModalScaleSelectors();

        // Sync selectors state
        const rootSelect   = document.getElementById('root-select');
        const scaleSelect  = document.getElementById('scale-select');
        const modalRootSel = document.getElementById('cam-modal-root-select');
        const modalScaleSel= document.getElementById('cam-modal-scale-select');

        if (rootSelect && modalRootSel) modalRootSel.value = rootSelect.value;
        if (scaleSelect && modalScaleSel) modalScaleSel.value = scaleSelect.value;

        updateActiveScaleBadge();
        checkCameraPermissions();
    }

    // ── 3. closeCameraModal ──────────────────────────────────────────────
    function closeCameraModal() {
        const modal = document.getElementById('camPracticeModal');
        if (modal) {
            modal.classList.remove('cam-modal-open');
        }
        document.body.style.overflow = '';

        stopCameraStream();
    }

    // ── 4. checkCameraPermissions ────────────────────────────────────────
    async function checkCameraPermissions() {
        const statusBadge = document.getElementById('cam-status-badge');
        const statusText  = document.getElementById('cam-status-text');
        const errorBox    = document.getElementById('cam-error-box');
        const startBtn    = document.getElementById('cam-start-btn');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (window.cameraPipeline && window.cameraPipeline.handleError) {
                window.cameraPipeline.handleError(new Error('NotSupportedError'));
            } else {
                _setStatusError('API de mídia não suportada neste navegador.', statusBadge, statusText, errorBox, startBtn);
            }
            return;
        }

        if (statusBadge) {
            statusBadge.className = 'cam-status-badge status-checking';
            if (statusText) statusText.textContent = 'Verificando câmera...';
        }
        if (errorBox) errorBox.classList.remove('visible');

        // Add timeout wrapper so UI doesn't hang indefinitely
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: Resposta da câmera demorou muito.')), 4000)
        );

        try {
            const checkLogic = async () => {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasCam = devices.some(d => d.kind === 'videoinput');

                if (!hasCam) {
                    const err = new Error('NotFoundError');
                    err.name = 'NotFoundError';
                    throw err;
                }

                // Attempt stream
                if (!camState.activeStream) {
                    await startCameraStream(camState.resolution, camState.mirrorView, true);
                }
            };

            await Promise.race([checkLogic(), timeoutPromise]);

            camState.camAvailable = true;
            if (statusBadge) {
                statusBadge.className = 'cam-status-badge status-ok';
                if (statusText) statusText.textContent = 'Câmera pronta';
            }
            if (startBtn) startBtn.disabled = false;

        } catch (err) {
            console.warn('[camModal] Falha na verificação da câmera:', err);
            if (window.cameraPipeline && window.cameraPipeline.handleError) {
                window.cameraPipeline.handleError(err);
            } else {
                _setStatusError(
                    err.message || 'Erro ao acessar câmera.',
                    statusBadge, statusText, errorBox, startBtn
                );
            }
            // Always enable start button as fallback so user can retry or activate tracking
            if (startBtn) startBtn.disabled = false;
        }
    }

    function _setStatusError(msg, statusBadge, statusText, errorBox, startBtn) {
        camState.camAvailable = false;
        if (statusBadge) {
            statusBadge.className = 'cam-status-badge status-error';
            if (statusText) statusText.textContent = 'Erro de Câmera';
        }
        if (errorBox) {
            const errorMsg = errorBox.querySelector('.cam-error-msg');
            if (errorMsg) errorMsg.textContent = msg;
            errorBox.classList.add('visible');
        }
        if (startBtn) startBtn.disabled = false;
    }

    // ── Handle Start / Toggle Camera Tracking ─────────────────────────────
    async function handleStartCamera() {
        const startBtn          = document.getElementById('cam-start-btn');
        const onboardingContent = document.getElementById('cam-onboarding-content');
        const activeOverlayBar  = document.getElementById('cam-active-overlay-bar');
        const videoEl           = document.getElementById('camPracticeVideo');

        if (!camState.isTrackingActive) {
            // Activate Tracking Mode
            if (startBtn) {
                startBtn.classList.add('loading');
                startBtn.disabled = true;
            }

            try {
                if (!camState.activeStream) {
                    await startCameraStream(camState.resolution, camState.mirrorView, false);
                }

                if (window.visionPipeline && !window.visionPipeline.isReady()) {
                    await window.visionPipeline.init();
                }

                // Transition Video from Blur to Sharp
                if (videoEl) {
                    videoEl.classList.remove('cam-video-blur');
                    videoEl.classList.add('cam-video-sharp');
                }

                // Hide onboarding content and show live overlay bar
                if (onboardingContent) onboardingContent.classList.add('cam-hidden');
                if (activeOverlayBar) activeOverlayBar.classList.remove('cam-hidden');

                camState.isTrackingActive = true;

                if (startBtn) {
                    const btnText = startBtn.querySelector('.btn-text');
                    if (btnText) btnText.textContent = '🛑 Encerrar Rastreamento';
                    startBtn.style.background = 'rgba(255, 80, 80, 0.2)';
                    startBtn.style.borderColor = 'rgba(255, 80, 80, 0.5)';
                    startBtn.style.color = '#ff8080';
                }

                // Update status badge to Active
                const statusBadge = document.getElementById('cam-status-badge');
                const statusText  = document.getElementById('cam-status-text');
                if (statusBadge) {
                    statusBadge.className = 'cam-status-badge status-ok';
                    if (statusText) statusText.textContent = 'Rastreamento Ativo';
                }

                // Dispatch Custom Event for Vision Pipeline (MediaPipe)
                const event = new CustomEvent('camPractice:start', {
                    detail: {
                        resolution: camState.resolution,
                        mirrorView: camState.mirrorView,
                        stream: camState.activeStream
                    }
                });
                document.dispatchEvent(event);

            } catch (err) {
                console.error('Falha ao ativar rastreamento da câmera:', err);
            } finally {
                if (startBtn) {
                    startBtn.classList.remove('loading');
                    startBtn.disabled = false;
                }
            }
        } else {
            // Stop Tracking Mode & Return to Onboarding Preview
            stopCameraTracking();
        }
    }

    function stopCameraTracking() {
        const startBtn          = document.getElementById('cam-start-btn');
        const onboardingContent = document.getElementById('cam-onboarding-content');
        const activeOverlayBar  = document.getElementById('cam-active-overlay-bar');
        const videoEl           = document.getElementById('camPracticeVideo');

        camState.isTrackingActive = false;

        // Transition video back to blur
        if (videoEl) {
            videoEl.classList.remove('cam-video-sharp');
            videoEl.classList.add('cam-video-blur');
        }

        // Show onboarding content & hide active overlay bar
        if (onboardingContent) onboardingContent.classList.remove('cam-hidden');
        if (activeOverlayBar) activeOverlayBar.classList.add('cam-hidden');

        if (startBtn) {
            const btnText = startBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = '🚀 Iniciar Câmera e Rastreamento';
            startBtn.style.background = '';
            startBtn.style.borderColor = '';
            startBtn.style.color = '';
        }

        // Dispatch stop event
        const event = new CustomEvent('camPractice:stop');
        document.dispatchEvent(event);
    }

    // ── Start Camera Stream (Preview or Active) ───────────────────────────
    async function startCameraStream(resolution, mirrorView, isPreview = true) {
        stopCameraStreamTracks();

        const idealW = resolution === '1080p' ? 1920 : 1280;
        const idealH = resolution === '1080p' ? 1080 : 720;

        const constraints = {
            video: {
                width: { ideal: idealW },
                height: { ideal: idealH },
                aspectRatio: { ideal: 1.7777777778 },
                facingMode: 'user'
            },
            audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        camState.activeStream = stream;

        const videoEl = document.getElementById('camPracticeVideo');
        if (videoEl) {
            videoEl.srcObject = stream;
            await videoEl.play();

            if (isPreview && !camState.isTrackingActive) {
                videoEl.classList.add('cam-video-blur');
                videoEl.classList.remove('cam-video-sharp');
            } else {
                videoEl.classList.remove('cam-video-blur');
                videoEl.classList.add('cam-video-sharp');
            }
            applyMirrorToVideo();
        }
    }

    // ── Stop Camera Stream ───────────────────────────────────────────────
    function stopCameraStream() {
        stopCameraStreamTracks();

        const videoEl = document.getElementById('camPracticeVideo');
        if (videoEl) {
            videoEl.srcObject = null;
        }

        stopCameraTracking();
    }

    function stopCameraStreamTracks() {
        if (camState.activeStream) {
            camState.activeStream.getTracks().forEach(track => track.stop());
            camState.activeStream = null;
        }
    }

    function applyMirrorToVideo() {
        const videoEl = document.getElementById('camPracticeVideo');
        if (videoEl) {
            if (camState.mirrorView) {
                videoEl.classList.add('mirror-mode');
            } else {
                videoEl.classList.remove('mirror-mode');
            }
        }
    }

    function updateToggleLabel() {
        const mirrorToggle = document.getElementById('cam-mirror-toggle');
        const mirrorLabel  = document.getElementById('cam-mirror-label');
        if (mirrorToggle && mirrorLabel) {
            mirrorLabel.textContent = mirrorToggle.checked ? 'Ligado' : 'Desl.';
        }
    }

    // ── Expose to Global Scope ───────────────────────────────────────────
    window.createCameraButtonUI   = createCameraButtonUI;
    window.openCameraModal        = openCameraModal;
    window.closeCameraModal       = closeCameraModal;
    window.checkCameraPermissions = checkCameraPermissions;
    window.checkCameraAvailability= checkCameraPermissions;
    window.stopCameraStream       = stopCameraStream;

    window.camModal = {
        open        : openCameraModal,
        close       : closeCameraModal,
        check       : checkCameraPermissions,
        createButton: createCameraButtonUI,
        stopStream  : stopCameraStream,
        state       : camState,
    };

    // ── Bootstrap ────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
