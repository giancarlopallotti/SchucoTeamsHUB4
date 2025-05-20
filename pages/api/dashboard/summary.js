// pages/api/dashboard/summary.js

const db = require('../../../db/db');

export default function handler(req, res) {
  try {
    // Totali rapidi
    const users = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
    const teams = db.prepare("SELECT COUNT(*) AS n FROM teams").get().n;
    const projects = db.prepare("SELECT COUNT(*) AS n FROM projects").get().n;
    const clients = db.prepare("SELECT COUNT(*) AS n FROM clients").get().n;
    const files = db.prepare("SELECT COUNT(*) AS n FROM files").get().n;
    const tags = db.prepare("SELECT COUNT(*) AS n FROM tags").get().n;

    // Ultimi files
    const latestFiles = db.prepare("SELECT id, name, created_at FROM files ORDER BY created_at DESC LIMIT 5").all();
    // Ultimi progetti
    const latestProjects = db.prepare("SELECT id, title, status, created_at FROM projects ORDER BY created_at DESC LIMIT 5").all();

    // Stato progetti (conta per status)
    const statusRows = db.prepare("SELECT status, COUNT(*) as n FROM projects GROUP BY status").all();
    const statusCounts = {};
    statusRows.forEach(r => { statusCounts[r.status || "Non assegnato"] = r.n; });

    res.status(200).json({
      totals: { users, teams, projects, clients, files, tags },
      latestFiles,
      latestProjects,
      statusCounts
    });
  } catch (e) {
    console.error("Errore dashboard:", e);
    res.status(500).json({ message: "Errore caricamento dati dashboard", error: e.message });
  }
}
