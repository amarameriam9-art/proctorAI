import { useState } from "react"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Rapport from "./pages/Rapport"

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState("dashboard")

  if (!user) return <Login onLogin={setUser} />

  return (
    <div>
      {/* Navigation */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        background: "#fff", borderBottom: "0.5px solid #e0e0e0",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 24px", zIndex: 100
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "dashboard", label: "👁 Surveillance" },
            { id: "rapport", label: "📊 Rapport" }
          ].map(nav => (
            <button key={nav.id} onClick={() => setPage(nav.id)} style={{
              padding: "6px 16px", borderRadius: 8,
              border: "none", cursor: "pointer", fontSize: 13,
              background: page === nav.id ? "#178a6e" : "transparent",
              color: page === nav.id ? "#fff" : "#555",
              fontWeight: page === nav.id ? 500 : 400
            }}>
              {nav.label}
            </button>
          ))}
        </div>

        {/* User info + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#555" }}>
            👤 <strong>{user.nom}</strong> — {user.role}
          </div>
          <button onClick={() => setUser(null)} style={{
            padding: "5px 12px", borderRadius: 8,
            border: "0.5px solid #e0e0e0",
            background: "#fff", cursor: "pointer",
            fontSize: 12, color: "#888"
          }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ marginTop: 50 }}>
        {page === "dashboard" ? <Dashboard /> : <Rapport />}
      </div>
    </div>
  )
}