// pages/index.js
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
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Colori da usare per i vari stati dei progetti
const COLORS = ["#2843A1", "#ffd600", "#a4e1af", "#f78c6c", "#8884d8", "#ffa1b5", "#b8e986"];

export default function Dashboard() {
  const [stats, setStats] = useState({
    progetti: 0,
    progettiAttivi: 0,
    clienti: 0,
    attivitaScadute: 0,
    statoProgetti: {} // es: { "da iniziare": 3, "in corso": 2, "terminato": 1 }
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setMsg("Errore caricamento dati");
        setLoading(false);
      });
  }, []);

  // Prepara dati per il grafico a torta
  const pieData = Object.entries(stats.statoProgetti || {}).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      {loading ? (
        <p>Caricamento dati...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Card label="Progetti Totali" value={stats.progetti} />
            <Card label="Progetti Attivi" value={stats.progettiAttivi} />
            <Card label="Clienti Totali" value={stats.clienti} />
            <Card label="Attività Scadute" value={stats.attivitaScadute} color="#F23" />
          </div>
          {msg && <p>{msg}</p>}

          {/* Sezione Grafico */}
          <div style={{ marginTop: 40, display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div style={{
              background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px #bde2ee44",
              padding: 32, minWidth: 350
            }}>
              <h3>Distribuzione Stato Progetti</h3>
              {pieData.length === 0 ? (
                <div style={{ color: "#2843A1", fontSize: 20, opacity: 0.7 }}>Nessun dato disponibile</div>
              ) : (
                <ResponsiveContainer width={320} height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Placeholder per altri grafici, esempio attività del Team */}
            <div style={{
              background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px #bde2ee44",
              padding: 32, minWidth: 350
            }}>
              <h3>Attività del Team</h3>
              <div style={{ color: "#2843A1", fontSize: 20, opacity: 0.7 }}>Grafico Attività del Team (Placeholder)</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Card riutilizzabile per i box riepilogo
function Card({ label, value, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #8882",
      padding: 24, minWidth: 210
    }}>
      <b>{label}</b>
      <div style={{ fontSize: 38, fontWeight: 700, color: color || "#222" }}>{value}</div>
    </div>
  );
}
