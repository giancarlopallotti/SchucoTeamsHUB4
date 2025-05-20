// /pages/api/activities/index.js

const db = require('../../../db/db');

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Lista tutte le attività (opzionale: filtro per progetto, utente, stato)
    const { project, user, status } = req.query;
    let sql = `SELECT a.*, 
                      p.title as project_title, 
                      u.name as assigned_name, 
                      u.surname as assigned_surname 
               FROM activities a
               LEFT JOIN projects p ON a.project_id = p.id
               LEFT JOIN users u ON a.assigned_to = u.id
               WHERE 1=1`;
    const params = [];
    if (project) {
      sql += ' AND a.project_id = ?';
      params.push(project);
    }
    if (user) {
      sql += ' AND a.assigned_to = ?';
      params.push(user);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY a.due_date ASC, a.created_at DESC';
    const list = db.prepare(sql).all(...params);
    res.status(200).json(list);
  } else if (req.method === 'POST') {
    // Crea nuova attività
    const { title, description, project_id, assigned_to, status, priority, due_date } = req.body;
    if (!title) return res.status(400).json({ message: "Titolo obbligatorio" });
    const stmt = db.prepare(`
      INSERT INTO activities 
      (title, description, project_id, assigned_to, status, priority, due_date, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'))
    `);
    const info = stmt.run(
      title,
      description || "",
      project_id || null,
      assigned_to || null,
      status || "da_iniziare",
      priority || "normale",
      due_date || null
    );

    // --- AGGIUNTA NOTIFICA AUTOMATICA ---
    if (assigned_to) {
      const msg = `Nuova attività assegnata: "${title}"`;
      db.prepare(`
        INSERT INTO notifications (user_id, message) VALUES (?, ?)
      `).run(assigned_to, msg);
    }
    // ------------------------------------

    res.status(201).json({ id: info.lastInsertRowid });
  } else {
    res.status(405).json({ message: "Metodo non consentito" });
  }
}
