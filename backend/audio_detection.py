import numpy as np
import base64
import struct

def decode_audio_b64(audio_b64: str) -> np.ndarray:
    """Décode les données audio base64 reçues du frontend"""
    raw = base64.b64decode(audio_b64)
    # Float32 samples envoyés depuis Web Audio API
    n = len(raw) // 4
    samples = struct.unpack(f'{n}f', raw)
    return np.array(samples, dtype=np.float32)

def analyze_audio(audio_b64: str) -> dict:
    """
    Analyse un chunk audio et retourne les alertes détectées.
    Détecte :
      - Volume élevé (quelqu'un parle fort)
      - Plusieurs sources vocales (pattern d'énergie suspect)
    """
    try:
        samples = decode_audio_b64(audio_b64)
    except Exception as e:
        return {"audio_alerts": [], "volume_db": 0, "voice_detected": False}

    if len(samples) == 0:
        return {"audio_alerts": [], "volume_db": 0, "voice_detected": False}

    # RMS → niveau sonore
    rms = float(np.sqrt(np.mean(samples ** 2)))
    # Convertir en dB (éviter log(0))
    volume_db = round(20 * np.log10(rms + 1e-9), 1)

    alerts = []
    voice_detected = False

    # Seuil : voix humaine normale commence vers -30 dB
    if volume_db > -20:
        voice_detected = True
        alerts.append({
            "type": "VOICE_DETECTED",
            "message": f"Voix externe détectée (niveau : {volume_db} dB)",
            "severity": "high"
        })
    elif volume_db > -35:
        voice_detected = True
        alerts.append({
            "type": "NOISE_DETECTED",
            "message": f"Bruit suspect détecté ({volume_db} dB)",
            "severity": "medium"
        })

    return {
        "audio_alerts": alerts,
        "volume_db": volume_db,
        "voice_detected": voice_detected
    }