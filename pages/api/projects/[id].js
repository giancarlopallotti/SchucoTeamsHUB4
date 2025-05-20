// /pages/api/projects/[id].js
import { parse } from "cookie";
const db = require('../../../db/db');

export default function handler(req, res) {
  // --- Protezione: verifica presenza token nella cookie ---
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    res.status(401).json({ message: "Non autorizzato" });
    return;
  }

  const {
    query: { id },
    method,
  } = req;

  if (!id) return res.status(400).json({ message: "ID mancante" });

  if (method === 'GET') {
    // Ottieni dettaglio progetto, compresi clienti e utenti assegnati
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) return res.status(404).json({ message: "Progetto non trovato" });

    // Recupera clienti associati
    const clients = db.prepare(`
      SELECT c.id, c.name, c.surname, c.company
      FROM clients c
      JOIN project_clients pc ON pc.client_id = c.id
      WHERE pc.project_id = ?
    `).all(id);

    // Recupera utenti assegnati
    let users = [];
    // Se la tabella esiste
    try {
      users = db.prepare(`
        SELECT u.id, u.name, u.surname, u.email
        FROM users u
        JOIN projects_users pu ON pu.user_id = u.id
        WHERE pu.project_id = ?
      `).all(id);
    } catch { users = []; }

    project.clients = clients;
    project.users = users;

    res.status(200).json(project);

  } else if (method === 'PUT') {
    // Modifica progetto
    const { title, name, description, status, priority, deadline, note } = req.body;
    const newTitle = title || name;
    if (!newTitle) return res.status(400).json({ message: "Titolo obbligatorio" });

    db.prepare(`
      UPDATE projects
      SET title = ?, description = ?, status = ?, priority = ?, deadline = ?, note = ?
      WHERE id = ?
    `).run(newTitle, description, status, priority, deadline, note, id);

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(200).json(updated);

  } else if (method === 'DELETE') {
    // Elimina progetto + associazioni
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    db.prepare('DELETE FROM project_clients WHERE project_id = ?').run(id);
    // Elimina anche utenti associati se la tabella esiste
    try {
      db.prepare('DELETE FROM projects_users WHERE project_id = ?').run(id);
    } catch {}
    res.status(200).json({ message: "Progetto eliminato" });

  } else {
    res.status(405).json({ message: 'Metodo non consentito' });
  }
}
