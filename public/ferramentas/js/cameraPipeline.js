/**
 * cameraPipeline.js — Etapa 2: WebRTC & Canvas Render Pipeline
 * JS-musicalHelper | Mapeador de Escalas
 *
 * Responsável por:
 *  1. Conectar à webcam via getUserMedia (1280x720 Wide)
 *  2. Encerrar o MediaStream e desligar o LED do hardware
 *  3. Loop de renderização em Canvas via requestAnimationFrame com controle de FPS
 *  4. Medidor de FPS estilizado sobreposto ao Canvas
 *  5. Tratamento de erros robusto (NotAllowedError, NotFoundError, NotReadableError)
 */

(function () {
    'use strict';

    // ── Pipeline State ───────────────────────────────────────────────────
    const pipelineState = {
        activeStream: null,
        animFrameId: null,
        isRendering: false,
        fps: 0,
        frameCount: 0,
        lastTime: performance.now(),
        fpsUpdateInterval: 500, // Update FPS text every 500ms
        lastFpsUpdate: performance.now()
    };

    // ── 1. initWebcamStream ──────────────────────────────────────────────
    /**
     * Solicita acesso à webcam via WebRTC com resolução Wide (720p ou 1080p).
     * @param {HTMLVideoElement} videoElement
     * @param {number} width - Largura ideal (padrão 1280)
     * @param {number} height - Altura ideal (padrão 720)
     * @returns {Promise<MediaStream>}
     */
    async function initWebcamStream(videoElement, width = 1280, height = 720) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const err = new Error('NotSupportedError: API mediaDevices não suportada neste ambiente.');
            handleCameraError(err);
            throw err;
        }

        const constraints = {
            video: {
                width: { ideal: width },
                height: { ideal: height },
                aspectRatio: { ideal: 1.7777777778 },
                facingMode: 'user'
            },
            audio: false
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            pipelineState.activeStream = stream;

            if (videoElement) {
                videoElement.srcObject = stream;
                await new Promise((resolve) => {
                    videoElement.onloadedmetadata = () => {
                        videoElement.play().then(resolve).catch(resolve);
                    };
                });
            }

            return stream;
        } catch (error) {
            handleCameraError(error);
            throw error;
        }
    }

    // ── 2. stopWebcamStream ──────────────────────────────────────────────
    /**
     * Encerra todas as faixas do MediaStream para desligar o LED do hardware.
     * @param {HTMLVideoElement} videoElement
     */
    function stopWebcamStream(videoElement) {
        stopCanvasRenderLoop();

        const targetVideo = videoElement || document.getElementById('camPracticeVideo');
        if (targetVideo && targetVideo.srcObject) {
            const stream = targetVideo.srcObject;
            if (stream.getTracks) {
                stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            targetVideo.srcObject = null;
        }

        if (pipelineState.activeStream) {
            if (pipelineState.activeStream.getTracks) {
                pipelineState.activeStream.getTracks().forEach(track => track.stop());
            }
            pipelineState.activeStream = null;
        }
    }

    // ── 3. startCanvasRenderLoop ─────────────────────────────────────────
    /**
     * Loop de renderização em requestAnimationFrame que desenha o vídeo no canvas sobreposto.
     * @param {HTMLVideoElement} videoElement
     * @param {HTMLCanvasElement} canvasElement
     */
    function startCanvasRenderLoop(videoElement, canvasElement) {
        const video  = videoElement  || document.getElementById('camPracticeVideo');
        const canvas = canvasElement || document.getElementById('camPracticeCanvas');

        if (!video || !canvas) {
            console.warn('[cameraPipeline] Elementos de vídeo ou canvas não encontrados.');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Cancela loop anterior se estivesse rodando
        stopCanvasRenderLoop();

        pipelineState.isRendering = true;
        pipelineState.frameCount = 0;
        pipelineState.lastTime = performance.now();
        pipelineState.lastFpsUpdate = performance.now();

        if (window.fretboardMapper) {
            window.fretboardMapper.initUI(canvas);
        }

        function renderFrame(now) {
            if (!pipelineState.isRendering) return;

            // Ajusta dimensões internas do canvas para coincidir com o vídeo real
            const vWidth  = video.videoWidth || 1280;
            const vHeight = video.videoHeight || 720;

            if (canvas.width !== vWidth || canvas.height !== vHeight) {
                canvas.width  = vWidth;
                canvas.height = vHeight;
            }

            // Limpa canvas anterior
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Verifica se deve espelhar no canvas
            const isMirrored = video.classList.contains('mirror-mode');

            ctx.save();
            if (isMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            // Desenha a imagem do vídeo no canvas ou padrão de teste se o vídeo estiver aguardando
            if (video.readyState >= 2) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            } else {
                // Background gradiente escuro de teste
                const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                grad.addColorStop(0, '#0a0a18');
                grad.addColorStop(1, '#12122c');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Desenha braço de guitarra de teste sintético
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 2;
                for (let i = 1; i <= 6; i++) {
                    const y = (canvas.height / 7) * i;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(canvas.width, y);
                    ctx.stroke();
                }

                // Efeito visual de pulso
                const pulse = Math.sin(now / 200) * 8 + 20;
                ctx.fillStyle = '#00ffb4';
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, pulse, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            // === Fretboard Calibration Grid ===
            if (window.fretboardMapper) {
                window.fretboardMapper.drawGrid(ctx, canvas.width, canvas.height);
            }

            // === Integração com MediaPipe Vision Pipeline ===
            if (window.visionPipeline && window.visionPipeline.isReady()) {
                const detectionResult = window.visionPipeline.process(video, now);
                
                // detectionResult is already the array of hands
                const landmarks = Array.isArray(detectionResult) ? detectionResult : [];
                
                if (window.fretboardMapper && window.fretboardMapper.state.showSkeleton !== false) {
                    window.visionPipeline.draw(ctx, landmarks, isMirrored, canvas.width, canvas.height);
                }

                if (window.scaleDetectorEngine) {
                    window.scaleDetectorEngine.processNotes(ctx, landmarks, isMirrored, canvas.width, canvas.height);
                }
            }

            // Cálculo do FPS
            pipelineState.frameCount++;
            const elapsed = now - pipelineState.lastFpsUpdate;

            if (elapsed >= pipelineState.fpsUpdateInterval) {
                pipelineState.fps = Math.round((pipelineState.frameCount * 1000) / elapsed);
                pipelineState.frameCount = 0;
                pipelineState.lastFpsUpdate = now;

                // Sync with DOM badge overlay bar if present
                const fpsDomVal = document.getElementById('cam-fps-val');
                if (fpsDomVal) fpsDomVal.textContent = pipelineState.fps;
            }

            // Renderiza indicador de FPS estilizado sobreposto ao Canvas (no canto inferior direito)
            renderFPSBadge(ctx, canvas.width, canvas.height, pipelineState.fps);

            pipelineState.animFrameId = requestAnimationFrame(renderFrame);
        }

        pipelineState.animFrameId = requestAnimationFrame(renderFrame);
    }

    /**
     * Cancela o loop de renderização do canvas.
     */
    function stopCanvasRenderLoop() {
        pipelineState.isRendering = false;
        if (pipelineState.animFrameId) {
            cancelAnimationFrame(pipelineState.animFrameId);
            pipelineState.animFrameId = null;
        }

        // Limpa canvas
        const canvas = document.getElementById('camPracticeCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // ── 4. Render FPS Badge ──────────────────────────────────────────────
    /**
     * Desenha um selo visual moderno com a contagem de FPS no canto inferior direito do canvas.
     */
    function renderFPSBadge(ctx, width, height, fps) {
        ctx.save();
        ctx.font = '600 12px "Space Grotesk", sans-serif';

        const text = `⚡ ${fps} FPS | ${width}x${height}`;
        const metrics = ctx.measureText(text);
        const bgWidth = metrics.width + 20;
        const bgHeight = 24;

        // Positioned at bottom-right of canvas context to avoid top overlay bar
        const x = width - bgWidth - 16;
        const y = height - bgHeight - 16;

        // Background pill
        ctx.fillStyle = 'rgba(8, 8, 22, 0.85)';
        ctx.strokeStyle = 'rgba(0, 255, 180, 0.35)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(x, y, bgWidth, bgHeight, 12);
        ctx.fill();
        ctx.stroke();

        // FPS Text Color based on performance
        if (fps >= 45) {
            ctx.fillStyle = '#00ffb4';
        } else if (fps >= 24) {
            ctx.fillStyle = '#ffb800';
        } else {
            ctx.fillStyle = '#ff6b6b';
        }

        ctx.fillText(text, x + 10, y + 16);
        ctx.restore();
    }

    // ── 5. handleCameraError ─────────────────────────────────────────────
    /**
     * Trata recusas de permissão, ausência de webcam ou dispositivos ocupados.
     * @param {Error} error
     */
    function handleCameraError(error) {
        console.error('[cameraPipeline] Erro de Câmera:', error);

        let userMsg = 'Não foi possível acessar a câmera.';
        const errName = error.name || '';

        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
            userMsg = 'Permissão de acesso à câmera negada. Habilite a permissão no ícone de cadeado do navegador.';
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
            userMsg = 'Nenhuma webcam foi encontrada. Conecte uma câmera USB ou utilize os apps Irium Webcam / DroidCam.';
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
            userMsg = 'A câmera já está sendo usada por outro aplicativo (Zoom, Meet, OBS). Feche-os e tente novamente.';
        } else if (errName === 'OverconstrainedError') {
            userMsg = 'A resolução selecionada (1080p/720p) não é suportada por este dispositivo de captura.';
        } else if (error.message) {
            userMsg = 'Erro de captura: ' + error.message;
        }

        // Atualiza UI do modal de onboarding se disponível
        const errorBox = document.getElementById('cam-error-box');
        const statusBadge = document.getElementById('cam-status-badge');
        const statusText  = document.getElementById('cam-status-text');

        if (errorBox) {
            const errorMsg = errorBox.querySelector('.cam-error-msg');
            if (errorMsg) errorMsg.textContent = userMsg;
            errorBox.classList.add('visible');
        }

        if (statusBadge) {
            statusBadge.className = 'cam-status-badge status-error';
            if (statusText) statusText.textContent = 'Erro de Câmera';
        }
    }

    // ── 6. Event Listeners para Integração com camModal.js ──────────────
    document.addEventListener('camPractice:start', function (e) {
        const video  = document.getElementById('camPracticeVideo');
        const canvas = document.getElementById('camPracticeCanvas');
        if (video && canvas) {
            startCanvasRenderLoop(video, canvas);
        }
    });

    document.addEventListener('camPractice:stop', function () {
        stopCanvasRenderLoop();
    });

    // ── Expose Global API ────────────────────────────────────────────────
    window.cameraPipeline = {
        initStream  : initWebcamStream,
        stopStream  : stopWebcamStream,
        startLoop   : startCanvasRenderLoop,
        stopLoop    : stopCanvasRenderLoop,
        handleError : handleCameraError,
        getFPS      : () => pipelineState.fps,
        state       : pipelineState
    };

    // Alias individuais para compatibilidade global
    window.initWebcamStream     = initWebcamStream;
    window.stopWebcamStream     = stopWebcamStream;
    window.startCanvasRenderLoop= startCanvasRenderLoop;
    window.handleCameraError    = handleCameraError;

})();
