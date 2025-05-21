// /pages/api/users/index.js
// v2 - 21/05/2025
// Modifica: gestione multi-ruolo/team dinamica via tabella user_roles
// Autore: ChatGPT + Giancarlo
// Note: ora ogni utente ha lista di {role, team}, nessun ruolo statico su users

import db from "../../../db/db.js";
import { parse } from "cookie";

export default function handler(req, res) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) return res.status(401).json({ error: "Non autorizzato" });

  if (req.method === "GET") {
    // Query: utenti + lista ruoli/team
    const users = db.prepare(`
      SELECT u.id, u.name, u.surname, u.email, u.phone, u.status, u.tags, u.created_by, u.created_at,
        GROUP_CONCAT(DISTINCT r.name || '@' || t.name) as roles_teams
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN teams t ON ur.team_id = t.id
      GROUP BY u.id
    `).all();

    users.forEach(u => {
      u.roles_teams = u.roles_teams
        ? u.roles_teams.split(",").map(rt => {
            const [role, team] = rt.split("@");
            return { role, team };
          })
        : [];
    });

    res.status(200).json(users);
  } else if (req.method === "POST" || req.method === "PUT") {
    const { id, name, surname, email, password, phone, status, tags, created_by, roles_teams } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Nome e email obbligatori" });
    let userId = id;

    // TODO: hash password qui, se richiesto
    // const passwordHash = hashPassword(password);

    if (!userId) {
      // Nuovo utente
      const stmt = db.prepare(`
        INSERT INTO users (name, surname, email, password, phone, status, tags, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(name, surname, email, password, phone, status, tags, created_by);
      userId = result.lastInsertRowid;
    } else {
      // Update utente
      const stmt = db.prepare(`
        UPDATE users SET name=?, surname=?, email=?, password=?, phone=?, status=?, tags=?, created_by=?
        WHERE id=?
      `);
      stmt.run(name, surname, email, password, phone, status, tags, created_by, userId);
      // Rimuovi tutte le associazioni ruoli/team precedenti
      db.prepare(`DELETE FROM user_roles WHERE user_id=?`).run(userId);
    }

    // INSERISCI RUOLI/TEAM ASSOCIATI
    if (Array.isArray(roles_teams)) {
      const insertRole = db.prepare(`
        INSERT INTO user_roles (user_id, team_id, role_id)
        VALUES (?, ?, ?)
      `);
      for (const { team_id, role_id } of roles_teams) {
        insertRole.run(userId, team_id, role_id);
      }
    }

    res.status(200).json({ success: true, user_id: userId });
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).end("Metodo non permesso");
  }
}
