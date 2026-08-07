/**
 * visionPipeline.js — Universal MediaPipe Hand Detector Engine
 * JS-musicalHelper | Mapeador de Escalas
 * 
 * Funciona universalmente tanto via protocolo file:// quanto via http/https (npm run dev / hospedagem online).
 */

(function () {
    'use strict';

    const visionState = {
        detectorType: null, // 'hands' ou 'tasks-vision'
        detector: null,
        isInitialized: false,
        isBusy: false,
        lastLandmarks: [],
        lastVideoTime: -1
    };

    // ── 1. Inicializador Universal ─────────────────────────────────────────
    async function initHandDetector() {
        if (visionState.isInitialized) return true;

        const statusText = document.getElementById('cam-status-text');
        if (statusText) statusText.textContent = 'Carregando IA...';

        // Tentar primeiro carregar via MediaPipe Hands UMD (Global window.Hands)
        // Isso é 100% garantido de funcionar em file://, localhost, npm run dev e HTTPS
        if (typeof window.Hands !== 'undefined') {
            try {
                console.log('[visionPipeline] Inicializando MediaPipe Hands (UMD Global)...');
                const hands = new window.Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                });

                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                hands.onResults((results) => {
                    visionState.isBusy = false;
                    if (results && results.multiHandLandmarks) {
                        visionState.lastLandmarks = results.multiHandLandmarks;
                    } else {
                        visionState.lastLandmarks = [];
                    }
                });

                visionState.detector = hands;
                visionState.detectorType = 'hands';
                visionState.isInitialized = true;

                if (statusText) statusText.textContent = 'Rastreamento Ativo';
                console.log('[visionPipeline] MediaPipe Hands pronto!');
                return true;
            } catch (err) {
                console.warn('[visionPipeline] Erro ao iniciar MediaPipe Hands UMD:', err);
            }
        }

        // Caso window.Hands não esteja disponível, tenta carregar dynamic import de tasks-vision
        try {
            console.log('[visionPipeline] Tentando MediaPipe Tasks Vision (ESM)...');
            const { HandLandmarker, FilesetResolver } = await import(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs'
            );

            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
            );

            const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO',
                numHands: 2,
                minHandDetectionConfidence: 0.5,
                minHandPresenceConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            visionState.detector = handLandmarker;
            visionState.detectorType = 'tasks-vision';
            visionState.isInitialized = true;

            if (statusText) statusText.textContent = 'Rastreamento Ativo';
            console.log('[visionPipeline] MediaPipe Tasks Vision pronto!');
            return true;
        } catch (err) {
            console.error('[visionPipeline] Falha em todos os métodos de carregamento da IA:', err);
            if (statusText) statusText.textContent = 'Erro na IA';
            return false;
        }
    }

    // ── 2. Processar Frame de Vídeo ────────────────────────────────────────
    function processVideoFrame(videoElement, timestamp) {
        if (!visionState.isInitialized || !visionState.detector) return visionState.lastLandmarks;
        if (videoElement.readyState < 2) return visionState.lastLandmarks;

        // Evitar chamadas redundantes para o mesmo tempo de vídeo
        if (videoElement.currentTime === visionState.lastVideoTime) {
            return visionState.lastLandmarks;
        }
        visionState.lastVideoTime = videoElement.currentTime;

        try {
            if (visionState.detectorType === 'hands') {
                if (!visionState.isBusy) {
                    visionState.isBusy = true;
                    visionState.detector.send({ image: videoElement }).catch((e) => {
                        visionState.isBusy = false;
                        console.error('[visionPipeline] erro no send():', e);
                    });
                }
            } else if (visionState.detectorType === 'tasks-vision') {
                const results = visionState.detector.detectForVideo(videoElement, timestamp);
                if (results && results.landmarks) {
                    visionState.lastLandmarks = results.landmarks;
                }
            }
        } catch (err) {
            console.error('[visionPipeline] Erro durante detecção:', err);
        }

        return visionState.lastLandmarks;
    }

    // ── 3. Desenhar Esqueleto e Pontos das Mãos no Canvas ──────────────────
    function drawHandLandmarksOnCanvas(ctx, landmarksList, isMirrored, canvasWidth, canvasHeight) {
        if (!landmarksList || landmarksList.length === 0) return;

        ctx.save();

        const connections = [
            // [0, 1], [1, 2], [2, 3], [3, 4],    // Polegar ocultado pois costuma ficar atrás do braço da guitarra
            [0, 5], [5, 6], [6, 7], [7, 8],       // Indicador
            [5, 9], [9, 10], [10, 11], [11, 12],   // Médio
            [9, 13], [13, 14], [14, 15], [15, 16], // Anelar
            [13, 17], [17, 18], [18, 19], [19, 20],// Mínimo
            [0, 17]                               // Palma
        ];

        for (const hand of landmarksList) {
            // Desenhar linhas das conexões (Esqueleto)
            ctx.strokeStyle = '#5B50D6';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            for (const [startIdx, endIdx] of connections) {
                const start = hand[startIdx];
                const end = hand[endIdx];
                if (!start || !end) continue;

                const startX = isMirrored ? (1 - start.x) * canvasWidth : start.x * canvasWidth;
                const startY = start.y * canvasHeight;

                const endX = isMirrored ? (1 - end.x) * canvasWidth : end.x * canvasWidth;
                const endY = end.y * canvasHeight;

                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
            }
            ctx.stroke();

            // Desenhar os 21 pontos das articulações
            for (let i = 0; i < hand.length; i++) {
                const pt = hand[i];
                // Ocultar os pontos do polegar (1, 2, 3, 4) já que ele fica atrás do braço
                if ([1, 2, 3, 4].includes(i)) continue;

                const x = isMirrored ? (1 - pt.x) * canvasWidth : pt.x * canvasWidth;
                const y = pt.y * canvasHeight;

                ctx.beginPath();

                // Destaque brilhante nas pontas dos dedos (4, 8, 12, 16, 20)
                if ([4, 8, 12, 16, 20].includes(i)) {
                    ctx.arc(x, y, 7, 0, 2 * Math.PI);
                    ctx.fillStyle = '#00FFB4';
                    ctx.shadowColor = '#00FFB4';
                    ctx.shadowBlur = 12;
                } else {
                    ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
            }
        }

        ctx.restore();
    }

    // ── Expor API global no objeto window ─────────────────────────────────
    window.visionPipeline = {
        init: initHandDetector,
        process: processVideoFrame,
        draw: drawHandLandmarksOnCanvas,
        isReady: () => visionState.isInitialized
    };

    // Tentar inicialização automática ao carregar o script
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initHandDetector();
    } else {
        document.addEventListener('DOMContentLoaded', initHandDetector);
    }
})();
