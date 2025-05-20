// /pages/notifications.js
import { parse } from "cookie";

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

import { useEffect, useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sostituisci con ID utente reale se usi autenticazione
  const userId = 1;

  useEffect(() => {
    fetch(`/api/notifications?user_id=${userId}`)
      .then(r => r.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      });
  }, []);

  // Marcare tutte come lette (opzionale)
  const markAllRead = async () => {
    await fetch(`/api/notifications/mark-all-read?user_id=${userId}`, { method: "POST" });
    // Aggiorna elenco
    fetch(`/api/notifications?user_id=${userId}`)
      .then(r => r.json())
      .then(data => setNotifications(data));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "#2843A1" }}>Notifiche</h1>
      <button onClick={markAllRead} style={{
        marginBottom: 16, background: "#2843A1", color: "#fff",
        border: "none", borderRadius: 8, padding: "6px 20px"
      }}>Segna tutte come lette</button>
      {loading ? (
        <p>Caricamento notifiche...</p>
      ) : notifications.length === 0 ? (
        <p>Nessuna notifica presente</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map(n => (
            <li key={n.id} style={{
              background: n.read ? "#f3f6fb" : "#ffe4e4",
              borderRadius: 10,
              boxShadow: n.read ? "0 1px 3px #c8d0ee11" : "0 1px 5px #f88a",
              marginBottom: 14,
              padding: "14px 20px",
              color: n.read ? "#444" : "#b70d0d",
              fontWeight: n.read ? 400 : 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 20
            }}
            onClick={async () => {
              // Marca come letta se non lo è
              if (!n.read) {
                await fetch(`/api/notifications/${n.id}/read`, { method: "POST" });
                setNotifications(notifications => notifications.map(x =>
                  x.id === n.id ? { ...x, read: 1 } : x
                ));
              }
            }}>
              {n.read ? "🔔" : "🛎️"}
              <span>
                {n.message}
                <span style={{ marginLeft: 14, fontSize: 13, color: "#999" }}>
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
