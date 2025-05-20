// /pages/api/projects/[id]/clients.js
import { parse } from "cookie";
const db = require('../../../../db/db');

export default function handler(req, res) {
  // --- Protezione token ---
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    res.status(401).json({ message: "Non autorizzato" });
    return;
  }
  const { id } = req.query;

  if (req.method === 'GET') {
    // Lista clienti associati al progetto
    const clients = db.prepare(`
      SELECT c.id, c.name, c.surname, c.company
      FROM clients c
      JOIN project_clients pc ON pc.client_id = c.id
      WHERE pc.project_id = ?
    `).all(id);
    res.status(200).json(clients);
  } else if (req.method === 'POST') {
    // Associa cliente a progetto
    const { client_id } = req.body;
    if (!client_id) {
      res.status(400).json({ message: "client_id obbligatorio" });
      return;
    }
    try {
      db.prepare('INSERT INTO project_clients (project_id, client_id) VALUES (?, ?)').run(id, client_id);
      res.status(201).json({ message: "Associazione creata" });
    } catch (err) {
      res.status(409).json({ message: "Cliente già associato o errore DB" });
    }
  } else if (req.method === 'DELETE') {
    // Rimuove associazione cliente-progetto
    const { client_id } = req.body;
    if (!client_id) {
      res.status(400).json({ message: "client_id obbligatorio" });
      return;
    }
    db.prepare('DELETE FROM project_clients WHERE project_id = ? AND client_id = ?').run(id, client_id);
    res.status(200).json({ message: "Associazione rimossa" });
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).json({ message: 'Metodo non consentito' });
  }
}
