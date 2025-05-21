// Percorso: /components/TeamModal.js

import React, { useState, useEffect } from "react";
import Select from "react-select";

export default function TeamModal({ team, onClose, onSaved }) {
  const [name, setName] = useState(team?.name || "");
  const [description, setDescription] = useState(team?.description || "");
  const [status, setStatus] = useState(team?.status || "attivo");
  const [manager, setManager] = useState(null); // user obj
  const [members, setMembers] = useState([]);   // array user obj
  const [tags, setTags] = useState([]);         // array tag obj
  const [users, setUsers] = useState([]);       // lista utenti per select
  const [allTags, setAllTags] = useState([]);   // lista tag per select
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch users/tags all'avvio
  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data));
    fetch("/api/tags")
      .then(res => res.json())
      .then(data => setAllTags(data));

    // Preselezione dati team (in caso di modifica)
    if (team) {
      setName(team.name || "");
      setDescription(team.description || "");
      setStatus(team.status || "attivo");
      // manager: id → oggetto
      if (team.manager) {
        fetch("/api/users/" + team.manager)
          .then(res => res.json())
          .then(u => setManager({ value: u.id, label: `${u.name} ${u.surname} (${u.email})` }))
          .catch(() => {});
      }
      // membri: CSV id → array oggetti
      if (team.members) {
        const memberIds = (team.members || "").split(",").map(id => id.trim()).filter(Boolean);
        setMembers(
          memberIds.map(id => {
            const u = (data || []).find(u => String(u.id) === String(id));
            return u
              ? { value: u.id, label: `${u.name} ${u.surname} (${u.email})` }
              : null;
          }).filter(Boolean)
        );
      }
      // tags: CSV → array oggetti
      if (team.tags) {
        const tagArr = (team.tags || "").split(",").map(tag => tag.trim()).filter(Boolean);
        setTags(
          tagArr.map(t => {
            const tagObj = (allTags || []).find(tt => tt.name === t || tt.label === t);
            return tagObj ? { value: tagObj.name || tagObj.label, label: tagObj.name || tagObj.label } : { value: t, label: t };
          })
        );
      }
    }
    // eslint-disable-next-line
  }, [team]);

  // Crea opzioni per Select da utenti/tag
  const userOptions = users.map(u => ({
    value: u.id,
    label: `${u.name} ${u.surname} (${u.email})`
  }));
  const tagOptions = allTags.map(t => ({
    value: t.name || t.label,
    label: t.name || t.label
  }));

  // Salva team
  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!name.trim()) { setError("Il nome è obbligatorio."); setLoading(false); return; }
    if (!manager) { setError("Seleziona il responsabile."); setLoading(false); return; }

    const body = {
      name,
      description,
      status,
      manager: manager.value,
      members: members.map(m => m.value).join(","),
      tags: tags.map(t => t.value).join(","),
    };

    const method = team?.id ? "PUT" : "POST";
    const url = team?.id ? `/api/teams/${team.id}` : "/api/teams";
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

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1200,
      background: "rgba(0,0,0,0.20)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form onSubmit={handleSave}
        style={{
          background: "#fff", borderRadius: 18, padding: 32, minWidth: 410, maxWidth: 540,
          boxShadow: "0 2px 18px #0002", margin: 18
        }}>
        <h2 style={{ marginBottom: 18 }}>{team?.id ? "Modifica Team" : "Nuovo Team"}</h2>
        <div style={{ marginBottom: 16 }}>
          <label>Nome *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            style={inputStyle} required autoFocus />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Descrizione</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Responsabile *</label>
          <Select
            options={userOptions}
            value={manager}
            onChange={setManager}
            isSearchable
            placeholder="Cerca utente..."
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Membri (selezione multipla)</label>
          <Select
            options={userOptions}
            value={members}
            onChange={setMembers}
            isMulti
            isSearchable
            placeholder="Cerca e seleziona membri"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Tag (selezione multipla)</label>
          <Select
            options={tagOptions}
            value={tags}
            onChange={setTags}
            isMulti
            isSearchable
            placeholder="Seleziona tag"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Stato</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
            <option value="attivo">Attivo</option>
            <option value="bloccato">Bloccato</option>
            <option value="archiviato">Archiviato</option>
          </select>
        </div>
        {error && <div style={{ color: "#d32f2f", marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} style={btnStyle2}>Annulla</button>
          <button type="submit" disabled={loading} style={btnStyle1}>
            {loading ? "Salva..." : "Salva"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Stili di base
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
