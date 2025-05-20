// pages/api/tags/assign.js

const db = require('../../../db/db');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { tagId, fileIds, projectIds, clientIds, teamIds } = req.body;
    if (!tagId) return res.status(400).json({ message: "tagId obbligatorio" });

    try {
      // Files
      if (Array.isArray(fileIds)) {
        const stmt = db.prepare("INSERT OR IGNORE INTO tags_files (tag_id, file_id) VALUES (?, ?)");
        fileIds.forEach(fid => stmt.run(tagId, fid));
      }
      // Progetti
      if (Array.isArray(projectIds)) {
        const stmt = db.prepare("INSERT OR IGNORE INTO tags_projects (tag_id, project_id) VALUES (?, ?)");
        projectIds.forEach(pid => stmt.run(tagId, pid));
      }
      // Clienti
      if (Array.isArray(clientIds)) {
        const stmt = db.prepare("INSERT OR IGNORE INTO tags_clients (tag_id, client_id) VALUES (?, ?)");
        clientIds.forEach(cid => stmt.run(tagId, cid));
      }
      // Team
      if (Array.isArray(teamIds)) {
        const stmt = db.prepare("INSERT OR IGNORE INTO tags_teams (tag_id, team_id) VALUES (?, ?)");
        teamIds.forEach(tid => stmt.run(tagId, tid));
      }

      res.status(200).json({ message: "Associazione tag eseguita" });
    } catch (err) {
      res.status(500).json({ message: "Errore associazione", error: err.message });
    }
  } else {
    res.status(405).json({ message: "Metodo non consentito" });
  }
}
