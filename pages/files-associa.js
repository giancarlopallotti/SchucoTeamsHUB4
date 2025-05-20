// pages/files-associa.js
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

export default function FilesAssocia() {
  const [files, setFiles] = useState([]);
  const [progetti, setProgetti] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [teams, setTeams] = useState([]);
  const [fileId, setFileId] = useState("");
  const [projectIds, setProjectIds] = useState([]);
  const [clientIds, setClientIds] = useState([]);
  const [teamIds, setTeamIds] = useState([]);
  const [msg, setMsg] = useState("");
  const [assoc, setAssoc] = useState({ projects: [], clients: [], teams: [] });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (fileId) fetchAssociations(fileId);
    else setAssoc({ projects: [], clients: [], teams: [] });
  }, [fileId]);

  const fetchData = async () => {
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

  // Mostra le associazioni attuali di un file
  const fetchAssociations = async fileId => {
    const [fp, fc, ft] = await Promise.all([
      fetch(`/api/files?project=-1&file=${fileId}`).then(r => r.json()),
      fetch(`/api/files?client=-1&file=${fileId}`).then(r => r.json()),
      fetch(`/api/files?team=-1&file=${fileId}`).then(r => r.json()),
    ]);
    setAssoc({
      projects: fp.filter(f => f.id === Number(fileId)).map(f => f.project_id || f.id),
      clients: fc.filter(f => f.id === Number(fileId)).map(f => f.client_id || f.id),
      teams: ft.filter(f => f.id === Number(fileId)).map(f => f.team_id || f.id),
    });
  };

  const handleAssign = async e => {
    e.preventDefault();
    setMsg("");
    if (!fileId) {
      setMsg("Seleziona un file!");
      return;
    }
    const res = await fetch("/api/files/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, projectIds, clientIds, teamIds })
    });
    if (res.ok) {
      setMsg("File associato con successo!");
      fetchAssociations(fileId);
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Impossibile associare file"));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Associa File a Progetti, Clienti, Team</h1>
      <form onSubmit={handleAssign} style={{ marginBottom: "2rem" }}>
        <select value={fileId} onChange={e => setFileId(e.target.value)} style={{ marginRight: 10 }}>
          <option value="">Seleziona file...</option>
          {files.map(f => (
            <option key={f.id} value={f.id}>{f.name} ({f.created_at})</option>
          ))}
        </select>
        <span> → Progetti: </span>
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
        <button type="submit">Associa</button>
      </form>
      {msg && <p><b>{msg}</b></p>}
      {fileId && (
        <div>
          <h3>Associazioni correnti per il file selezionato</h3>
          <ul>
            <li>
              <b>Progetti:</b> {assoc.projects.length === 0 ? "Nessuno" : assoc.projects.join(", ")}
            </li>
            <li>
              <b>Clienti:</b> {assoc.clients.length === 0 ? "Nessuno" : assoc.clients.join(", ")}
            </li>
            <li>
              <b>Team:</b> {assoc.teams.length === 0 ? "Nessuno" : assoc.teams.join(", ")}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
