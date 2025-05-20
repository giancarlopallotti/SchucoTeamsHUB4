// pages/api/files/assign.js

const db = require('../../../db/db');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { fileId, projectIds, clientIds, teamIds } = req.body;
    if (!fileId) {
      return res.status(400).json({ message: "fileId obbligatorio" });
    }

    try {
      // Associa a progetti
      if (Array.isArray(projectIds)) {
        const stmt = db.prepare("INSERT OR IGNORE INTO files_projects (file_id, project_id) VALUES (?, ?)");
        projectIds.forEach(pid => stmt.run(fileId, pid));
      }
      // Associa a clienti
      if (Array.isArray(clientIds)) {
        const stmt = db.prepare("INSERT OR IGNORE INTO files_clients (file_id, client_id) VALUES (?, ?)");
        clientIds.forEach(cid => stmt.run(fileId, cid));
      }
      // Associa a team
      if (Array.isArray(teamIds)) {
        const stmt = db.prepare("INSERT OR IGNORE INTO files_teams (file_id, team_id) VALUES (?, ?)");
        teamIds.forEach(tid => stmt.run(fileId, tid));
      }

      res.status(200).json({ message: "Associazioni salvate" });
    } catch (err) {
      res.status(500).json({ message: "Errore associazione", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Metodo non consentito" });
  }
}
