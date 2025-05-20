// pages/events.js
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

export default function Events() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState([]);
  // Form nuovo evento
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [userIds, setUserIds] = useState([]);
  const [teamIds, setTeamIds] = useState([]);
  const [fileIds, setFileIds] = useState([]);
  const [tagIds, setTagIds] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const fetchAll = async () => {
    const [ev, us, ts, fs, tgs] = await Promise.all([
      fetch("/api/events").then(r => r.json()),
      fetch("/api/users").then(r => r.json()),
      fetch("/api/teams").then(r => r.json()),
      fetch("/api/files").then(r => r.json()),
      fetch("/api/tags").then(r => r.json())
    ]);
    setEvents(ev);
    setUsers(us);
    setTeams(ts);
    setFiles(fs);
    setTags(tgs);
  };

  const handleCreate = async e => {
    e.preventDefault();
    setMsg("");
    if (!title || !start) {
      setMsg("Titolo e data inizio obbligatori!");
      return;
    }
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, start, end, userIds, teamIds, fileIds, tagIds })
    });
    if (res.ok) {
      setMsg("Evento creato!");
      setTitle(""); setDescription(""); setStart(""); setEnd("");
      setUserIds([]); setTeamIds([]); setFileIds([]); setTagIds([]);
      fetchAll();
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Impossibile creare evento"));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestione Eventi & Calendario</h1>
      <form onSubmit={handleCreate} style={{ marginBottom: 32, border: "1px solid #eee", padding: 16, borderRadius: 10 }}>
        <h3>Nuovo Evento</h3>
        <input
          placeholder="Titolo evento"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ marginRight: 10, minWidth: 200 }}
        />
        <input
          type="datetime-local"
          value={start}
          onChange={e => setStart(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="datetime-local"
          value={end}
          onChange={e => setEnd(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <br />
        <textarea
          placeholder="Descrizione"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: "80%", margin: "12px 0" }}
        />
        <br />
        <span>Partecipanti: </span>
        <select multiple value={userIds} onChange={e => setUserIds(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ minWidth: 160, marginRight: 10 }}>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.surname} {u.name} ({u.email})</option>
          ))}
        </select>
        <span> Team: </span>
        <select multiple value={teamIds} onChange={e => setTeamIds(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ minWidth: 120, marginRight: 10 }}>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <span> File: </span>
        <select multiple value={fileIds} onChange={e => setFileIds(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ minWidth: 120, marginRight: 10 }}>
          {files.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <span> Tag: </span>
        <select multiple value={tagIds} onChange={e => setTagIds(Array.from(e.target.selectedOptions, o => Number(o.value)))} style={{ minWidth: 120 }}>
          {tags.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <br />
        <button type="submit" style={{ marginTop: 16 }}>Crea Evento</button>
      </form>
      {msg && <p><b>{msg}</b></p>}
      <h3>Elenco Eventi</h3>
      <table border="1" cellPadding="7" style={{ fontSize: 15, maxWidth: "100%", marginTop: 10 }}>
        <thead>
          <tr>
            <th>Titolo</th>
            <th>Inizio</th>
            <th>Fine</th>
            <th>Descrizione</th>
            <th>Partecipanti</th>
            <th>Team</th>
            <th>Tags</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev.id}>
              <td>{ev.title}</td>
              <td>{ev.start && ev.start.replace("T", " ").substring(0, 16)}</td>
              <td>{ev.end && ev.end.replace("T", " ").substring(0, 16)}</td>
              <td style={{ maxWidth: 180, whiteSpace: "pre-wrap" }}>{ev.description}</td>
              <td>
                {/* Qui puoi aggiungere fetch di partecipanti/teams/tag per ogni evento se vuoi visualizzare dettagli */}
                {/* Per semplicità mostriamo solo gli ID, poi puoi espandere per mostrare nomi */}
                {/* Potresti mappare le relazioni con altre API o tabelle ponte */}
                -
              </td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
