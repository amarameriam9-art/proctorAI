import { useState } from "react"

export default function Login({ onLogin }) {
  const [role, setRole] = useState("surveillant")
  const [nom, setNom] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    if (!nom.trim()) return setError("Entrez votre nom")
    if (password !== "proctor2025") return setError("Mot de passe incorrect")
    setError("")
    onLogin({ nom, role })
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f6e56 0%, #1a1a2e 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "40px 36px",
        width: 380,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: "#178a6e",
            borderRadius: 14,
            display: "flex", alignItems: "center",
            justifyContent: "center",
            fontSize: 28, margin: "0 auto 12px"
          }}>👁</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>ProctorAI</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Surveillance intelligente d'examens</div>
        </div>

        {/* Rôle */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 8 }}>Vous êtes</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["surveillant", "candidat"].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex: 1, padding: "10px 0",
                borderRadius: 8,
                border: role === r ? "2px solid #178a6e" : "1.5px solid #e0e0e0",
                background: role === r ? "#e1f5ee" : "#fff",
                color: role === r ? "#0f6e56" : "#555",
                fontWeight: role === r ? 600 : 400,
                cursor: "pointer", fontSize: 13,
                textTransform: "capitalize"
              }}>
                {r === "surveillant" ? "👨‍💼 Surveillant" : "👤 Candidat"}
              </button>
            ))}
          </div>
        </div>

        {/* Nom */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 6 }}>Nom complet</div>
          <input
            value={nom}
            onChange={e => setNom(e.target.value)}
            placeholder="Ex: Amira Ben Ali"
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: 8, border: "1.5px solid #e0e0e0",
              fontSize: 14, outline: "none",
              boxSizing: "border-box"
            }}
            onFocus={e => e.target.style.borderColor = "#178a6e"}
            onBlur={e => e.target.style.borderColor = "#e0e0e0"}
          />
        </div>

        {/* Mot de passe */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 6 }}>Mot de passe</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: 8, border: "1.5px solid #e0e0e0",
              fontSize: 14, outline: "none",
              boxSizing: "border-box"
            }}
            onFocus={e => e.target.style.borderColor = "#178a6e"}
            onBlur={e => e.target.style.borderColor = "#e0e0e0"}
          />
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
            Mot de passe demo : proctor2025
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            background: "#fcebeb", color: "#a32d2d",
            padding: "8px 12px", borderRadius: 8,
            fontSize: 13, marginBottom: 16
          }}>
            {error}
          </div>
        )}

        {/* Bouton */}
        <button onClick={handleLogin} style={{
          width: "100%", padding: "12px 0",
          background: "#178a6e", color: "#fff",
          border: "none", borderRadius: 10,
          fontSize: 15, fontWeight: 600,
          cursor: "pointer"
        }}>
          Se connecter →
        </button>
      </div>
    </div>
  )
}