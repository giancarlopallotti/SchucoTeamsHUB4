// pages/projects.js
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "da iniziare",
    priority: "normale",
    deadline: "",
    note: "",
  });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (!res.ok) {
      setMsg("Errore caricamento progetti");
      return;
    }
    const data = await res.json();
    setProjects(data);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    if (!form.name) {
      setMsg("Il nome del progetto è obbligatorio!");
      return;
    }
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMsg("Progetto aggiunto!");
      setForm({
        name: "",
        description: "",
        status: "da iniziare",
        priority: "normale",
        deadline: "",
        note: "",
      });
      fetchProjects();
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Impossibile aggiungere progetto"));
    }
  };

  // --- Modifica progetto ---
  const startEdit = (project) => {
    setEditId(project.id);
    setEditForm({
      name: project.title || project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      deadline: project.deadline ? project.deadline.substring(0,10) : "",
      note: project.note,
    });
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (id) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });
    if (res.ok) {
      setMsg("Progetto aggiornato!");
      setEditId(null);
      fetchProjects();
    } else {
      setMsg("Errore aggiornamento progetto");
    }
  };

  // --- Cancella progetto ---
  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo progetto?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("Progetto eliminato!");
      fetchProjects();
    } else {
      setMsg("Errore eliminazione progetto");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Lista Progetti</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input name="name" placeholder="Nome progetto *" value={form.name} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="description" placeholder="Descrizione" value={form.description} onChange={handleChange} style={{ marginRight: 10 }} />
        <select name="status" value={form.status} onChange={handleChange} style={{ marginRight: 10 }}>
          <option value="da iniziare">Da iniziare</option>
          <option value="in corso">In corso</option>
          <option value="completato">Completato</option>
        </select>
        <select name="priority" value={form.priority} onChange={handleChange} style={{ marginRight: 10 }}>
          <option value="bassa">Bassa</option>
          <option value="normale">Normale</option>
          <option value="alta">Alta</option>
        </select>
        <input name="deadline" type="date" value={form.deadline} onChange={handleChange} style={{ marginRight: 10 }} />
        <input name="note" placeholder="Note" value={form.note} onChange={handleChange} style={{ marginRight: 10 }} />
        <button type="submit">Aggiungi Progetto</button>
      </form>
      {msg && <p style={{ color: msg.includes('Errore') ? 'red' : 'green' }}>{msg}</p>}
      <table border="1" cellPadding="10" style={{ maxWidth: "100%", fontSize: 14 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Descrizione</th>
            <th>Stato</th>
            <th>Priorità</th>
            <th>Scadenza</th>
            <th>Note</th>
            <th>Data Creazione</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            editId === project.id ? (
              <tr key={project.id} style={{ background: "#eef" }}>
                <td>{project.id}</td>
                <td>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    style={{ width: 110 }}
                  />
                </td>
                <td>
                  <input
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    style={{ width: 110 }}
                  />
                </td>
                <td>
                  <select name="status" value={editForm.status} onChange={handleEditChange}>
                    <option value="da iniziare">Da iniziare</option>
                    <option value="in corso">In corso</option>
                    <option value="completato">Completato</option>
                  </select>
                </td>
                <td>
                  <select name="priority" value={editForm.priority} onChange={handleEditChange}>
                    <option value="bassa">Bassa</option>
                    <option value="normale">Normale</option>
                    <option value="alta">Alta</option>
                  </select>
                </td>
                <td>
                  <input
                    name="deadline"
                    type="date"
                    value={editForm.deadline}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <input
                    name="note"
                    value={editForm.note}
                    onChange={handleEditChange}
                    style={{ width: 90 }}
                  />
                </td>
                <td>{project.created_at}</td>
                <td>
                  <button onClick={() => handleEditSubmit(project.id)}>Salva</button>
                  <button onClick={() => setEditId(null)} style={{ marginLeft: 6 }}>Annulla</button>
                </td>
              </tr>
            ) : (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.title || project.name}</td>
                <td>{project.description}</td>
                <td>{project.status}</td>
                <td>{project.priority}</td>
                <td>{project.deadline}</td>
                <td>{project.note}</td>
                <td>{project.created_at}</td>
                <td>
                  <button onClick={() => startEdit(project)}>Modifica</button>
                  <button onClick={() => handleDelete(project.id)} style={{ marginLeft: 6, color: 'red' }}>Elimina</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}
