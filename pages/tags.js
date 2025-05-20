// pages/tags.js
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

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [msg, setMsg] = useState("");
  const [files, setFiles] = useState([]);
  const [progetti, setProgetti] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [teams, setTeams] = useState([]);
  // selezione assegnazione
  const [tagId, setTagId] = useState("");
  const [fileIds, setFileIds] = useState([]);
  const [projectIds, setProjectIds] = useState([]);
  const [clientIds, setClientIds] = useState([]);
  const [teamIds, setTeamIds] = useState([]);

  useEffect(() => {
    fetchTags();
    fetchEntities();
  }, []);

  const fetchTags = async () => {
    const res = await fetch("/api/tags");
    setTags(await res.json());
  };
  const fetchEntities = async () => {
    const [f, p, c, t] = await Promise.all([
      fetch("/api/files").then(r => r.json()),
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/teams").then(r => r.json())
    ]);
    setFiles(f);
    setProgetti(p);
    setClienti(c);
    setTeams(t);
  };

  const handleAddTag = async e => {
    e.preventDefault();
    setMsg("");
    if (!newTag) return setMsg("Inserisci un nome tag");
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag })
    });
    if (res.ok) {
      setMsg("Tag aggiunto!");
      setNewTag("");
      fetchTags();
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Impossibile aggiungere tag"));
    }
  };

  const handleAssign = async e => {
    e.preventDefault();
    setMsg("");
    if (!tagId) return setMsg("Seleziona un tag!");
    const res = await fetch("/api/tags/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId, fileIds, projectIds, clientIds, teamIds })
    });
    if (res.ok) {
      setMsg("Tag associato!");
      setFileIds([]); setProjectIds([]); setClientIds([]); setTeamIds([]);
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Impossibile associare tag"));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestione TAGS Globali</h1>
      <form onSubmit={handleAddTag} style={{ marginBottom: 20 }}>
        <input
          placeholder="Nuovo TAG (solo MAIUSCOLO)"
          value={newTag}
          onChange={e => setNewTag(e.target.value.toUpperCase())}
          style={{ marginRight: 10 }}
        />
        <button type="submit">Aggiungi TAG</button>
      </form>
      <div style={{ marginBottom: 30 }}>
        <b>TAG disponibili:</b>{" "}
        {tags.map(t => (
          <span key={t.id} style={{
            background: "#2843A1", color: "#fff", borderRadius: 6, padding: "2px 10px", marginRight: 8, fontSize: 15
          }}>{t.name}</span>
        ))}
      </div>
      <form onSubmit={handleAssign} style={{ marginBottom: 30 }}>
        <h3>Assegna TAG a entità</h3>
        <select value={tagId} onChange={e => setTagId(e.target.value)} style={{ marginRight: 10 }}>
          <option value="">Seleziona TAG...</option>
          {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <span> → Files: </span>
        <select multiple value={fileIds} onChange={e => setFileIds(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ marginRight: 10, minWidth: 120 }}>
          {files.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <span> Progetti: </span>
        <select multiple value={projectIds} onChange={e => setProjectIds(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ marginRight: 10, minWidth: 120 }}>
          {progetti.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <span> Clienti: </span>
        <select multiple value={clientIds} onChange={e => setClientIds(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ marginRight: 10, minWidth: 120 }}>
          {clienti.map(c => (
            <option key={c.id} value={c.id}>{c.surname} {c.name} {c.company && "(" + c.company + ")"}</option>
          ))}
        </select>
        <span> Team: </span>
        <select multiple value={teamIds} onChange={e => setTeamIds(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ marginRight: 10, minWidth: 120 }}>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button type="submit">Assegna TAG</button>
      </form>
      {msg && <p><b>{msg}</b></p>}
    </div>
  );
}
