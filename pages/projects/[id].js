// /pages/projects/[id].js

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // --- CLIENTI ---
  const [clients, setClients] = useState([]); // clienti associati al progetto
  const [allClients, setAllClients] = useState([]); // tutti i clienti disponibili
  const [addClientId, setAddClientId] = useState(""); // client id da aggiungere
  const [clientsLoading, setClientsLoading] = useState(false);

  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => {
        setProject(data);
        setForm(data);
        setLoading(false);
        fetchClients(); // carica associati
        fetchAllClients(); // carica tutti i clienti disponibili
      })
      .catch(() => {
        setMsg("Errore caricamento progetto");
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [id]);

  // --- FETCH CLIENTI ASSOCIATI ---
  const fetchClients = async () => {
    setClientsLoading(true);
    const res = await fetch(`/api/projects/${id}/clients`);
    if (res.ok) {
      setClients(await res.json());
    }
    setClientsLoading(false);
  };

  // --- FETCH TUTTI I CLIENTI DISPONIBILI ---
  const fetchAllClients = async () => {
    const res = await fetch("/api/clients");
    if (res.ok) {
      setAllClients(await res.json());
    }
  };

  // --- AGGIUNGI CLIENTE AL PROGETTO ---
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!addClientId) return;
    const res = await fetch(`/api/projects/${id}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: addClientId })
    });
    if (res.ok) {
      setMsg("Cliente associato!");
      setAddClientId("");
      fetchClients();
    } else {
      setMsg("Errore associazione cliente");
    }
  };

  // --- RIMUOVI CLIENTE DAL PROGETTO ---
  const handleRemoveClient = async (client_id) => {
    if (!window.confirm("Rimuovere questo cliente dal progetto?")) return;
    const res = await fetch(`/api/projects/${id}/clients`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id })
    });
    if (res.ok) {
      setMsg("Associazione rimossa");
      fetchClients();
    } else {
      setMsg("Errore rimozione associazione");
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async e => {
    e.preventDefault();
    setMsg("");
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const data = await res.json();
      setProject(data);
      setEditMode(false);
      setMsg("Modifiche salvate!");
    } else {
      setMsg("Errore salvataggio modifiche");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Confermi di eliminare questo progetto? L'azione non è reversibile.")) return;
    setMsg("");
    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      router.push("/projects");
    } else {
      setMsg("Errore eliminazione progetto");
    }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Caricamento progetto...</div>;
  }

  if (!project) {
    return <div style={{ padding: 40, color: "red" }}>Progetto non trovato</div>;
  }

  // Clienti non già associati (per select)
  const clientsAvailable = allClients.filter(c => !clients.some(cc => cc.id === c.id));

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto", position: "relative" }}>
      <h1 style={{
        color: "#2843A1",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 10
      }}>
        {project.title}
        <span
          onClick={() => setShowInfo(s => !s)}
          style={{
            cursor: "pointer",
            color: "#76CE40",
            fontSize: 22,
            marginLeft: 6,
            position: "relative"
          }}
          title="Info creazione progetto"
        >
          <FaInfoCircle />
        </span>
        {showInfo && (
          <div style={{
            position: "absolute",
            left: 185, top: 48,
            background: "#fff",
            border: "1px solid #76CE40",
            borderRadius: 8,
            padding: "16px 22px",
            color: "#222",
            zIndex: 1002,
            boxShadow: "0 4px 20px #bde2ee44",
            fontSize: 15,
            minWidth: 240
          }}>
            <div><b>Creato da:</b> {project.created_by_name && project.created_by_surname ? `${project.created_by_name} ${project.created_by_surname}` : (project.created_by || "-")}</div>
            <div><b>Data creazione:</b> {project.created_at ? new Date(project.created_at).toLocaleString() : "-"}</div>
            {project.updated_at &&
              <div><b>Ultima modifica:</b> {new Date(project.updated_at).toLocaleString()}</div>
            }
            {project.updated_by_name && project.updated_by_surname &&
              <div><b>Ultimo modificatore:</b> {`${project.updated_by_name} ${project.updated_by_surname}`}</div>
            }
            <button onClick={() => setShowInfo(false)} style={{
              marginTop: 12, background: "#2843A1", color: "#fff", border: "none", borderRadius: 6, padding: "4px 14px", cursor: "pointer"
            }}>Chiudi</button>
          </div>
        )}
      </h1>

      {/* --- CLIENTI ASSOCIATI --- */}
      <section style={{
        background: "#eef7eb",
        border: "1px solid #76CE40",
        borderRadius: 10,
        padding: "18px 18px 8px",
        marginBottom: 32,
        marginTop: 12
      }}>
        <h3 style={{ color: "#2843A1", margin: 0 }}>Clienti associati a questo progetto</h3>
        {clientsLoading ? (
          <div>Caricamento clienti...</div>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0, margin: 10 }}>
              {clients.map(c => (
                <li key={c.id} style={{
                  marginBottom: 4, display: "flex", alignItems: "center", gap: 16
                }}>
                  <span><b>{c.surname}</b> {c.name} <span style={{ color: "#888" }}>({c.company || "Privato"})</span></span>
                  <button onClick={() => handleRemoveClient(c.id)} style={{
                    background: "#eee", color: "#b60d0d", border: "1px solid #fcc", borderRadius: 6, padding: "2px 12px", cursor: "pointer"
                  }}>Rimuovi</button>
                </li>
              ))}
              {clients.length === 0 && <li style={{ color: "#666" }}>Nessun cliente associato</li>}
            </ul>
            <form onSubmit={handleAddClient} style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={addClientId}
                onChange={e => setAddClientId(e.target.value)}
                style={{ minWidth: 180, padding: 7, borderRadius: 6, border: "1px solid #b2c8e6", fontSize: 15 }}
                required
              >
                <option value="">-- Seleziona cliente da aggiungere --</option>
                {clientsAvailable.map(c => (
                  <option value={c.id} key={c.id}>
                    {c.surname} {c.name} ({c.company || "Privato"})
                  </option>
                ))}
              </select>
              <button type="submit" style={{
                background: "#76CE40", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer"
              }}>
                + Aggiungi
              </button>
            </form>
          </>
        )}
      </section>

      {/* --- DETTAGLIO PROGETTO E MODIFICA --- */}
      {!editMode ? (
        <>
          <div style={boxStyle}><strong>ID:</strong> {project.id}</div>
          <div style={boxStyle}><strong>Descrizione:</strong> {project.description || "-"}</div>
          <div style={boxStyle}><strong>Stato:</strong> {project.status}</div>
          <div style={boxStyle}><strong>Priorità:</strong> {project.priority || "-"}</div>
          <div style={boxStyle}><strong>Scadenza:</strong> {project.deadline ? new Date(project.deadline).toLocaleDateString() : "-"}</div>
          <div style={boxStyle}><strong>Note:</strong> {project.note || "-"}</div>
          <div style={boxStyle}><strong>Data creazione:</strong> {project.created_at ? new Date(project.created_at).toLocaleString() : "-"}</div>
          <div style={{ marginTop: 30, display: "flex", gap: 14 }}>
            <button onClick={() => setEditMode(true)}
              style={buttonStyle}>
              Modifica
            </button>
            <button onClick={handleDelete}
              style={{ ...buttonStyle, background: "#f43" }}>
              Elimina
            </button>
            <button onClick={() => router.back()}
              style={{ ...buttonStyle, background: "#ddd", color: "#222" }}>
              &laquo; Torna
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ ...boxStyle, border: "none" }}>
            <label>Titolo:<br />
              <input
                name="title"
                value={form.title || ""}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </label>
          </div>
          <div style={boxStyle}>
            <label>Descrizione:<br />
              <input
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </label>
          </div>
          <div style={boxStyle}>
            <label>Stato:<br />
              <select name="status" value={form.status || ""} onChange={handleChange} style={inputStyle}>
                <option value="da iniziare">Da Iniziare</option>
                <option value="in corso">In Corso</option>
                <option value="terminato">Terminato</option>
              </select>
            </label>
          </div>
          <div style={boxStyle}>
            <label>Priorità:<br />
              <input
                name="priority"
                value={form.priority || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </label>
          </div>
          <div style={boxStyle}>
            <label>Scadenza:<br />
              <input
                type="date"
                name="deadline"
                value={form.deadline ? form.deadline.slice(0,10) : ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </label>
          </div>
          <div style={boxStyle}>
            <label>Note:<br />
              <input
                name="note"
                value={form.note || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </label>
          </div>
          <div style={{ marginTop: 30, display: "flex", gap: 14 }}>
            <button type="submit" style={buttonStyle}>Salva</button>
            <button type="button" onClick={() => setEditMode(false)}
              style={{ ...buttonStyle, background: "#ddd", color: "#222" }}>
              Annulla
            </button>
          </div>
        </form>
      )}
      {msg && <div style={{ color: msg.startsWith("Errore") ? "#b70d0d" : "#267800", marginTop: 20 }}>{msg}</div>}
    </div>
  );
}

const boxStyle = {
  padding: "10px 0",
  fontSize: 16,
  borderBottom: "1px solid #edf2fa"
};
const inputStyle = {
  padding: "7px 10px",
  borderRadius: 6,
  border: "1px solid #b2c8e6",
  fontSize: 16,
  width: "100%"
};
const buttonStyle = {
  background: "#2843A1",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 30px",
  fontWeight: 600,
  fontSize: 16,
  boxShadow: "0 2px 8px #bde2ee55",
  cursor: "pointer"
};
