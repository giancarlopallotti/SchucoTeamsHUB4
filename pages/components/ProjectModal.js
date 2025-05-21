// Percorso: /pages/components/ProjectModal.js

import React, { useState, useEffect } from "react";
import Select from "react-select";

export default function ProjectModal({ project, onClose, onSaved }) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState(project?.status || "da iniziare");
  const [priority, setPriority] = useState(project?.priority || "media");
  const [deadline, setDeadline] = useState(project?.deadline || "");
  const [note, setNote] = useState(project?.note || "");
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch clienti all'avvio
  useEffect(() => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(data => setAllClients(data));

    // Preselezione dati progetto (in caso di modifica)
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setStatus(project.status || "da iniziare");
      setPriority(project.priority || "media");
      setDeadline(project.deadline || "");
      setNote(project.note || "");
      // clienti: CSV id → array oggetti
      if (project.clients) {
        const clientIds = (project.clients || "").split(",").map(id => id.trim()).filter(Boolean);
        setClients(
          clientIds.map(id => {
            const c = (allClients || []).find(c => String(c.id) === String(id));
            return c
              ? { value: c.id, label: `${c.name}${c.surname ? " " + c.surname : ""}` }
              : null;
          }).filter(Boolean)
        );
      }
    }
    // eslint-disable-next-line
  }, [project]);

  // Crea opzioni per Select da clienti
  const clientOptions = allClients.map(c => ({
    value: c.id,
    label: `${c.name}${c.surname ? " " + c.surname : ""}`
  }));

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!title.trim()) { setError("Il titolo è obbligatorio."); setLoading(false); return; }
    if (!clients.length) { setError("Seleziona almeno un cliente."); setLoading(false); return; }

    const body = {
      title,
      description,
      status,
      priority,
      deadline,
      note,
      clients: clients.map(c => c.value).join(","),
    };

    const method = project?.id ? "PUT" : "POST";
    const url = project?.id ? `/api/projects/${project.id}` : "/api/projects";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      setLoading(false);
      onSaved && onSaved();
    } catch (err) {
      setLoading(false);
      setError("Errore salvataggio: " + (err.message || err));
    }
  }

  // Layout responsive: due colonne su desktop, una su mobile
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1200,
      background: "rgba(0,0,0,0.20)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form onSubmit={handleSave}
        style={{
          background: "#fff", borderRadius: 18, padding: 32, minWidth: 410, maxWidth: 780,
          boxShadow: "0 2px 18px #0002", margin: 18
        }}>
        <h2 style={{ marginBottom: 18 }}>{project?.id ? "Modifica Progetto" : "Nuovo Progetto"}</h2>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: "space-between"
        }}>
          <div style={{ flex: "1 1 320px", minWidth: 260 }}>
            <div style={{ marginBottom: 16 }}>
              <label>Titolo *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                style={inputStyle} required autoFocus />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Descrizione</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Priorità</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={inputStyle}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="bassa">Bassa</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Stato</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                <option value="da iniziare">Da iniziare</option>
                <option value="in corso">In corso</option>
                <option value="completato">Completato</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Scadenza</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 260 }}>
            <div style={{ marginBottom: 16 }}>
              <label>Clienti associati *</label>
              <Select
                options={clientOptions}
                value={clients}
                onChange={setClients}
                isMulti
                isSearchable
                placeholder="Cerca e seleziona clienti"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Note</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} style={{ ...inputStyle, height: 52 }} />
            </div>
          </div>
        </div>
        {error && <div style={{ color: "#d32f2f", marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} style={btnStyle2}>Annulla</button>
          <button type="submit" disabled={loading} style={btnStyle1}>
            {loading ? "Salva..." : "Salva"}
          </button>
        </div>
      </form>
      <style>{`
        @media (max-width: 800px) {
          form > div { flex-direction: column !important; gap: 8px !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: "100%", fontSize: 16, padding: "7px 10px",
  borderRadius: 8, border: "1px solid #d7e3f1", marginTop: 3
};
const btnStyle1 = {
  background: "#0749a6", color: "#fff", padding: "10px 30px", border: "none",
  borderRadius: 10, fontWeight: 600, fontSize: 16, cursor: "pointer"
};
const btnStyle2 = {
  background: "#f5f7fa", color: "#222", padding: "10px 28px", border: "none",
  borderRadius: 10, fontWeight: 500, fontSize: 16, cursor: "pointer"
};
