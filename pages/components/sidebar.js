// Percorso: /pages/components/sidebar.js
import { useState } from "react";
import { useRouter } from "next/router"; // <--- AGGIUNTA

export default function Sidebar({ user }) {
  const [showUser, setShowUser] = useState(false);
  const router = useRouter(); // <--- AGGIUNTA

  // Funzione logout reale
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside style={{
      width: 230, background: "#182764", minHeight: "100vh", color: "#fff",
      display: "flex", flexDirection: "column", alignItems: "stretch"
    }}>
      <div style={{ padding: "18px 0 6px 0", textAlign: "center" }}>
        <img src="/logo_schuco.png" alt="Schuco Logo" style={{ width: 110, marginBottom: 4, borderRadius: "50%", background: "#fff" }} />
        <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: 0.4, color: "#fff", margin: 0 }}>
          SchucoTeamsHUB
        </h2>
        {/* Pulsante info utente */}
        <button
          onClick={() => setShowUser(true)}
          style={{
            margin: "18px auto 4px auto", padding: "6px 24px", background: "#fff", color: "#23285A",
            border: "none", borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: "pointer", boxShadow: "0 2px 8px #0002"
          }}
        >
          Info Utente
        </button>
        {/* Popup informazioni utente */}
        {showUser && (
          <div style={{
            position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 9999,
            background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              background: "#fff", color: "#23285A", borderRadius: 18,
              boxShadow: "0 4px 20px #0002", minWidth: 310, maxWidth: 390, padding: 32,
              textAlign: "center"
            }}>
              <h3 style={{ color: "#234", marginBottom: 14 }}>Informazioni utente</h3>
              <div style={{ marginBottom: 12, fontSize: 16 }}>
                <b>Nome:</b> {user?.name || "-"}
              </div>
              <div style={{ marginBottom: 12, fontSize: 16 }}>
                <b>Cognome:</b> {user?.surname || "-"}
              </div>
              <div style={{ marginBottom: 14, fontSize: 16 }}>
                <b>Ruolo:</b> <span style={{color:'#00713f', fontWeight:600}}>{user?.role || "-"}</span>
              </div>
              <button
                onClick={() => setShowUser(false)}
                style={{ marginTop: 10, padding: "7px 28px", borderRadius: 8, border: "none", background: "#0070f3", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                Chiudi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ... resto della sidebar ... */}
      <nav style={{ flex: 1, marginTop: 16 }}>
        {/* Menu voci qui */}
      </nav>
      {/* Bottone logout in fondo alla sidebar */}
      <div style={{ padding: "16px" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "9px 0",
            borderRadius: 10,
            border: "none",
            background: "#ff5d5d",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            marginTop: 12,
            boxShadow: "0 2px 8px #0002"
          }}
        >
          Esci
        </button>
      </div>
    </aside>
  );
}
