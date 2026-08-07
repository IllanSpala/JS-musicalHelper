import cv2
import mediapipe as mp
import time
import os
import urllib.request

script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'hand_landmarker.task')

# Verifica se o modelo existe e se não está corrompido (tamanho mínimo ~5MB)
if not os.path.exists(model_path) or os.path.getsize(model_path) < 5 * 1024 * 1024:
    print("⏳ Baixando modelo MediaPipe Hand Landmarker (7.5 MB)...")
    url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
    try:
        urllib.request.urlretrieve(url, model_path)
        print("✅ Modelo baixado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao baixar modelo: {e}")

# Conexões das articulações da mão (21 pontos)
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),        # Polegar
    (0, 5), (5, 6), (6, 7), (7, 8),        # Indicador
    (5, 9), (9, 10), (10, 11), (11, 12),   # Médio
    (9, 13), (13, 14), (14, 15), (15, 16), # Anelar
    (13, 17), (0, 17), (17, 18), (18, 19), (19, 20) # Mínimo
]

# Inicializa o detector MediaPipe HandLandmarker em modo VIDEO (otimizado para fluxo contínuo de câmera)
BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=2
)

window_name = "Mapa de Intervalos — Rastreamento de Mão"
detector = HandLandmarker.create_from_options(options)

# ── Captura da Câmera ────────────────────────────────────────────────────────
cap = cv2.VideoCapture(0)

# Define resolução estável (1280x720) para evitar que o sensor pegue 4K desnecessário
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

pTime = 0
start_time_ms = int(time.time() * 1000)

print("🎥 Câmera iniciada! Rastreamento de Mão ativo.")
print("👉 Pressione 'q', 'ESC' ou feche a janela ('X') para encerrar.")

cv2.namedWindow(window_name, cv2.WINDOW_AUTOSIZE)

try:
    while cap.isOpened():
        success, frame = cap.read()
        if not success or frame is None:
            print("⚠️ Erro ao capturar imagem da webcam (ou câmera desconectada).")
            break

        h, w, c = frame.shape
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Converte imagem OpenCV para MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        
        # Modo VIDEO requer timestamp monotônico em ms
        frame_timestamp_ms = int(time.time() * 1000) - start_time_ms
        detection_result = detector.detect_for_video(mp_image, frame_timestamp_ms)

        # Desenha os pontos-chave (Landmarks) e conexões se alguma mão for detectada
        if detection_result and detection_result.hand_landmarks:
            for hand_landmarks in detection_result.hand_landmarks:
                # Converte coordenadas relativas (0.0 a 1.0) em pixels da tela
                pixel_landmarks = [(int(lm.x * w), int(lm.y * h)) for lm in hand_landmarks]

                # Desenha as conexões
                for start_idx, end_idx in HAND_CONNECTIONS:
                    cv2.line(frame, pixel_landmarks[start_idx], pixel_landmarks[end_idx], (91, 80, 214), 2)

                # Desenha as articulações (pontos)
                for idx, (x, y) in enumerate(pixel_landmarks):
                    color = (0, 255, 180) if idx in (4, 8, 12, 16, 20) else (255, 255, 255) # Pontas dos dedos destacadas
                    cv2.circle(frame, (x, y), 5, color, -1)
                    cv2.circle(frame, (x, y), 6, (0, 0, 0), 1)

        # Cálculo e exibição de FPS
        cTime = time.time()
        fps = 1 / (cTime - pTime) if (cTime - pTime) > 0 else 0
        pTime = cTime

        cv2.putText(frame, f'JS-musicalHelper | FPS: {int(fps)}', (15, 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 180), 2)

        cv2.imshow(window_name, frame)

        # Tecla para sair
        key = cv2.waitKey(1) & 0xFF
        if key in (ord('q'), 27):
            break

        # FIX CRÍTICO: Se o usuário fechar a janela clicando no 'X', encerra o loop.
        # Sem isso, a janela sumia mas o Python ficava rodando em segundo plano a 100% de CPU indefinidamente!
        if cv2.getWindowProperty(window_name, cv2.WND_PROP_VISIBLE) < 1:
            print("🛑 Janela fechada pelo usuário. Encerrando...")
            break

        # Pequeno descanso para aliviar o processador
        time.sleep(0.001)

finally:
    print("🧹 Liberando câmera e recursos...")
    cap.release()
    cv2.destroyAllWindows()
    try:
        detector.close()
    except Exception:
        pass
    print("✅ Aplicação encerrada com segurança.")

