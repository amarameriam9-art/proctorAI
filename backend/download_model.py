import requests
import os

url = "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx"
output = "yolov8n.onnx"

if os.path.exists(output):
    print("Modèle déjà téléchargé.")
else:
    print("Téléchargement du modèle...")
    r = requests.get(url, stream=True)
    with open(output, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    print("Modèle téléchargé avec succès !")