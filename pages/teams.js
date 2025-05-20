// /pages/teams.js
// UI lista moderna Team + modale aggiungi/modifica, responsive, filtro stato/tag/responsabile
import { useEffect, useState } from "react";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]); // Per dropdown responsabile/membri
  const [tags, setTags] = useState([]); // Per dropdown tags
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null); // team in editing

  useEffect(() => {
    fetchTeams();
    fetch("/api/users").then(r => r.json()).then(setUsers);
    fetch("/api/tags").then(r => r.json()).then(setTags);
  }, []);

  function fetchTeams() {
    fetch("/api/teams").then(r => r.json()).then(setTeams);
  }

  function openNewTeam() {
    setEditTeam(null);
    setShowModal(true);
  }

  function openEditTeam(team) {
    setEditTeam(team);
    setShowModal(true);
  }

  // ...filtri, handler, ecc. (placeholder, vedi sotto)

  return (
    <div style={{ padding: 32 }}>
      <h1>Team</h1>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
        <div>
          {/* Filtri avanzati: stato/tags/responsabile (solo UI, logica da aggiungere) */}
          <input placeholder="Cerca per nome o descrizione..." style={{ padding: 8, width: 240, marginRight: 16 }} />
          <select style={{ marginRight: 8 }}>
            <option value="">Tutti gli stati</option>
            <option value="attivo">Attivo</option>
            <option value="archiviato">Archiviato</option>
          </select>
          <select style={{ marginRight: 8 }}>
            <option value="">Tutti i responsabili</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.surname}</option>)}
          </select>
          <select style={{ minWidth: 100 }}>
            <option value="">Tutti i tag</option>
            {tags.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <button
          style={{ background: "#2843A1", color: "#fff", padding: "12px 22px", borderRadius: 8, border: 0, fontWeight: 700, fontSize: 16 }}
          onClick={openNewTeam}
        >+ Nuovo Team</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #99c7e040", padding: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17 }}>
          <thead style={{ background: "#f4f8fd" }}>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Descrizione</th>
              <th>Stato</th>
              <th>Responsabile</th>
              <th>Membri</th>
              <th>Tag</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team.id}>
                <td>{team.id}</td>
                <td>{team.name}</td>
                <td>{team.description}</td>
                <td>
                  <span style={{
                    background: team.status === "archiviato" ? "#aaa" : "#76ce40",
                    color: "#222",
                    borderRadius: 8,
                    padding: "2px 14px",
                    fontWeight: 700,
                  }}>{team.status || "attivo"}</span>
                </td>
                <td>{team.responsabile_name || "-"}</td>
                <td>{team.membri?.map(m => m.name).join(", ")}</td>
                <td>{team.tags?.map(t => t.label).join(", ")}</td>
                <td>
                  <button onClick={() => openEditTeam(team)} style={{ marginRight: 8 }}>✏️</button>
                  <button style={{ color: "#c00" }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <TeamModal
          team={editTeam}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchTeams(); }}
          users={users}
          tags={tags}
        />
      )}
    </div>
  );
}

// Modale Aggiungi/Modifica Team (UI moderna, 2 colonne, validazione base)
function TeamModal({ team, onClose, onSave, users, tags }) {
  const isEdit = !!team;
  const [form, setForm] = useState({
    name: team?.name || "",
    description: team?.description || "",
    status: team?.status || "attivo",
    responsible_id: team?.responsible_id || "",
    membri: team?.membri?.map(m => m.id) || [],
    tags: team?.tags?.map(t => t.id) || [],
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleMultiChange(e, key) {
    const values = Array.from(e.target.selectedOptions).map(opt => +opt.value);
    setForm(f => ({ ...f, [key]: values }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `/api/teams/${team.id}` : "/api/teams";
    const body = {
      ...form,
      membri: form.membri,
      tags: form.tags
    };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    setSaving(false);
    if (res.ok) onSave();
    // TODO: gestione errori
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#2233",
      zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 18, padding: 36, minWidth: 540, boxShadow: "0 6px 32px #0012", maxWidth: 700 }}>
        <h2 style={{ marginTop: 0 }}>{isEdit ? "Modifica Team" : "Nuovo Team"}</h2>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label>Nome <span style={{ color: "#f23" }}>*</span><br />
              <input name="name" value={form.name} onChange={handleChange} required style={{ width: "100%", padding: 8, marginBottom: 16 }} />
            </label>
            <label>Descrizione<br />
              <input name="description" value={form.description} onChange={handleChange} style={{ width: "100%", padding: 8, marginBottom: 16 }} />
            </label>
            <label>Stato<br />
              <select name="status" value={form.status} onChange={handleChange} style={{ width: "100%", padding: 8, marginBottom: 16 }}>
                <option value="attivo">Attivo</option>
                <option value="archiviato">Archiviato</option>
              </select>
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label>Responsabile<br />
              <select name="responsible_id" value={form.responsible_id} onChange={handleChange} required style={{ width: "100%", padding: 8, marginBottom: 16 }}>
                <option value="">Seleziona utente</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.surname} ({u.email})</option>)}
              </select>
            </label>
            <label>Membri (Ctrl+click per selezione multipla)<br />
              <select multiple name="membri" value={form.membri} onChange={e => handleMultiChange(e, "membri")}
                style={{ width: "100%", padding: 8, marginBottom: 16, minHeight: 70 }}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.surname} ({u.email})</option>)}
              </select>
            </label>
            <label>Tag (Ctrl+click per selezione multipla)<br />
              <select multiple name="tags" value={form.tags} onChange={e => handleMultiChange(e, "tags")}
                style={{ width: "100%", padding: 8, marginBottom: 16, minHeight: 70 }}>
                {tags.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button type="button" onClick={onClose} style={{ padding: "10px 22px", borderRadius: 8 }}>Annulla</button>
          <button type="submit" style={{ background: "#2843A1", color: "#fff", padding: "10px 22px", borderRadius: 8 }} disabled={saving}>{saving ? "Salva..." : "Salva"}</button>
        </div>
      </form>
    </div>
  );
}
