import cv2
import numpy as np

# --- Détection visages ---
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

def count_faces(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4, minSize=(60, 60))
    return len(faces)

def get_gaze_direction(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    eyes = eye_cascade.detectMultiScale(gray, 1.1, 4)
    if len(eyes) == 0:
        return "ABSENT"
    h, w = image.shape[:2]
    centers = [x + ew // 2 for (x, y, ew, eh) in eyes]
    avg_x = np.mean(centers)
    if avg_x < w * 0.35:
        return "GAUCHE"
    elif avg_x > w * 0.65:
        return "DROITE"
    return "CENTRE"

def detect_rectangle_object(image):
    """
    Détecte un objet rectangulaire tenu dans la main (téléphone, feuille, livre)
    en cherchant des contours rectangulaires dans la zone basse de l'image
    """
    h, w = image.shape[:2]

    # Zone d'intérêt : moitié basse de l'image (là où les mains se trouvent)
    roi = image[h // 2:, :]

    # Convertir en niveaux de gris et flou
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)

    # Dilatation pour connecter les contours
    kernel = np.ones((3, 3), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)

    # Cherche les contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    detected_objects = []

    for cnt in contours:
        area = cv2.contourArea(cnt)

        # Filtre par taille — trop petit ou trop grand = ignoré
        if area < 3000 or area > (roi.shape[0] * roi.shape[1] * 0.5):
            continue

        # Approximation polygonale
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.04 * peri, True)

        # Rectangle = 4 côtés
        if len(approx) == 4:
            x, y, rw, rh = cv2.boundingRect(approx)
            aspect_ratio = rw / rh if rh > 0 else 0

            # Téléphone : ratio portrait (hauteur > largeur) entre 0.4 et 0.7
            if 0.4 <= aspect_ratio <= 0.7 and rh > 60:
                detected_objects.append({
                    "object": "téléphone",
                    "confidence": 75
                })
                break  # Un seul suffit

            # Feuille/livre : ratio paysage ou carré
            elif 0.7 <= aspect_ratio <= 2.5 and rw > 80 and rh > 60:
                detected_objects.append({
                    "object": "document",
                    "confidence": 65
                })
                break

    return detected_objects

def detect_skin_object(image):
    """
    Détecte un objet tenu dans une main via la couleur de peau
    Si une main est détectée tenant quelque chose de rectangulaire
    """
    h, w = image.shape[:2]
    roi = image[h // 2:, :]

    # Masque couleur peau en HSV
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)

    # Si beaucoup de peau détectée dans la zone basse → main présente
    skin_pixels = cv2.countNonZero(skin_mask)
    roi_area = roi.shape[0] * roi.shape[1]
    skin_ratio = skin_pixels / roi_area

    return skin_ratio > 0.05  # Plus de 5% de peau = main probablement visible

def analyze_frame(frame_bytes):
    np_arr = np.frombuffer(frame_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        return {"faces_count": 0, "gaze": "INCONNU", "suspicious_objects": [], "alerts": []}

    alerts = []

    # 1 — Visages
    nb_faces = count_faces(image)
    if nb_faces == 0:
        alerts.append({
            "type": "NO_FACE",
            "message": "Aucun visage détecté",
            "severity": "high"
        })
    elif nb_faces > 1:
        alerts.append({
            "type": "MULTIPLE_FACES",
            "message": f"{nb_faces} visages détectés dans le champ",
            "severity": "high"
        })

    # 2 — Regard
    gaze = get_gaze_direction(image)
    if gaze in ["GAUCHE", "DROITE"]:
        alerts.append({
            "type": "GAZE_DEVIATION",
            "message": f"Regard dévié vers la {gaze}",
            "severity": "medium"
        })

    # 3 — Détection objets rectangulaires (téléphone, document)
    hand_present = detect_skin_object(image)
    suspicious = []

    if hand_present:
        suspicious = detect_rectangle_object(image)
        for obj in suspicious:
            alerts.append({
                "type": "SUSPICIOUS_OBJECT",
                "message": f"{obj['object'].capitalize()} détecté ({obj['confidence']}% confiance)",
                "severity": "high"
            })

    return {
        "faces_count": nb_faces,
        "gaze": gaze,
        "suspicious_objects": suspicious,
        "alerts": alerts
    }