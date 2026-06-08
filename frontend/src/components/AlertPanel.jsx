const severityColor = {
  high: { bg: "#fcebeb", color: "#a32d2d" },
  medium: { bg: "#faeeda", color: "#854f0b" },
  low: { bg: "#e6f1fb", color: "#185fa5" }
}

export default function AlertPanel({ alerts }) {
  return (
    <div style={{
      background: "#fff",
      border: "0.5px solid #e0e0e0",
      borderRadius: 12,
      overflow: "hidden",
      height: "100%"
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "0.5px solid #e0e0e0", fontWeight: 500, fontSize: 14 }}>
        Alertes en temps réel ({alerts.length})
      </div>
      <div style={{ overflowY: "auto", maxHeight: 400 }}>
        {alerts.length === 0 && (
          <div style={{ padding: 20, color: "#888", fontSize: 13, textAlign: "center" }}>
            Aucune alerte pour le moment
          </div>
        )}
        {[...alerts].reverse().map((alert, i) => {
          const style = severityColor[alert.severity] || severityColor.low
          return (
            <div key={i} style={{
              padding: "12px 16px",
              borderBottom: "0.5px solid #f0f0f0",
              display: "flex",
              gap: 10,
              alignItems: "flex-start"
            }}>
              <span style={{
                background: style.bg,
                color: style.color,
                fontSize: 11,
                fontWeight: 500,
                padding: "3px 9px",
                borderRadius: 99,
                whiteSpace: "nowrap",
                marginTop: 2
              }}>
                {alert.severity === "high" ? "CRITIQUE" : alert.severity === "medium" ? "MOYEN" : "INFO"}
              </span>
              <div>
                <div style={{ fontSize: 13, color: "#222" }}>{alert.message}</div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}