from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from detection import analyze_frame
from database import SessionLocal, Alert, Session, init_db
import json, base64
from datetime import datetime
from audio_detection import analyze_audio

app = FastAPI(title="ProctorAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Alertes en mémoire pour le temps réel
alerts_memory = []

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "ProctorAI backend running"}

@app.get("/alerts")
def get_alerts(candidate_id: str = None):
    db = SessionLocal()
    query = db.query(Alert)
    if candidate_id:
        query = query.filter(Alert.candidate_id == candidate_id)
    alerts = query.order_by(Alert.created_at.desc()).limit(100).all()
    db.close()
    return {"alerts": [
        {
            "id": a.id,
            "candidate_id": a.candidate_id,
            "type": a.alert_type,
            "message": a.message,
            "severity": a.severity,
            "time": a.created_at.strftime("%H:%M:%S")
        } for a in alerts
    ]}

@app.get("/stats")
def get_stats():
    db = SessionLocal()
    total = db.query(Alert).count()
    critical = db.query(Alert).filter(Alert.severity == "high").count()
    medium = db.query(Alert).filter(Alert.severity == "medium").count()
    db.close()
    return {"total": total, "critical": critical, "medium": medium}

@app.delete("/alerts/clear")
def clear_alerts():
    db = SessionLocal()
    db.query(Alert).delete()
    db.commit()
    db.close()
    alerts_memory.clear()
    return {"message": "Alertes effacées"}

@app.websocket("/ws/{candidate_id}")
async def websocket_endpoint(websocket: WebSocket, candidate_id: str):
    await websocket.accept()
    print(f"Candidat connecté : {candidate_id}")
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            frame_b64 = payload.get("frame", "")
            frame_bytes = base64.b64decode(frame_b64)

            # --- Analyse vidéo ---
            result = analyze_frame(frame_bytes)

            # --- Analyse audio ---
            audio_b64 = payload.get("audio", "")
            if audio_b64:
                audio_result = analyze_audio(audio_b64)
                result["audio_alerts"] = audio_result["audio_alerts"]
                result["volume_db"] = audio_result["volume_db"]
                result["voice_detected"] = audio_result["voice_detected"]
                result["alerts"] += audio_result["audio_alerts"]
            else:
                result["audio_alerts"] = []
                result["volume_db"] = 0
                result["voice_detected"] = False

            result["candidate_id"] = candidate_id

            # Sauvegarde en base de données
            if result["alerts"]:
                db = SessionLocal()
                for alert in result["alerts"]:
                    db_alert = Alert(
                        candidate_id=candidate_id,
                        alert_type=alert["type"],
                        message=alert["message"],
                        severity=alert["severity"]
                    )
                    db.add(db_alert)
                    alerts_memory.append({
                        "candidate_id": candidate_id,
                        **alert,
                        "time": datetime.now().strftime("%H:%M:%S")
                    })
                db.commit()
                db.close()

            await websocket.send_text(json.dumps(result))

    except WebSocketDisconnect:
        print(f"Candidat déconnecté : {candidate_id}")