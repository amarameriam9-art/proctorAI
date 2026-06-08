import { useState } from "react"
import CameraFeed from "../components/CameraFeed"
import AlertPanel from "../components/AlertPanel"

export default function Dashboard() {
  const [alerts, setAlerts] = useState([])

  const handleAlert = (alert) => {
    setAlerts(prev => [...prev, { ...alert, time: new Date() }])
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f5f5f3", minHeight: "100vh", padding: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: "#178a6e",
            borderRadius: 8, display: "flex", alignItems: "center",
            justifyContent: "center", color: "#fff", fontSize: 18
          }}>👁</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>ProctorAI</div>
            <div style={{ fontSize: 12, color: "#888" }}>Surveillance intelligente</div>
          </div>
        </div>
        <div style={{
          background: "#e1f5ee", color: "#0f6e56",
          fontSize: 12, fontWeight: 500,
          padding: "5px 14px", borderRadius: 99,
          display: "flex", alignItems: "center", gap: 6
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#1d9e75", display: "inline-block",
            animation: "pulse 1.5s infinite"
          }} />
          EN DIRECT
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Alertes totales", value: alerts.length, color: alerts.length > 0 ? "#a32d2d" : "#222" },
          { label: "Critiques", value: alerts.filter(a => a.severity === "high").length, color: "#a32d2d" },
          { label: "Statut", value: "Actif", color: "#0f6e56" }
        ].map((s, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 10,
            border: "0.5px solid #e0e0e0", padding: "14px 16px"
          }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#333" }}>Votre caméra</div>
          <CameraFeed candidateId="candidat-01" onAlert={handleAlert} />
          <div style={{
            background: "#fff", borderRadius: 10,
            border: "0.5px solid #e0e0e0", padding: "14px 16px",
            fontSize: 13, color: "#555", lineHeight: 1.6
          }}>
            Le module IA analyse votre flux vidéo toutes les 500ms et détecte :
            regard dévié, plusieurs visages, absence de visage.
            Les alertes apparaissent en temps réel dans le panneau de droite.
          </div>
        </div>
        <AlertPanel alerts={alerts} />
      </div>
    </div>
  )
}