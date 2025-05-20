// /pages/activities.js
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

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // State for insert form
  const [form, setForm] = useState({
    title: "",
    description: "",
    project_id: "",
    assigned_to: "",
    status: "da_iniziare",
    priority: "normale",
    due_date: ""
  });

  // Lists for projects and users for select
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchActivities();
    fetch("/api/projects").then(r => r.json()).then(setProjects);
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }, []);

  const fetchActivities = () => {
    setLoading(true);
    fetch("/api/activities")
      .then(r => r.json())
      .then(data => {
        setActivities(data);
        setLoading(false);
      })
      .catch(() => {
        setMsg("Errore caricamento attività");
        setLoading(false);
      });
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    if (!form.title) return setMsg("Titolo obbligatorio!");
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMsg("Attività inserita!");
      setForm({
        title: "",
        description: "",
        project_id: "",
        assigned_to: "",
        status: "da_iniziare",
        priority: "normale",
        due_date: ""
      });
      fetchActivities();
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Impossibile inserire attività"));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "#2843A1" }}>Gestione Attività / Task</h1>

      {/* Insert Form */}
      <form onSubmit={handleSubmit} style={{
        marginBottom: 30, background: "#f5faff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px #bde2ee33"
      }}>
        <h3>Nuova Attività</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <input name="title" value={form.title} onChange={handleChange}
            placeholder="Titolo attività" style={inputStyle} required />
          <input name="description" value={form.description} onChange={handleChange}
            placeholder="Descrizione" style={inputStyle} />
          <select name="project_id" value={form.project_id} onChange={handleChange} style={inputStyle}>
            <option value="">Progetto</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select name="assigned_to" value={form.assigned_to} onChange={handleChange} style={inputStyle}>
            <option value="">Assegna a</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.surname}</option>)}
          </select>
          <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
            <option value="da_iniziare">Da Iniziare</option>
            <option value="in_corso">In Corso</option>
            <option value="completata">Completata</option>
            <option value="scaduta">Scaduta</option>
          </select>
          <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle}>
            <option value="bassa">Bassa</option>
            <option value="normale">Normale</option>
            <option value="alta">Alta</option>
          </select>
          <input type="date" name="due_date" value={form.due_date} onChange={handleChange} style={inputStyle} />
          <button type="submit" style={{
            background: "#2843A1", color: "#fff", border: "none",
            padding: "8px 24px", borderRadius: 8, fontWeight: 600
          }}>Inserisci</button>
        </div>
        {msg && <div style={{ marginTop: 10, color: msg.startsWith("Errore") ? "#b70d0d" : "#267800" }}>{msg}</div>}
      </form>

      {/* Activities Table */}
      <div style={{
        overflowX: "auto",
        borderRadius: 12,
        boxShadow: "0 2px 12px #bde2ee44",
        background: "#fff",
        padding: "18px"
      }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 850 }}>
          <thead>
            <tr style={{
              background: "#e8f0fe",
              color: "#2843A1",
              textAlign: "left",
              fontWeight: 700
            }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Titolo</th>
              <th style={thStyle}>Descrizione</th>
              <th style={thStyle}>Progetto</th>
              <th style={thStyle}>Assegnato a</th>
              <th style={thStyle}>Stato</th>
              <th style={thStyle}>Priorità</th>
              <th style={thStyle}>Scadenza</th>
              <th style={thStyle}>Creato il</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 30, color: "#999" }}>
                  Caricamento...
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 30, color: "#999" }}>
                  Nessuna attività presente
                </td>
              </tr>
            ) : (
              activities.map((a, i) => (
                <tr key={a.id} style={{
                  background: i % 2 === 0 ? "#f9fbff" : "#f1f6fb"
                }}>
                  <td style={tdStyle}>{a.id}</td>
                  <td style={tdStyle}>{a.title}</td>
                  <td style={tdStyle}>{a.description}</td>
                  <td style={tdStyle}>{a.project_title || "-"}</td>
                  <td style={tdStyle}>{a.assigned_name ? `${a.assigned_name} ${a.assigned_surname}` : "-"}</td>
                  <td style={{
                    ...tdStyle,
                    fontWeight: 600,
                    color: a.status === "in_corso" ? "#1265d2" : a.status === "completata" ? "#13ba3f" : a.status === "scaduta" ? "#b70d0d" : "#b57a0e"
                  }}>
                    {a.status}
                  </td>
                  <td style={tdStyle}>{a.priority}</td>
                  <td style={tdStyle}>{a.due_date ? new Date(a.due_date).toLocaleDateString() : "-"}</td>
                  <td style={tdStyle}>{a.created_at ? new Date(a.created_at).toLocaleString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "10px 8px",
  borderBottom: "2px solid #d2e3fc",
  fontSize: 16
};
const tdStyle = {
  padding: "10px 8px",
  fontSize: 15,
  borderBottom: "1px solid #edf2fa",
  maxWidth: 210,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const inputStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #b2c8e6",
  fontSize: 15
};
