import { useEffect, useState } from "react"
import axios from "axios"

const severityLabel = { high: "CRITIQUE", medium: "MOYEN", low: "INFO" }
const severityColor = { high: "#a32d2d", medium: "#854f0b", low: "#185fa5" }
const severityBg = { high: "#fcebeb", medium: "#faeeda", low: "#e6f1fb" }

export default function Rapport() {
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState({ total: 0, critical: 0, medium: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [alertsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:8000/alerts"),
        axios.get("http://localhost:8000/stats")
      ])
      setAlerts(alertsRes.data.alerts)
      setStats(statsRes.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const clearAlerts = async () => {
    if (!window.confirm("Effacer toutes les alertes ?")) return
    await axios.delete("http://localhost:8000/alerts/clear")
    fetchData()
  }

  const exportCSV = () => {
    const header = "ID,Candidat,Type,Message,Sévérité,Heure"
    const rows = alerts.map(a =>
      `${a.id},${a.candidate_id},${a.type},"${a.message}",${a.severity},${a.time}`
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `rapport_${new Date().toLocaleDateString()}.csv`
    link.click()
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
          }}>📊</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Rapport de session</div>
            <div style={{ fontSize: 12, color: "#888" }}>Historique des alertes</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={fetchData} style={{
            padding: "8px 16px", borderRadius: 8, border: "0.5px solid #e0e0e0",
            background: "#fff", cursor: "pointer", fontSize: 13
          }}>🔄 Actualiser</button>
          <button onClick={exportCSV} style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: "#178a6e", color: "#fff", cursor: "pointer", fontSize: 13
          }}>⬇️ Exporter CSV</button>
          <button onClick={clearAlerts} style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: "#a32d2d", color: "#fff", cursor: "pointer", fontSize: 13
          }}>🗑️ Effacer</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total alertes", value: stats.total, color: "#222" },
          { label: "Critiques", value: stats.critical, color: "#a32d2d" },
          { label: "Moyennes", value: stats.medium, color: "#854f0b" }
        ].map((s, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 10,
            border: "0.5px solid #e0e0e0", padding: "16px 20px"
          }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: "#fff", borderRadius: 12,
        border: "0.5px solid #e0e0e0", overflow: "hidden"
      }}>
        <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #e0e0e0", fontWeight: 500, fontSize: 14 }}>
          Historique des alertes ({alerts.length})
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Chargement...</div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
            Aucune alerte enregistrée — lance une session de surveillance d'abord.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                {["#", "Candidat", "Type", "Message", "Sévérité", "Heure"].map(h => (
                  <th key={h} style={{
                    padding: "10px 16px", textAlign: "left",
                    fontWeight: 500, color: "#555",
                    borderBottom: "0.5px solid #e0e0e0"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 16px", color: "#aaa" }}>{alert.id}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 500 }}>{alert.candidate_id}</td>
                  <td style={{ padding: "10px 16px", color: "#555" }}>{alert.type}</td>
                  <td style={{ padding: "10px 16px" }}>{alert.message}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{
                      background: severityBg[alert.severity],
                      color: severityColor[alert.severity],
                      fontSize: 11, fontWeight: 500,
                      padding: "3px 9px", borderRadius: 99
                    }}>
                      {severityLabel[alert.severity]}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", color: "#888" }}>{alert.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}